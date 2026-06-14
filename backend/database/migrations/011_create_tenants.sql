-- Migration 011 — Tenants table + default tenant
CREATE TABLE IF NOT EXISTS tenants (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    name            VARCHAR(200)    NOT NULL,
    slug            VARCHAR(100)    NOT NULL,
    domain          VARCHAR(255)    NULL,
    owner_id        INT UNSIGNED    NULL,
    plan_id         INT UNSIGNED    NOT NULL DEFAULT 1,
    status          ENUM('active','suspended','trial','cancelled') NOT NULL DEFAULT 'trial',
    branding        JSON            NULL,
    sector          ENUM('mode','electronique','pharmacie','restaurant','autre') NOT NULL DEFAULT 'autre',
    settings        JSON            NULL,
    trial_ends_at   DATETIME        NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_tenants_slug   (slug),
    UNIQUE KEY uq_tenants_domain (domain),
    KEY idx_tenants_owner (owner_id),
    KEY idx_tenants_plan  (plan_id),
    CONSTRAINT fk_tenants_plan FOREIGN KEY (plan_id) REFERENCES plans (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default tenant for all existing data
INSERT INTO tenants (id, name, slug, status, plan_id, trial_ends_at, created_at)
VALUES (1, 'AMF Africa', 'amf', 'active', 2, NULL, NOW());
