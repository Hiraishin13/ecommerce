<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\TenantModel;

class TenantSettingsController extends Controller
{
    private TenantModel $tenants;

    public function __construct()
    {
        $this->tenants = new TenantModel();
    }

    public function show(Request $request, Response $response): void
    {
        $tenantId = (int) $request->param('_tenant_id');
        $tenant   = $this->tenants->findById($tenantId);

        if (!$tenant) {
            $response->error('Tenant not found.', 404);
        }

        if (is_string($tenant['branding'])) {
            $tenant['branding'] = json_decode($tenant['branding'], true);
        }
        if (is_string($tenant['settings'])) {
            $tenant['settings'] = json_decode($tenant['settings'], true);
        }

        $response->success(['tenant' => $tenant]);
    }

    public function update(Request $request, Response $response): void
    {
        $tenantId = (int) $request->param('_tenant_id');
        $data     = $request->body();

        $allowed = ['name', 'sector', 'branding', 'settings'];
        $update  = array_intersect_key($data, array_flip($allowed));

        if (empty($update)) {
            $response->error('No valid fields to update.', 422);
        }

        $this->tenants->update($tenantId, $update);
        $tenant = $this->tenants->findById($tenantId);

        if (is_string($tenant['branding'])) {
            $tenant['branding'] = json_decode($tenant['branding'], true);
        }

        $response->success(['tenant' => $tenant], 'Settings updated.');
    }
}
