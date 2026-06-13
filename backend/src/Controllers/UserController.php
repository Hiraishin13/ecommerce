<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\UserModel;
use PDO;

class UserController extends Controller
{
    private UserModel $users;

    public function __construct()
    {
        $this->users = new UserModel();
    }

    public function profile(Request $request, Response $response): void
    {
        $userId = (int) $request->param('_auth_user_id');
        $user   = $this->users->findById($userId);

        if (!$user) {
            $response->error('User not found.', 404);
        }

        $response->success(['user' => $user]);
    }

    public function update(Request $request, Response $response): void
    {
        $userId = (int) $request->param('_auth_user_id');
        $data   = $request->body();

        $updateData = [];

        if (isset($data['name'])) {
            if (strlen(trim($data['name'])) < 2) {
                $response->error('Name must be at least 2 characters.', 422);
            }
            $updateData['name'] = trim($data['name']);
        }

        if (isset($data['email'])) {
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                $response->error('Invalid email address.', 422);
            }
            // Check uniqueness
            $existing = $this->users->findByEmail(strtolower(trim($data['email'])));
            if ($existing && (int) $existing['id'] !== $userId) {
                $response->error('Email is already in use.', 409);
            }
            $updateData['email'] = strtolower(trim($data['email']));
        }

        if (isset($data['avatar'])) {
            $updateData['avatar'] = $data['avatar'];
        }

        if (empty($updateData)) {
            $response->error('No fields provided for update.', 400);
        }

        $this->users->updateProfile($userId, $updateData);
        $user = $this->users->findById($userId);

        $response->success(['user' => $user], 'Profile updated.');
    }

    public function password(Request $request, Response $response): void
    {
        $userId = (int) $request->param('_auth_user_id');
        $data   = $request->body();

        $errors = $this->validate($data, [
            'current_password' => 'required',
            'new_password'     => 'required|min:8',
        ]);

        if (!empty($errors)) {
            $response->error('Validation failed.', 422, $errors);
        }

        // Need full user record (with password hash) — use the DB singleton directly
        $db   = Database::getInstance()->getConnection();
        $stmt = $db->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($data['current_password'], $user['password'])) {
            $response->error('Current password is incorrect.', 401);
        }

        $hash = password_hash($data['new_password'], PASSWORD_BCRYPT, ['cost' => 12]);
        $this->users->updatePassword($userId, $hash);

        $response->success(null, 'Password updated successfully.');
    }
}
