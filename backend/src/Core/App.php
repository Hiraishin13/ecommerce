<?php

declare(strict_types=1);

namespace App\Core;

use App\Middleware\CorsMiddleware;

class App
{
    private Router $router;

    public function __construct()
    {
        $this->router = new Router();
    }

    public function run(): void
    {
        CorsMiddleware::handle();

        $request = new Request();
        $response = new Response();

        require BASE_PATH . '/routes/api.php';

        $this->router->dispatch($request, $response);
    }
}
