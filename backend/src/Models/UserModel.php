<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Model;
use PDO;

class UserModel extends Model
{
    protected string $table = 'users';

    public function findByEmail(string $email): array|false
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM users WHERE email = ? LIMIT 1'
        );
        $stmt->execute([$email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO users (name, email, password, role, verify_token)
             VALUES (:name, :email, :password, :role, :verify_token)'
        );
        $stmt->execute([
            ':name'         => $data['name'],
            ':email'        => $data['email'],
            ':password'     => $data['password'],
            ':role'         => $data['role'] ?? 'customer',
            ':verify_token' => $data['verify_token'] ?? null,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function updateResetToken(int $id, string $token, string $expires): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?'
        );
        return $stmt->execute([$token, $expires, $id]);
    }

    public function findByResetToken(string $token): array|false
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM users WHERE reset_token = ? LIMIT 1'
        );
        $stmt->execute([$token]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function clearResetToken(int $id): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE users SET reset_token = NULL, reset_expires = NULL WHERE id = ?'
        );
        return $stmt->execute([$id]);
    }

    public function verifyEmail(string $token): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE users SET email_verified = 1, verify_token = NULL
             WHERE verify_token = ? AND email_verified = 0'
        );
        $stmt->execute([$token]);
        return $stmt->rowCount() > 0;
    }

    public function updatePassword(int $id, string $hashedPassword): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE users SET password = ? WHERE id = ?'
        );
        return $stmt->execute([$hashedPassword, $id]);
    }

    public function updateProfile(int $id, array $data): bool
    {
        $fields = [];
        $values = [];

        $allowed = ['name', 'email', 'avatar'];
        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "{$field} = ?";
                $values[] = $data[$field];
            }
        }

        if (empty($fields)) {
            return false;
        }

        $values[] = $id;
        $sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?';
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($values);
    }

    public function findAll(int $limit = 20, int $offset = 0, string $search = ''): array
    {
        if ($search !== '') {
            $stmt = $this->db->prepare(
                'SELECT id, name, email, role, email_verified, avatar, created_at
                 FROM users
                 WHERE name LIKE ? OR email LIKE ?
                 ORDER BY created_at DESC
                 LIMIT ? OFFSET ?'
            );
            $like = '%' . $search . '%';
            $stmt->execute([$like, $like, $limit, $offset]);
        } else {
            $stmt = $this->db->prepare(
                'SELECT id, name, email, role, email_verified, avatar, created_at
                 FROM users
                 ORDER BY created_at DESC
                 LIMIT ? OFFSET ?'
            );
            $stmt->execute([$limit, $offset]);
        }
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function countAll(string $search = ''): int
    {
        if ($search !== '') {
            $stmt = $this->db->prepare(
                'SELECT COUNT(*) FROM users WHERE name LIKE ? OR email LIKE ?'
            );
            $like = '%' . $search . '%';
            $stmt->execute([$like, $like]);
        } else {
            $stmt = $this->db->prepare('SELECT COUNT(*) FROM users');
            $stmt->execute();
        }
        return (int) $stmt->fetchColumn();
    }

    public function updateStatus(int $id, string $role): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE users SET role = ? WHERE id = ?'
        );
        return $stmt->execute([$role, $id]);
    }

    public function findById(int $id): array|false
    {
        $stmt = $this->db->prepare(
            'SELECT id, name, email, role, email_verified, avatar, created_at, updated_at
             FROM users WHERE id = ? LIMIT 1'
        );
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
