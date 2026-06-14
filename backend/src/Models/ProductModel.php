<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Model;
use PDO;

class ProductModel extends Model
{
    protected string $table = 'products';

    /**
     * @param array{category_id?:int,min_price?:float,max_price?:float,search?:string,is_featured?:int} $filters
     * @param array{limit?:int,offset?:int} $pagination
     */
    public function findAll(array $filters = [], array $pagination = []): array
    {
        $where    = ['p.is_active = 1'];
        $bindings = [];

        if (!empty($filters['category_id'])) {
            $where[]    = 'p.category_id = ?';
            $bindings[] = (int) $filters['category_id'];
        }

        if (isset($filters['min_price'])) {
            $where[]    = 'p.price >= ?';
            $bindings[] = (float) $filters['min_price'];
        }

        if (isset($filters['max_price'])) {
            $where[]    = 'p.price <= ?';
            $bindings[] = (float) $filters['max_price'];
        }

        if (!empty($filters['is_featured'])) {
            $where[]    = 'p.is_featured = 1';
        }

        if (!empty($filters['search'])) {
            $where[]    = 'MATCH(p.name, p.description) AGAINST(? IN BOOLEAN MODE)';
            $bindings[] = $filters['search'] . '*';
        }

        $whereClause = implode(' AND ', $where);
        $limit  = (int) ($pagination['limit'] ?? 20);
        $offset = (int) ($pagination['offset'] ?? 0);

        $sql = "SELECT p.*, c.name AS category_name, c.slug AS category_slug
                FROM products p
                LEFT JOIN categories c ON c.id = p.category_id
                WHERE {$whereClause}
                ORDER BY p.created_at DESC
                LIMIT ? OFFSET ?";

        $bindings[] = $limit;
        $bindings[] = $offset;

        $stmt = $this->db->prepare($sql);
        $stmt->execute($bindings);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function countFiltered(array $filters = []): int
    {
        $where    = ['p.is_active = 1'];
        $bindings = [];

        if (!empty($filters['category_id'])) {
            $where[]    = 'p.category_id = ?';
            $bindings[] = (int) $filters['category_id'];
        }

        if (isset($filters['min_price'])) {
            $where[]    = 'p.price >= ?';
            $bindings[] = (float) $filters['min_price'];
        }

        if (isset($filters['max_price'])) {
            $where[]    = 'p.price <= ?';
            $bindings[] = (float) $filters['max_price'];
        }

        if (!empty($filters['is_featured'])) {
            $where[]    = 'p.is_featured = 1';
        }

        if (!empty($filters['search'])) {
            $where[]    = 'MATCH(p.name, p.description) AGAINST(? IN BOOLEAN MODE)';
            $bindings[] = $filters['search'] . '*';
        }

        $whereClause = implode(' AND ', $where);
        $sql = "SELECT COUNT(*) FROM products p WHERE {$whereClause}";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($bindings);
        return (int) $stmt->fetchColumn();
    }

    public function findBySlug(string $slug): array|false
    {
        $stmt = $this->db->prepare(
            'SELECT p.*, c.name AS category_name, c.slug AS category_slug
             FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.slug = ? AND p.is_active = 1
             LIMIT 1'
        );
        $stmt->execute([$slug]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findById(int $id): array|false
    {
        $stmt = $this->db->prepare(
            'SELECT p.*, c.name AS category_name, c.slug AS category_slug
             FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.id = ?
             LIMIT 1'
        );
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /** Returns assoc array keyed by product id */
    public function findByIds(array $ids): array
    {
        if (empty($ids)) {
            return [];
        }
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $stmt = $this->db->prepare(
            "SELECT id, name, sku, price, stock, is_active FROM products WHERE id IN ($placeholders)"
        );
        $stmt->execute($ids);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $indexed = [];
        foreach ($rows as $row) {
            $indexed[(int) $row['id']] = $row;
        }
        return $indexed;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO products
             (category_id, name, slug, description, price, compare_price, stock, sku,
              images, is_active, is_featured, weight, meta_title, meta_desc)
             VALUES
             (:category_id, :name, :slug, :description, :price, :compare_price, :stock, :sku,
              :images, :is_active, :is_featured, :weight, :meta_title, :meta_desc)'
        );
        $stmt->execute([
            ':category_id'   => $data['category_id'] ?? null,
            ':name'          => $data['name'],
            ':slug'          => $data['slug'],
            ':description'   => $data['description'] ?? null,
            ':price'         => $data['price'],
            ':compare_price' => $data['compare_price'] ?? null,
            ':stock'         => $data['stock'] ?? 0,
            ':sku'           => $data['sku'] ?? null,
            ':images'        => isset($data['images']) ? (is_string($data['images']) ? $data['images'] : json_encode($data['images'])) : null,
            ':is_active'     => $data['is_active'] ?? 1,
            ':is_featured'   => $data['is_featured'] ?? 0,
            ':weight'        => $data['weight'] ?? null,
            ':meta_title'    => $data['meta_title'] ?? null,
            ':meta_desc'     => $data['meta_desc'] ?? null,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $allowed = [
            'category_id', 'name', 'slug', 'description', 'price',
            'compare_price', 'stock', 'sku', 'images', 'is_active',
            'is_featured', 'weight', 'meta_title', 'meta_desc',
        ];

        $fields = [];
        $values = [];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "{$field} = ?";
                $values[] = ($field === 'images' && is_array($data[$field]))
                    ? json_encode($data[$field])
                    : $data[$field];
            }
        }

        if (empty($fields)) {
            return false;
        }

        $values[] = $id;
        $sql = 'UPDATE products SET ' . implode(', ', $fields) . ' WHERE id = ?';
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($values);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM products WHERE id = ?');
        return $stmt->execute([$id]);
    }

    /** Recherche rapide pour la caisse POS (LIKE sur nom + SKU, avec stock) */
    public function rechercherCaisse(string $query, int $limit = 10): array
    {
        $like = '%' . $query . '%';
        $stmt = $this->db->prepare(
            "SELECT p.id, p.name, p.slug, p.sku, p.price, p.stock,
                    p.images, p.a_des_variantes,
                    c.name AS category_name
             FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.is_active = 1
               AND (p.name LIKE ? OR p.sku LIKE ?)
             ORDER BY p.name ASC
             LIMIT ?"
        );
        $stmt->execute([$like, $like, $limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function search(string $query, int $limit = 20): array
    {
        $stmt = $this->db->prepare(
            'SELECT p.*, c.name AS category_name
             FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.is_active = 1
               AND MATCH(p.name, p.description) AGAINST(? IN BOOLEAN MODE)
             ORDER BY MATCH(p.name, p.description) AGAINST(? IN BOOLEAN MODE) DESC
             LIMIT ?'
        );
        $q = $query . '*';
        $stmt->execute([$q, $q, $limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getFeatured(int $limit = 8): array
    {
        $stmt = $this->db->prepare(
            'SELECT p.*, c.name AS category_name
             FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.is_active = 1 AND p.is_featured = 1
             ORDER BY p.created_at DESC
             LIMIT ?'
        );
        $stmt->execute([$limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getBestsellers(int $limit = 8): array
    {
        $stmt = $this->db->prepare(
            'SELECT p.*, c.name AS category_name, SUM(oi.quantity) AS total_sold
             FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             LEFT JOIN order_items oi ON oi.product_id = p.id
             WHERE p.is_active = 1
             GROUP BY p.id
             ORDER BY total_sold DESC
             LIMIT ?'
        );
        $stmt->execute([$limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function decrementStock(int $productId, int $quantity): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?'
        );
        $stmt->execute([$quantity, $productId, $quantity]);
        return $stmt->rowCount() > 0;
    }

    public function generateSlug(string $name): string
    {
        $slug = strtolower(trim($name));
        $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
        $slug = preg_replace('/[\s-]+/', '-', $slug);
        $slug = trim($slug, '-');

        $original = $slug;
        $counter  = 1;
        while ($this->slugExists($slug)) {
            $slug = $original . '-' . $counter;
            $counter++;
        }
        return $slug;
    }

    private function slugExists(string $slug): bool
    {
        $stmt = $this->db->prepare('SELECT id FROM products WHERE slug = ? LIMIT 1');
        $stmt->execute([$slug]);
        return (bool) $stmt->fetch();
    }
}
