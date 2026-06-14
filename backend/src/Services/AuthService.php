<?php

declare(strict_types=1);

namespace App\Services;

use App\Helpers\JwtHelper;
use App\Helpers\MailHelper;
use App\Models\TenantModel;
use App\Models\TenantUserModel;
use App\Models\UserModel;
use App\Config\Database;
use RuntimeException;

class AuthService
{
    private UserModel $users;

    public function __construct()
    {
        $this->users = new UserModel();
    }

    public function register(string $name, string $email, string $password, int $tenantId = 1): array
    {
        if ($this->users->findByEmailAndTenant($email, $tenantId)) {
            throw new RuntimeException('Email already in use.', 409);
        }

        $hash        = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
        $verifyToken = bin2hex(random_bytes(32));

        $userId = $this->users->create([
            'tenant_id'    => $tenantId,
            'name'         => $name,
            'email'        => $email,
            'password'     => $hash,
            'role'         => 'customer',
            'verify_token' => $verifyToken,
        ]);

        // Add to tenant_users
        $tuModel = new TenantUserModel();
        $tuModel->addMember($tenantId, $userId, 'staff');

        $user = $this->users->findById($userId);

        try {
            $verifyUrl = ($_ENV['APP_URL'] ?? '') . '/api/auth/verify/' . $verifyToken;
            MailHelper::send(
                $email,
                'Verify your email address',
                "<p>Hello {$name},</p><p>Please verify your email by clicking: <a href=\"{$verifyUrl}\">{$verifyUrl}</a></p>",
            );
        } catch (\Throwable) {
            // Non-critical
        }

        $accessToken  = JwtHelper::generateAccessToken($userId, $user['role'], $tenantId);
        $refreshToken = JwtHelper::generateRefreshToken($userId);

        return [
            'user'          => $this->sanitizeUser($user),
            'access_token'  => $accessToken,
            'refresh_token' => $refreshToken,
        ];
    }

    public function login(string $email, string $password, int $tenantId = 1): array
    {
        // Chercher d'abord dans le tenant courant
        $user = $this->users->findByEmailAndTenant($email, $tenantId);

        // Fallback : chercher globalement (pour les admins/superadmins qui se connectent
        // depuis un frontend avec un tenant_id différent du leur)
        if (!$user) {
            $user = $this->users->findByEmail($email);
        }

        if (!$user || !password_verify($password, $user['password'])) {
            throw new RuntimeException('Invalid credentials.', 401);
        }

        $userTenantId = (int) ($user['tenant_id'] ?? $tenantId);
        $accessToken  = JwtHelper::generateAccessToken((int) $user['id'], $user['role'], $userTenantId);
        $refreshToken = JwtHelper::generateRefreshToken((int) $user['id']);

        $tenant = (new TenantModel())->findById($userTenantId);

        return [
            'user'          => $this->sanitizeUser($user),
            'access_token'  => $accessToken,
            'refresh_token' => $refreshToken,
            'tenant'        => $tenant ? $this->sanitizeTenant($tenant) : null,
        ];
    }

    public function refresh(string $refreshToken): array
    {
        $payload = JwtHelper::verifyRefreshToken($refreshToken);

        if (!$payload) {
            throw new RuntimeException('Invalid or expired refresh token.', 401);
        }

        $userId = (int) $payload->sub;
        $user   = $this->users->findById($userId);

        if (!$user) {
            throw new RuntimeException('User not found.', 401);
        }

        $tenantId        = (int) ($user['tenant_id'] ?? 1);
        $accessToken     = JwtHelper::generateAccessToken($userId, $user['role'], $tenantId);
        $newRefreshToken = JwtHelper::generateRefreshToken($userId);

        return [
            'access_token'  => $accessToken,
            'refresh_token' => $newRefreshToken,
        ];
    }

