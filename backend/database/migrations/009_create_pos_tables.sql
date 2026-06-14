-- ============================================================
-- MIGRATION 009 — Tables POS (Caisse)
-- ============================================================

-- Ajouter flag variantes sur la table products existante
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS a_des_variantes TINYINT(1) NOT NULL DEFAULT 0 AFTER stock;

-- ============================================================
-- TABLE : produit_variantes
-- Stock par combinaison taille × couleur
-- ============================================================
CREATE TABLE IF NOT EXISTS produit_variantes (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    produit_id      INT UNSIGNED      NOT NULL,

    taille          VARCHAR(20)       DEFAULT NULL,   -- XS/S/M/L/XL ou 36/37/38
    couleur         VARCHAR(50)       DEFAULT NULL,   -- Noir, Blanc, Rouge…
    couleur_hex     CHAR(7)           DEFAULT NULL,   -- #1A1A1A (swatch front)

    sku             VARCHAR(100)      DEFAULT NULL,
    prix            DECIMAL(15,2)     DEFAULT NULL,   -- NULL = hérite du produit
    stock           SMALLINT UNSIGNED NOT NULL DEFAULT 0,

    est_actif       TINYINT(1)        NOT NULL DEFAULT 1,

    created_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP
                                               ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (produit_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY uq_variante (produit_id, taille, couleur)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE : pos_ventes
-- Une transaction caisse (ou WhatsApp, téléphone…)
-- ============================================================
CREATE TABLE IF NOT EXISTS pos_ventes (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Identifiant lisible : VNT-2406-00001
    numero_vente    VARCHAR(25)       NOT NULL UNIQUE,

    canal           ENUM('caisse','whatsapp','telephone','online')
                                      NOT NULL DEFAULT 'caisse',
    statut          ENUM(
                        'brouillon',
                        'confirmee',
                        'partiellement_payee',
                        'payee',
                        'annulee',
                        'remboursee'
                    ) NOT NULL DEFAULT 'confirmee',

    -- Client (nullable = vente invité)
    client_id       INT UNSIGNED      DEFAULT NULL,
    client_nom      VARCHAR(150)      DEFAULT NULL,
    client_telephone VARCHAR(30)      DEFAULT NULL,

    -- Caissier/vendeur
    caissier_id     INT UNSIGNED      NOT NULL,

    -- Montants en CDF
    sous_total      DECIMAL(15,2)     NOT NULL DEFAULT 0.00,
    remise_montant  DECIMAL(15,2)     NOT NULL DEFAULT 0.00,
    remise_pct      DECIMAL(5,2)      NOT NULL DEFAULT 0.00,
    frais_livraison DECIMAL(15,2)     NOT NULL DEFAULT 0.00,
    total           DECIMAL(15,2)     NOT NULL DEFAULT 0.00,

    -- Suivi paiement
    total_paye      DECIMAL(15,2)     NOT NULL DEFAULT 0.00,
    solde_restant   DECIMAL(15,2)     NOT NULL DEFAULT 0.00,
    a_une_avance    TINYINT(1)        NOT NULL DEFAULT 0,

    -- Résumé modes (ex : "cash,mobile_money")
    modes_paiement  VARCHAR(100)      DEFAULT NULL,

    notes           TEXT              DEFAULT NULL,
    ticket_envoye   TINYINT(1)        NOT NULL DEFAULT 0,

    created_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP
                                               ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (client_id)   REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (caissier_id) REFERENCES users(id),

    INDEX idx_statut     (statut),
    INDEX idx_canal      (canal),
    INDEX idx_caissier   (caissier_id),
    INDEX idx_client     (client_id),
    INDEX idx_created_at (created_at)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE : pos_vente_articles
-- Lignes de panier — snapshot figé au moment de la vente
-- ============================================================
CREATE TABLE IF NOT EXISTS pos_vente_articles (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vente_id        INT UNSIGNED      NOT NULL,

    produit_id      INT UNSIGNED      DEFAULT NULL,
    variante_id     INT UNSIGNED      DEFAULT NULL,

    -- Snapshot données produit
    nom_produit     VARCHAR(200)      NOT NULL,
    sku             VARCHAR(100)      DEFAULT NULL,
    taille          VARCHAR(20)       DEFAULT NULL,
    couleur         VARCHAR(50)       DEFAULT NULL,

    -- Montants en CDF
    prix_unitaire   DECIMAL(15,2)     NOT NULL,
    quantite        SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    remise_ligne    DECIMAL(15,2)     NOT NULL DEFAULT 0.00,
    sous_total      DECIMAL(15,2)     NOT NULL,

    FOREIGN KEY (vente_id)    REFERENCES pos_ventes(id)        ON DELETE CASCADE,
    FOREIGN KEY (produit_id)  REFERENCES products(id)          ON DELETE SET NULL,
    FOREIGN KEY (variante_id) REFERENCES produit_variantes(id) ON DELETE SET NULL,

    INDEX idx_vente (vente_id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE : pos_paiements
-- N paiements par vente (split cash + MoMo + acomptes)
-- ============================================================
CREATE TABLE IF NOT EXISTS pos_paiements (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vente_id        INT UNSIGNED      NOT NULL,

    mode            ENUM('cash','mobile_money','carte','virement','credit')
                                      NOT NULL,
    montant         DECIMAL(15,2)     NOT NULL,

    -- Détails Mobile Money (M-Pesa, Airtel, Orange, Africell)
    operateur       ENUM('mpesa','airtel_money','orange_money','africell')
                                      DEFAULT NULL,
    reference_mm    VARCHAR(100)      DEFAULT NULL,
    telephone_payeur VARCHAR(30)      DEFAULT NULL,

    -- Acompte = paiement partiel à la commande
    est_acompte     TINYINT(1)        NOT NULL DEFAULT 0,

    statut          ENUM('confirme','en_attente','echec','rembourse')
                                      NOT NULL DEFAULT 'confirme',
    note            VARCHAR(255)      DEFAULT NULL,

    created_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (vente_id) REFERENCES pos_ventes(id) ON DELETE CASCADE,

    INDEX idx_vente  (vente_id),
    INDEX idx_mode   (mode),
    INDEX idx_statut (statut)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE : pos_tickets
-- Historique des tickets envoyés / imprimés
-- ============================================================
CREATE TABLE IF NOT EXISTS pos_tickets (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vente_id        INT UNSIGNED      NOT NULL,

    canal_envoi     ENUM('whatsapp','email','impression') NOT NULL,
    destinataire    VARCHAR(150)      DEFAULT NULL,
    statut          ENUM('envoye','echec','imprime')      NOT NULL DEFAULT 'envoye',
    reference_wa    VARCHAR(100)      DEFAULT NULL,

    created_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (vente_id) REFERENCES pos_ventes(id) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
