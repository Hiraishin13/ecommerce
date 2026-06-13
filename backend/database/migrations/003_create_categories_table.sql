CREATE TABLE IF NOT EXISTS categories (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    parent_id   INT UNSIGNED             DEFAULT NULL,
    name        VARCHAR(100)  NOT NULL,
    slug        VARCHAR(120)  NOT NULL UNIQUE,
    description TEXT                     DEFAULT NULL,
    image       VARCHAR(255)             DEFAULT NULL,
    sort_order  SMALLINT UNSIGNED        DEFAULT 0,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
