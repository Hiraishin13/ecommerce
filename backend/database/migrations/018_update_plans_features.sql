-- Migration 018 — Plans enrichis avec feature flags complets
-- Supprimer les plans existants et remettre avec la définition complète
SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE plans;
SET FOREIGN_KEY_CHECKS=1;

INSERT INTO plans (name, slug, price_monthly, price_yearly, limits, features, is_public, sort_order) VALUES

('Gratuit', 'free', 0.00, 0.00,
 '{"products_max":50,"users_max":1,"orders_per_month":100,"storage_mb":256,"categories_max":5}',
 '{"catalog":true,"orders":true,"customers":true,"pos":false,"analytics":false,"promotions":false,"coupons":false,"employees":false,"branding_basic":true,"branding_advanced":false,"social_links":false,"api":false,"multi_store":false,"marketing":false,"ai":false,"custom_domain":false,"priority_support":false}',
 1, 1),

('Starter', 'starter', 9.00, 90.00,
 '{"products_max":500,"users_max":3,"orders_per_month":500,"storage_mb":1024,"categories_max":20}',
 '{"catalog":true,"orders":true,"customers":true,"pos":false,"analytics":true,"promotions":true,"coupons":true,"employees":false,"branding_basic":true,"branding_advanced":false,"social_links":true,"api":false,"multi_store":false,"marketing":false,"ai":false,"custom_domain":false,"priority_support":false}',
 1, 2),

('Business', 'business', 29.00, 290.00,
 '{"products_max":2000,"users_max":10,"orders_per_month":2000,"storage_mb":5120,"categories_max":100}',
 '{"catalog":true,"orders":true,"customers":true,"pos":true,"analytics":true,"promotions":true,"coupons":true,"employees":true,"branding_basic":true,"branding_advanced":true,"social_links":true,"api":false,"multi_store":false,"marketing":true,"ai":false,"custom_domain":true,"priority_support":false}',
 1, 3),

('Premium', 'premium', 79.00, 790.00,
 '{"products_max":-1,"users_max":-1,"orders_per_month":-1,"storage_mb":20480,"categories_max":-1}',
 '{"catalog":true,"orders":true,"customers":true,"pos":true,"analytics":true,"promotions":true,"coupons":true,"employees":true,"branding_basic":true,"branding_advanced":true,"social_links":true,"api":true,"multi_store":false,"marketing":true,"ai":true,"custom_domain":true,"priority_support":true}',
 1, 4),

('Enterprise', 'enterprise', 199.00, 1990.00,
 '{"products_max":-1,"users_max":-1,"orders_per_month":-1,"storage_mb":-1,"categories_max":-1}',
 '{"catalog":true,"orders":true,"customers":true,"pos":true,"analytics":true,"promotions":true,"coupons":true,"employees":true,"branding_basic":true,"branding_advanced":true,"social_links":true,"api":true,"multi_store":true,"marketing":true,"ai":true,"custom_domain":true,"priority_support":true}',
 1, 5);

-- Remettre le tenant 1 (AMF) sur Business (id=3)
UPDATE tenants SET plan_id = 3 WHERE id = 1;
UPDATE subscriptions SET plan_id = 3 WHERE tenant_id = 1;
