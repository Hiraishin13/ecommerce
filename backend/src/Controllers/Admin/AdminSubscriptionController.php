<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Config\Database;
use App\Models\PlanModel;
use App\Services\FeatureGateService;
use App\Services\InvoiceService;
use App\Services\ActivityLogService;

class AdminSubscriptionController extends Controller
{
    public function show(Request $request, Response $response): void
    {
        $tenantId = (int) $request->param('_tenant_id');
        $db       = Database::pdo();

        $stmt = $db->prepare(
            "SELECT s.*, p.name AS plan_name, p.slug AS plan_slug,
                    p.price_monthly, p.price_yearly, p.limits, p.features,
                    t.name AS tenant_name, t.status AS tenant_status
             FROM subscriptions s
             JOIN plans p ON p.id = s.plan_id
             JOIN tenants t ON t.id = s.tenant_id
             WHERE s.tenant_id = ?
             ORDER BY s.id DESC LIMIT 1"
        );
        $stmt->execute([$tenantId]);
        $sub = $stmt->fetch(\PDO::FETCH_ASSOC);

        if ($sub) {
            foreach (['limits','features'] as $f) {
                if (isset($sub[$f]) && is_string($sub[$f])) {
                    $sub[$f] = json_decode($sub[$f], true);
                }
            }
        }

        $response->success(['subscription' => $sub]);
    }

    public function usage(Request $request, Response $response): void
    {
        $tenantId = (int) $request->param('_tenant_id');
        try {
            $gate  = new FeatureGateService($tenantId);
            $usage = $gate->getUsage();
            $response->success(['usage' => $usage]);
        } catch (\Exception $e) {
            $response->error($e->getMessage(), 500);
        }
    }

    public function invoices(Request $request, Response $response): void
    {
        $tenantId = (int) $request->param('_tenant_id');
        $page     = max(1, (int) $request->query('page', 1));
        $limit    = min(50, max(1, (int) $request->query('limit', 10)));
        $offset   = ($page - 1) * $limit;

        $svc  = new InvoiceService();
        $list = $svc->findByTenant($tenantId, $limit, $offset);

        $response->success(['invoices' => $list]);
    }

    public function plans(Request $request, Response $response): void
    {
        $model = new PlanModel();
        $plans = $model->findAll(publicOnly: true);

        foreach ($plans as &$p) {
            foreach (['limits','features'] as $f) {
                if (isset($p[$f]) && is_string($p[$f])) {
                    $p[$f] = json_decode($p[$f], true);
                }
            }
        }

        $response->success(['plans' => $plans]);
    }

    public function requestUpgrade(Request $request, Response $response): void
    {
        $tenantId = (int) $request->param('_tenant_id');
        $planId   = (int) ($request->body()['plan_id'] ?? 0);

        if (!$planId) {
            $response->error('plan_id is required.', 422);
        }

        $plan = (new PlanModel())->findById($planId);
        if (!$plan) {
            $response->error('Plan not found.', 404);
        }

        // Log the upgrade request — actual billing handled externally / Stripe webhook
        ActivityLogService::log(
            'subscription.upgrade_requested',
            $tenantId,
            (int) $request->param('_auth_user_id'),
            null,
            'subscription',
            $tenantId,
            ['requested_plan_id' => $planId, 'plan_name' => $plan['name']]
        );

        $response->success([
            'message'   => 'Upgrade request received.',
            'plan'      => $plan,
            'checkout_url' => null, // set when Stripe is integrated
        ], 'Upgrade request submitted.');
    }

    public function checkFeature(Request $request, Response $response): void
    {
        $tenantId = (int) $request->param('_tenant_id');
        $feature  = $request->param('feature');

        try {
            $gate    = new FeatureGateService($tenantId);
            $allowed = $gate->can($feature);
            $response->success(['feature' => $feature, 'allowed' => $allowed]);
        } catch (\Exception $e) {
            $response->error($e->getMessage(), 500);
        }
    }
}
