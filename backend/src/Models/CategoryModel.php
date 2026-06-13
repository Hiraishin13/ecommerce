<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Model;
use PDO;

class CategoryModel extends Model
{
    protected string $table = 'categories';

    public function findAll(): array
    {
        $stmt = $this->db->prepare(
            'SELECT c.*,
                    (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = 1) AS products_count
             FROM categories c
             ORDER BY c.sort_order ASC, c.name ASC'
        );
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findBySlug(string $slug): array|false
    {
        $stmt = $this->db->prepare(
            'SELECT c.*,
                    (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = 1) AS products_count
             FROM categories c
             WHERE c.slug = ?
             LIMIT 1'
        );
        $stmt->execute([$slug]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findById(int $id): array|false
    {
        $stmt = $this->db->prepare(
            'SELECT c.*,
                    (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = 1) AS products_count
             FROM categories c
             WHERE c.id = ?
             LIMIT 1'
        );
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO categories (parent_id, name, slug, description, image, sort_order)
             VALUES (:parent_id, :name, :slug, :description, :image, :sort_order)'
        );
        $stmt->execute([
            ':parent_id'   => $data['parent_id'] ?? null,
            ':name'        => $data['name'],
            ':slug'        => $data['slug'],
            ':description' => $data['description'] ?? null,
            ':image'       => $data['image'] ?? null,
            ':sort_order'  => $data['sort_order'] ?? 0,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $allowed = ['parent_id', 'name', 'slug', 'description', 'image', 'sort_order'];
        $fields  = [];
        $values  = [];

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
        $sql = 'UPDATE categories SET ' . implode(', ', $fields) . ' WHERE id = ?';
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($values);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM categories WHERE id = ?');
        return $stmt->execute([$id]);
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
        $stmt = $this->db->prepare('SELECT id FROM categories WHERE slug = ? LIMIT 1');
        $stmt->execute([$slug]);
        return (bool) $stmt->fetch();
    }
}
