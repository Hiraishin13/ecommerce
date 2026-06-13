<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\OrderModel;
use App\Services\OrderService;
use RuntimeException;

class AdminOrderController extends Controller
{
    private OrderModel   $orders;
    private OrderService $orderService;

    public function __construct()
    {
        $this->orders       = new OrderModel();
        $this->orderService = new OrderService();
    }

    public function index(Request $request, Response $response): void
    {
        $page   = max(1, (int) $request->query('page', 1));
        $limit  = min(100, max(1, (int) $request->query('limit', 20)));
        $offset = ($page - 1) * $limit;
        $status = $request->query('status', '');

        $orders = $this->orders->findAll($limit, $offset, (string) $status);
        $total  = $this->orders->countAll((string) $status);

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

    public function show(Request $request, Response $response): void
    {
        $orderId = (int) $request->param('id');
        $order   = $this->orders->findById($orderId);

        if (!$order) {
            $response->error('Order not found.', 404);
        }

        $response->success(['order' => $order]);
    }

    public function updateStatus(Request $request, Response $response): void
    {
        $orderId = (int) $request->param('id');
        $data    = $request->body();

        $errors = $this->validate($data, [
            'status' => 'required',
        ]);

        if (!empty($errors)) {
            $response->error('Validation failed.', 422, $errors);
        }

        $allowed = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
        if (!in_array($data['status'], $allowed, true)) {
            $response->error('Invalid status. Allowed: ' . implode(', ', $allowed), 422);
        }

        $order = $this->orders->findById($orderId);
        if (!$order) {
            $response->error('Order not found.', 404);
        }

        try {
            $updated = $this->orderService->updateStatus($orderId, $data['status']);
            $response->success(['order' => $updated], 'Order status updated.');
        } catch (RuntimeException $e) {
            $response->error($e->getMessage(), $e->getCode() ?: 400);
        }
    }
}
