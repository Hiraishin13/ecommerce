<?php

declare(strict_types=1);

namespace App\Controllers\SuperAdmin;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Services\InvoiceService;
use App\Services\ActivityLogService;

class SuperAdminInvoiceController extends Controller
{
    private InvoiceService $invoices;

    public function __construct()
    {
        $this->invoices = new InvoiceService();
    }

    public function index(Request $request, Response $response): void
    {
        $page   = max(1, (int) $request->query('page', 1));
        $limit  = min(100, max(1, (int) $request->query('limit', 20)));
        $offset = ($page - 1) * $limit;
        $status = (string) $request->query('status', '');

        $list  = $this->invoices->findAll($limit, $offset, $status);
        $total = $this->invoices->countAll($status);

        $response->success([
            'invoices'   => $list,
            'total'      => $total,
            'pagination' => ['page' => $page, 'limit' => $limit, 'total_pages' => (int) ceil($total / $limit)],
        ]);
    }

    public function store(Request $request, Response $response): void
    {
        $data   = $request->body();
        $errors = $this->validate($data, [
            'tenant_id'    => 'required',
            'amount'       => 'required',
            'period_start' => 'required',
            'period_end'   => 'required',
        ]);
        if (!empty($errors)) $response->error('Validation failed.', 422, $errors);

        $id = $this->invoices->create($data);

        ActivityLogService::log(
            'invoice.create',
            null,
            (int) $request->param('_auth_user_id'),
            null,
            'invoice',
            $id,
            ['tenant_id' => $data['tenant_id'], 'amount' => $data['amount']]
        );

        $response->success(['invoice_id' => $id], 'Invoice created.', 201);
    }

    public function markPaid(Request $request, Response $response): void
    {
        $id = (int) $request->param('id');
        $this->invoices->markPaid($id);

        ActivityLogService::log(
            'invoice.paid',
            null,
            (int) $request->param('_auth_user_id'),
            null,
            'invoice',
            $id
        );

        $response->success(null, 'Invoice marked as paid.');
    }

    public function tenantInvoices(Request $request, Response $response): void
    {
        $tenantId = (int) $request->param('id');
        $page     = max(1, (int) $request->query('page', 1));
        $limit    = min(100, max(1, (int) $request->query('limit', 20)));
        $offset   = ($page - 1) * $limit;

        $list = $this->invoices->findByTenant($tenantId, $limit, $offset);
        $response->success(['invoices' => $list]);
    }
}
