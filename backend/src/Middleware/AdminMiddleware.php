<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;

class AdminMiddleware
{
    public function handle(Request $request, Response $response): void
    {
        $role = $request->param('_auth_user_role');

        if ($role !== 'admin') {
            $response->error('Accès refusé.', 403);
        }
    }
}
