<?php

declare(strict_types=1);

namespace App\Models;

use App\Config\Database;

class TenantModel
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = Database::pdo();
    }

    public function findById(int $id): array|false
    {
        $stmt = $this->db->prepare('SELECT * FROM tenants WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function findBySlug(string $slug): array|false
    {
        $stmt = $this->db->prepare('SELECT * FROM tenants WHERE slug = ? LIMIT 1');
        $stmt->execute([$slug]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function findByDomain(string $domain): array|false
    {
        $stmt = $this->db->prepare('SELECT * FROM tenants WHERE domain = ? LIMIT 1');
        $stmt->execute([$domain]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function slugExists(string $slug, int $excludeId = 0): bool
    {
        $stmt = $this->db->prepare('SELECT id FROM tenants WHERE slug = ? AND id != ? LIMIT 1');
        $stmt->execute([$slug, $excludeId]);
        return (bool) $stmt->fetch();
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO tenants (name, slug, owner_id, plan_id, status, branding, sector, settings, trial_ends_at)
             VALUES (:name, :slug, :owner_id, :plan_id, :status, :branding, :sector, :settings, :trial_ends_at)'
        );
        $stmt->execute([
            ':name'          => $data['name'],
            ':slug'          => $data['slug'],
            ':owner_id'      => $data['owner_id'] ?? null,
            ':plan_id'       => $data['plan_id'] ?? 1,
            ':status'        => $data['status'] ?? 'trial',
            ':branding'      => isset($data['branding']) ? json_encode($data['branding']) : null,
            ':sector'        => $data['sector'] ?? 'autre',
            ':settings'      => isset($data['settings']) ? json_encode($data['settings']) : null,
            ':trial_ends_at' => $data['trial_ends_at'] ?? null,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $allowed = ['name', 'slug', 'owner_id', 'plan_id', 'status', 'branding', 'sector', 'settings', 'domain', 'trial_ends_at'];
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
        $stmt = $this->db->prepare('UPDATE tenants SET ' . implode(', ', $set) . ' WHERE id = ?');
        return $stmt->execute($values);
    }

    public function updateStatus(int $id, string $status): bool
    {
        $stmt = $this->db->prepare('UPDATE tenants SET status = ? WHERE id = ?');
        return $stmt->execute([$status, $id]);
    }

    public function findAll(int $limit = 20, int $offset = 0, string $search = ''): array
    {
        $where = '';
        $params = [];
        if ($search !== '') {
            $where = 'WHERE t.name LIKE ? OR t.slug LIKE ?';
            $params = ["%$search%", "%$search%"];
        }
        $params[] = $limit;
        $params[] = $offset;
        $stmt = $this->db->prepare(
            "SELECT t.*, p.name AS plan_name,
                    u.name AS owner_name, u.email AS owner_email
             FROM tenants t
             LEFT JOIN plans p ON p.id = t.plan_id
             LEFT JOIN users u ON u.id = t.owner_id
             $where
             ORDER BY t.created_at DESC
             LIMIT ? OFFSET ?"
        );
        $stmt->execute($params);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function countAll(string $search = ''): int
    {
        if ($search !== '') {
            $stmt = $this->db->prepare('SELECT COUNT(*) FROM tenants WHERE name LIKE ? OR slug LIKE ?');
            $stmt->execute(["%$search%", "%$search%"]);
        } else {
            $stmt = $this->db->query('SELECT COUNT(*) FROM tenants');
        }
        return (int) $stmt->fetchColumn();
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM tenants WHERE id = ?');
        return $stmt->execute([$id]);
    }
}
