<?php
declare(strict_types=1);

try {
    $pdo = new PDO("mysql:host=127.0.0.1;port=3306;dbname=ecommerce;charset=utf8mb4", "root", "", [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    echo "Connected.\n";

    // ── Users ────────────────────────────────────────────────────────────────────
    $pdo->exec("
        INSERT IGNORE INTO users (name, email, password, role, email_verified)
        VALUES
        ('Admin',    'admin@ecommerce.local',    '\$2y\$12\$YOdxHKFw/xFNYwHqbHTuDO5rh5mAu5NKFA7SqExCcXrn.7bWGaLuO', 'admin',    1),
        ('Jane Doe', 'customer@ecommerce.local', '\$2y\$12\$6UXDX/yIJivBrBkn5l8rP.hV4TjhF9u1v3Tl7q.WE4kTuaH.r0HMO', 'customer', 1)
    ");
    echo "Users inserted.\n";

    // ── Root categories ──────────────────────────────────────────────────────────
    $pdo->exec("
        INSERT IGNORE INTO categories (name, slug, description, sort_order)
        VALUES
        ('Electronics',   'electronics',  'Phones, laptops, and gadgets',    1),
        ('Clothing',      'clothing',     'Men and women fashion',            2),
        ('Home & Garden', 'home-garden',  'Furniture, decor, and tools',      3),
        ('Books',         'books',        'Fiction, non-fiction, and more',   4),
        ('Sports',        'sports',       'Equipment and apparel',            5)
    ");
    echo "Root categories inserted.\n";

    // ── Get category IDs ─────────────────────────────────────────────────────────
    $cats = [];
    $stmt = $pdo->query("SELECT id, slug FROM categories");
    foreach ($stmt->fetchAll() as $row) {
        $cats[$row['slug']] = (int) $row['id'];
    }

    // ── Sub-categories ───────────────────────────────────────────────────────────
    $subStmt = $pdo->prepare("
        INSERT IGNORE INTO categories (parent_id, name, slug, description, sort_order)
        VALUES (?, ?, ?, ?, ?)
    ");
    $subs = [
        [$cats['electronics'], 'Smartphones',    'smartphones',      'Latest mobile phones',     1],
        [$cats['electronics'], 'Laptops',         'laptops',          'Notebooks and ultrabooks', 2],
        [$cats['clothing'],    'Men',             'mens-clothing',    'Men fashion',              1],
        [$cats['clothing'],    'Women',           'womens-clothing',  'Women fashion',            2],
    ];
    foreach ($subs as $sub) {
        $subStmt->execute($sub);
    }
    echo "Sub-categories inserted.\n";

    // Refresh cat IDs
    $stmt = $pdo->query("SELECT id, slug FROM categories");
    foreach ($stmt->fetchAll() as $row) {
        $cats[$row['slug']] = (int) $row['id'];
    }

    // ── Products ─────────────────────────────────────────────────────────────────
    $prodStmt = $pdo->prepare("
        INSERT IGNORE INTO products (category_id, name, slug, description, price, compare_price, stock, sku, images, is_active, is_featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    ");

    $products = [
        [$cats['smartphones'],    'ProPhone X12',           'prophone-x12',           'The latest flagship smartphone with a stunning 6.7" AMOLED display, 200MP camera, and 5000mAh battery.',  799.99, 999.99, 50, 'PPX12-BLK',       '["https://placehold.co/800x800?text=ProPhone+X12"]', 1],
        [$cats['laptops'],        'UltraBook Pro 15',       'ultrabook-pro-15',       'Slim and powerful laptop with Intel Core i9, 32GB RAM, and 1TB NVMe SSD. Perfect for professionals.',      1299.00, 1499.00, 30, 'UBP15-SLV',     '["https://placehold.co/800x800?text=UltraBook+Pro+15"]', 1],
        [$cats['mens-clothing'],  'Classic Oxford Shirt',   'classic-oxford-shirt',   'Timeless Oxford shirt crafted from 100% premium cotton. Available in multiple colors.',                     49.99, null, 100, 'COS-WHT-M',        '["https://placehold.co/800x800?text=Oxford+Shirt"]', 0],
        [$cats['womens-clothing'],'Summer Floral Dress',    'summer-floral-dress',    'Light and breezy floral dress perfect for warm days. Machine washable.',                                    59.99, 79.99, 80, 'SFD-BLU-S',        '["https://placehold.co/800x800?text=Floral+Dress"]', 1],
        [$cats['home-garden'],    'Ergonomic Office Chair', 'ergonomic-office-chair', 'Lumbar support, adjustable armrests, and breathable mesh back. Up to 8 hours comfort.',                     349.00, 449.00, 20, 'EOC-BLK',          '["https://placehold.co/800x800?text=Office+Chair"]', 0],
        [$cats['books'],          'The Art of Clean Code',  'art-of-clean-code',      'A practical guide to writing maintainable, readable, and testable code by senior engineers.',               29.99, null, 200, 'BOOK-CLEANCODE',   '["https://placehold.co/800x800?text=Clean+Code+Book"]', 0],
        [$cats['sports'],         'ProFit Running Shoes',   'profit-running-shoes',   'Lightweight running shoes with advanced cushioning technology. Ideal for marathon training.',               119.99, 149.99, 60, 'PRS-WHT-42',      '["https://placehold.co/800x800?text=Running+Shoes"]', 1],
        [$cats['electronics'],    'AirSound Pro Headphones','airsound-pro-headphones','Premium wireless noise-cancelling headphones with 40-hour battery life and Hi-Fi audio.',                   249.99, 299.99, 45, 'ASP-BLK',          '["https://placehold.co/800x800?text=Headphones"]', 1],
    ];
    foreach ($products as $prod) {
        $prodStmt->execute($prod);
    }
    echo "Products inserted.\n";

    // ── Coupons ──────────────────────────────────────────────────────────────────
    $pdo->exec("
        INSERT IGNORE INTO coupons (code, type, value, min_order, max_uses, is_active)
        VALUES
        ('WELCOME10',  'percent', 10.00, 50.00,  NULL, 1),
        ('SAVE20',     'fixed',   20.00, 100.00, 500,  1),
        ('SUMMER2025', 'percent', 15.00, 75.00,  200,  1)
    ");
    echo "Coupons inserted.\n";

    echo "\nSeed completed successfully!\n";
    echo "Admin:    admin@ecommerce.local    / Admin@1234\n";
    echo "Customer: customer@ecommerce.local / Customer@1234\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
