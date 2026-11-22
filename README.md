# A2SIL — Boutique de jeux vidéo

> Un site e-commerce complet dédié aux jeux vidéo, développé en PHP/MySQL avec un design gaming moderne.

## Fonctionnalités

| Module | Description |
|--------|-------------|
| **Accueil** | Jeux populaires, nouveautés, promotions et catégories |
| **Boutique** | Filtres, tri et pagination |
| **Fiche jeu** | Détails, avis et jeux similaires |
| **Panier** | Ajout d'articles, quantités et récapitulatif |
| **Compte** | Inscription, connexion et déconnexion |
| **Recherche** | Recherche par titre, description ou éditeur |
| **Administration** | Statistiques, catalogue, commandes et utilisateurs |

## Base de données

```
users        → Clients et administrateurs
games        → Catalogue de jeux (produits)
categories   → Genres (Action, RPG, FPS, Sport...)
platforms    → Plateformes (PS5, Xbox, PC, Switch...)
cart         → Panier (session ou compte)
orders       → Commandes
order_items  → Détails des commandes
reviews      → Avis et notes des joueurs
```

## 📁 Structure du projet

```
game-store/
├── api/                    ← API REST JSON (pour le frontend React)
│   ├── auth.php            ← Connexion, inscription, profil
│   ├── cart.php            ← Gestion du panier (CRUD)
│   ├── categories.php      ← Liste des catégories & stats
│   ├── cors.php            ← Headers CORS & session
│   ├── games.php           ← Recherche, filtres, détails
│   ├── orders.php          ← Création et historique commandes
│   └── platforms.php       ← Plateformes (PS5, Xbox, PC...)
├── frontend/               ← Application Frontend React + Vite
│   ├── src/
│   │   ├── components/     ← Navbar, Footer, GameCard, CartDrawer, AuthModal...
│   │   ├── context/        ← CartContext & AuthContext
│   │   ├── pages/          ← HomePage, ShopPage, GameDetailPage, OrdersPage
│   │   ├── services/       ← Client API type-safe
│   │   └── types/          ← Définitions TypeScript
│   ├── package.json
│   └── vite.config.js
├── config.php              ← Configuration DB + fonctions PHP
├── database.sql            ← Schéma + données de démo
├── index.php               ← Page d'accueil classique PHP
├── includes/               ← Header & Footer classiques PHP
├── pages/                  ← Vues classiques PHP
├── admin/                  ← Panneau d'administration PHP
└── assets/                 ← Feuilles de style & images
```

## Lancement du Frontend React

Pour utiliser le frontend moderne en React :

```bash
cd c:\xampp\htdocs\game-store\frontend
npm run dev
```

Puis ouvrez votre navigateur sur : **http://localhost:5173**  
*(Assurez-vous qu'Apache et MySQL sont démarrés dans le panneau XAMPP)*

## Installation

### Prérequis
- PHP 7.4+
- MySQL 5.7+ / MariaDB
- Serveur web (Apache/Nginx) — XAMPP, WAMP, Laragon...

### Étapes

1. **Copier le projet** dans votre dossier web :
   ```
   C:\xampp\htdocs\game-store\
   ```

2. **Créer la base de données** via phpMyAdmin ou MySQL CLI :
   ```sql
   mysql -u root -p < database.sql
   ```

3. **Créer et configurer la connexion** : copiez `config.example.php` vers `config.php`, puis adaptez les paramètres MySQL et l'URL du site :
   ```php
   define('DB_HOST', 'localhost');
   define('DB_USER', 'root');
   define('DB_PASS', '');         // Votre mot de passe MySQL
   define('DB_NAME', 'gamestore_db');
   define('SITE_URL', 'http://localhost/game-store');
   ```

   Pour une base déjà installée, importer aussi `database_update.sql` afin d'ajouter les nouveaux produits et le compte administrateur A2SIL.

4. **Accéder au site** :
   - Site : http://localhost/game-store
   - Administration : http://localhost/game-store/admin

5. **Compte administrateur** :
   - Email : `assil@admin.ma`
   - Mot de passe : `assil123`

## Produits inclus

| Jeu | Plateforme | Prix |
|-----|------------|------|
| Grand Theft Auto VI | PS5 | 750 DH (promotion) |
| Grand Theft Auto V | PS5 | 350 DH |
| EA SPORTS FC 27 | PS5 | 650 DH |
| Red Dead Redemption 2 | PS5 | 450 DH |
| Valorant Points | PC | 100 DH |
| V-Bucks Fortnite | PC | 100 DH |
| FC Coins | PS5 | 100 DH |

## 🔧 Extensions possibles

- [ ] Paiement Stripe / PayPal
- [ ] Envoi d'emails (confirmation commande)
- [ ] Upload d'images pour les jeux
- [ ] Wishlist (liste de souhaits)
- [ ] Codes promo / coupons
- [ ] Téléchargement de clés numériques
- [ ] API REST pour une app mobile
- [ ] Newsletter

## 🎨 Design

- **Thème** : Gaming sombre avec accents néon violet + cyan
- **Polices** : Orbitron (titres), Rajdhani (texte)
- **Responsive** : Mobile, tablette, desktop
- **Animations** : Hover effects, notifications toast, logo flottant

---
*Développé avec PHP 8+, MySQL, CSS3, JavaScript ES6*
