<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\TenantUserModel;
use App\Models\UserModel;

class TenantMembersController extends Controller
{
    private TenantUserModel $tu;
    private UserModel $users;

    public function __construct()
    {
        $this->tu    = new TenantUserModel();
        $this->users = new UserModel();
    }

    public function index(Request $request, Response $response): void
    {
        $tenantId = (int) $request->param('_tenant_id');
        $members  = $this->tu->getMembersOfTenant($tenantId);
        $response->success(['members' => $members]);
    }

    public function invite(Request $request, Response $response): void
    {
        $tenantId  = (int) $request->param('_tenant_id');
        $inviterId = (int) $request->param('_auth_user_id');
        $data      = $request->body();

        $errors = $this->validate($data, [
            'name'     => 'required|min:2',
            'email'    => 'required|email',
            'role'     => 'required',
        ]);

        if (!empty($errors)) {
            $response->error('Validation failed.', 422, $errors);
        }

        $allowedRoles = ['admin', 'manager', 'cashier', 'staff'];
        if (!in_array($data['role'], $allowedRoles, true)) {
            $response->error('Invalid role.', 422);
        }

        // Check if user already exists in this tenant
        $existing = $this->users->findByEmailAndTenant($data['email'], $tenantId);

        if ($existing) {
            // Already a user — just ensure they're in tenant_users
            $member = $this->tu->findByTenantAndUser($tenantId, (int) $existing['id']);
            if ($member) {
                $response->error('User is already a member of this shop.', 409);
            }
            $this->tu->addMember($tenantId, (int) $existing['id'], $data['role'], $inviterId);
            $response->success(['user_id' => $existing['id']], 'Member added.', 201);
        }

        // Create a new user for this tenant
        $tempPassword = bin2hex(random_bytes(8));
        $hash         = password_hash($tempPassword, PASSWORD_BCRYPT, ['cost' => 12]);

        $userId = $this->users->create([
            'tenant_id' => $tenantId,
            'name'      => trim($data['name']),
            'email'     => strtolower(trim($data['email'])),
            'password'  => $hash,
            'role'      => 'customer',
        ]);

        $this->tu->addMember($tenantId, $userId, $data['role'], $inviterId);

        $response->success(['user_id' => $userId], 'Member invited.', 201);
    }

    public function updateRole(Request $request, Response $response): void
    {
        $tenantId = (int) $request->param('_tenant_id');
        $userId   = (int) $request->param('id');
        $data     = $request->body();

        $allowedRoles = ['owner', 'admin', 'manager', 'cashier', 'staff'];
        $role         = $data['role'] ?? '';

        if (!in_array($role, $allowedRoles, true)) {
            $response->error('Invalid role.', 422);
        }

        $this->tu->updateRole($tenantId, $userId, $role);
        $response->success(null, 'Role updated.');
    }

    public function remove(Request $request, Response $response): void
    {
        $tenantId      = (int) $request->param('_tenant_id');
        $userId        = (int) $request->param('id');
        $requestUserId = (int) $request->param('_auth_user_id');

        if ($userId === $requestUserId) {
            $response->error('You cannot remove yourself.', 400);
        }

        $this->tu->removeMember($tenantId, $userId);
        $response->success(null, 'Member removed.');
    }
}
