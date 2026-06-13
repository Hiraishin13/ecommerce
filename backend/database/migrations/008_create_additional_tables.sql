-- ── Addresses ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED  NOT NULL,
    label       VARCHAR(50)             DEFAULT 'Home',
    name        VARCHAR(150)  NOT NULL,
    phone       VARCHAR(30)             DEFAULT NULL,
    address     VARCHAR(255)  NOT NULL,
    city        VARCHAR(100)  NOT NULL,
    zip         VARCHAR(20)   NOT NULL,
    country     VARCHAR(60)   NOT NULL DEFAULT 'FR',
    is_default  TINYINT(1)    NOT NULL DEFAULT 0,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Coupons ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(50)   NOT NULL UNIQUE,
    type            ENUM('percent','fixed') NOT NULL DEFAULT 'percent',
    value           DECIMAL(10,2) NOT NULL,
    min_order       DECIMAL(10,2)           DEFAULT NULL,
    max_uses        INT UNSIGNED            DEFAULT NULL,
    uses_count      INT UNSIGNED  NOT NULL  DEFAULT 0,
    starts_at       DATETIME                DEFAULT NULL,
    expires_at      DATETIME                DEFAULT NULL,
    is_active       TINYINT(1)    NOT NULL  DEFAULT 1,
    created_at      DATETIME      NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Wishlists ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlists (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED  NOT NULL,
    product_id  INT UNSIGNED  NOT NULL,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_wishlist_user_product (user_id, product_id),
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Notifications ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED  NOT NULL,
    type        VARCHAR(80)   NOT NULL,
    title       VARCHAR(200)  NOT NULL,
    body        TEXT                    DEFAULT NULL,
    data        JSON                    DEFAULT NULL,
    read_at     DATETIME                DEFAULT NULL,
    created_at  DATETIME      NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user_read (user_id, read_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
