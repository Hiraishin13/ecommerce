CREATE TABLE IF NOT EXISTS users (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)        NOT NULL,
    email           VARCHAR(180)        NOT NULL UNIQUE,
    password        VARCHAR(255)        NOT NULL,
    role            ENUM('customer','admin') NOT NULL DEFAULT 'customer',
    email_verified  TINYINT(1)          NOT NULL DEFAULT 0,
    verify_token    VARCHAR(100)                 DEFAULT NULL,
    reset_token     VARCHAR(100)                 DEFAULT NULL,
    reset_expires   DATETIME                     DEFAULT NULL,
    avatar          VARCHAR(255)                 DEFAULT NULL,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
