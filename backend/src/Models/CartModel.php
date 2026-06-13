<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Model;
use PDO;

class CartModel extends Model
{
    protected string $table = 'cart_items';

    public function getByUser(int $userId): array
    {
        $stmt = $this->db->prepare(
            'SELECT ci.id, ci.user_id, ci.product_id, ci.quantity,
                    p.name, p.slug, p.price, p.compare_price, p.stock,
                    p.images, p.sku, p.is_active
             FROM cart_items ci
             INNER JOIN products p ON p.id = ci.product_id
             WHERE ci.user_id = ?
             ORDER BY ci.created_at ASC'
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findItem(int $userId, int $productId): array|false
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ? LIMIT 1'
        );
        $stmt->execute([$userId, $productId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findItemById(int $itemId, int $userId): array|false
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM cart_items WHERE id = ? AND user_id = ? LIMIT 1'
        );
        $stmt->execute([$itemId, $userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function addItem(int $userId, int $productId, int $quantity): int
    {
        // Upsert — if already in cart, increment quantity
        $existing = $this->findItem($userId, $productId);

        if ($existing) {
            $newQty = $existing['quantity'] + $quantity;
            $stmt = $this->db->prepare(
                'UPDATE cart_items SET quantity = ? WHERE id = ?'
            );
            $stmt->execute([$newQty, $existing['id']]);
            return $existing['id'];
        }

        $stmt = $this->db->prepare(
            'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)'
        );
        $stmt->execute([$userId, $productId, $quantity]);
        return (int) $this->db->lastInsertId();
    }

    public function updateItem(int $itemId, int $userId, int $quantity): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?'
        );
        $stmt->execute([$quantity, $itemId, $userId]);
        return $stmt->rowCount() > 0;
    }

    public function removeItem(int $itemId, int $userId): bool
    {
        $stmt = $this->db->prepare(
            'DELETE FROM cart_items WHERE id = ? AND user_id = ?'
        );
        $stmt->execute([$itemId, $userId]);
        return $stmt->rowCount() > 0;
    }

    public function clear(int $userId): bool
    {
        $stmt = $this->db->prepare('DELETE FROM cart_items WHERE user_id = ?');
        return $stmt->execute([$userId]);
    }

    public function mergeGuestCart(int $userId, array $guestItems): void
    {
        foreach ($guestItems as $item) {
            if (empty($item['product_id']) || empty($item['quantity'])) {
                continue;
            }
            $this->addItem($userId, (int) $item['product_id'], (int) $item['quantity']);
        }
    }
}
