<?php

declare(strict_types=1);

namespace App\Core;

class Response
{
    public function json(mixed $data, int $status = 200): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public function success(mixed $data = null, string $message = 'OK', int $status = 200): never
    {
        $payload = ['success' => true, 'message' => $message];
        if ($data !== null) {
            $payload['data'] = $data;
        }
        $this->json($payload, $status);
    }

    public function error(string $message, int $status = 400, array $errors = []): never
    {
        $payload = ['success' => false, 'message' => $message];
        if (!empty($errors)) {
            $payload['errors'] = $errors;
        }
        $this->json($payload, $status);
    }

    public function setCookie(string $name, string $value, int $ttl): void
    {
        setcookie($name, $value, [
            'expires'  => time() + $ttl,
            'path'     => '/',
            'httponly' => true,
            'secure'   => $_ENV['APP_ENV'] === 'production',
            'samesite' => 'Strict',
        ]);
    }

    public function clearCookie(string $name): void
    {
        setcookie($name, '', ['expires' => time() - 3600, 'path' => '/', 'httponly' => true]);
    }
}
