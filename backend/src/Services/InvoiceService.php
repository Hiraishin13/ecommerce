<?php

declare(strict_types=1);

namespace App\Services;

use App\Config\Database;

class InvoiceService
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = Database::pdo();
    }

    public function generateNumber(): string
    {
        $year  = date('Y');
        $month = date('m');
        $stmt  = $this->db->prepare(
            "SELECT invoice_number FROM invoices
             WHERE invoice_number LIKE ? ORDER BY id DESC LIMIT 1"
        );
        $stmt->execute(["INV-{$year}{$month}-%"]);
        $last = $stmt->fetchColumn();
        $seq  = $last ? ((int) substr($last, -5)) + 1 : 1;
        return sprintf('INV-%s%s-%05d', $year, $month, $seq);
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO invoices
             (tenant_id, subscription_id, invoice_number, status, amount, currency, period_start, period_end, due_date, description)
             VALUES (:tid, :sid, :num, :status, :amount, :currency, :pstart, :pend, :due, :desc)'
        );
        $stmt->execute([
            ':tid'      => $data['tenant_id'],
            ':sid'      => $data['subscription_id'] ?? null,
            ':num'      => $this->generateNumber(),
            ':status'   => $data['status'] ?? 'open',
            ':amount'   => $data['amount'],
            ':currency' => $data['currency'] ?? 'USD',
            ':pstart'   => $data['period_start'],
            ':pend'     => $data['period_end'],
            ':due'      => $data['due_date'] ?? null,
            ':desc'     => $data['description'] ?? null,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function markPaid(int $id): bool
    {
        return $this->db->prepare(
            "UPDATE invoices SET status = 'paid', paid_at = NOW() WHERE id = ?"
        )->execute([$id]);
    }

    public function findByTenant(int $tenantId, int $limit = 20, int $offset = 0): array
    {
        $stmt = $this->db->prepare(
            'SELECT i.*, t.name AS tenant_name, p.name AS plan_name
             FROM invoices i
             JOIN tenants t ON t.id = i.tenant_id
             LEFT JOIN subscriptions s ON s.id = i.subscription_id
             LEFT JOIN plans p ON p.id = s.plan_id
             WHERE i.tenant_id = ?
             ORDER BY i.created_at DESC LIMIT ? OFFSET ?'
        );
        $stmt->execute([$tenantId, $limit, $offset]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function findAll(int $limit = 50, int $offset = 0, string $status = ''): array
    {
        $where  = $status ? 'WHERE i.status = ?' : '';
        $params = $status ? [$status, $limit, $offset] : [$limit, $offset];
        $stmt   = $this->db->prepare(
            "SELECT i.*, t.name AS tenant_name
             FROM invoices i
             JOIN tenants t ON t.id = i.tenant_id
             $where
             ORDER BY i.created_at DESC LIMIT ? OFFSET ?"
        );
        $stmt->execute($params);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function countAll(string $status = ''): int
    {
        if ($status) {
            $stmt = $this->db->prepare('SELECT COUNT(*) FROM invoices WHERE status = ?');
            $stmt->execute([$status]);
        } else {
            $stmt = $this->db->query('SELECT COUNT(*) FROM invoices');
        }
        return (int) $stmt->fetchColumn();
    }

    public function getMRR(): float
    {
        $stmt = $this->db->query(
            "SELECT COALESCE(SUM(p.price_monthly), 0)
             FROM subscriptions s
             JOIN plans p ON p.id = s.plan_id
             WHERE s.status = 'active'"
        );
        return (float) $stmt->fetchColumn();
    }

    public function getRevenueLast12Months(): array
    {
        $stmt = $this->db->query(
            "SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
                    SUM(amount) AS revenue,
                    COUNT(*) AS invoice_count
             FROM invoices
             WHERE status = 'paid'
               AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
             GROUP BY month
             ORDER BY month ASC"
        );
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
