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
use App\Controllers\Admin\PosController;
use App\Controllers\WebhookController;
use App\Middleware\AuthMiddleware;
use App\Middleware\AdminMiddleware;

// ── Auth ────────────────────────────────────────────────────────────────────
$this->router->post('/api/auth/register',      [AuthController::class, 'register']);
$this->router->post('/api/auth/login',         [AuthController::class, 'login']);
$this->router->post('/api/auth/refresh',       [AuthController::class, 'refresh']);
$this->router->post('/api/auth/logout',        [AuthController::class, 'logout']);
$this->router->post('/api/auth/forgot-password', [AuthController::class, 'forgotPassword']);
$this->router->post('/api/auth/reset-password',  [AuthController::class, 'resetPassword']);
$this->router->get('/api/auth/verify/{token}', [AuthController::class, 'verifyEmail']);

// ── Catalogue (public) ───────────────────────────────────────────────────────
$this->router->get('/api/categories',              [CategoryController::class, 'index']);
$this->router->get('/api/categories/{slug}',       [CategoryController::class, 'show']);
$this->router->get('/api/products',                [ProductController::class, 'index']);
$this->router->get('/api/products/featured',       [ProductController::class, 'featured']);
$this->router->get('/api/products/bestsellers',    [ProductController::class, 'bestsellers']);
$this->router->get('/api/products/search',         [ProductController::class, 'search']);
$this->router->get('/api/products/{slug}',         [ProductController::class, 'show']);
$this->router->get('/api/products/{id}/reviews',   [ReviewController::class, 'index']);

// ── Compte utilisateur (auth requis) ────────────────────────────────────────
$this->router->get('/api/me',            [UserController::class, 'profile'],    [AuthMiddleware::class]);
$this->router->put('/api/me',            [UserController::class, 'update'],     [AuthMiddleware::class]);
$this->router->put('/api/me/password',   [UserController::class, 'password'],   [AuthMiddleware::class]);
$this->router->get('/api/me/orders',     [OrderController::class, 'myOrders'],  [AuthMiddleware::class]);
$this->router->get('/api/me/orders/{id}',[OrderController::class, 'myOrder'],   [AuthMiddleware::class]);

// ── Panier ───────────────────────────────────────────────────────────────────
$this->router->get('/api/cart',              [CartController::class, 'index'],   [AuthMiddleware::class]);
$this->router->post('/api/cart/items',       [CartController::class, 'add'],     [AuthMiddleware::class]);
$this->router->put('/api/cart/items/{id}',   [CartController::class, 'update'],  [AuthMiddleware::class]);
$this->router->delete('/api/cart/items/{id}',[CartController::class, 'remove'],  [AuthMiddleware::class]);
$this->router->delete('/api/cart',           [CartController::class, 'clear'],   [AuthMiddleware::class]);

// ── Commandes ────────────────────────────────────────────────────────────────
$this->router->post('/api/orders',               [OrderController::class, 'create'],        [AuthMiddleware::class]);
$this->router->post('/api/orders/{id}/pay',      [OrderController::class, 'initiatePayment'],[AuthMiddleware::class]);
$this->router->post('/api/orders/{id}/cancel',   [OrderController::class, 'cancel'],        [AuthMiddleware::class]);

// ── Avis ─────────────────────────────────────────────────────────────────────
$this->router->post('/api/products/{id}/reviews', [ReviewController::class, 'store'],  [AuthMiddleware::class]);
$this->router->delete('/api/reviews/{id}',        [ReviewController::class, 'destroy'],[AuthMiddleware::class]);

// ── Stripe webhook (sans auth JWT) ──────────────────────────────────────────
$this->router->post('/api/webhooks/stripe', [WebhookController::class, 'stripe']);

