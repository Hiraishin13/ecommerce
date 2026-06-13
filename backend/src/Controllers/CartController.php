<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Services\CartService;
use RuntimeException;

class CartController extends Controller
{
    private CartService $cartService;

    public function __construct()
    {
        $this->cartService = new CartService();
    }

    public function index(Request $request, Response $response): void
    {
        $userId = (int) $request->param('_auth_user_id');
        $cart   = $this->cartService->get($userId);
        $response->success(['cart' => $cart]);
    }

    public function add(Request $request, Response $response): void
    {
        $userId = (int) $request->param('_auth_user_id');
        $data   = $request->body();

        $errors = $this->validate($data, [
            'product_id' => 'required',
            'quantity'   => 'required',
        ]);

        if (!empty($errors)) {
            $response->error('Validation failed.', 422, $errors);
        }

        try {
            $cart = $this->cartService->add(
                $userId,
                (int) $data['product_id'],
                (int) ($data['quantity'] ?? 1)
            );
            $response->success(['cart' => $cart], 'Item added to cart.', 201);
        } catch (RuntimeException $e) {
            $response->error($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    public function update(Request $request, Response $response): void
    {
        $userId = (int) $request->param('_auth_user_id');
        $itemId = (int) $request->param('id');
        $data   = $request->body();

        $errors = $this->validate($data, [
            'quantity' => 'required',
        ]);

        if (!empty($errors)) {
            $response->error('Validation failed.', 422, $errors);
        }

        try {
            $cart = $this->cartService->update($userId, $itemId, (int) $data['quantity']);
            $response->success(['cart' => $cart], 'Cart updated.');
        } catch (RuntimeException $e) {
            $response->error($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    public function remove(Request $request, Response $response): void
    {
        $userId = (int) $request->param('_auth_user_id');
        $itemId = (int) $request->param('id');

        $cart = $this->cartService->remove($userId, $itemId);
        $response->success(['cart' => $cart], 'Item removed from cart.');
    }

    public function clear(Request $request, Response $response): void
    {
        $userId = (int) $request->param('_auth_user_id');
        $this->cartService->clear($userId);
        $response->success(null, 'Cart cleared.');
    }
}
