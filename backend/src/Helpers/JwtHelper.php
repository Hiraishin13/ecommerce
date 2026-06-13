<?php

declare(strict_types=1);

namespace App\Helpers;

use App\Config\Jwt as JwtConfig;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Throwable;

class JwtHelper
{
    public static function generateAccessToken(int $userId, string $role): string
    {
        $now = time();
        $payload = [
            'iss' => $_ENV['APP_URL'],
            'iat' => $now,
            'exp' => $now + JwtConfig::accessTtl(),
            'sub' => $userId,
            'role' => $role,
        ];
        return JWT::encode($payload, JwtConfig::secret(), JwtConfig::algorithm());
    }

    public static function generateRefreshToken(int $userId): string
    {
        $now = time();
        $payload = [
            'iss' => $_ENV['APP_URL'],
            'iat' => $now,
            'exp' => $now + JwtConfig::refreshTtl(),
            'sub' => $userId,
            'type' => 'refresh',
        ];
        return JWT::encode($payload, JwtConfig::secret(), JwtConfig::algorithm());
    }

    public static function verifyAccessToken(string $token): object|false
    {
        try {
            return JWT::decode($token, new Key(JwtConfig::secret(), JwtConfig::algorithm()));
        } catch (Throwable) {
            return false;
        }
    }

    public static function verifyRefreshToken(string $token): object|false
    {
        try {
            $decoded = JWT::decode($token, new Key(JwtConfig::secret(), JwtConfig::algorithm()));
            if (($decoded->type ?? '') !== 'refresh') {
                return false;
            }
            return $decoded;
        } catch (Throwable) {
            return false;
        }
    }
}
