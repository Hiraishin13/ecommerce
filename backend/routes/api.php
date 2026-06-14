<?php

declare(strict_types=1);

use App\Controllers\Auth\AuthController;
use App\Controllers\ProductController;
use App\Controllers\CategoryController;
use App\Controllers\CartController;
use App\Controllers\OrderController;
use App\Controllers\ReviewController;
use App\Controllers\UserController;
use App\Controllers\Admin\AdminProductController;
use App\Controllers\Admin\AdminOrderController;
use App\Controllers\Admin\AdminUserController;
use App\Controllers\Admin\AdminCategoryController;
use App\Controllers\Admin\AdminUploadController;
use App\Controllers\Admin\PosController;
use App\Controllers\Admin\TenantSettingsController;
use App\Controllers\Admin\TenantMembersController;
use App\Controllers\SaaS\TenantSignupController;
use App\Controllers\SuperAdmin\SuperAdminTenantController;
use App\Controllers\SuperAdmin\SuperAdminPlanController;
use App\Controllers\SuperAdmin\SuperAdminStatsController;
use App\Controllers\SuperAdmin\SuperAdminInvoiceController;
use App\Controllers\SuperAdmin\SuperAdminActivityController;
use App\Controllers\Admin\AdminSubscriptionController;
use App\Controllers\WebhookController;
use App\Middleware\AuthMiddleware;
use App\Middleware\AdminMiddleware;
use App\Middleware\SuperAdminMiddleware;
use App\Middleware\TenantMiddleware;
use App\Middleware\TenantAdminMiddleware;

// ── Public SaaS (no tenant context needed) ───────────────────────────────────
$this->router->get('/api/saas/plans',                 [TenantSignupController::class, 'listPlans']);
$this->router->get('/api/saas/tenants/{slug}/check',  [TenantSignupController::class, 'checkSlug']);
$this->router->post('/api/saas/tenants',              [TenantSignupController::class, 'createTenant']);

// ── SuperAdmin (AuthMiddleware + SuperAdminMiddleware only, no TenantMiddleware) ──
$this->router->get('/api/superadmin/stats',                        [SuperAdminStatsController::class, 'index'],        [AuthMiddleware::class, SuperAdminMiddleware::class]);
$this->router->get('/api/superadmin/tenants',                      [SuperAdminTenantController::class, 'index'],       [AuthMiddleware::class, SuperAdminMiddleware::class]);
$this->router->get('/api/superadmin/tenants/{id}',                 [SuperAdminTenantController::class, 'show'],        [AuthMiddleware::class, SuperAdminMiddleware::class]);
$this->router->patch('/api/superadmin/tenants/{id}/status',        [SuperAdminTenantController::class, 'updateStatus'],[AuthMiddleware::class, SuperAdminMiddleware::class]);
$this->router->delete('/api/superadmin/tenants/{id}',              [SuperAdminTenantController::class, 'destroy'],     [AuthMiddleware::class, SuperAdminMiddleware::class]);
$this->router->get('/api/superadmin/plans',                        [SuperAdminPlanController::class, 'index'],         [AuthMiddleware::class, SuperAdminMiddleware::class]);
$this->router->post('/api/superadmin/plans',                       [SuperAdminPlanController::class, 'store'],         [AuthMiddleware::class, SuperAdminMiddleware::class]);
$this->router->put('/api/superadmin/plans/{id}',                   [SuperAdminPlanController::class, 'update'],        [AuthMiddleware::class, SuperAdminMiddleware::class]);
$this->router->delete('/api/superadmin/plans/{id}',                [SuperAdminPlanController::class, 'destroy'],        [AuthMiddleware::class, SuperAdminMiddleware::class]);
$this->router->get('/api/superadmin/stats/tenant/{id}',            [SuperAdminStatsController::class, 'tenantStats'],   [AuthMiddleware::class, SuperAdminMiddleware::class]);
$this->router->patch('/api/superadmin/tenants/{id}/plan',          [SuperAdminTenantController::class, 'upgradePlan'],  [AuthMiddleware::class, SuperAdminMiddleware::class]);
$this->router->get('/api/superadmin/invoices',                     [SuperAdminInvoiceController::class, 'index'],       [AuthMiddleware::class, SuperAdminMiddleware::class]);
$this->router->post('/api/superadmin/invoices',                    [SuperAdminInvoiceController::class, 'store'],       [AuthMiddleware::class, SuperAdminMiddleware::class]);
$this->router->patch('/api/superadmin/invoices/{id}/pay',          [SuperAdminInvoiceController::class, 'markPaid'],    [AuthMiddleware::class, SuperAdminMiddleware::class]);
$this->router->get('/api/superadmin/tenants/{id}/invoices',        [SuperAdminInvoiceController::class, 'tenantInvoices'],[AuthMiddleware::class, SuperAdminMiddleware::class]);
$this->router->get('/api/superadmin/activity',                     [SuperAdminActivityController::class, 'index'],      [AuthMiddleware::class, SuperAdminMiddleware::class]);

