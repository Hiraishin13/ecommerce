<?php

declare(strict_types=1);

namespace App\Controllers\SuperAdmin;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Services\ActivityLogService;

class SuperAdminActivityController extends Controller
{
    public function index(Request $request, Response $response): void
    {
        $page     = max(1, (int) $request->query('page', 1));
        $limit    = min(200, max(1, (int) $request->query('limit', 50)));
        $offset   = ($page - 1) * $limit;
        $tenantId = $request->query('tenant_id') ? (int) $request->query('tenant_id') : null;
        $action   = (string) $request->query('action', '');

        $logs  = ActivityLogService::findAll($limit, $offset, $tenantId, $action ?: null);
        $total = ActivityLogService::count($tenantId, $action ?: null);

        $response->success([
            'logs'       => $logs,
            'total'      => $total,
            'pagination' => ['page' => $page, 'limit' => $limit, 'total_pages' => (int) ceil($total / $limit)],
        ]);
    }
}
