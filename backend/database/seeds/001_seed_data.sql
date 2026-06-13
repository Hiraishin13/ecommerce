-- ── Seed: Admin User ──────────────────────────────────────────────────────────
-- Password: Admin@1234  (bcrypt cost=12)
INSERT IGNORE INTO users (name, email, password, role, email_verified)
VALUES (
    'Admin',
    'admin@ecommerce.local',
    '$2y$12$YOdxHKFw/xFNYwHqbHTuDO5rh5mAu5NKFA7SqExCcXrn.7bWGaLuO',
    'admin',
    1
);

-- ── Seed: Demo Customer ───────────────────────────────────────────────────────
-- Password: Customer@1234  (bcrypt cost=12)
INSERT IGNORE INTO users (name, email, password, role, email_verified)
VALUES (
    'Jane Doe',
    'customer@ecommerce.local',
    '$2y$12$6UXDX/yIJivBrBkn5l8rP.hV4TjhF9u1v3Tl7q.WE4kTuaH.r0HMO',
    'customer',
    1
);

-- ── Seed: Categories ─────────────────────────────────────────────────────────
INSERT IGNORE INTO categories (name, slug, description, sort_order)
VALUES
    ('Electronics',    'electronics',    'Phones, laptops, and gadgets',  1),
    ('Clothing',       'clothing',       'Men and women fashion',         2),
    ('Home & Garden',  'home-garden',    'Furniture, decor, and tools',   3),
    ('Books',          'books',          'Fiction, non-fiction, and more', 4),
    ('Sports',         'sports',         'Equipment and apparel',         5);

-- Sub-categories
INSERT IGNORE INTO categories (parent_id, name, slug, description, sort_order)
VALUES
    ((SELECT id FROM categories WHERE slug='electronics' LIMIT 1), 'Smartphones', 'smartphones', 'Latest mobile phones', 1),
    ((SELECT id FROM categories WHERE slug='electronics' LIMIT 1), 'Laptops',     'laptops',     'Notebooks and ultrabooks', 2),
    ((SELECT id FROM categories WHERE slug='clothing' LIMIT 1),    'Men',         'mens-clothing', 'Men fashion',   1),
    ((SELECT id FROM categories WHERE slug='clothing' LIMIT 1),    'Women',       'womens-clothing', 'Women fashion', 2);

-- ── Seed: Sample Products ─────────────────────────────────────────────────────
INSERT IGNORE INTO products
    (category_id, name, slug, description, price, compare_price, stock, sku, images, is_active, is_featured)
VALUES
(
    (SELECT id FROM categories WHERE slug='smartphones' LIMIT 1),
    'ProPhone X12',
    'prophone-x12',
    'The latest flagship smartphone with a stunning 6.7" AMOLED display, 200MP camera, and 5000mAh battery.',
    799.99, 999.99, 50, 'PPX12-BLK',
    '["https://placehold.co/800x800?text=ProPhone+X12"]',
    1, 1
),
(
    (SELECT id FROM categories WHERE slug='laptops' LIMIT 1),
    'UltraBook Pro 15',
    'ultrabook-pro-15',
    'Slim and powerful laptop with Intel Core i9, 32GB RAM, and 1TB NVMe SSD. Perfect for professionals.',
    1299.00, 1499.00, 30, 'UBP15-SLV',
    '["https://placehold.co/800x800?text=UltraBook+Pro+15"]',
    1, 1
),
(
    (SELECT id FROM categories WHERE slug='mens-clothing' LIMIT 1),
    'Classic Oxford Shirt',
    'classic-oxford-shirt',
    'Timeless Oxford shirt crafted from 100% premium cotton. Available in multiple colors.',
    49.99, NULL, 100, 'COS-WHT-M',
    '["https://placehold.co/800x800?text=Oxford+Shirt"]',
    1, 0
),
(
    (SELECT id FROM categories WHERE slug='womens-clothing' LIMIT 1),
    'Summer Floral Dress',
    'summer-floral-dress',
    'Light and breezy floral dress perfect for warm days. Machine washable.',
    59.99, 79.99, 80, 'SFD-BLU-S',
    '["https://placehold.co/800x800?text=Floral+Dress"]',
    1, 1
),
(
    (SELECT id FROM categories WHERE slug='home-garden' LIMIT 1),
    'Ergonomic Office Chair',
    'ergonomic-office-chair',
    'Lumbar support, adjustable armrests, and breathable mesh back. Up to 8 hours comfort.',
    349.00, 449.00, 20, 'EOC-BLK',
    '["https://placehold.co/800x800?text=Office+Chair"]',
    1, 0
),
(
    (SELECT id FROM categories WHERE slug='books' LIMIT 1),
    'The Art of Clean Code',
    'art-of-clean-code',
    'A practical guide to writing maintainable, readable, and testable code by senior engineers.',
    29.99, NULL, 200, 'BOOK-CLEANCODE',
    '["https://placehold.co/800x800?text=Clean+Code+Book"]',
    1, 0
),
(
    (SELECT id FROM categories WHERE slug='sports' LIMIT 1),
    'ProFit Running Shoes',
    'profit-running-shoes',
    'Lightweight running shoes with advanced cushioning technology. Ideal for marathon training.',
    119.99, 149.99, 60, 'PRS-WHT-42',
    '["https://placehold.co/800x800?text=Running+Shoes"]',
    1, 1
),
(
    (SELECT id FROM categories WHERE slug='electronics' LIMIT 1),
    'AirSound Pro Headphones',
    'airsound-pro-headphones',
    'Premium wireless noise-cancelling headphones with 40-hour battery life and Hi-Fi audio.',
    249.99, 299.99, 45, 'ASP-BLK',
    '["https://placehold.co/800x800?text=Headphones"]',
    1, 1
);

-- ── Seed: Sample Coupon ───────────────────────────────────────────────────────
INSERT IGNORE INTO coupons (code, type, value, min_order, max_uses, is_active)
VALUES
    ('WELCOME10',  'percent', 10.00, 50.00,  NULL, 1),
    ('SAVE20',     'fixed',   20.00, 100.00, 500,  1),
    ('SUMMER2025', 'percent', 15.00, 75.00,  200,  1);
