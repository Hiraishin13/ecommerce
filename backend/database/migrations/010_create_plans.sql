-- Migration 010 — SaaS Plans table
CREATE TABLE IF NOT EXISTS plans (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    name            VARCHAR(100)    NOT NULL,
    slug            VARCHAR(100)    NOT NULL,
    price_monthly   DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    price_yearly    DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    limits          JSON            NOT NULL,
    features        JSON            NOT NULL,
    is_public       TINYINT(1)      NOT NULL DEFAULT 1,
    sort_order      SMALLINT        NOT NULL DEFAULT 0,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_plans_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO plans (name, slug, price_monthly, price_yearly, limits, features, is_public, sort_order) VALUES
('Starter',  'starter',  0.00,   0.00,
 '{"products_max":50,"users_max":2,"orders_per_month":200,"storage_mb":512}',
 '{"pos":false,"analytics":false,"marketing":false,"ai":false,"multi_store":false,"api":false}',
 1, 1),
('Pro',      'pro',      29.00,  290.00,
 '{"products_max":500,"users_max":10,"orders_per_month":2000,"storage_mb":5120}',
 '{"pos":true,"analytics":true,"marketing":false,"ai":false,"multi_store":false,"api":true}',
 1, 2),
('Business', 'business', 79.00,  790.00,
 '{"products_max":-1,"users_max":-1,"orders_per_month":-1,"storage_mb":20480}',
 '{"pos":true,"analytics":true,"marketing":true,"ai":true,"multi_store":true,"api":true}',
 1, 3);
