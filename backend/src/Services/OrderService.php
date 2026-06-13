<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CartModel;
use App\Models\OrderModel;
use App\Models\ProductModel;
use RuntimeException;

class OrderService
{
    private OrderModel   $orders;
    private CartModel    $cart;
    private ProductModel $products;

    public function __construct()
    {
        $this->orders   = new OrderModel();
        $this->cart     = new CartModel();
        $this->products = new ProductModel();
    }

    /**
     * @param int   $userId
     * @param array $shippingData  {name, email, phone?, address, city, zip, country?, notes?}
     * @param array $requestItems  Optional items from frontend [{product_id, quantity}]
     */
    public function createOrder(int $userId, array $shippingData, array $requestItems = []): array
    {
        if (!empty($requestItems)) {
            $productIds = array_values(array_unique(array_map(
                fn($i) => (int) ($i['product_id'] ?? 0),
                $requestItems
            )));
            $products = $this->products->findByIds(array_filter($productIds));
            $cartItems = [];
            foreach ($requestItems as $item) {
                $pid = (int) ($item['product_id'] ?? 0);
                $qty = (int) ($item['quantity'] ?? 0);
                if ($pid <= 0 || $qty <= 0 || !isset($products[$pid])) {
                    continue;
                }
                $p = $products[$pid];
                $cartItems[] = [
                    'product_id' => $pid,
                    'name'       => $p['name'],
                    'sku'        => $p['sku'],
                    'price'      => $p['price'],
                    'quantity'   => $qty,
                    'stock'      => $p['stock'],
                    'is_active'  => $p['is_active'],
                ];
            }
        } else {
            $cartItems = $this->cart->getByUser($userId);
        }

        if (empty($cartItems)) {
            throw new RuntimeException('Cart is empty.', 400);
        }

        // Validate stock and build order items
        $orderItems  = [];
        $totalAmount = 0.0;

        foreach ($cartItems as $item) {
            if (!$item['is_active']) {
                throw new RuntimeException("Product '{$item['name']}' is no longer available.", 400);
            }

            if ($item['stock'] < $item['quantity']) {
                throw new RuntimeException(
                    "Insufficient stock for '{$item['name']}'. Available: {$item['stock']}.",
                    400
                );
            }

            $subtotal     = (float) $item['price'] * $item['quantity'];
            $totalAmount += $subtotal;

            $orderItems[] = [
                'product_id'   => $item['product_id'],
                'product_name' => $item['name'],
                'product_sku'  => $item['sku'],
                'unit_price'   => (float) $item['price'],
                'quantity'     => (int) $item['quantity'],
            ];
        }

        // Create order record
        $orderId = $this->orders->create([
            'user_id'          => $userId,
            'status'           => 'pending',
            'total_amount'     => $totalAmount,
            'shipping_name'    => $shippingData['name'],
            'shipping_email'   => $shippingData['email'],
            'shipping_phone'   => $shippingData['phone'] ?? null,
            'shipping_address' => $shippingData['address'],
            'shipping_city'    => $shippingData['city'],
            'shipping_zip'     => $shippingData['zip'],
            'shipping_country' => $shippingData['country'] ?? 'FR',
            'notes'            => $shippingData['notes'] ?? null,
        ]);

        // Persist order items
        $this->orders->createItems($orderId, $orderItems);

        // Decrement stock
        foreach ($orderItems as $item) {
            $this->products->decrementStock((int) $item['product_id'], (int) $item['quantity']);
        }

        // Clear cart
        $this->cart->clear($userId);

        return $this->orders->findById($orderId);
    }

    public function getOrder(int $orderId): array
    {
        $order = $this->orders->findById($orderId);

        if (!$order) {
            throw new RuntimeException('Order not found.', 404);
        }

        return $order;
    }

    public function updateStatus(int $orderId, string $status): array
    {
        $allowed = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

        if (!in_array($status, $allowed, true)) {
            throw new RuntimeException('Invalid status.', 400);
        }

        $this->orders->updateStatus($orderId, $status);
        return $this->getOrder($orderId);
    }

    public function cancelOrder(int $orderId, int $userId): array
    {
        $success = $this->orders->cancel($orderId, $userId);

        if (!$success) {
            throw new RuntimeException('Order cannot be cancelled (not found, not yours, or not pending).', 400);
        }

        return $this->getOrder($orderId);
    }
}
