# Cahier des Charges — Plateforme E-Commerce

> **Stack :** Backend PHP · MySQL · Frontend React  
> **Design :** Simple, épuré, inspiré de us.puma.com  
> **Version :** 1.0 · Juin 2026 · Confidentiel

---

## Table des matières

1. [Présentation du projet](#1-présentation-du-projet)
2. [Objectifs et portée](#2-objectifs-et-portée)
3. [Architecture technique](#3-architecture-technique)
4. [Charte graphique & Design System](#4-charte-graphique--design-system)
5. [Structure des rôles et espaces](#5-structure-des-rôles-et-espaces)
6. [Espace Client — Pages et fonctionnalités](#6-espace-client--pages-et-fonctionnalités)
7. [Espace Admin — Pages et fonctionnalités](#7-espace-admin--pages-et-fonctionnalités)
8. [Espace Super Admin — Pages et fonctionnalités](#8-espace-super-admin--pages-et-fonctionnalités)
9. [Système d'abonnements](#9-système-dabonnements)
10. [Catalogue produits](#10-catalogue-produits)
11. [Panier et Checkout](#11-panier-et-checkout)
12. [Gestion des commandes](#12-gestion-des-commandes)
13. [Système de paiement](#13-système-de-paiement)
14. [Notifications et emails](#14-notifications-et-emails)
15. [Sécurité](#15-sécurité)
16. [API REST — Endpoints](#16-api-rest--endpoints)
17. [Base de données — Schéma](#17-base-de-données--schéma)
18. [Déploiement et hébergement](#18-déploiement-et-hébergement)
19. [Planning et phases](#19-planning-et-phases)
20. [Glossaire](#20-glossaire)

---

## 1. Présentation du projet

### 1.1 Contexte

Le projet consiste à développer une plateforme e-commerce complète permettant la vente de produits en ligne. La plateforme s'inspire de **us.puma.com** pour son approche épurée, minimaliste et focalisée sur l'expérience utilisateur. L'accent est mis sur la simplicité d'utilisation, la rapidité de navigation et la lisibilité des informations produits.

### 1.2 Parties prenantes

| Acteur | Rôle |
|---|---|
| **Propriétaire** | Possède la plateforme, gère les abonnements des boutiques via le Super Admin |
| **Administrateur (Admin)** | Gère une boutique : produits, commandes, clients, promotions |
| **Client (User)** | Navigue, achète, suit ses commandes, gère son compte |
| **Visiteur** | Peut naviguer et consulter les produits sans compte |

### 1.3 Livrables attendus

- Application web React (SPA) — frontend responsive
- API REST PHP avec architecture MVC
- Base de données MySQL — schéma complet
- Panel d'administration complet
- Panel Super Admin pour gestion des abonnements
- Documentation technique et guide d'utilisation

---

## 2. Objectifs et portée

### 2.1 Objectifs principaux

1. Offrir une expérience d'achat simple, fluide et agréable inspirée des grandes plateformes
2. Permettre à plusieurs marchands de gérer leur boutique de manière autonome
3. Fournir au propriétaire un contrôle total via un espace Super Admin
4. Gérer un système d'abonnements flexibles (Mensuel / Annuel / Gratuit)
5. Garantir la sécurité des données et des transactions

### 2.2 Périmètre MVP

**✅ Inclus dans le MVP**

- Authentification (inscription, connexion, récupération mot de passe)
- Catalogue produits avec filtres et recherche
- Panier, checkout et gestion des commandes
- Espace client (profil, commandes, adresses)
- Espace Admin (produits, commandes, stats)
- Espace Super Admin (boutiques, abonnements, utilisateurs)
- Système de notifications email

**🔮 Évolutions futures (V2)**

- Application mobile React Native
- Intégration Mobile Money (Airtel, Orange)
- Programme fidélité et points de récompenses
- Chat en direct avec le support
- API publique pour intégrations tierces

---

## 3. Architecture technique

### 3.1 Stack technologique

| Couche | Technologie | Rôle |
|---|---|---|
| Frontend | React 18 + Vite | SPA, routing, state management |
| State Management | Redux Toolkit ou Zustand | Gestion état global (panier, auth) |
| Styles | Tailwind CSS ou CSS Modules | Design system cohérent et épuré |
| HTTP Client | Axios | Appels API REST |
| Backend | PHP 8.2 (architecture MVC) | Logique métier, API REST |
| Base de données | MySQL 8.0 | Données relationnelles |
| ORM / Query Builder | PDO + classes Repository | Accès données sécurisé |
| Authentification | JWT (JSON Web Tokens) | Authentification stateless |
| Emails | PHPMailer + SMTP | Notifications transactionnelles |
| Upload fichiers | PHP move_uploaded_file | Images produits |
| Hébergement | VPS ou shared hosting cPanel | Déploiement |

### 3.2 Architecture MVC PHP

Le backend PHP suit une architecture MVC stricte :

- **Models** — Classes PHP représentant les entités (User, Product, Order…) avec méthodes CRUD
- **Controllers** — Gestion des requêtes HTTP, validation, appel des services
- **Services** — Logique métier (calcul prix, gestion stock, envoi email)
- **Middlewares** — Authentification JWT, rate limiting, CORS
- **Routers** — Mapping URL → Controller::method

### 3.3 Structure des répertoires

**Frontend (React)**
```
/src/pages/        — pages de l'application
/src/components/   — composants UI réutilisables
/src/store/        — Redux / Zustand
/src/api/          — appels Axios
/src/hooks/        — hooks custom
/src/assets/       — images, fonts
```

**Backend (PHP)**
```
/app/Controllers/  — logique HTTP
/app/Models/       — entités BDD
/app/Services/     — logique métier
/app/Middlewares/  — auth, CORS
/routes/           — définition des routes
/public/           — index.php, uploads
```

---

## 4. Charte graphique & Design System

### 4.1 Philosophie design

Le design s'inspire directement de us.puma.com : **minimaliste, aéré, axé sur le produit**. Aucun élément superflu. Le blanc domine, les typographies sont nettes, les CTA sont directs.

### 4.2 Palette de couleurs

| Rôle | Couleur | Usage |
|---|---|---|
| Primaire | `#000000` noir | CTA principaux, textes forts, navbar |
| Secondaire | `#FFFFFF` blanc | Fond principal, cartes produits |
| Accent | `#E0E0E0` gris clair | Bordures, fonds de sections |
| Texte principal | `#1A1A1A` | Corps de texte, descriptions |
| Texte secondaire | `#757575` | Labels, métadonnées, prix barrés |
| Erreur | `#D32F2F` | Messages d'erreur, stock épuisé |
| Succès | `#388E3C` | Confirmations, livré, en stock |
| Warning | `#F57C00` | Alertes, stock faible, promo |

### 4.3 Typographie

| Élément | Police | Taille / Poids |
|---|---|---|
| Titres H1 | Inter ou Helvetica Neue | 32–48px / Bold 700 |
| Titres H2 | Inter ou Helvetica Neue | 24–28px / SemiBold 600 |
| Titres H3 | Inter ou Helvetica Neue | 18–20px / Medium 500 |
| Corps de texte | Inter ou Helvetica Neue | 14–16px / Regular 400 |
| Prix | Inter ou Helvetica Neue | 18–22px / Bold 700 |
| Labels / Tags | Inter ou Helvetica Neue | 11–13px / Medium 500, uppercase |
| CTA Buttons | Inter ou Helvetica Neue | 14px / Bold 700, uppercase, letter-spacing |

### 4.4 Composants UI réutilisables

- **ProductCard** — image, nom, prix, badge promo, hover effect
- **Button** — variantes : Primary (noir plein), Secondary (outline), Ghost
- **Input / Select / Checkbox** — style épuré, focus ring discret
- **Badge** — NEW, SALE, OUT OF STOCK
- **Breadcrumb** — navigation contextuelle
- **Modal / Drawer** — overlay minimal
- **Toast notifications** — en bas à droite, auto-dismiss 3s
- **DataTable** — utilisé dans les espaces Admin / Super Admin
- **Pagination** — simple, numérotée
- **Skeleton Loading** — placeholders pendant le chargement

---

## 5. Structure des rôles et espaces

### 5.1 Matrice des permissions

| Fonctionnalité | Visiteur | Client | Admin | Super Admin |
|---|:---:|:---:|:---:|:---:|
| Voir les produits | ✅ | ✅ | ✅ | ✅ |
| Ajouter au panier | ✅* | ✅ | — | — |
| Passer une commande | ❌ | ✅ | — | — |
| Gérer son profil | ❌ | ✅ | ✅ | ✅ |
| Voir ses commandes | ❌ | ✅ | ✅ | ✅ |
| Gérer les produits | ❌ | ❌ | ✅ | ✅ |
| Gérer les commandes | ❌ | ❌ | ✅ | ✅ |
| Gérer les clients | ❌ | ❌ | ✅ | ✅ |
| Statistiques boutique | ❌ | ❌ | ✅ | ✅ |
| Gérer les boutiques | ❌ | ❌ | ❌ | ✅ |
| Gérer les abonnements | ❌ | ❌ | ❌ | ✅ |
| Accès à toutes les données | ❌ | ❌ | ❌ | ✅ |

> *Le visiteur peut ajouter au panier mais devra se connecter pour valider la commande.

### 5.2 Système d'authentification

- JWT — Access Token 1h, Refresh Token 7 jours
- Middleware PHP vérifie le token sur chaque route protégée
- Rôle encodé dans le payload JWT : `role: 'client' | 'admin' | 'superadmin'`
- React Router protège les routes côté frontend selon le rôle
- Token stocké dans `localStorage` ou cookie `httpOnly`

---

## 6. Espace Client — Pages et fonctionnalités

### 6.1 Pages publiques

#### Page d'accueil `/`
- Hero section : image plein écran, slogan, bouton CTA
- Section Nouveautés : grille de 4 produits récents
- Section Catégories vedettes : icônes + nom cliquable
- Section Promotions : bannière promo si active
- Section Bestsellers : 4–8 produits les plus vendus
- Footer : liens utiles, réseaux sociaux, newsletter

#### Page Catalogue `/products`
- Grille de produits responsive (2–3–4 colonnes selon écran)
- Sidebar filtres : catégorie, prix (range slider), taille, couleur, marque
- Tri : Nouveautés, Prix croissant, Prix décroissant, Popularité
- Barre de recherche en temps réel (debounce 300ms)
- Pagination ou infinite scroll
- Filtres actifs affichés sous forme de tags supprimables

#### Page Produit `/products/:id`
- Galerie photos : image principale + miniatures (zoom au survol)
- Nom produit, SKU, prix (et prix barré si promo)
- Sélecteur de variantes : taille, couleur (grille cliquable)
- Stock disponible affiché (En stock / Stock faible / Épuisé)
- Description longue avec onglets : Description / Détails / Livraison
- Bouton Ajouter au panier + sélecteur quantité
- Section Produits similaires (4 produits)
- Breadcrumb de navigation

#### Page Recherche `/search?q=...`
- Résultats en temps réel pendant la frappe
- Affichage : produits correspondants + suggestion de catégories
- Message si aucun résultat trouvé

#### Pages statiques
- À propos `/about`
- Contact `/contact` avec formulaire
- Politique de confidentialité `/privacy`
- Conditions d'utilisation `/terms`
- FAQ `/faq`

### 6.2 Pages authentification

#### Inscription `/register`
- Champs : prénom, nom, email, mot de passe, confirmation
- Validation côté client (React Hook Form + Yup) et côté serveur (PHP)
- Email de confirmation envoyé après inscription

#### Connexion `/login`
- Champs : email, mot de passe
- Option "Se souvenir de moi" (30 jours)
- Lien "Mot de passe oublié"
- Redirection automatique après connexion

#### Récupération mot de passe `/forgot-password`
- Saisie de l'email → envoi d'un lien de réinitialisation (expire en 1h)
- Page de réinitialisation `/reset-password?token=...`

### 6.3 Pages espace client (protégées)

#### Tableau de bord `/account`
- Résumé : dernière commande, adresses enregistrées
- Navigation latérale vers les sous-sections

#### Mes commandes `/account/orders`
- Liste avec : numéro, date, total, statut (badge coloré)
- Filtre par statut et période
- **Détail commande** `/account/orders/:id`
  - Récapitulatif produits, adresse livraison, mode paiement, timeline statut
  - Bouton "Suivre la livraison" (lien tracking externe)
  - Bouton "Retour/Échange" si statut = livré

#### Mon profil `/account/profile`
- Modification : prénom, nom, email, téléphone, date de naissance
- Upload photo de profil
- Changement de mot de passe

#### Mes adresses `/account/addresses`
- Ajouter, modifier, supprimer une adresse
- Définir une adresse par défaut

#### Mes favoris `/account/wishlist`
- Produits mis en favoris
- Ajouter au panier depuis la wishlist

#### Panier `/cart`
- Liste des produits avec image, nom, variante, quantité, prix
- Modification quantité (+/-) et suppression
- Champ code promo avec application en temps réel
- Récapitulatif : sous-total, livraison, réduction, total TTC

#### Checkout `/checkout`
- **Étape 1** — Adresse : sélection ou saisie nouvelle
- **Étape 2** — Livraison : Standard, Express, Point relais
- **Étape 3** — Paiement : carte bancaire, PayPal, paiement à la livraison
- **Étape 4** — Confirmation : récapitulatif avant validation
- Page confirmation `/order-success/:id` avec numéro de commande

---

## 7. Espace Admin — Pages et fonctionnalités

> Accessible via `/admin` · Protégé par le rôle `admin` · Layout sidebar + contenu principal

### 7.1 Tableau de bord `/admin/dashboard`

- KPIs en temps réel : CA (jour/semaine/mois), commandes, nouveaux clients
- Graphique CA sur les 30 derniers jours (Line Chart)
- Graphique Ventes par catégorie (Pie ou Bar Chart)
- Liste des 5 dernières commandes
- Alertes stock faible (produits < seuil paramétrable)
- Indicateur abonnement actif (type + date d'expiration)

### 7.2 Gestion des produits `/admin/products`

**Liste des produits**
- Tableau paginé : image, nom, SKU, catégorie, prix, stock, statut
- Recherche et filtres (catégorie, statut, fourchette de prix)
- Actions rapides : activer/désactiver, dupliquer, supprimer

**Formulaire produit (création / modification)**
- Informations : nom, slug (auto-généré), description courte, description longue (éditeur riche)
- Prix : prix de vente, prix comparatif (barré), coût d'achat
- Stock : quantité, seuil d'alerte, statut
- Catégorie et sous-catégorie (select avec recherche)
- Images : upload multiple, réorganisation drag & drop, image principale
- Variantes : combinaisons taille/couleur avec prix et stock individuels
- SEO : meta title, meta description, URL canonique
- Visibilité : actif, brouillon, archivé

**Gestion des catégories `/admin/categories`**
- Arborescence catégorie parent > sous-catégories
- CRUD complet : nom, slug, image, description, ordre d'affichage

### 7.3 Gestion des commandes `/admin/orders`

**Liste des commandes**
- Tableau : N° commande, date, client, total, statut, mode paiement
- Filtres : statut, date, montant min/max
- Export CSV des commandes filtrées

**Détail commande `/admin/orders/:id`**
- Informations client et adresse de livraison
- Timeline du statut de la commande
- Changement de statut : `En attente → Confirmé → En préparation → Expédié → Livré → Annulé`
- Saisie du numéro de suivi transporteur
- Ajout de notes internes (non visibles du client)
- Remboursement partiel ou total

### 7.4 Gestion des clients `/admin/customers`

- Tableau paginé : nom, email, date d'inscription, nombre de commandes, total dépensé
- Fiche client `/admin/customers/:id` : profil, historique commandes, adresses
- Activer / désactiver un compte client

### 7.5 Promotions et codes promo `/admin/promotions`

| Type | Description | Exemple |
|---|---|---|
| Réduction % | Réduction en pourcentage | -20% sur toute la boutique |
| Réduction fixe | Montant fixe déduit | -10€ sur commande > 50€ |
| Livraison gratuite | Offre la livraison | `FREESHIP50` |
| Produit offert | Ajoute un produit gratuit | 1 acheté = 1 offert |

- Création : code, type, valeur, usage max, date début/fin, montant minimum
- Statistiques d'utilisation par code
- Gestion des soldes / ventes flash

### 7.6 Paramètres de la boutique `/admin/settings`

- Informations boutique : nom, logo, description, coordonnées
- Modes de livraison : nom, prix, délai estimé, zones géographiques
- Modes de paiement : activer/désactiver
- Paramètres taxes : taux TVA par catégorie
- Emails automatiques : personnalisation des templates
- Intégrations : clés API paiement, SMTP

### 7.7 Avis clients `/admin/reviews`

- Liste des avis avec note, commentaire, produit, client, date
- Modération : approuver, rejeter, répondre
- Filtre par note et statut de modération

---

## 8. Espace Super Admin — Pages et fonctionnalités

> Accessible via `/superadmin` · Réservé uniquement au propriétaire de la plateforme

### 8.1 Tableau de bord `/superadmin/dashboard`

- KPIs globaux : boutiques totales, actives, revenus abonnements (mois/an)
- Graphique nouveaux abonnements sur 12 mois
- Graphique répartition par plan (Gratuit / Pro / Enterprise)
- Alertes : abonnements expirant dans les 7 jours, paiements en attente

### 8.2 Gestion des boutiques `/superadmin/shops`

- Tableau : nom boutique, admin, plan actif, date création, date expiration, statut
- Filtres : plan, statut (actif / suspendu / expiré), date
- Actions : suspendre, réactiver, supprimer une boutique
- **Vue détaillée** `/superadmin/shops/:id`
  - Informations boutique et admin
  - Historique abonnements et paiements
  - Statistiques : produits, commandes, CA
  - Journal d'activité (logs)

### 8.3 Gestion des abonnements `/superadmin/subscriptions`

**Plans disponibles**

| Plan | Mensuel | Annuel | Produits max | Admins | Support |
|---|---|---|---|---|---|
| Gratuit (Free) | 0 € | 0 € | 10 | 1 | Email uniquement |
| Starter | 19,99 € | 199,99 € | 100 | 2 | Email + Chat |
| Pro | 49,99 € | 499,99 € | 1 000 | 5 | Prioritaire |
| Enterprise | Sur devis | Sur devis | Illimité | Illimité | Dédié 24/7 |

**Gestion des plans `/superadmin/plans`**
- Créer, modifier, désactiver un plan
- Paramétrage des limites (produits, admins, stockage, fonctionnalités)

**Liste des abonnements**
- Tableau : boutique, plan, date début, date fin, statut, montant
- Renouvellement manuel
- Ajout d'un crédit ou d'une extension gratuite
- Export CSV de la facturation

### 8.4 Gestion globale des utilisateurs `/superadmin/users`

- Tous les utilisateurs (clients + admins)
- Recherche par email / nom / rôle
- Modifier le rôle d'un utilisateur
- Réinitialiser le mot de passe manuellement
- Bannir / débannir un compte

### 8.5 Paramètres de la plateforme `/superadmin/settings`

- Informations plateforme : nom, logo, domaine
- Configuration SMTP globale
- Passerelles de paiement : clés API Stripe, PayPal
- Maintenance : activer/désactiver le mode maintenance
- Logs système : erreurs PHP, requêtes lentes
- Sauvegarde BDD : export SQL manuel ou planifié

---

## 9. Système d'abonnements

### 9.1 Cycle de vie d'un abonnement

| Étape | Action | Déclencheur |
|---|---|---|
| 1. Inscription | Création boutique + plan Free activé | Admin crée son compte |
| 2. Upgrade | Admin choisit un plan payant | Formulaire d'abonnement |
| 3. Paiement | Paiement par carte ou PayPal | Stripe Checkout |
| 4. Activation | Super Admin valide ou auto-activation | Webhook paiement |
| 5. Rappel | Email J-7 avant expiration | CRON PHP quotidien |
| 6. Renouvellement | Auto-renew ou manuel | Stripe Subscription |
| 7. Expiration | Dégradation vers Free | CRON PHP quotidien |
| 8. Annulation | Accès maintenu jusqu'à fin de période | Demande admin |

### 9.2 Limitations par plan

- **Produits max** — blocage de la création si dépassement
- **Admins max** — blocage des invitations si dépassement
- **Fonctionnalités premium** — codes promo, exports CSV, stats avancées
- **Bannière d'upgrade** affichée quand la limite est atteinte à 80%

### 9.3 Facturation

- Factures PDF générées automatiquement après chaque paiement
- Envoi automatique par email à l'admin
- Historique accessible dans l'espace Admin et Super Admin

---

## 10. Catalogue produits

### 10.1 Structure d'un produit

| Champ | Type | Description |
|---|---|---|
| `id` | INT AUTO_INCREMENT | Identifiant unique |
| `shop_id` | INT FK | Boutique propriétaire |
| `name` | VARCHAR(255) | Nom du produit |
| `slug` | VARCHAR(255) UNIQUE | URL friendly |
| `description_short` | VARCHAR(500) | Accroche courte |
| `description_long` | TEXT | Description complète HTML |
| `price` | DECIMAL(10,2) | Prix de vente TTC |
| `compare_price` | DECIMAL(10,2) NULL | Prix barré |
| `cost_price` | DECIMAL(10,2) NULL | Coût d'achat |
| `sku` | VARCHAR(100) | Référence produit |
| `stock` | INT | Quantité disponible |
| `stock_alert` | INT DEFAULT 5 | Seuil d'alerte |
| `category_id` | INT FK | Catégorie |
| `status` | ENUM(active, draft, archived) | Visibilité |
| `is_featured` | TINYINT | Mis en avant |
| `created_at` | TIMESTAMP | Date de création |

### 10.2 Variantes produit

Un produit peut avoir plusieurs variantes (ex: Taille S/Bleu, Taille M/Rouge). Chaque variante possède son propre prix et stock.

### 10.3 Images produit

- Stockage : `/uploads/products/{product_id}/`
- Formats acceptés : JPEG, PNG, WebP — max 5 MB
- Redimensionnement auto : 800×800 principale, 200×200 miniature
- Maximum 10 images par produit

---

## 11. Panier et Checkout

### 11.1 Gestion du panier

- Panier stocké en `localStorage` pour les visiteurs (synchronisé après connexion)
- Panier persisté en base de données pour les clients connectés
- Vérification stock en temps réel à l'ajout et au checkout
- Maximum 99 unités par produit/variante

### 11.2 Processus de commande

| Étape | Actions | Validations |
|---|---|---|
| 1 — Panier | Révision des articles, code promo | Stock disponible, code promo valide |
| 2 — Adresse | Sélection ou saisie adresse | Champs obligatoires complets |
| 3 — Livraison | Choix du mode de livraison | Mode disponible pour la zone |
| 4 — Paiement | Saisie données paiement | Carte valide, fonds suffisants |
| 5 — Confirmation | Récapitulatif et validation | Double confirmation |

### 11.3 Calcul du total

```
Sous-total  = Σ (prix × quantité) par article
Réduction   = valeur du code promo appliqué
Livraison   = selon le mode choisi et la zone
TVA         = taux défini par catégorie de produit
Total TTC   = sous-total - réduction + livraison
```

---

## 12. Gestion des commandes

### 12.1 Cycle de vie d'une commande

| Statut | Couleur | Description | Actions possibles |
|---|---|---|---|
| `pending` | Gris | En attente de confirmation | Confirmer, Annuler |
| `confirmed` | Bleu | Commande confirmée | Préparer |
| `processing` | Orange | En préparation | Expédier |
| `shipped` | Violet | Expédiée | Saisir N° tracking |
| `delivered` | Vert | Livrée | Clôturer |
| `cancelled` | Rouge | Annulée | Rembourser |
| `refunded` | Rose | Remboursée | Archiver |

### 12.2 Gestion des retours

- Client initie un retour depuis son compte (délai max configurable)
- Admin valide ou refuse la demande
- Remboursement déclenché si retour validé
- Réintégration du stock si produit retourné en bon état

---

## 13. Système de paiement

### 13.1 Moyens de paiement supportés

| Moyen | Intégration | MVP |
|---|---|---|
| Carte bancaire (Visa / Mastercard) | Stripe Checkout | ✅ |
| PayPal | PayPal SDK | ✅ |
| Paiement à la livraison | Interne | ✅ |
| Virement bancaire | Manuel | ✅ |
| Mobile Money (Airtel, Orange) | API locale | 🔮 V2 |
| Crypto | Intégration tierce | 🔮 V3 |

### 13.2 Sécurité des paiements

- Aucune donnée bancaire stockée sur le serveur
- Tokenisation via Stripe (PCI-DSS compliance)
- HTTPS obligatoire sur toutes les pages de paiement
- Validation webhook Stripe (signature HMAC)
- Logs de toutes les transactions pour audit

---

## 14. Notifications et emails

| Événement | Destinataire | Canal |
|---|---|---|
| Inscription réussie | Client | Email de bienvenue |
| Commande confirmée | Client + Admin | Email récapitulatif |
| Statut commande mis à jour | Client | Email de mise à jour |
| Commande expédiée | Client | Email + N° tracking |
| Mot de passe réinitialisé | Client | Email avec lien |
| Paiement accepté | Client + Admin | Email confirmation paiement |
| Abonnement expirant | Admin | Email J-7 et J-1 |
| Abonnement expiré | Admin | Email avec lien renouvellement |
| Stock faible | Admin | Email d'alerte |
| Nouvel avis client | Admin | Notification email |

### 14.1 Templates email

- Templates HTML responsives (compatible Gmail, Outlook, mobile)
- Variables dynamiques : `{client_name}`, `{order_id}`, `{order_total}`
- Personnalisation : logo boutique, couleurs de la marque
- Footer avec lien désabonnement (conforme RGPD)

---

## 15. Sécurité

### 15.1 Authentification et autorisation

- JWT avec expiration courte (Access Token 1h)
- Refresh Token sécurisé (`httpOnly` cookie)
- Hachage des mots de passe : `bcrypt` (cost factor 12)
- Rate limiting : 5 tentatives de connexion / 15 min
- Middleware de vérification du rôle sur chaque endpoint protégé

### 15.2 Protection des données

- Requêtes SQL préparées (PDO prepared statements) — anti SQL Injection
- Validation et sanitisation de toutes les entrées utilisateur
- Protection CSRF via token synchronizer
- Headers de sécurité HTTP : `X-Frame-Options`, `X-XSS-Protection`, `Content-Security-Policy`
- HTTPS obligatoire (SSL/TLS)

### 15.3 Gestion des fichiers

- Validation du type MIME côté serveur (pas seulement l'extension)
- Renommage des fichiers uploadés (UUID + timestamp)
- Répertoire uploads protégé par `.htaccess`
- Taille max configurable (défaut : 5 MB par image)

### 15.4 RGPD

- Politique de confidentialité accessible et claire
- Consentement cookies au premier accès
- Droit d'accès et de suppression des données
- Export des données personnelles sur demande

---

## 16. API REST — Endpoints

### 16.1 Authentification

| Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Inscription client | Public |
| POST | `/api/auth/login` | Connexion | Public |
| POST | `/api/auth/logout` | Déconnexion | JWT |
| POST | `/api/auth/refresh` | Renouveler le token | Refresh Token |
| POST | `/api/auth/forgot-password` | Envoyer email reset | Public |
| POST | `/api/auth/reset-password` | Réinitialiser MDP | Token email |

### 16.2 Produits

| Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/products` | Liste produits (filtres, tri, pagination) | Public |
| GET | `/api/products/:id` | Détail produit | Public |
| GET | `/api/products/search?q=...` | Recherche plein texte | Public |
| POST | `/api/products` | Créer un produit | Admin |
| PUT | `/api/products/:id` | Modifier un produit | Admin |
| DELETE | `/api/products/:id` | Supprimer un produit | Admin |
| POST | `/api/products/:id/images` | Upload images | Admin |

### 16.3 Commandes

| Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/orders` | Liste commandes (admin: toutes, client: les siennes) | JWT |
| GET | `/api/orders/:id` | Détail commande | JWT |
| POST | `/api/orders` | Créer une commande | Client JWT |
| PATCH | `/api/orders/:id/status` | Changer le statut | Admin |
| POST | `/api/orders/:id/cancel` | Annuler une commande | Client / Admin |

### 16.4 Catégories

| Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/categories` | Liste des catégories | Public |
| POST | `/api/categories` | Créer une catégorie | Admin |
| PUT | `/api/categories/:id` | Modifier une catégorie | Admin |
| DELETE | `/api/categories/:id` | Supprimer une catégorie | Admin |

### 16.5 Panier

| Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/cart` | Récupérer le panier | JWT |
| POST | `/api/cart/items` | Ajouter un article | JWT |
| PATCH | `/api/cart/items/:id` | Modifier la quantité | JWT |
| DELETE | `/api/cart/items/:id` | Supprimer un article | JWT |
| POST | `/api/cart/coupon` | Appliquer un code promo | JWT |

### 16.6 Super Admin

| Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/superadmin/shops` | Liste toutes les boutiques | SuperAdmin |
| POST | `/api/superadmin/shops` | Créer une boutique | SuperAdmin |
| PATCH | `/api/superadmin/shops/:id/status` | Suspendre / réactiver | SuperAdmin |
| GET | `/api/superadmin/subscriptions` | Liste abonnements | SuperAdmin |
| POST | `/api/superadmin/subscriptions` | Créer un abonnement | SuperAdmin |
| PATCH | `/api/superadmin/subscriptions/:id` | Modifier un abonnement | SuperAdmin |
| GET | `/api/superadmin/users` | Liste tous les utilisateurs | SuperAdmin |
| PATCH | `/api/superadmin/users/:id/role` | Changer le rôle | SuperAdmin |

---

## 17. Base de données — Schéma

### 17.1 Tables principales

| Table | Colonnes clés | Description |
|---|---|---|
| `users` | id, shop_id, name, email, password_hash, role, status, created_at | Tous les utilisateurs |
| `shops` | id, name, slug, logo, owner_id, plan_id, status, created_at | Boutiques |
| `plans` | id, name, price_monthly, price_yearly, max_products, max_admins, features_json | Plans abonnement |
| `subscriptions` | id, shop_id, plan_id, starts_at, ends_at, status, payment_method | Abonnements actifs |
| `products` | id, shop_id, category_id, name, slug, price, stock, status, created_at | Produits |
| `product_variants` | id, product_id, size, color, price, stock, sku | Variantes |
| `product_images` | id, product_id, url, is_main, sort_order | Images |
| `categories` | id, shop_id, parent_id, name, slug, image_url | Catégories |
| `orders` | id, shop_id, user_id, status, total, shipping_address_id, coupon_id | Commandes |
| `order_items` | id, order_id, product_id, variant_id, qty, unit_price | Lignes commande |
| `addresses` | id, user_id, name, street, city, country, phone, is_default | Adresses |
| `coupons` | id, shop_id, code, type, value, min_order, max_uses, uses_count, expires_at | Codes promo |
| `payments` | id, order_id, method, amount, status, transaction_id, created_at | Paiements |
| `reviews` | id, product_id, user_id, rating, comment, status, created_at | Avis clients |
| `wishlists` | id, user_id, product_id, created_at | Favoris |
| `invoices` | id, subscription_id, amount, pdf_url, paid_at, created_at | Factures |
| `notifications` | id, user_id, type, message, is_read, created_at | Notifications |

### 17.2 Relations clés

- `users` ←→ `shops` : un admin appartient à une boutique (`shop_id`)
- `shops` ←→ `plans` : via la table `subscriptions`
- `products` ←→ `shops` : chaque produit appartient à une boutique
- `orders` ←→ `users` + `shops` : commande d'un client dans une boutique
- `order_items` ←→ `orders` + `products` + `product_variants`

### 17.3 Exemple SQL — Table `orders`

```sql
CREATE TABLE orders (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  shop_id         INT NOT NULL,
  user_id         INT NOT NULL,
  status          ENUM('pending','confirmed','processing','shipped','delivered','cancelled','refunded') DEFAULT 'pending',
  subtotal        DECIMAL(10,2) NOT NULL,
  discount        DECIMAL(10,2) DEFAULT 0,
  shipping_fee    DECIMAL(10,2) DEFAULT 0,
  total           DECIMAL(10,2) NOT NULL,
  coupon_id       INT NULL,
  shipping_address_id INT NOT NULL,
  payment_method  VARCHAR(50),
  tracking_number VARCHAR(100) NULL,
  notes           TEXT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id)   REFERENCES shops(id),
  FOREIGN KEY (user_id)   REFERENCES users(id),
  FOREIGN KEY (coupon_id) REFERENCES coupons(id)
);
```

---

## 18. Déploiement et hébergement

### 18.1 Environnements

| Environnement | Usage | Accès |
|---|---|---|
| Local (dev) | Développement quotidien | localhost |
| Staging | Tests avant mise en prod | staging.monsite.com |
| Production | Utilisateurs finaux | monsite.com |

### 18.2 Infrastructure recommandée

| Composant | Option recommandée | Coût estimé |
|---|---|---|
| Hébergement PHP + MySQL | VPS OVH 2 vCPU / 4 GB RAM ou cPanel | ~10–25 €/mois |
| CDN images | Cloudinary (plan Free) | 0 € (jusqu'à 25 GB) |
| Emails transactionnels | Brevo (ex-Sendinblue) ou Mailgun | 0–25 €/mois |
| Domaine | OVH ou Namecheap | ~10–15 €/an |
| SSL | Let's Encrypt (automatique) | Gratuit |
| Backup BDD | Cron job export SQL vers stockage externe | ~2–5 €/mois |

### 18.3 CI/CD

- Git pour versioning (GitHub ou GitLab)
- Déploiement manuel via SSH ou FTP pour le MVP
- Script `deploy.sh` pour automatiser build React + upload
- Variables d'environnement dans `.env` (non committé en Git)

---

## 19. Planning et phases

| Phase | Durée | Contenu |
|---|---|---|
| Phase 1 — Setup | Semaine 1 | Init React + Vite, architecture PHP MVC, BDD MySQL, auth JWT |
| Phase 2 — Catalogue | Semaines 2–3 | Produits (CRUD), catégories, images, filtres, recherche |
| Phase 3 — Espace Client | Semaines 4–5 | Inscription, connexion, profil, adresses, wishlist |
| Phase 4 — Panier & Commandes | Semaines 6–7 | Panier, checkout, gestion commandes, emails |
| Phase 5 — Paiement | Semaine 8 | Stripe, PayPal, paiement livraison, webhooks |
| Phase 6 — Espace Admin | Semaines 9–11 | Dashboard, produits, commandes, clients, promotions, stats |
| Phase 7 — Super Admin | Semaines 12–13 | Gestion boutiques, plans, abonnements, facturation |
| Phase 8 — QA & Sécurité | Semaine 14 | Tests, sécurité, audit performances, responsive |
| Phase 9 — Déploiement | Semaine 15 | Mise en production, docs, formation |

**Durée totale estimée : ~15 semaines (3,5 mois)**  
**Équipe minimale : 1 dev fullstack ou 1 frontend + 1 backend**

---

## 20. Glossaire

| Terme | Définition |
|---|---|
| SPA | Single Page Application — application web chargée une seule fois, navigation sans rechargement |
| JWT | JSON Web Token — token signé pour l'authentification stateless |
| MVC | Model-View-Controller — pattern d'architecture logicielle |
| REST | REpresentational State Transfer — style d'API utilisant les méthodes HTTP |
| CRUD | Create, Read, Update, Delete — opérations de base sur les données |
| SKU | Stock Keeping Unit — référence unique d'un produit ou d'une variante |
| Webhook | URL appelée automatiquement par un service externe lors d'un événement (ex: paiement) |
| MVP | Minimum Viable Product — version minimale fonctionnelle du produit |
| CRON | Tâche planifiée exécutée automatiquement à intervalles réguliers |
| PDO | PHP Data Objects — interface d'accès aux bases de données en PHP |
| bcrypt | Algorithme de hachage de mots de passe résistant aux attaques brute-force |
| RGPD | Règlement Général sur la Protection des Données (GDPR en anglais) |
| CDN | Content Delivery Network — réseau de distribution de contenu |
| CI/CD | Continuous Integration / Continuous Deployment — automatisation du déploiement |

---

*— Fin du cahier des charges — Version 1.0 — Juin 2026 —*