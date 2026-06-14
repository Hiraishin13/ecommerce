<?php

declare(strict_types=1);

namespace App\Controllers\SaaS;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\PlanModel;
use App\Models\TenantModel;
use App\Services\AuthService;
use App\Config\Jwt;
use RuntimeException;

class TenantSignupController extends Controller
{
    public function listPlans(Request $request, Response $response): void
    {
        $plans = (new PlanModel())->findAll(publicOnly: true);
        $response->success(['plans' => $plans]);
    }

    public function checkSlug(Request $request, Response $response): void
    {
        $slug  = strtolower(trim($request->param('slug') ?? ''));
        $taken = (new TenantModel())->slugExists($slug);
        $response->success(['available' => !$taken, 'slug' => $slug]);
    }

    public function createTenant(Request $request, Response $response): void
    {
        $data   = $request->body();
        $errors = $this->validate($data, [
            'shop_name'    => 'required|min:2|max:200',
            'shop_slug'    => 'required|min:2|max:100',
            'owner_name'   => 'required|min:2|max:100',
            'email'        => 'required|email',
            'password'     => 'required|min:8',
        ]);

        if (!empty($errors)) {
            $response->error('Validation failed.', 422, $errors);
        }

        // Validate slug format
        $slug = strtolower(trim($data['shop_slug']));
        if (!preg_match('/^[a-z0-9][a-z0-9-]{1,98}[a-z0-9]$/', $slug)) {
            $response->error('Shop URL must be lowercase letters, numbers and hyphens only.', 422);
        }

        $planId = (int) ($data['plan_id'] ?? 1);

        try {
            $authService = new AuthService();
            $result = $authService->registerTenant(
                shopName:   trim($data['shop_name']),
                shopSlug:   $slug,
                sector:     $data['sector'] ?? 'autre',
                ownerName:  trim($data['owner_name']),
                ownerEmail: strtolower(trim($data['email'])),
                password:   $data['password'],
                planId:     $planId
            );

            $response->setCookie('refresh_token', $result['refresh_token'], Jwt::refreshTtl());

            $response->success([
                'tenant'       => $result['tenant'],
                'user'         => $result['user'],
                'access_token' => $result['access_token'],
            ], 'Shop created successfully.', 201);
        } catch (RuntimeException $e) {
            $response->error($e->getMessage(), $e->getCode() ?: 400);
        }
    }
}