// ── Admin ─────────────────────────────────────────────────────────────────────
$this->router->get('/api/admin/products',        [AdminProductController::class, 'index'],   [AuthMiddleware::class, AdminMiddleware::class]);
$this->router->post('/api/admin/products',       [AdminProductController::class, 'store'],   [AuthMiddleware::class, AdminMiddleware::class]);
$this->router->put('/api/admin/products/{id}',   [AdminProductController::class, 'update'],  [AuthMiddleware::class, AdminMiddleware::class]);
$this->router->delete('/api/admin/products/{id}',[AdminProductController::class, 'destroy'], [AuthMiddleware::class, AdminMiddleware::class]);

$this->router->get('/api/admin/categories',        [AdminCategoryController::class, 'index'],   [AuthMiddleware::class, AdminMiddleware::class]);
$this->router->post('/api/admin/categories',       [AdminCategoryController::class, 'store'],   [AuthMiddleware::class, AdminMiddleware::class]);
$this->router->put('/api/admin/categories/{id}',   [AdminCategoryController::class, 'update'],  [AuthMiddleware::class, AdminMiddleware::class]);
$this->router->delete('/api/admin/categories/{id}',[AdminCategoryController::class, 'destroy'], [AuthMiddleware::class, AdminMiddleware::class]);

$this->router->get('/api/admin/orders',            [AdminOrderController::class, 'index'],  [AuthMiddleware::class, AdminMiddleware::class]);
$this->router->get('/api/admin/orders/{id}',       [AdminOrderController::class, 'show'],   [AuthMiddleware::class, AdminMiddleware::class]);
$this->router->patch('/api/admin/orders/{id}/status',[AdminOrderController::class, 'updateStatus'],[AuthMiddleware::class, AdminMiddleware::class]);

// ── POS — Caisse ──────────────────────────────────────────────────────────────
$this->router->get('/api/admin/pos/recherche',             [PosController::class, 'rechercherProduits'],   [AuthMiddleware::class, AdminMiddleware::class]);
$this->router->get('/api/admin/pos/produits/{id}/variantes',[PosController::class, 'variantesProduit'],    [AuthMiddleware::class, AdminMiddleware::class]);
$this->router->post('/api/admin/pos/produits/{id}/variantes',[PosController::class, 'creerVariante'],      [AuthMiddleware::class, AdminMiddleware::class]);
$this->router->put('/api/admin/pos/variantes/{vid}',        [PosController::class, 'mettreAJourVariante'], [AuthMiddleware::class, AdminMiddleware::class]);
$this->router->delete('/api/admin/pos/variantes/{vid}',     [PosController::class, 'supprimerVariante'],   [AuthMiddleware::class, AdminMiddleware::class]);

$this->router->get('/api/admin/pos/ventes',                 [PosController::class, 'listerVentes'],        [AuthMiddleware::class, AdminMiddleware::class]);
$this->router->post('/api/admin/pos/ventes',                [PosController::class, 'creerVente'],          [AuthMiddleware::class, AdminMiddleware::class]);
$this->router->get('/api/admin/pos/ventes/{id}',            [PosController::class, 'afficherVente'],       [AuthMiddleware::class, AdminMiddleware::class]);
$this->router->post('/api/admin/pos/ventes/{id}/paiement',  [PosController::class, 'ajouterPaiement'],     [AuthMiddleware::class, AdminMiddleware::class]);
$this->router->post('/api/admin/pos/ventes/{id}/annuler',   [PosController::class, 'annulerVente'],        [AuthMiddleware::class, AdminMiddleware::class]);
$this->router->post('/api/admin/pos/ventes/{id}/whatsapp',  [PosController::class, 'genererLienWhatsApp'], [AuthMiddleware::class, AdminMiddleware::class]);

$this->router->get('/api/admin/users',             [AdminUserController::class, 'index'],   [AuthMiddleware::class, AdminMiddleware::class]);
$this->router->get('/api/admin/users/{id}',        [AdminUserController::class, 'show'],    [AuthMiddleware::class, AdminMiddleware::class]);
$this->router->patch('/api/admin/users/{id}/role', [AdminUserController::class, 'setRole'], [AuthMiddleware::class, AdminMiddleware::class]);
$this->router->delete('/api/admin/users/{id}',     [AdminUserController::class, 'destroy'], [AuthMiddleware::class, AdminMiddleware::class]);