// ── Stripe webhook (no auth) ─────────────────────────────────────────────────
$this->router->post('/api/webhooks/stripe', [WebhookController::class, 'stripe']);

// ── Auth (tenant-scoped) ─────────────────────────────────────────────────────
$this->router->post('/api/auth/register',        [AuthController::class, 'register'],       [TenantMiddleware::class]);
$this->router->post('/api/auth/login',           [AuthController::class, 'login'],          [TenantMiddleware::class]);
$this->router->post('/api/auth/refresh',         [AuthController::class, 'refresh'],        [TenantMiddleware::class]);
$this->router->post('/api/auth/logout',          [AuthController::class, 'logout'],         [TenantMiddleware::class]);
$this->router->post('/api/auth/forgot-password', [AuthController::class, 'forgotPassword'], [TenantMiddleware::class]);
$this->router->post('/api/auth/reset-password',  [AuthController::class, 'resetPassword'],  [TenantMiddleware::class]);
$this->router->get('/api/auth/verify/{token}',   [AuthController::class, 'verifyEmail'],    [TenantMiddleware::class]);

// ── Catalogue public (tenant-scoped) ─────────────────────────────────────────
$this->router->get('/api/categories',            [CategoryController::class, 'index'], [TenantMiddleware::class]);
$this->router->get('/api/categories/{slug}',     [CategoryController::class, 'show'],  [TenantMiddleware::class]);
$this->router->get('/api/products',              [ProductController::class, 'index'],       [TenantMiddleware::class]);
$this->router->get('/api/products/featured',     [ProductController::class, 'featured'],    [TenantMiddleware::class]);
$this->router->get('/api/products/bestsellers',  [ProductController::class, 'bestsellers'], [TenantMiddleware::class]);
$this->router->get('/api/products/search',       [ProductController::class, 'search'],      [TenantMiddleware::class]);
$this->router->get('/api/products/{slug}',       [ProductController::class, 'show'],        [TenantMiddleware::class]);
$this->router->get('/api/products/{id}/reviews', [ReviewController::class, 'index'],        [TenantMiddleware::class]);

// ── Compte utilisateur (tenant + auth) ───────────────────────────────────────
$this->router->get('/api/me',           [UserController::class, 'profile'],   [TenantMiddleware::class, AuthMiddleware::class]);
$this->router->put('/api/me',           [UserController::class, 'update'],    [TenantMiddleware::class, AuthMiddleware::class]);
$this->router->put('/api/me/password',  [UserController::class, 'password'],  [TenantMiddleware::class, AuthMiddleware::class]);
$this->router->get('/api/me/orders',    [OrderController::class, 'myOrders'], [TenantMiddleware::class, AuthMiddleware::class]);
$this->router->get('/api/me/orders/{id}',[OrderController::class, 'myOrder'], [TenantMiddleware::class, AuthMiddleware::class]);

// ── Panier (tenant + auth) ────────────────────────────────────────────────────
$this->router->get('/api/cart',               [CartController::class, 'index'],  [TenantMiddleware::class, AuthMiddleware::class]);
$this->router->post('/api/cart/items',        [CartController::class, 'add'],    [TenantMiddleware::class, AuthMiddleware::class]);
$this->router->put('/api/cart/items/{id}',    [CartController::class, 'update'], [TenantMiddleware::class, AuthMiddleware::class]);
$this->router->delete('/api/cart/items/{id}', [CartController::class, 'remove'], [TenantMiddleware::class, AuthMiddleware::class]);
$this->router->delete('/api/cart',            [CartController::class, 'clear'],  [TenantMiddleware::class, AuthMiddleware::class]);

// ── Commandes (tenant + auth) ─────────────────────────────────────────────────
$this->router->post('/api/orders',             [OrderController::class, 'create'],         [TenantMiddleware::class, AuthMiddleware::class]);
$this->router->post('/api/orders/{id}/pay',    [OrderController::class, 'initiatePayment'],[TenantMiddleware::class, AuthMiddleware::class]);
$this->router->post('/api/orders/{id}/cancel', [OrderController::class, 'cancel'],         [TenantMiddleware::class, AuthMiddleware::class]);

// ── Avis (tenant + auth) ──────────────────────────────────────────────────────
$this->router->post('/api/products/{id}/reviews', [ReviewController::class, 'store'],   [TenantMiddleware::class, AuthMiddleware::class]);
$this->router->delete('/api/reviews/{id}',        [ReviewController::class, 'destroy'], [TenantMiddleware::class, AuthMiddleware::class]);

// ── Admin (tenant + auth + tenant-admin) ──────────────────────────────────────
$adminMw = [TenantMiddleware::class, AuthMiddleware::class, TenantAdminMiddleware::class];

