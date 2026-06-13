<?php

declare(strict_types=1);

namespace App\Core;

class Router
{
    private array $routes = [];

    public function get(string $path, array|callable $handler, array $middlewares = []): void
    {
        $this->addRoute('GET', $path, $handler, $middlewares);
    }

    public function post(string $path, array|callable $handler, array $middlewares = []): void
    {
        $this->addRoute('POST', $path, $handler, $middlewares);
    }

    public function put(string $path, array|callable $handler, array $middlewares = []): void
    {
        $this->addRoute('PUT', $path, $handler, $middlewares);
    }

    public function patch(string $path, array|callable $handler, array $middlewares = []): void
    {
        $this->addRoute('PATCH', $path, $handler, $middlewares);
    }

    public function delete(string $path, array|callable $handler, array $middlewares = []): void
    {
        $this->addRoute('DELETE', $path, $handler, $middlewares);
    }

    private function addRoute(string $method, string $path, array|callable $handler, array $middlewares): void
    {
        $this->routes[] = [
            'method'      => $method,
            'path'        => $path,
            'pattern'     => $this->buildPattern($path),
            'handler'     => $handler,
            'middlewares' => $middlewares,
        ];
    }

    private function buildPattern(string $path): string
    {
        $pattern = preg_replace('/\{([a-zA-Z_]+)\}/', '(?P<$1>[^/]+)', $path);
        return '#^' . $pattern . '$#';
    }

    public function dispatch(Request $request, Response $response): void
    {
        $method = $request->method();
        $uri    = $request->uri();

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            if (!preg_match($route['pattern'], $uri, $matches)) {
                continue;
            }

            $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
            $request->setParams($params);

            foreach ($route['middlewares'] as $middleware) {
                (new $middleware())->handle($request, $response);
            }

            if (is_callable($route['handler'])) {
                ($route['handler'])($request, $response);
            } else {
                [$controllerClass, $method] = $route['handler'];
                (new $controllerClass())->$method($request, $response);
            }

            return;
        }

        $response->json(['error' => 'Not Found'], 404);
    }
}
