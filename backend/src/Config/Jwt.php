<?php

declare(strict_types=1);

namespace App\Config;

class Jwt
{
    public static function secret(): string
    {
        return $_ENV['JWT_SECRET'];
    }

    public static function accessTtl(): int
    {
        return (int) $_ENV['JWT_ACCESS_TTL'];
    }

    public static function refreshTtl(): int
    {
        return (int) $_ENV['JWT_REFRESH_TTL'];
    }

    public static function algorithm(): string
    {
        return 'HS256';
    }
}
