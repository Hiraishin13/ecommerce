<?php

declare(strict_types=1);

namespace App\Services;

use App\Helpers\JwtHelper;
use App\Helpers\MailHelper;
use App\Models\UserModel;
use RuntimeException;

class AuthService
{
    private UserModel $users;

    public function __construct()
    {
        $this->users = new UserModel();
    }

    public function register(string $name, string $email, string $password): array
    {
        if ($this->users->findByEmail($email)) {
            throw new RuntimeException('Email already in use.', 409);
        }

        $hash        = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
        $verifyToken = bin2hex(random_bytes(32));

        $userId = $this->users->create([
            'name'         => $name,
            'email'        => $email,
            'password'     => $hash,
            'role'         => 'customer',
            'verify_token' => $verifyToken,
        ]);

        $user = $this->users->findById($userId);

        // Send verification email (non-fatal if mail fails)
        try {
            $verifyUrl = ($_ENV['APP_URL'] ?? '') . '/api/auth/verify/' . $verifyToken;
            MailHelper::send(
                $email,
                'Verify your email address',
                "<p>Hello {$name},</p><p>Please verify your email by clicking: <a href=\"{$verifyUrl}\">{$verifyUrl}</a></p>",
            );
        } catch (\Throwable) {
            // Non-critical — do not abort registration
        }

        $accessToken  = JwtHelper::generateAccessToken($userId, $user['role']);
        $refreshToken = JwtHelper::generateRefreshToken($userId);

        return [
            'user'          => $this->sanitizeUser($user),
            'access_token'  => $accessToken,
            'refresh_token' => $refreshToken,
        ];
    }

    public function login(string $email, string $password): array
    {
        $user = $this->users->findByEmail($email);

        if (!$user || !password_verify($password, $user['password'])) {
            throw new RuntimeException('Invalid credentials.', 401);
        }

        $accessToken  = JwtHelper::generateAccessToken((int) $user['id'], $user['role']);
        $refreshToken = JwtHelper::generateRefreshToken((int) $user['id']);

        return [
            'user'          => $this->sanitizeUser($user),
            'access_token'  => $accessToken,
            'refresh_token' => $refreshToken,
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

        $accessToken     = JwtHelper::generateAccessToken($userId, $user['role']);
        $newRefreshToken = JwtHelper::generateRefreshToken($userId);

        return [
            'access_token'  => $accessToken,
            'refresh_token' => $newRefreshToken,
        ];
    }

    public function forgotPassword(string $email): void
    {
        $user = $this->users->findByEmail($email);

        if (!$user) {
            // Silently succeed to avoid user enumeration
            return;
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
}
