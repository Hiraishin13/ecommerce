<?php

declare(strict_types=1);

namespace App\Services;

use App\Config\Database;

class FeatureGateService
{
    private array $plan;
    private array $limits;
    private array $features;
    private int   $tenantId;

    public function __construct(int $tenantId)
    {
        $this->tenantId = $tenantId;
        $db   = Database::pdo();
        $stmt = $db->prepare(
            'SELECT p.limits, p.features
             FROM tenants t
             JOIN plans p ON p.id = t.plan_id
             WHERE t.id = ?'
        );
        $stmt->execute([$tenantId]);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);

        $this->limits   = $row ? (json_decode($row['limits'],   true) ?? []) : [];
        $this->features = $row ? (json_decode($row['features'], true) ?? []) : [];
    }

    // ── Feature availability ──────────────────────────────────────────────────

    public function can(string $feature): bool
    {
        return (bool) ($this->features[$feature] ?? false);
    }

    public function requireFeature(string $feature): void
    {
        if (!$this->can($feature)) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => "Cette fonctionnalité n'est pas incluse dans votre plan actuel.",
                'upgrade_required' => true,
                'feature' => $feature,
            ]);
            exit;
        }
    }

    // ── Limits ────────────────────────────────────────────────────────────────

    public function getLimit(string $key): int
    {
        return (int) ($this->limits[$key] ?? 0);
    }

    public function isUnlimited(string $key): bool
    {
        return ($this->limits[$key] ?? 0) === -1;
    }

    public function checkProductLimit(): bool
    {
        if ($this->isUnlimited('products_max')) return true;
        $db   = Database::pdo();
        $stmt = $db->prepare('SELECT COUNT(*) FROM products WHERE tenant_id = ?');
        $stmt->execute([$this->tenantId]);
        return (int) $stmt->fetchColumn() < $this->getLimit('products_max');
    }

    public function checkUserLimit(): bool
    {
        if ($this->isUnlimited('users_max')) return true;
        $db   = Database::pdo();
        $stmt = $db->prepare('SELECT COUNT(*) FROM tenant_users WHERE tenant_id = ?');
        $stmt->execute([$this->tenantId]);
        return (int) $stmt->fetchColumn() < $this->getLimit('users_max');
    }

    // ── Usage stats for dashboard ─────────────────────────────────────────────

    public function getUsage(): array
    {
        $db = Database::pdo();

        $products  = (int) $db->prepare('SELECT COUNT(*) FROM products WHERE tenant_id = ?')->execute([$this->tenantId]) ? 0 : 0;
        $pStmt = $db->prepare('SELECT COUNT(*) FROM products WHERE tenant_id = ?');
        $pStmt->execute([$this->tenantId]);
        $products = (int) $pStmt->fetchColumn();

        $uStmt = $db->prepare('SELECT COUNT(*) FROM tenant_users WHERE tenant_id = ?');
        $uStmt->execute([$this->tenantId]);
        $users = (int) $uStmt->fetchColumn();

        $oStmt = $db->prepare(
            "SELECT COUNT(*) FROM orders WHERE tenant_id = ?
             AND YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW())"
        );
        $oStmt->execute([$this->tenantId]);
        $ordersThisMonth = (int) $oStmt->fetchColumn();

        return [
            'products'         => $products,
            'products_max'     => $this->getLimit('products_max'),
            'products_pct'     => $this->isUnlimited('products_max') ? 0 : ($products / max(1, $this->getLimit('products_max'))) * 100,
            'users'            => $users,
            'users_max'        => $this->getLimit('users_max'),
            'users_pct'        => $this->isUnlimited('users_max') ? 0 : ($users / max(1, $this->getLimit('users_max'))) * 100,
            'orders_month'     => $ordersThisMonth,
            'orders_max'       => $this->getLimit('orders_per_month'),
            'orders_pct'       => $this->isUnlimited('orders_per_month') ? 0 : ($ordersThisMonth / max(1, $this->getLimit('orders_per_month'))) * 100,
        ];
    }

    public function getFeatures(): array { return $this->features; }
    public function getLimits(): array   { return $this->limits; }
}
