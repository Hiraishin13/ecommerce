-- Migration 013 — tenant_users junction + subscriptions

CREATE TABLE IF NOT EXISTS tenant_users (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    tenant_id   INT UNSIGNED    NOT NULL,
    user_id     INT UNSIGNED    NOT NULL,
    role        ENUM('owner','admin','manager','cashier','staff') NOT NULL DEFAULT 'staff',
    is_active   TINYINT(1)      NOT NULL DEFAULT 1,
    invited_by  INT UNSIGNED    NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_tenant_users (tenant_id, user_id),
    KEY idx_tu_user   (user_id),
    CONSTRAINT fk_tu_tenant     FOREIGN KEY (tenant_id)  REFERENCES tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_tu_user       FOREIGN KEY (user_id)    REFERENCES users   (id) ON DELETE CASCADE,
    CONSTRAINT fk_tu_inviter    FOREIGN KEY (invited_by) REFERENCES users   (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Populate from existing users (all belong to tenant 1)
INSERT INTO tenant_users (tenant_id, user_id, role)
SELECT 1, id,
    CASE role
        WHEN 'superadmin' THEN 'owner'
        WHEN 'admin'      THEN 'admin'
        ELSE                   'staff'
    END
FROM users
WHERE tenant_id = 1;

CREATE TABLE IF NOT EXISTS subscriptions (
    id                      INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    tenant_id               INT UNSIGNED    NOT NULL,
    plan_id                 INT UNSIGNED    NOT NULL,
    status                  ENUM('active','past_due','cancelled','trialing') NOT NULL DEFAULT 'trialing',
    current_period_start    DATETIME        NOT NULL,
    current_period_end      DATETIME        NOT NULL,
    cancelled_at            DATETIME        NULL,
    stripe_subscription_id  VARCHAR(255)    NULL,
    created_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_sub_tenant (tenant_id),
    CONSTRAINT fk_sub_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_sub_plan   FOREIGN KEY (plan_id)   REFERENCES plans   (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed active subscription for the default tenant
INSERT INTO subscriptions (tenant_id, plan_id, status, current_period_start, current_period_end)
VALUES (1, 2, 'active', NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR));
