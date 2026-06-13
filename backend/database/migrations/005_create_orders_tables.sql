CREATE TABLE IF NOT EXISTS orders (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED             DEFAULT NULL,
    status          ENUM('pending','paid','processing','shipped','delivered','cancelled','refunded')
                                  NOT NULL   DEFAULT 'pending',
    total_amount    DECIMAL(10,2) NOT NULL,
    shipping_name   VARCHAR(150)  NOT NULL,
    shipping_email  VARCHAR(180)  NOT NULL,
    shipping_phone  VARCHAR(30)              DEFAULT NULL,
    shipping_address VARCHAR(255) NOT NULL,
    shipping_city   VARCHAR(100)  NOT NULL,
    shipping_zip    VARCHAR(20)   NOT NULL,
    shipping_country VARCHAR(60)  NOT NULL   DEFAULT 'FR',
    stripe_pi_id    VARCHAR(100)             DEFAULT NULL,
    notes           TEXT                     DEFAULT NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id        INT UNSIGNED  NOT NULL,
    product_id      INT UNSIGNED             DEFAULT NULL,
    product_name    VARCHAR(200)  NOT NULL,
    product_sku     VARCHAR(100)             DEFAULT NULL,
    unit_price      DECIMAL(10,2) NOT NULL,
    quantity        SMALLINT UNSIGNED NOT NULL,
    subtotal        DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
