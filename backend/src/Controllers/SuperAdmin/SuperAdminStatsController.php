<?php

declare(strict_types=1);

namespace App\Controllers\SuperAdmin;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Config\Database;
use App\Services\InvoiceService;

class SuperAdminStatsController extends Controller
{
    public function index(Request $request, Response $response): void
    {
        $db      = Database::pdo();
        $invoice = new InvoiceService();

        // ── KPIs ──────────────────────────────────────────────────────────────
        $tenantCount = (int) $db->query('SELECT COUNT(*) FROM tenants')->fetchColumn();

        $activeSubs = (int) $db->query(
            "SELECT COUNT(*) FROM subscriptions WHERE status IN ('active','trialing')"
        )->fetchColumn();

        $mrr = $invoice->getMRR();

        $newTrials = (int) $db->query(
            "SELECT COUNT(*) FROM tenants WHERE status='trial'
             AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
        )->fetchColumn();

        $totalRevenue = (float) $db->query(
            "SELECT COALESCE(SUM(amount),0) FROM invoices WHERE status='paid'"
        )->fetchColumn();

        $expiringSoon = (int) $db->query(
            "SELECT COUNT(*) FROM subscriptions
             WHERE status='active'
             AND current_period_end BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)"
        )->fetchColumn();

        // ── Plans distribution ─────────────────────────────────────────────────
        $topPlans = $db->query(
            "SELECT p.name, p.slug, p.price_monthly, COUNT(s.id) AS tenant_count
             FROM subscriptions s
             JOIN plans p ON p.id = s.plan_id
             WHERE s.status IN ('active','trialing')
             GROUP BY p.id ORDER BY tenant_count DESC"
        )->fetchAll(\PDO::FETCH_ASSOC);

        // ── Revenue last 12 months ─────────────────────────────────────────────
        $revenueChart = $invoice->getRevenueLast12Months();

        // ── Recent tenants ─────────────────────────────────────────────────────
        $recentTenants = $db->query(
            "SELECT t.id, t.name, t.slug, t.status, t.created_at,
                    p.name AS plan_name, u.email AS owner_email
             FROM tenants t
             LEFT JOIN plans p ON p.id = t.plan_id
             LEFT JOIN users u ON u.id = t.owner_id
             ORDER BY t.created_at DESC LIMIT 5"
        )->fetchAll(\PDO::FETCH_ASSOC);

        // ── Status breakdown ───────────────────────────────────────────────────
        $statusBreakdown = $db->query(
            "SELECT status, COUNT(*) AS cnt FROM tenants GROUP BY status"
        )->fetchAll(\PDO::FETCH_ASSOC);

        $response->success([
            'kpis' => [
                'tenant_count'         => $tenantCount,
                'active_subscriptions' => $activeSubs,
                'mrr'                  => $mrr,
                'arr'                  => $mrr * 12,
                'total_revenue'        => $totalRevenue,
                'new_trials_7d'        => $newTrials,
                'expiring_soon'        => $expiringSoon,
            ],
            'top_plans'       => $topPlans,
            'revenue_chart'   => $revenueChart,
            'recent_tenants'  => $recentTenants,
            'status_breakdown'=> $statusBreakdown,
        ]);
    }

    public function tenantStats(Request $request, Response $response): void
    {
        $id = (int) $request->param('id');
        $db = Database::pdo();

        $stmt = $db->prepare(
            "SELECT t.*, p.name AS plan_name, p.limits, p.features,
                    u.email AS owner_email, u.name AS owner_name,
                    s.status AS sub_status, s.current_period_end
             FROM tenants t
             LEFT JOIN plans p ON p.id = t.plan_id
             LEFT JOIN users u ON u.id = t.owner_id
             LEFT JOIN subscriptions s ON s.tenant_id = t.id
             WHERE t.id = ?"
        );
        $stmt->execute([$id]);
        $tenant = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$tenant) $response->error('Tenant not found.', 404);

        // decode JSON fields
        foreach (['branding','settings','limits','features'] as $f) {
            if (isset($tenant[$f]) && is_string($tenant[$f])) {
                $tenant[$f] = json_decode($tenant[$f], true);
            }
        }

        $productCount = (int) $db->prepare('SELECT COUNT(*) FROM products WHERE tenant_id = ?')
            ->execute([$id]) ? 0 : 0;
        $ps = $db->prepare('SELECT COUNT(*) FROM products WHERE tenant_id = ?'); $ps->execute([$id]);
        $productCount = (int) $ps->fetchColumn();

        $os = $db->prepare('SELECT COUNT(*) FROM orders WHERE tenant_id = ?'); $os->execute([$id]);
        $orderCount = (int) $os->fetchColumn();

        $us = $db->prepare('SELECT COUNT(*) FROM users WHERE tenant_id = ?'); $us->execute([$id]);
        $userCount = (int) $us->fetchColumn();

        $rs = $db->prepare('SELECT COALESCE(SUM(total),0) FROM orders WHERE tenant_id = ? AND status = "paid"');
        $rs->execute([$id]);
        $revenue = (float) $rs->fetchColumn();

        $monthlyOrders = $db->prepare(
            "SELECT DATE_FORMAT(created_at,'%Y-%m') m, COUNT(*) cnt, SUM(total) rev
             FROM orders WHERE tenant_id = ?
             AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
             GROUP BY m ORDER BY m ASC"
        );
        $monthlyOrders->execute([$id]);

        $response->success([
            'tenant'  => $tenant,
            'usage'   => [
                'products'  => $productCount,
                'orders'    => $orderCount,
                'users'     => $userCount,
                'revenue'   => $revenue,
            ],
            'monthly_orders' => $monthlyOrders->fetchAll(\PDO::FETCH_ASSOC),
        ]);
    }
}
