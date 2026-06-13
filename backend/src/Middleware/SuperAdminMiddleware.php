<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;

class SuperAdminMiddleware
{
    public function handle(Request $request, Response $response): void
    {
        $role = $request->param('_auth_user_role');

        if ($role !== 'superadmin') {
            $response->error('Access denied. Superadmin role required.', 403);
        }
    }
}
