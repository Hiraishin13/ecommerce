<?php

declare(strict_types=1);

namespace App\Controllers\Auth;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Services\AuthService;
use App\Config\Jwt;
use RuntimeException;

class AuthController extends Controller
{
    private AuthService $authService;

    public function __construct()
    {
        $this->authService = new AuthService();
    }

    public function register(Request $request, Response $response): void
    {
        $data   = $request->body();
        $errors = $this->validate($data, [
            'name'     => 'required|min:2|max:100',
            'email'    => 'required|email',
            'password' => 'required|min:8',
        ]);

        if (!empty($errors)) {
            $response->error('Validation failed.', 422, $errors);
        }

        try {
            $result = $this->authService->register(
                trim($data['name']),
                strtolower(trim($data['email'])),
                $data['password']
            );

            $response->setCookie('refresh_token', $result['refresh_token'], Jwt::refreshTtl());

            $response->success([
                'user'         => $result['user'],
                'access_token' => $result['access_token'],
            ], 'Registration successful.', 201);
        } catch (RuntimeException $e) {
            $response->error($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    public function login(Request $request, Response $response): void
    {
        $data   = $request->body();
        $errors = $this->validate($data, [
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (!empty($errors)) {
            $response->error('Validation failed.', 422, $errors);
        }

        try {
            $result = $this->authService->login(
                strtolower(trim($data['email'])),
                $data['password']
            );

            $response->setCookie('refresh_token', $result['refresh_token'], Jwt::refreshTtl());

            $response->success([
                'user'         => $result['user'],
                'access_token' => $result['access_token'],
            ], 'Login successful.');
        } catch (RuntimeException $e) {
            $response->error($e->getMessage(), $e->getCode() ?: 401);
        }
    }

    public function refresh(Request $request, Response $response): void
    {
        $refreshToken = $_COOKIE['refresh_token'] ?? null;

        if (!$refreshToken) {
            $response->error('No refresh token provided.', 401);
        }

        try {
            $result = $this->authService->refresh($refreshToken);

            $response->setCookie('refresh_token', $result['refresh_token'], Jwt::refreshTtl());

            $response->success([
                'access_token' => $result['access_token'],
            ], 'Token refreshed.');
        } catch (RuntimeException $e) {
            $response->error($e->getMessage(), $e->getCode() ?: 401);
        }
    }

    public function logout(Request $request, Response $response): void
    {
        $response->clearCookie('refresh_token');
        $response->success(null, 'Logged out successfully.');
    }

    public function forgotPassword(Request $request, Response $response): void
    {
        $data   = $request->body();
        $errors = $this->validate($data, [
            'email' => 'required|email',
        ]);

        if (!empty($errors)) {
            $response->error('Validation failed.', 422, $errors);
        }

        try {
            $this->authService->forgotPassword(strtolower(trim($data['email'])));
        } catch (\Throwable) {
            // Swallow errors to prevent user enumeration
        }

        // Always return the same message
        $response->success(null, 'If that email is registered, a reset link has been sent.');
    }

    public function resetPassword(Request $request, Response $response): void
    {
        $data   = $request->body();
        $errors = $this->validate($data, [
            'token'    => 'required',
            'password' => 'required|min:8',
        ]);

        if (!empty($errors)) {
            $response->error('Validation failed.', 422, $errors);
        }

        try {
            $this->authService->resetPassword($data['token'], $data['password']);
            $response->success(null, 'Password reset successfully. You may now log in.');
        } catch (RuntimeException $e) {
            $response->error($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    public function verifyEmail(Request $request, Response $response): void
    {
        $token = $request->param('token');

        if (!$token) {
            $response->error('Verification token is missing.', 400);
        }

        try {
            $this->authService->verifyEmail($token);
            $response->success(null, 'Email verified successfully.');
        } catch (RuntimeException $e) {
            $response->error($e->getMessage(), $e->getCode() ?: 400);
        }
    }
}
