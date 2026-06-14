-- Migration 016 — Activity logs (audit trail complet)
CREATE TABLE IF NOT EXISTS activity_logs (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    tenant_id   INT UNSIGNED    NULL     COMMENT 'NULL = action plateforme superadmin',
    user_id     INT UNSIGNED    NULL,
    user_email  VARCHAR(180)    NULL     COMMENT 'snapshot au moment de l action',
    action      VARCHAR(100)    NOT NULL COMMENT 'ex: tenant.suspend, product.create',
    entity_type VARCHAR(60)     NULL     COMMENT 'ex: tenant, product, order',
    entity_id   INT UNSIGNED    NULL,
    meta        JSON            NULL     COMMENT 'données contextuelles',
    ip_address  VARCHAR(45)     NULL,
    user_agent  VARCHAR(255)    NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_al_tenant  (tenant_id),
    KEY idx_al_user    (user_id),
    KEY idx_al_action  (action),
    KEY idx_al_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
