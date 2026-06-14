-- Migration 015 — Add tenant_id to POS tables (run after POS tables are created)

-- ── produit_variantes ─────────────────────────────────────────────────────────
ALTER TABLE produit_variantes ADD COLUMN tenant_id INT UNSIGNED NULL AFTER id;
UPDATE produit_variantes SET tenant_id = 1;
ALTER TABLE produit_variantes MODIFY COLUMN tenant_id INT UNSIGNED NOT NULL;
ALTER TABLE produit_variantes ADD KEY idx_produit_variantes_tenant (tenant_id);

-- ── pos_ventes ────────────────────────────────────────────────────────────────
ALTER TABLE pos_ventes ADD COLUMN tenant_id INT UNSIGNED NULL AFTER id;
UPDATE pos_ventes SET tenant_id = 1;
ALTER TABLE pos_ventes MODIFY COLUMN tenant_id INT UNSIGNED NOT NULL;
ALTER TABLE pos_ventes ADD KEY idx_pos_ventes_tenant (tenant_id);
ALTER TABLE pos_ventes DROP INDEX numero_vente;
ALTER TABLE pos_ventes ADD UNIQUE KEY uq_pos_ventes_numero_tenant (numero_vente, tenant_id);
ALTER TABLE pos_ventes ADD CONSTRAINT fk_pos_ventes_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id);

-- ── pos_vente_articles ────────────────────────────────────────────────────────
ALTER TABLE pos_vente_articles ADD COLUMN tenant_id INT UNSIGNED NULL AFTER id;
UPDATE pos_vente_articles SET tenant_id = 1;
ALTER TABLE pos_vente_articles MODIFY COLUMN tenant_id INT UNSIGNED NOT NULL;
ALTER TABLE pos_vente_articles ADD KEY idx_pos_vente_articles_tenant (tenant_id);

-- ── pos_paiements ─────────────────────────────────────────────────────────────
ALTER TABLE pos_paiements ADD COLUMN tenant_id INT UNSIGNED NULL AFTER id;
UPDATE pos_paiements SET tenant_id = 1;
ALTER TABLE pos_paiements MODIFY COLUMN tenant_id INT UNSIGNED NOT NULL;
ALTER TABLE pos_paiements ADD KEY idx_pos_paiements_tenant (tenant_id);

-- ── pos_tickets ───────────────────────────────────────────────────────────────
ALTER TABLE pos_tickets ADD COLUMN tenant_id INT UNSIGNED NULL AFTER id;
UPDATE pos_tickets SET tenant_id = 1;
ALTER TABLE pos_tickets MODIFY COLUMN tenant_id INT UNSIGNED NOT NULL;
ALTER TABLE pos_tickets ADD KEY idx_pos_tickets_tenant (tenant_id);
