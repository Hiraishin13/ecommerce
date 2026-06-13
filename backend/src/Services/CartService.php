<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CartModel;
use App\Models\ProductModel;
use RuntimeException;

class CartService
{
    private CartModel    $cart;
    private ProductModel $products;

    public function __construct()
    {
        $this->cart     = new CartModel();
        $this->products = new ProductModel();
    }

    public function get(int $userId): array
    {
        $items = $this->cart->getByUser($userId);
        $total = 0.0;

        foreach ($items as &$item) {
            $item['subtotal'] = (float) $item['price'] * (int) $item['quantity'];
            $total           += $item['subtotal'];

            // Decode images JSON if stored as string
            if (is_string($item['images'])) {
                $item['images'] = json_decode($item['images'], true) ?? [];
            }
        }
        unset($item);

        return [
            'items' => $items,
            'total' => $total,
            'count' => count($items),
        ];
    }

    public function add(int $userId, int $productId, int $quantity): array
    {
        if ($quantity < 1) {
            throw new RuntimeException('Quantity must be at least 1.', 400);
        }

        $product = $this->products->findById($productId);

        if (!$product || !$product['is_active']) {
            throw new RuntimeException('Product not found or inactive.', 404);
        }

        // Check available stock
        $existing = $this->cart->findItem($userId, $productId);
        $currentQty = $existing ? (int) $existing['quantity'] : 0;
        $newQty     = $currentQty + $quantity;

        if ($newQty > $product['stock']) {
            throw new RuntimeException(
                "Insufficient stock. Available: {$product['stock']}, already in cart: {$currentQty}.",
                400
            );
        }

        $this->cart->addItem($userId, $productId, $quantity);
        return $this->get($userId);
    }

    public function update(int $userId, int $itemId, int $quantity): array
    {
        if ($quantity < 1) {
            throw new RuntimeException('Quantity must be at least 1.', 400);
        }

        $item = $this->cart->findItemById($itemId, $userId);

        if (!$item) {
            throw new RuntimeException('Cart item not found.', 404);
        }

        $product = $this->products->findById((int) $item['product_id']);

        if ($product && $quantity > $product['stock']) {
            throw new RuntimeException("Insufficient stock. Available: {$product['stock']}.", 400);
        }

        $this->cart->updateItem($itemId, $userId, $quantity);
        return $this->get($userId);
    }

    public function remove(int $userId, int $itemId): array
    {
        $this->cart->removeItem($itemId, $userId);
        return $this->get($userId);
    }

    public function clear(int $userId): void
    {
        $this->cart->clear($userId);
    }
}
