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

    public function stats(Request $request, Response $response): void
    {
        $months      = max(1, min(24, (int) $request->query('months', 6)));
        $monthly     = $this->orders->getStats($months);
        $topProducts = $this->orders->getTopProducts(5);
        $totalOrders = $this->orders->countAll();
        $totalRev    = (float) array_sum(array_column($monthly, 'revenue'));

        $response->success([
            'monthly'      => $monthly,
            'top_products' => $topProducts,
            'total_orders' => $totalOrders,
            'total_revenue'=> $totalRev,
        ]);
    }

    public function updateMeta(Request $request, Response $response): void
    {
        $orderId = (int) $request->param('id');
        $data    = $request->body();

        $order = $this->orders->findById($orderId);
        if (!$order) {
            $response->error('Order not found.', 404);
        }

        $fields = [];
        if (array_key_exists('tracking_number', $data)) {
            $fields['tracking_number'] = $data['tracking_number'] !== '' ? (string) $data['tracking_number'] : null;
        }
        if (array_key_exists('admin_notes', $data)) {
            $fields['admin_notes'] = $data['admin_notes'] !== '' ? (string) $data['admin_notes'] : null;
        }

        if (empty($fields)) {
            $response->error('Nothing to update.', 400);
        }

        $this->orders->updateMeta($orderId, $fields);
        $updated = $this->orders->findById($orderId);
        $response->success(['order' => $updated], 'Order updated.');
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
