<?php

declare(strict_types=1);

namespace App\Middleware;

class CorsMiddleware
{
    public static function handle(): void
    {
        $origin = $_ENV['FRONTEND_URL'] ?? '*';

        header("Access-Control-Allow-Origin: {$origin}");
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Tenant-ID, X-Tenant-Slug');
        header('Access-Control-Allow-Credentials: true');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
}
