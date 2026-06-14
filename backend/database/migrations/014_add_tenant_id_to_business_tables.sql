-- Migration 014 — Add tenant_id to all business tables (backfill with tenant 1)

-- ── categories ──────────────────────────────────────────────────────────────
ALTER TABLE categories ADD COLUMN tenant_id INT UNSIGNED NULL AFTER id;
UPDATE categories SET tenant_id = 1;
ALTER TABLE categories MODIFY COLUMN tenant_id INT UNSIGNED NOT NULL;
ALTER TABLE categories ADD KEY idx_categories_tenant (tenant_id);
ALTER TABLE categories DROP INDEX slug;
ALTER TABLE categories ADD UNIQUE KEY uq_categories_slug_tenant (slug, tenant_id);
ALTER TABLE categories ADD CONSTRAINT fk_categories_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id);

-- ── products ─────────────────────────────────────────────────────────────────
ALTER TABLE products ADD COLUMN tenant_id INT UNSIGNED NULL AFTER id;
UPDATE products SET tenant_id = 1;
ALTER TABLE products MODIFY COLUMN tenant_id INT UNSIGNED NOT NULL;
ALTER TABLE products ADD KEY idx_products_tenant (tenant_id);
ALTER TABLE products DROP INDEX slug;
ALTER TABLE products ADD UNIQUE KEY uq_products_slug_tenant (slug, tenant_id);
ALTER TABLE products DROP INDEX sku;
ALTER TABLE products ADD UNIQUE KEY uq_products_sku_tenant (sku, tenant_id);
ALTER TABLE products ADD CONSTRAINT fk_products_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id);

-- ── orders ───────────────────────────────────────────────────────────────────
ALTER TABLE orders ADD COLUMN tenant_id INT UNSIGNED NULL AFTER id;
UPDATE orders SET tenant_id = 1;
ALTER TABLE orders MODIFY COLUMN tenant_id INT UNSIGNED NOT NULL;
ALTER TABLE orders ADD KEY idx_orders_tenant (tenant_id);
ALTER TABLE orders ADD CONSTRAINT fk_orders_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id);

-- ── order_items ──────────────────────────────────────────────────────────────
ALTER TABLE order_items ADD COLUMN tenant_id INT UNSIGNED NULL AFTER id;
UPDATE order_items SET tenant_id = 1;
ALTER TABLE order_items MODIFY COLUMN tenant_id INT UNSIGNED NOT NULL;
ALTER TABLE order_items ADD KEY idx_order_items_tenant (tenant_id);

-- ── cart_items ───────────────────────────────────────────────────────────────
ALTER TABLE cart_items ADD COLUMN tenant_id INT UNSIGNED NULL AFTER id;
UPDATE cart_items SET tenant_id = 1;
ALTER TABLE cart_items MODIFY COLUMN tenant_id INT UNSIGNED NOT NULL;
ALTER TABLE cart_items ADD KEY idx_cart_items_tenant (tenant_id);

-- ── reviews ──────────────────────────────────────────────────────────────────
ALTER TABLE reviews ADD COLUMN tenant_id INT UNSIGNED NULL AFTER id;
UPDATE reviews SET tenant_id = 1;
ALTER TABLE reviews MODIFY COLUMN tenant_id INT UNSIGNED NOT NULL;
ALTER TABLE reviews ADD KEY idx_reviews_tenant (tenant_id);

-- ── addresses ────────────────────────────────────────────────────────────────
ALTER TABLE addresses ADD COLUMN tenant_id INT UNSIGNED NULL AFTER id;
UPDATE addresses SET tenant_id = 1;
ALTER TABLE addresses MODIFY COLUMN tenant_id INT UNSIGNED NOT NULL;
ALTER TABLE addresses ADD KEY idx_addresses_tenant (tenant_id);

-- ── coupons ──────────────────────────────────────────────────────────────────
ALTER TABLE coupons ADD COLUMN tenant_id INT UNSIGNED NULL AFTER id;
UPDATE coupons SET tenant_id = 1;
ALTER TABLE coupons MODIFY COLUMN tenant_id INT UNSIGNED NOT NULL;
ALTER TABLE coupons ADD KEY idx_coupons_tenant (tenant_id);
ALTER TABLE coupons DROP INDEX code;
ALTER TABLE coupons ADD UNIQUE KEY uq_coupons_code_tenant (code, tenant_id);
ALTER TABLE coupons ADD CONSTRAINT fk_coupons_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id);

-- ── wishlists ────────────────────────────────────────────────────────────────
ALTER TABLE wishlists ADD COLUMN tenant_id INT UNSIGNED NULL AFTER id;
UPDATE wishlists SET tenant_id = 1;
ALTER TABLE wishlists MODIFY COLUMN tenant_id INT UNSIGNED NOT NULL;
ALTER TABLE wishlists ADD KEY idx_wishlists_tenant (tenant_id);

-- ── notifications ─────────────────────────────────────────────────────────────
ALTER TABLE notifications ADD COLUMN tenant_id INT UNSIGNED NULL AFTER id;
UPDATE notifications SET tenant_id = 1;
ALTER TABLE notifications MODIFY COLUMN tenant_id INT UNSIGNED NOT NULL;
ALTER TABLE notifications ADD KEY idx_notifications_tenant (tenant_id);

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
