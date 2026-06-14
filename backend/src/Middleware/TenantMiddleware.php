<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Models\TenantModel;

class TenantMiddleware
{
    public function handle(Request $request, Response $response): void
    {
        $tenantModel = new TenantModel();
        $tenant      = null;

        // 1. Integer ID header (superadmin / trusted calls)
        $tenantId = $request->header('X-Tenant-ID');
        if ($tenantId && ctype_digit($tenantId)) {
            $tenant = $tenantModel->findById((int) $tenantId);
        }

        // 2. Slug header (Vite proxy dev injection)
        if (!$tenant) {
            $slug = $request->header('X-Tenant-Slug');
            if ($slug) {
                $tenant = $tenantModel->findBySlug($slug);
            }
        }

        // 3. Subdomain from Host header
        if (!$tenant) {
            $slug = $this->extractSubdomain($request->header('Host') ?? '');
            if ($slug) {
                $tenant = $tenantModel->findBySlug($slug);
            }
        }

        // 4. Query param fallback
        if (!$tenant) {
            $slug = $request->query('tenant_slug');
            if ($slug) {
                $tenant = $tenantModel->findBySlug($slug);
            }
        }

        if (!$tenant) {
            $response->error('Tenant not found.', 404);
        }

        if ($tenant['status'] === 'suspended') {
            $response->error('This shop is suspended.', 403);
        }

        if ($tenant['status'] === 'cancelled') {
            $response->error('This shop is no longer active.', 410);
        }

        $request->mergeParams([
            '_tenant_id'      => (int) $tenant['id'],
            '_tenant_slug'    => $tenant['slug'],
            '_tenant_status'  => $tenant['status'],
            '_tenant_plan_id' => (int) $tenant['plan_id'],
        ]);
    }

    private function extractSubdomain(string $host): ?string
    {
        // Strip port if present
        $host = explode(':', $host)[0];
        $parts = explode('.', $host);

        // Need at least subdomain.domain.tld
        if (count($parts) < 3) {
            return null;
        }

        $sub = $parts[0];
        $skip = ['www', 'api', 'app', 'localhost', 'mail', 'ftp'];

        return in_array($sub, $skip, true) ? null : $sub;
    }
}
