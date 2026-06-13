<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Model;
use PDO;

class OrderModel extends Model
{
    protected string $table = 'orders';

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO orders
             (user_id, status, total_amount, shipping_name, shipping_email,
              shipping_phone, shipping_address, shipping_city, shipping_zip,
              shipping_country, notes)
             VALUES
             (:user_id, :status, :total_amount, :shipping_name, :shipping_email,
              :shipping_phone, :shipping_address, :shipping_city, :shipping_zip,
              :shipping_country, :notes)'
        );
        $stmt->execute([
            ':user_id'          => $data['user_id'],
            ':status'           => $data['status'] ?? 'pending',
            ':total_amount'     => $data['total_amount'],
            ':shipping_name'    => $data['shipping_name'],
            ':shipping_email'   => $data['shipping_email'],
            ':shipping_phone'   => $data['shipping_phone'] ?? null,
            ':shipping_address' => $data['shipping_address'],
            ':shipping_city'    => $data['shipping_city'],
            ':shipping_zip'     => $data['shipping_zip'],
            ':shipping_country' => $data['shipping_country'] ?? 'FR',
            ':notes'            => $data['notes'] ?? null,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function createItems(int $orderId, array $items): void
    {
        $stmt = $this->db->prepare(
            'INSERT INTO order_items
             (order_id, product_id, product_name, product_sku, unit_price, quantity, subtotal)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        foreach ($items as $item) {
            $stmt->execute([
                $orderId,
                $item['product_id'],
                $item['product_name'],
                $item['product_sku'] ?? null,
                $item['unit_price'],
                $item['quantity'],
                $item['unit_price'] * $item['quantity'],
            ]);
        }
    }

    public function findById(int $id): array|false
    {
        $stmt = $this->db->prepare(
            "SELECT o.*,
                    o.total_amount AS total,
                    o.total_amount AS subtotal,
                    0 AS discount,
                    0 AS shipping_fee,
                    CONCAT('ORD-', LPAD(o.id, 5, '0')) AS order_number,
                    u.name AS user_name, u.email AS user_email
             FROM orders o
             LEFT JOIN users u ON u.id = o.user_id
             WHERE o.id = ?
             LIMIT 1"
        );
        $stmt->execute([$id]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($order) {
            $order['items'] = $this->getItems($id);
        }

        return $order;
    }

    public function getItems(int $orderId): array
    {
        $stmt = $this->db->prepare(
            'SELECT oi.*, p.slug AS product_slug, p.images AS product_images
             FROM order_items oi
             LEFT JOIN products p ON p.id = oi.product_id
             WHERE oi.order_id = ?'
        );
        $stmt->execute([$orderId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findByUser(int $userId, int $limit = 20, int $offset = 0): array
    {
        $stmt = $this->db->prepare(
            "SELECT *,
                    total_amount AS total,
                    total_amount AS subtotal,
                    0 AS discount,
                    0 AS shipping_fee,
                    CONCAT('ORD-', LPAD(id, 5, '0')) AS order_number
             FROM orders
             WHERE user_id = ?
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?"
        );
        $stmt->execute([$userId, $limit, $offset]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function countByUser(int $userId): int
    {
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM orders WHERE user_id = ?');
        $stmt->execute([$userId]);
        return (int) $stmt->fetchColumn();
    }

    public function findAll(int $limit = 20, int $offset = 0, string $status = ''): array
    {
        if ($status !== '') {
            $stmt = $this->db->prepare(
                "SELECT o.*,
                        o.total_amount AS total,
                        o.total_amount AS subtotal,
                        0 AS discount,
                        0 AS shipping_fee,
                        CONCAT('ORD-', LPAD(o.id, 5, '0')) AS order_number,
                        u.name AS user_name, u.email AS user_email
                 FROM orders o
                 LEFT JOIN users u ON u.id = o.user_id
                 WHERE o.status = ?
                 ORDER BY o.created_at DESC
                 LIMIT ? OFFSET ?"
            );
            $stmt->execute([$status, $limit, $offset]);
        } else {
            $stmt = $this->db->prepare(
                "SELECT o.*,
                        o.total_amount AS total,
                        o.total_amount AS subtotal,
                        0 AS discount,
                        0 AS shipping_fee,
                        CONCAT('ORD-', LPAD(o.id, 5, '0')) AS order_number,
                        u.name AS user_name, u.email AS user_email
                 FROM orders o
                 LEFT JOIN users u ON u.id = o.user_id
                 ORDER BY o.created_at DESC
                 LIMIT ? OFFSET ?"
            );
            $stmt->execute([$limit, $offset]);
        }
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function countAll(string $status = ''): int
    {
        if ($status !== '') {
            $stmt = $this->db->prepare('SELECT COUNT(*) FROM orders WHERE status = ?');
            $stmt->execute([$status]);
        } else {
            $stmt = $this->db->prepare('SELECT COUNT(*) FROM orders');
            $stmt->execute();
        }
        return (int) $stmt->fetchColumn();
    }

    public function updateStatus(int $id, string $status): bool
    {
        $stmt = $this->db->prepare('UPDATE orders SET status = ? WHERE id = ?');
        return $stmt->execute([$status, $id]);
    }

    public function updateStripePaymentIntent(int $id, string $piId): bool
    {
        $stmt = $this->db->prepare('UPDATE orders SET stripe_pi_id = ? WHERE id = ?');
        return $stmt->execute([$piId, $id]);
    }

    public function findByStripePaymentIntent(string $piId): array|false
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM orders WHERE stripe_pi_id = ? LIMIT 1'
        );
        $stmt->execute([$piId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function cancel(int $id, int $userId): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE orders SET status = "cancelled"
             WHERE id = ? AND user_id = ? AND status = "pending"'
        );
        $stmt->execute([$id, $userId]);
        return $stmt->rowCount() > 0;
    }
}
