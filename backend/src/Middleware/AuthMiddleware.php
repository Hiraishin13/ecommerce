<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Helpers\JwtHelper;

class AuthMiddleware
{
    public function handle(Request $request, Response $response): void
    {
        $token = $request->bearerToken();

        if (!$token) {
            $response->error('Token manquant.', 401);
        }

        $payload = JwtHelper::verifyAccessToken($token);

        if (!$payload) {
            $response->error('Token invalide ou expiré.', 401);
        }

        // Merge auth data into existing route params (preserves {id}, {slug}, etc.)
        $request->mergeParams([
            '_auth_user_id'   => $payload->sub,
            '_auth_user_role' => $payload->role,
        ]);
    }
}
