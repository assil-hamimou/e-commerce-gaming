<?php
require_once __DIR__ . '/../config.php';

// Compter les articles dans le panier
function getCartCount() {
    $db = getDB();
    if (isset($_SESSION['user_id'])) {
        $stmt = $db->prepare("SELECT SUM(quantity) FROM cart WHERE user_id = ?");
        $stmt->execute([$_SESSION['user_id']]);
    } else {
        $stmt = $db->prepare("SELECT SUM(quantity) FROM cart WHERE session_id = ?");
        $stmt->execute([session_id()]);
    }
    return (int)$stmt->fetchColumn();
}

$cartCount = getCartCount();
$currentPage = basename($_SERVER['PHP_SELF']);

function renderGameArtwork(array $game): string {
    $title = htmlspecialchars($game['title'] ?? 'Jeu', ENT_QUOTES, 'UTF-8');
    if (empty($game['image'])) {
        return '<div class="game-art-placeholder">' . $title . '</div>';
    }
    $image = $game['image'];
    $src = str_starts_with($image, 'http') ? $image : SITE_URL . '/assets/images/' . rawurlencode(basename($image));
    return '<img class="game-art-image" src="' . htmlspecialchars($src, ENT_QUOTES, 'UTF-8') . '" alt="' . $title . '" loading="lazy">';
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= isset($pageTitle) ? htmlspecialchars($pageTitle) . ' - ' : '' ?><?= SITE_NAME ?></title>
    <link rel="stylesheet" href="<?= SITE_URL ?>/assets/css/style.css">
</head>
<body>

<!-- Header Principal -->
<header class="site-header">
    <div class="header-top">
        <div class="container">
            <div class="header-top-inner">
                <span class="promo-banner">Boutique A2SIL · Jeux et crédits numériques · Prix en DH</span>
                <div class="header-top-links">
                    <?php if (isset($_SESSION['user_id'])): ?>
                        <a href="<?= SITE_URL ?>/pages/account.php">Mon Compte</a>
                        <a href="<?= SITE_URL ?>/pages/logout.php">Déconnexion</a>
                    <?php else: ?>
                        <a href="<?= SITE_URL ?>/pages/login.php">Connexion</a>
                        <a href="<?= SITE_URL ?>/pages/register.php">Inscription</a>
                    <?php endif; ?>
                    <?php if (isset($_SESSION['role']) && $_SESSION['role'] === 'admin'): ?>
                        <a href="<?= SITE_URL ?>/admin/index.php" class="admin-link">Administration</a>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>

    <nav class="main-nav">
        <div class="container">
            <div class="nav-inner">
                <!-- Logo -->
                <a href="<?= SITE_URL ?>/index.php" class="logo">
                    <span class="logo-text">A2SIL</span>
                </a>

                <!-- Barre de recherche -->
                <form class="search-bar" action="<?= SITE_URL ?>/pages/search.php" method="GET">
                    <input type="text" name="q" placeholder="Rechercher un jeu, une plateforme..." 
                           value="<?= isset($_GET['q']) ? htmlspecialchars($_GET['q']) : '' ?>">
                    <button type="submit" aria-label="Rechercher">Rechercher</button>
                </form>

                <!-- Actions nav -->
                <div class="nav-actions">
                    <a href="<?= SITE_URL ?>/pages/wishlist.php" class="nav-btn" title="Liste de souhaits">Favoris</a>
                    <a href="<?= SITE_URL ?>/pages/cart.php" class="nav-btn cart-btn" title="Panier">
                        Panier
                        <?php if ($cartCount > 0): ?>
                            <span class="cart-badge"><?= $cartCount ?></span>
                        <?php endif; ?>
                    </a>
                </div>
            </div>

            <!-- Menu de navigation -->
            <ul class="nav-menu">
                <li><a href="<?= SITE_URL ?>/index.php" class="<?= $currentPage === 'index.php' ? 'active' : '' ?>">Accueil</a></li>
                <li class="has-dropdown">
                    <a href="<?= SITE_URL ?>/pages/shop.php">Boutique ▾</a>
                    <ul class="dropdown">
                        <li><a href="<?= SITE_URL ?>/pages/shop.php">Tous les jeux</a></li>
                        <li><a href="<?= SITE_URL ?>/pages/shop.php?filter=new">Nouveautés</a></li>
                        <li><a href="<?= SITE_URL ?>/pages/shop.php?filter=promo">Promotions</a></li>
                        <li><a href="<?= SITE_URL ?>/pages/shop.php?filter=featured">Jeux populaires</a></li>
                    </ul>
                </li>
                <li class="has-dropdown">
                    <a href="#">Plateformes ▾</a>
                    <ul class="dropdown">
                        <li><a href="<?= SITE_URL ?>/pages/shop.php?platform=1">PlayStation 5</a></li>
                        <li><a href="<?= SITE_URL ?>/pages/shop.php?platform=2">Xbox Series X</a></li>
                        <li><a href="<?= SITE_URL ?>/pages/shop.php?platform=3">PC</a></li>
                        <li><a href="<?= SITE_URL ?>/pages/shop.php?platform=4">Nintendo Switch</a></li>
                        <li><a href="<?= SITE_URL ?>/pages/shop.php?platform=5">PlayStation 4</a></li>
                    </ul>
                </li>
                <li class="has-dropdown">
                    <a href="#">Genres ▾</a>
                    <ul class="dropdown">
                        <li><a href="<?= SITE_URL ?>/pages/shop.php?category=1">Action</a></li>
                        <li><a href="<?= SITE_URL ?>/pages/shop.php?category=2">RPG</a></li>
                        <li><a href="<?= SITE_URL ?>/pages/shop.php?category=3">Sport</a></li>
                        <li><a href="<?= SITE_URL ?>/pages/shop.php?category=4">FPS</a></li>
                        <li><a href="<?= SITE_URL ?>/pages/shop.php?category=5">Stratégie</a></li>
                        <li><a href="<?= SITE_URL ?>/pages/shop.php?category=6">Course</a></li>
                    </ul>
                </li>
                <li><a href="<?= SITE_URL ?>/pages/deals.php">Promotions</a></li>
                <li><a href="<?= SITE_URL ?>/pages/contact.php">Contact</a></li>
            </ul>
        </div>
    </nav>
</header>
