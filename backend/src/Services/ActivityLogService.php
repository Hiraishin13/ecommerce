<?php

declare(strict_types=1);

namespace App\Services;

use App\Config\Database;

class ActivityLogService
{
    public static function log(
        string  $action,
        ?int    $tenantId   = null,
        ?int    $userId     = null,
        ?string $userEmail  = null,
        ?string $entityType = null,
        ?int    $entityId   = null,
        ?array  $meta       = null
    ): void {
        try {
            $db = Database::pdo();
            $db->prepare(
                'INSERT INTO activity_logs
                 (tenant_id, user_id, user_email, action, entity_type, entity_id, meta, ip_address, user_agent)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
            )->execute([
                $tenantId,
                $userId,
                $userEmail,
                $action,
                $entityType,
                $entityId,
                $meta ? json_encode($meta) : null,
                $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? null,
                isset($_SERVER['HTTP_USER_AGENT']) ? substr($_SERVER['HTTP_USER_AGENT'], 0, 255) : null,
            ]);
        } catch (\Throwable) {
            // Non-critical — never break the main request
        }
    }

    public static function findAll(
        int    $limit    = 50,
        int    $offset   = 0,
        ?int   $tenantId = null,
        ?string $action  = null,
        ?int   $userId   = null
    ): array {
        $db     = Database::pdo();
        $where  = [];
        $params = [];

        if ($tenantId !== null) { $where[] = 'tenant_id = ?'; $params[] = $tenantId; }
        if ($action   !== null) { $where[] = 'action LIKE ?'; $params[] = "%$action%"; }
        if ($userId   !== null) { $where[] = 'user_id = ?';   $params[] = $userId; }

        $sql  = 'SELECT * FROM activity_logs';
        if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
        $sql .= ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        $params[] = $limit;
        $params[] = $offset;

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public static function count(?int $tenantId = null, ?string $action = null): int
    {
        $db     = Database::pdo();
        $where  = [];
        $params = [];

        if ($tenantId !== null) { $where[] = 'tenant_id = ?'; $params[] = $tenantId; }
        if ($action   !== null) { $where[] = 'action LIKE ?'; $params[] = "%$action%"; }

        $sql = 'SELECT COUNT(*) FROM activity_logs';
        if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        return (int) $stmt->fetchColumn();
    }
}
