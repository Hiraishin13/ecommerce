-- Migration 012 — Add tenant_id to users, expand role ENUM, fix email uniqueness

-- 1. Add tenant_id (nullable first to allow backfill)
ALTER TABLE users ADD COLUMN tenant_id INT UNSIGNED NULL AFTER id;
ALTER TABLE users ADD KEY idx_users_tenant (tenant_id);

-- 2. Assign all existing users to tenant 1
UPDATE users SET tenant_id = 1;

-- 3. Make tenant_id NOT NULL
ALTER TABLE users MODIFY COLUMN tenant_id INT UNSIGNED NOT NULL;

-- 4. Expand role ENUM to include superadmin
ALTER TABLE users MODIFY COLUMN role ENUM('customer','admin','superadmin') NOT NULL DEFAULT 'customer';

-- 5. Promote existing admin to superadmin
UPDATE users SET role = 'superadmin' WHERE email = 'admin@ecommerce.local';

-- 6. Drop global unique index on email
ALTER TABLE users DROP INDEX email;

-- 7. Add composite unique: (email, tenant_id)
ALTER TABLE users ADD UNIQUE KEY uq_users_email_tenant (email, tenant_id);

-- 8. Wire tenants.owner_id FK now that users is ready
ALTER TABLE tenants
    ADD CONSTRAINT fk_tenants_owner FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE SET NULL;

-- 9. Set tenant 1 owner to the superadmin
UPDATE tenants t
    JOIN users u ON u.email = 'admin@ecommerce.local'
SET t.owner_id = u.id
WHERE t.id = 1;