    /**
     * Create a new tenant + owner account in a single transaction.
     * Used by the public SaaS signup flow.
     */
    public function registerTenant(
        string $shopName,
        string $shopSlug,
        string $sector,
        string $ownerName,
        string $ownerEmail,
        string $password,
        int    $planId = 1
    ): array {
        $db = Database::pdo();
        $db->beginTransaction();

        try {
            $tenantModel = new TenantModel();
            $tuModel     = new TenantUserModel();

            if ($tenantModel->slugExists($shopSlug)) {
                throw new RuntimeException('Shop URL already taken.', 409);
            }

            // 1. Create tenant (owner_id set after user creation)
            $tenantId = $tenantModel->create([
                'name'          => $shopName,
                'slug'          => $shopSlug,
                'sector'        => $sector,
                'plan_id'       => $planId,
                'status'        => 'trial',
                'trial_ends_at' => date('Y-m-d H:i:s', strtotime('+14 days')),
            ]);

            // 2. Check email uniqueness within this new tenant
            if ($this->users->findByEmailAndTenant($ownerEmail, $tenantId)) {
                throw new RuntimeException('Email already in use.', 409);
            }

            // 3. Create owner user
            $hash   = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
            $userId = $this->users->create([
                'tenant_id' => $tenantId,
                'name'      => $ownerName,
                'email'     => $ownerEmail,
                'password'  => $hash,
                'role'      => 'admin',
            ]);

            // 4. Set owner on tenant
            $tenantModel->update($tenantId, ['owner_id' => $userId]);

            // 5. Add to tenant_users as owner
            $tuModel->addMember($tenantId, $userId, 'owner');

            $db->commit();

            $user   = $this->users->findById($userId);
            $tenant = $tenantModel->findById($tenantId);

            $accessToken  = JwtHelper::generateAccessToken($userId, $user['role'], $tenantId);
            $refreshToken = JwtHelper::generateRefreshToken($userId);

            return [
                'tenant'        => $this->sanitizeTenant($tenant),
                'user'          => $this->sanitizeUser($user),
                'access_token'  => $accessToken,
                'refresh_token' => $refreshToken,
            ];
        } catch (\Throwable $e) {
            $db->rollBack();
            throw $e;
        }
    }

    public function forgotPassword(string $email, int $tenantId = 1): void
    {
        $user = $this->users->findByEmailAndTenant($email, $tenantId);

        if (!$user) {
            return; // Silently succeed to avoid enumeration
        }

        $token   = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', time() + 3600);

        $this->users->updateResetToken((int) $user['id'], $token, $expires);

        $resetUrl = ($_ENV['FRONTEND_URL'] ?? '') . '/reset-password?token=' . $token;
        MailHelper::send(
            $email,
            'Reset your password',
            "<p>Hello {$user['name']},</p><p>Click to reset your password: <a href=\"{$resetUrl}\">{$resetUrl}</a></p><p>This link expires in 1 hour.</p>",
        );
    }

    public function resetPassword(string $token, string $newPassword): void
    {
        $user = $this->users->findByResetToken($token);

        if (!$user) {
            throw new RuntimeException('Invalid reset token.', 400);
        }

        if (strtotime($user['reset_expires']) < time()) {
            throw new RuntimeException('Reset token has expired.', 400);
        }

        $hash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
        $this->users->updatePassword((int) $user['id'], $hash);
        $this->users->clearResetToken((int) $user['id']);
    }

    public function verifyEmail(string $token): void
    {
        $success = $this->users->verifyEmail($token);

        if (!$success) {
            throw new RuntimeException('Invalid or already used verification token.', 400);
        }
    }

    private function sanitizeUser(array $user): array
    {
        unset($user['password'], $user['reset_token'], $user['reset_expires'], $user['verify_token']);
        return $user;
    }

    private function sanitizeTenant(array $tenant): array
    {
        if (isset($tenant['branding']) && is_string($tenant['branding'])) {
            $tenant['branding'] = json_decode($tenant['branding'], true);
        }
        if (isset($tenant['settings']) && is_string($tenant['settings'])) {
            $tenant['settings'] = json_decode($tenant['settings'], true);
        }
        return $tenant;
    }
}