$this->router->get('/api/admin/products',         [AdminProductController::class, 'index'],   $adminMw);
$this->router->post('/api/admin/products',        [AdminProductController::class, 'store'],   $adminMw);
$this->router->put('/api/admin/products/{id}',    [AdminProductController::class, 'update'],  $adminMw);
$this->router->delete('/api/admin/products/{id}', [AdminProductController::class, 'destroy'], $adminMw);

$this->router->get('/api/admin/categories',         [AdminCategoryController::class, 'index'],   $adminMw);
$this->router->post('/api/admin/categories',        [AdminCategoryController::class, 'store'],   $adminMw);
$this->router->put('/api/admin/categories/{id}',    [AdminCategoryController::class, 'update'],  $adminMw);
$this->router->delete('/api/admin/categories/{id}', [AdminCategoryController::class, 'destroy'], $adminMw);

$this->router->get('/api/admin/orders/stats',          [AdminOrderController::class, 'stats'],        $adminMw);
$this->router->get('/api/admin/orders',                [AdminOrderController::class, 'index'],        $adminMw);
$this->router->get('/api/admin/orders/{id}',           [AdminOrderController::class, 'show'],         $adminMw);
$this->router->patch('/api/admin/orders/{id}/status',  [AdminOrderController::class, 'updateStatus'], $adminMw);
$this->router->patch('/api/admin/orders/{id}/meta',    [AdminOrderController::class, 'updateMeta'],   $adminMw);

$this->router->post('/api/admin/upload',   [AdminUploadController::class, 'upload'],  $adminMw);
$this->router->delete('/api/admin/upload', [AdminUploadController::class, 'destroy'], $adminMw);

$this->router->get('/api/admin/users',              [AdminUserController::class, 'index'],   $adminMw);
$this->router->get('/api/admin/users/{id}',         [AdminUserController::class, 'show'],    $adminMw);
$this->router->patch('/api/admin/users/{id}/role',  [AdminUserController::class, 'setRole'], $adminMw);
$this->router->delete('/api/admin/users/{id}',      [AdminUserController::class, 'destroy'], $adminMw);

// ── Tenant settings & members ─────────────────────────────────────────────────
$this->router->get('/api/admin/settings',             [TenantSettingsController::class, 'show'],   $adminMw);
$this->router->patch('/api/admin/settings',           [TenantSettingsController::class, 'update'], $adminMw);
$this->router->get('/api/admin/members',              [TenantMembersController::class, 'index'],   $adminMw);
$this->router->post('/api/admin/members',             [TenantMembersController::class, 'invite'],  $adminMw);
$this->router->patch('/api/admin/members/{id}/role',  [TenantMembersController::class, 'updateRole'], $adminMw);
$this->router->delete('/api/admin/members/{id}',      [TenantMembersController::class, 'remove'],  $adminMw);

// ── Admin Subscription & Feature Gate ────────────────────────────────────────
$this->router->get('/api/admin/subscription',           [AdminSubscriptionController::class, 'show'],         $adminMw);
$this->router->get('/api/admin/subscription/usage',     [AdminSubscriptionController::class, 'usage'],        $adminMw);
$this->router->get('/api/admin/subscription/invoices',  [AdminSubscriptionController::class, 'invoices'],     $adminMw);
$this->router->get('/api/admin/subscription/plans',     [AdminSubscriptionController::class, 'plans'],        $adminMw);
$this->router->post('/api/admin/subscription/upgrade',  [AdminSubscriptionController::class, 'requestUpgrade'], $adminMw);
$this->router->get('/api/admin/features/{feature}',     [AdminSubscriptionController::class, 'checkFeature'], $adminMw);

// ── POS (tenant + auth + tenant-admin) ────────────────────────────────────────
$this->router->get('/api/admin/pos/recherche',              [PosController::class, 'rechercherProduits'],   $adminMw);
$this->router->get('/api/admin/pos/produits/{id}/variantes', [PosController::class, 'variantesProduit'],    $adminMw);
$this->router->post('/api/admin/pos/produits/{id}/variantes',[PosController::class, 'creerVariante'],       $adminMw);
$this->router->put('/api/admin/pos/variantes/{vid}',         [PosController::class, 'mettreAJourVariante'], $adminMw);
$this->router->delete('/api/admin/pos/variantes/{vid}',      [PosController::class, 'supprimerVariante'],   $adminMw);

$this->router->get('/api/admin/pos/ventes',                  [PosController::class, 'listerVentes'],        $adminMw);
$this->router->post('/api/admin/pos/ventes',                 [PosController::class, 'creerVente'],          $adminMw);
$this->router->get('/api/admin/pos/ventes/{id}',             [PosController::class, 'afficherVente'],       $adminMw);
$this->router->post('/api/admin/pos/ventes/{id}/paiement',   [PosController::class, 'ajouterPaiement'],     $adminMw);
$this->router->post('/api/admin/pos/ventes/{id}/annuler',    [PosController::class, 'annulerVente'],        $adminMw);
$this->router->post('/api/admin/pos/ventes/{id}/whatsapp',   [PosController::class, 'genererLienWhatsApp'], $adminMw);
