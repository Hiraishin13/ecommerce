<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Model;
use PDO;

class ReviewModel extends Model
{
    protected string $table = 'reviews';

    public function findByProduct(int $productId, int $limit = 20, int $offset = 0): array
    {
        $stmt = $this->db->prepare(
            'SELECT r.id, r.rating, r.title, r.body, r.created_at,
                    u.name AS user_name, u.avatar AS user_avatar
             FROM reviews r
             INNER JOIN users u ON u.id = r.user_id
             WHERE r.product_id = ? AND r.is_approved = 1
             ORDER BY r.created_at DESC
             LIMIT ? OFFSET ?'
        );
        $stmt->execute([$productId, $limit, $offset]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function countByProduct(int $productId): int
    {
        $stmt = $this->db->prepare(
            'SELECT COUNT(*) FROM reviews WHERE product_id = ? AND is_approved = 1'
        );
        $stmt->execute([$productId]);
        return (int) $stmt->fetchColumn();
    }

    public function averageRating(int $productId): float
    {
        $stmt = $this->db->prepare(
            'SELECT AVG(rating) FROM reviews WHERE product_id = ? AND is_approved = 1'
        );
        $stmt->execute([$productId]);
        return (float) $stmt->fetchColumn();
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO reviews (product_id, user_id, rating, title, body, is_approved)
             VALUES (:product_id, :user_id, :rating, :title, :body, :is_approved)'
        );
        $stmt->execute([
            ':product_id'  => $data['product_id'],
            ':user_id'     => $data['user_id'],
            ':rating'      => $data['rating'],
            ':title'       => $data['title'] ?? null,
            ':body'        => $data['body'] ?? null,
            ':is_approved' => $data['is_approved'] ?? 1,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function destroy(int $id, int $userId): bool
    {
        $stmt = $this->db->prepare(
            'DELETE FROM reviews WHERE id = ? AND user_id = ?'
        );
        $stmt->execute([$id, $userId]);
        return $stmt->rowCount() > 0;
    }

    public function findByUser(int $userId, int $limit = 20, int $offset = 0): array
    {
        $stmt = $this->db->prepare(
            'SELECT r.*, p.name AS product_name, p.slug AS product_slug
             FROM reviews r
             INNER JOIN products p ON p.id = r.product_id
             WHERE r.user_id = ?
             ORDER BY r.created_at DESC
             LIMIT ? OFFSET ?'
        );
        $stmt->execute([$userId, $limit, $offset]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function hasUserReviewed(int $userId, int $productId): bool
    {
        $stmt = $this->db->prepare(
            'SELECT id FROM reviews WHERE user_id = ? AND product_id = ? LIMIT 1'
        );
        $stmt->execute([$userId, $productId]);
        return (bool) $stmt->fetch();
    }
}
