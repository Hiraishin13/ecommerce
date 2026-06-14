<?php

declare(strict_types=1);

namespace App\Controllers\SuperAdmin;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\TenantModel;
use App\Services\ActivityLogService;
use App\Services\InvoiceService;

class SuperAdminTenantController extends Controller
{
    private TenantModel $tenants;

    public function __construct()
    {
        $this->tenants = new TenantModel();
    }

    public function index(Request $request, Response $response): void
    {
        $page   = max(1, (int) $request->query('page', 1));
        $limit  = min(100, max(1, (int) $request->query('limit', 20)));
        $offset = ($page - 1) * $limit;
        $search = (string) $request->query('search', '');
        $status = (string) $request->query('status', '');

        $tenants = $this->tenants->findAll($limit, $offset, $search, $status);
        $total   = $this->tenants->countAll($search, $status);

        $response->success([
            'tenants'    => $tenants,
            'total'      => $total,
            'pagination' => ['page' => $page, 'limit' => $limit, 'total_pages' => (int) ceil($total / $limit)],
        ]);
    }

    public function show(Request $request, Response $response): void
    {
        $id     = (int) $request->param('id');
        $tenant = $this->tenants->findById($id);

        if (!$tenant) $response->error('Tenant not found.', 404);

        foreach (['branding','settings'] as $f) {
            if (isset($tenant[$f]) && is_string($tenant[$f])) {
                $tenant[$f] = json_decode($tenant[$f], true);
            }
        }

        $response->success(['tenant' => $tenant]);
    }

    public function update(Request $request, Response $response): void
    {
        $id     = (int) $request->param('id');
        $tenant = $this->tenants->findById($id);
        if (!$tenant) $response->error('Tenant not found.', 404);

        $allowed = ['name','plan_id','status','sector','domain'];
        $data    = array_intersect_key($request->body(), array_flip($allowed));

        $this->tenants->update($id, $data);

        ActivityLogService::log(
            'tenant.update',
            null,
            (int) $request->param('_auth_user_id'),
            null,
            'tenant', $id,
            $data
        );

        $response->success(['tenant' => $this->tenants->findById($id)], 'Tenant updated.');
    }

    public function updateStatus(Request $request, Response $response): void
    {
        $id     = (int) $request->param('id');
        $tenant = $this->tenants->findById($id);
        if (!$tenant) $response->error('Tenant not found.', 404);

        $status  = $request->body()['status'] ?? '';
        $allowed = ['active','suspended','trial','cancelled'];
        if (!in_array($status, $allowed, true)) {
            $response->error('Invalid status.', 422);
        }

        $this->tenants->updateStatus($id, $status);

        ActivityLogService::log(
            "tenant.{$status}",
            null,
            (int) $request->param('_auth_user_id'),
            null,
            'tenant', $id,
            ['previous_status' => $tenant['status'], 'new_status' => $status]
        );

        $updated = $this->tenants->findById($id);
        $response->success(['tenant' => $updated], "Tenant $status.");
    }

    public function upgradePlan(Request $request, Response $response): void
    {
        $id     = (int) $request->param('id');
        $tenant = $this->tenants->findById($id);
        if (!$tenant) $response->error('Tenant not found.', 404);

        $planId = (int) ($request->body()['plan_id'] ?? 0);
        if (!$planId) $response->error('plan_id is required.', 422);

        $this->tenants->update($id, ['plan_id' => $planId]);

        // Update active subscription
        $db = \App\Config\Database::pdo();
        $db->prepare('UPDATE subscriptions SET plan_id = ? WHERE tenant_id = ? ORDER BY id DESC LIMIT 1')
           ->execute([$planId, $id]);

        ActivityLogService::log(
            'tenant.plan_change',
            null,
            (int) $request->param('_auth_user_id'),
            null,
            'tenant', $id,
            ['old_plan' => $tenant['plan_id'], 'new_plan' => $planId]
        );

        $response->success(null, 'Plan updated.');
    }

    public function destroy(Request $request, Response $response): void
    {
        $id = (int) $request->param('id');
        if ($id === 1) $response->error('Cannot delete the default tenant.', 403);

        $tenant = $this->tenants->findById($id);
        if (!$tenant) $response->error('Tenant not found.', 404);

        ActivityLogService::log(
            'tenant.delete',
            null,
            (int) $request->param('_auth_user_id'),
            null,
            'tenant', $id,
            ['name' => $tenant['name'], 'slug' => $tenant['slug']]
        );

        $this->tenants->delete($id);
        $response->success(null, 'Tenant deleted.');
    }
}
