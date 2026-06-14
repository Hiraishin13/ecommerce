<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Models\TenantUserModel;

class TenantAdminMiddleware
{
    public function handle(Request $request, Response $response): void
    {
        $role = $request->param('_auth_user_role');

        // Superadmin bypasses all tenant-admin checks
        if ($role === 'superadmin') {
            return;
        }

        $userId   = (int) $request->param('_auth_user_id');
        $tenantId = (int) $request->param('_tenant_id');

        $model      = new TenantUserModel();
        $membership = $model->findByTenantAndUser($tenantId, $userId);

        if (!$membership || !$membership['is_active']) {
            $response->error('Access denied. Not a member of this tenant.', 403);
        }

        if (!in_array($membership['role'], ['owner', 'admin', 'manager'], true)) {
            $response->error('Access denied. Insufficient tenant role.', 403);
        }

        $request->mergeParams(['_tenant_user_role' => $membership['role']]);
    }
}
