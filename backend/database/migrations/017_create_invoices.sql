-- Migration 017 — Invoices (facturation des abonnements)
CREATE TABLE IF NOT EXISTS invoices (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    tenant_id       INT UNSIGNED    NOT NULL,
    subscription_id INT UNSIGNED    NULL,
    invoice_number  VARCHAR(30)     NOT NULL COMMENT 'INV-2024-00001',
    status          ENUM('draft','open','paid','void','uncollectible') NOT NULL DEFAULT 'open',
    amount          DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    currency        VARCHAR(3)      NOT NULL DEFAULT 'USD',
    period_start    DATETIME        NOT NULL,
    period_end      DATETIME        NOT NULL,
    paid_at         DATETIME        NULL,
    due_date        DATETIME        NULL,
    description     VARCHAR(255)    NULL,
    metadata        JSON            NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_invoice_number (invoice_number),
    KEY idx_inv_tenant (tenant_id),
    KEY idx_inv_status (status),
    CONSTRAINT fk_inv_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_inv_sub    FOREIGN KEY (subscription_id) REFERENCES subscriptions (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
