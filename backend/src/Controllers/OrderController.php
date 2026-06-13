<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\OrderModel;
use App\Services\OrderService;
use RuntimeException;
use Stripe\StripeClient;

class OrderController extends Controller
{
    private OrderService $orderService;
    private OrderModel   $orders;

    public function __construct()
    {
        $this->orderService = new OrderService();
        $this->orders       = new OrderModel();
    }

    public function myOrders(Request $request, Response $response): void
    {
        $userId = (int) $request->param('_auth_user_id');
        $page   = max(1, (int) $request->query('page', 1));
        $limit  = min(50, max(1, (int) $request->query('limit', 10)));
        $offset = ($page - 1) * $limit;

        $orders = $this->orders->findByUser($userId, $limit, $offset);
        $total  = $this->orders->countByUser($userId);

        $response->success([
            'orders'     => $orders,
            'total'      => $total,
            'pagination' => [
                'page'        => $page,
                'limit'       => $limit,
                'total_pages' => (int) ceil($total / $limit),
            ],
        ]);
    }

    public function myOrder(Request $request, Response $response): void
    {
        $userId  = (int) $request->param('_auth_user_id');
        $orderId = (int) $request->param('id');

        $order = $this->orders->findById($orderId);

        if (!$order || (int) $order['user_id'] !== $userId) {
            $response->error('Order not found.', 404);
        }

        $response->success(['order' => $order]);
    }

    public function create(Request $request, Response $response): void
    {
        $userId = (int) $request->param('_auth_user_id');
        $data   = $request->body();

        // Accept both shipping_* prefixed keys (from frontend) and plain keys
        $name    = $data['shipping_name']    ?? $data['name']    ?? null;
        $email   = $data['shipping_email']   ?? $data['email']   ?? null;
        $phone   = $data['shipping_phone']   ?? $data['phone']   ?? null;
        $address = $data['shipping_address'] ?? $data['address'] ?? null;
        $city    = $data['shipping_city']    ?? $data['city']    ?? null;
        $zip     = $data['shipping_zip']     ?? $data['zip']     ?? null;
        $country = $data['shipping_country'] ?? $data['country'] ?? 'FR';

        if (empty($name) || empty($email) || empty($address) || empty($city) || empty($zip)) {
            $response->error('Required shipping fields are missing.', 422);
        }

        try {
            $order = $this->orderService->createOrder($userId, [
                'name'    => $name,
                'email'   => $email,
                'phone'   => $phone,
                'address' => $address,
                'city'    => $city,
                'zip'     => $zip,
                'country' => $country,
                'notes'   => $data['notes'] ?? null,
            ]);

            $response->success(['order' => $order], 'Order created successfully.', 201);
        } catch (RuntimeException $e) {
            $response->error($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    public function initiatePayment(Request $request, Response $response): void
    {
        $userId  = (int) $request->param('_auth_user_id');
        $orderId = (int) $request->param('id');

        $order = $this->orders->findById($orderId);

        if (!$order || (int) $order['user_id'] !== $userId) {
            $response->error('Order not found.', 404);
        }

        if (!in_array($order['status'], ['pending'], true)) {
            $response->error('Order is not eligible for payment.', 400);
        }

        try {
            $stripe = new StripeClient($_ENV['STRIPE_SECRET_KEY']);

            $paymentIntent = $stripe->paymentIntents->create([
                'amount'   => (int) round((float) $order['total_amount'] * 100),
                'currency' => 'eur',
                'metadata' => [
                    'order_id' => $orderId,
                    'user_id'  => $userId,
                ],
            ]);

            $this->orders->updateStripePaymentIntent($orderId, $paymentIntent->id);

            $response->success([
                'client_secret' => $paymentIntent->client_secret,
                'order_id'      => $orderId,
            ], 'Payment intent created.');
        } catch (\Throwable $e) {
            $response->error('Payment initiation failed: ' . $e->getMessage(), 500);
        }
    }

    public function cancel(Request $request, Response $response): void
    {
        $userId  = (int) $request->param('_auth_user_id');
        $orderId = (int) $request->param('id');

        try {
            $order = $this->orderService->cancelOrder($orderId, $userId);
            $response->success(['order' => $order], 'Order cancelled.');
        } catch (RuntimeException $e) {
            $response->error($e->getMessage(), $e->getCode() ?: 400);
        }
    }
}
