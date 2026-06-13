<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\OrderModel;
use App\Models\UserModel;

class AdminUserController extends Controller
{
    private UserModel  $users;
    private OrderModel $orders;

    public function __construct()
    {
        $this->users  = new UserModel();
        $this->orders = new OrderModel();
    }

    public function index(Request $request, Response $response): void
    {
        $page   = max(1, (int) $request->query('page', 1));
        $limit  = min(100, max(1, (int) $request->query('limit', 20)));
        $offset = ($page - 1) * $limit;
        $search = (string) $request->query('search', '');

        $users = $this->users->findAll($limit, $offset, $search);
        $total = $this->users->countAll($search);

        $response->success([
            'users'      => $users,
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
        $userId = (int) $request->param('id');
        $user   = $this->users->findById($userId);

        if (!$user) {
            $response->error('User not found.', 404);
        }

        // Include recent order history
        $recentOrders = $this->orders->findByUser($userId, 10, 0);
        $user['recent_orders'] = $recentOrders;

        $response->success(['user' => $user]);
    }

    public function setRole(Request $request, Response $response): void
    {
        $userId = (int) $request->param('id');
        $data   = $request->body();

        $errors = $this->validate($data, [
            'role' => 'required',
        ]);

        if (!empty($errors)) {
            $response->error('Validation failed.', 422, $errors);
        }

        $allowedRoles = ['customer', 'admin'];
        if (!in_array($data['role'], $allowedRoles, true)) {
            $response->error('Invalid role. Allowed: ' . implode(', ', $allowedRoles), 422);
        }

        $user = $this->users->findById($userId);
        if (!$user) {
            $response->error('User not found.', 404);
        }

        $this->users->updateStatus($userId, $data['role']);
        $updated = $this->users->findById($userId);

        $response->success(['user' => $updated], 'User role updated.');
    }

    public function destroy(Request $request, Response $response): void
    {
        $userId        = (int) $request->param('id');
        $requestUserId = (int) $request->param('_auth_user_id');

        if ($userId === $requestUserId) {
            $response->error('You cannot delete your own account.', 400);
        }

        $user = $this->users->findById($userId);
        if (!$user) {
            $response->error('User not found.', 404);
        }

        $this->users->delete($userId);
        $response->success(null, 'User deleted.');
    }
}
