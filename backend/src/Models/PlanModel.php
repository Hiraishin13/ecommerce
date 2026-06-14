<?php

declare(strict_types=1);

namespace App\Models;

use App\Config\Database;

class PlanModel
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = Database::pdo();
    }

    public function findAll(bool $publicOnly = false): array
    {
        $where = $publicOnly ? 'WHERE is_public = 1' : '';
        $stmt = $this->db->query("SELECT * FROM plans $where ORDER BY sort_order ASC");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function findById(int $id): array|false
    {
        $stmt = $this->db->prepare('SELECT * FROM plans WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function findBySlug(string $slug): array|false
    {
        $stmt = $this->db->prepare('SELECT * FROM plans WHERE slug = ? LIMIT 1');
        $stmt->execute([$slug]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO plans (name, slug, price_monthly, price_yearly, limits, features, is_public, sort_order)
             VALUES (:name, :slug, :price_monthly, :price_yearly, :limits, :features, :is_public, :sort_order)'
        );
        $stmt->execute([
            ':name'          => $data['name'],
            ':slug'          => $data['slug'],
            ':price_monthly' => $data['price_monthly'] ?? 0,
            ':price_yearly'  => $data['price_yearly'] ?? 0,
            ':limits'        => is_array($data['limits'] ?? null) ? json_encode($data['limits']) : ($data['limits'] ?? '{}'),
            ':features'      => is_array($data['features'] ?? null) ? json_encode($data['features']) : ($data['features'] ?? '{}'),
            ':is_public'     => $data['is_public'] ?? 1,
            ':sort_order'    => $data['sort_order'] ?? 0,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $allowed = ['name', 'slug', 'price_monthly', 'price_yearly', 'limits', 'features', 'is_public', 'sort_order'];
        $set = [];
        $values = [];
        foreach ($allowed as $col) {
            if (array_key_exists($col, $data)) {
                $set[] = "$col = ?";
                $val = $data[$col];
                $values[] = is_array($val) ? json_encode($val) : $val;
            }
        }
        if (!$set) return false;
        $values[] = $id;
        $stmt = $this->db->prepare('UPDATE plans SET ' . implode(', ', $set) . ' WHERE id = ?');
        return $stmt->execute($values);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM plans WHERE id = ?');
        return $stmt->execute([$id]);
    }
}
