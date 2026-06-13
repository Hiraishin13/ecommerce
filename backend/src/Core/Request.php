<?php

declare(strict_types=1);

namespace App\Core;

class Request
{
    private array $params = [];
    private array $body   = [];

    public function __construct()
    {
        $raw = file_get_contents('php://input');
        if (!empty($raw)) {
            $this->body = json_decode($raw, true) ?? [];
        }
    }

    public function method(): string
    {
        return strtoupper($_SERVER['REQUEST_METHOD']);
    }

    public function uri(): string
    {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        return rtrim($uri, '/') ?: '/';
    }

    public function setParams(array $params): void
    {
        $this->params = $params;
    }

    public function mergeParams(array $params): void
    {
        $this->params = array_merge($this->params, $params);
    }

    public function param(string $key, mixed $default = null): mixed
    {
        return $this->params[$key] ?? $default;
    }

    public function body(string $key = null, mixed $default = null): mixed
    {
        if ($key === null) {
            return $this->body;
        }
        return $this->body[$key] ?? $default;
    }

    public function query(string $key, mixed $default = null): mixed
    {
        return $_GET[$key] ?? $default;
    }

    public function header(string $key): ?string
    {
        $server = 'HTTP_' . strtoupper(str_replace('-', '_', $key));
        return $_SERVER[$server] ?? null;
    }

    public function bearerToken(): ?string
    {
        $auth = $this->header('Authorization');
        if ($auth && str_starts_with($auth, 'Bearer ')) {
            return substr($auth, 7);
        }
        return null;
    }
}
