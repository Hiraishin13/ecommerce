<?php

declare(strict_types=1);

namespace App\Models;

use App\Config\Database;

class TenantUserModel
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = Database::pdo();
    }

    public function findByTenantAndUser(int $tenantId, int $userId): array|false
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM tenant_users WHERE tenant_id = ? AND user_id = ? LIMIT 1'
        );
        $stmt->execute([$tenantId, $userId]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function getMembersOfTenant(int $tenantId): array
    {
        $stmt = $this->db->prepare(
            'SELECT tu.*, u.name, u.email, u.avatar, u.created_at AS user_created_at
             FROM tenant_users tu
             JOIN users u ON u.id = tu.user_id
             WHERE tu.tenant_id = ?
             ORDER BY tu.created_at ASC'
        );
        $stmt->execute([$tenantId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function addMember(int $tenantId, int $userId, string $role, ?int $invitedBy = null): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO tenant_users (tenant_id, user_id, role, invited_by)
             VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([$tenantId, $userId, $role, $invitedBy]);
        return (int) $this->db->lastInsertId();
    }

    public function updateRole(int $tenantId, int $userId, string $role): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE tenant_users SET role = ? WHERE tenant_id = ? AND user_id = ?'
        );
        return $stmt->execute([$role, $tenantId, $userId]);
    }

    public function removeMember(int $tenantId, int $userId): bool
    {
        $stmt = $this->db->prepare(
            'DELETE FROM tenant_users WHERE tenant_id = ? AND user_id = ?'
        );
        return $stmt->execute([$tenantId, $userId]);
    }

    public function getUserTenants(int $userId): array
    {
        $stmt = $this->db->prepare(
            'SELECT t.*, tu.role AS member_role
             FROM tenant_users tu
             JOIN tenants t ON t.id = tu.tenant_id
             WHERE tu.user_id = ? AND tu.is_active = 1
             ORDER BY tu.created_at ASC'
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
