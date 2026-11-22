<?php
require_once 'config.php';

$pageTitle = 'Accueil';
$db = getDB();

// Jeux en vedette
$featuredGames = $db->query("
    SELECT g.*, c.name as category_name, p.name as platform_name 
    FROM games g 
    LEFT JOIN categories c ON g.category_id = c.id 
    LEFT JOIN platforms p ON g.platform_id = p.id 
    WHERE g.is_featured = 1
    ORDER BY g.id DESC
    LIMIT 4
")->fetchAll();

// Nouveautés
$newGames = $db->query("
    SELECT g.*, c.name as category_name, p.name as platform_name 
    FROM games g 
    LEFT JOIN categories c ON g.category_id = c.id 
    LEFT JOIN platforms p ON g.platform_id = p.id 
    WHERE g.is_new = 1
    ORDER BY g.id DESC
    LIMIT 4
")->fetchAll();

// Toutes les catégories
$categories = $db->query("SELECT * FROM categories")->fetchAll();

// Jeux en promo
$promoGames = $db->query("
    SELECT g.*, c.name as category_name, p.name as platform_name 
    FROM games g 
    LEFT JOIN categories c ON g.category_id = c.id 
    LEFT JOIN platforms p ON g.platform_id = p.id 
    WHERE g.old_price IS NOT NULL
    ORDER BY g.id DESC
    LIMIT 4
")->fetchAll();

include 'includes/header.php';

?>

<!-- ===== HERO SECTION ===== -->
<section class="hero">
    <div class="hero-bg"></div>
    <div class="container">
        <div class="hero-grid">
            <div class="hero-content">
                <div class="hero-badge">Nouveaux jeux disponibles</div>
                <h1>Votre Univers<br>Gaming Commence<br><span style="color: var(--accent)">Ici</span></h1>
                <p>Découvrez les meilleurs jeux vidéo aux meilleurs prix. PS5, Xbox, PC, Switch — toutes les plateformes, tous les genres.</p>
                <div class="hero-actions">
                    <a href="pages/shop.php" class="btn btn-primary btn-lg">Explorer la boutique</a>
                    <a href="pages/shop.php?filter=new" class="btn btn-outline btn-lg">Nouveautés</a>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- ===== AVANTAGES ===== -->
<section class="section" style="padding: 40px 0;">
    <div class="container">
        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon">1</div>
                <h3>Choisissez vos articles</h3>
                <p>Parcourez les jeux et les crédits numériques disponibles.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">2</div>
                <h3>Prix en dirhams</h3>
                <p>Chaque prix et le total du panier sont affichés en DH.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">3</div>
                <h3>Commande claire</h3>
                <p>Vérifiez les articles et le montant avant de confirmer.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">4</div>
                <h3>Suivi de commande</h3>
                <p>Connectez-vous pour consulter le statut de vos commandes.</p>
            </div>
        </div>
    </div>
</section>

<!-- ===== CATÉGORIES ===== -->
<section class="section" style="padding: 40px 0;">
    <div class="container">
        <div class="section-header">
            <div>
                <h2 class="section-title">Genres <span>Populaires</span></h2>
                <div class="section-line"></div>
            </div>
        </div>
        <div class="categories-grid">
            <?php foreach ($categories as $cat): ?>
                <a href="pages/shop.php?category=<?= $cat['id'] ?>" class="category-card">
                    <div class="category-icon"><?= htmlspecialchars(mb_substr($cat['name'], 0, 1)) ?></div>
                    <div class="category-name"><?= htmlspecialchars($cat['name']) ?></div>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- ===== JEUX EN VEDETTE ===== -->
<?php if (!empty($featuredGames)): ?>
<section class="section">
    <div class="container">
        <div class="section-header">
            <div>
                <h2 class="section-title">Produits <span>populaires</span></h2>
                <div class="section-line"></div>
            </div>
            <a href="pages/shop.php?filter=featured" class="view-all">Voir tout →</a>
        </div>
        <div class="games-grid">
            <?php foreach ($featuredGames as $game): ?>
                <div class="game-card">
                    <div class="game-card-image">
                        <?php if (!empty($game['image']) && file_exists('assets/images/' . $game['image'])): ?>
                            <img src="<?= SITE_URL ?>/assets/images/<?= htmlspecialchars($game['image']) ?>" alt="<?= htmlspecialchars($game['title']) ?>">
                        <?php else: ?>
                        <?= renderGameArtwork($game) ?>
                        <?php endif; ?>
                        <div class="game-card-badges">
                            <?php if ($game['is_new']): ?><span class="badge badge-new">NEW</span><?php endif; ?>
                            <?php if ($game['old_price']): ?><span class="badge badge-promo">PROMO</span><?php endif; ?>
                            <?php if ($game['is_featured']): ?><span class="badge badge-featured"> TOP</span><?php endif; ?>
                        </div>
                        <div class="game-card-overlay">
                            <a href="pages/product.php?slug=<?= urlencode($game['slug']) ?>" class="btn btn-outline btn-sm">Détails</a>
                            <button onclick="addToCart(<?= $game['id'] ?>)" class="btn btn-primary btn-sm">Ajouter</button>
                        </div>
                    </div>
                    <div class="game-card-body">
                        <div class="game-platform"><?= htmlspecialchars($game['platform_name'] ?? '') ?></div>
                        <div class="game-title">
                            <a href="pages/product.php?slug=<?= urlencode($game['slug']) ?>"><?= htmlspecialchars($game['title']) ?></a>
                        </div>
                        <div class="game-price-row">
                            <div>
                                <div class="game-price"><?= number_format($game['price'], 2) ?><?= CURRENCY ?></div>
                                <?php if ($game['old_price']): ?>
                                    <div class="game-old-price"><?= number_format($game['old_price'], 2) ?><?= CURRENCY ?></div>
                                <?php endif; ?>
                            </div>
                            <button onclick="addToCart(<?= $game['id'] ?>)" class="btn-add-cart">+ Panier</button>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- ===== BANNIÈRE PROMO ===== -->
<div class="container">
    <div class="promo-section">
        <h2>Offres de la semaine</h2>
        <p>Jusqu'à <strong style="color: var(--accent2)">-50%</strong> sur une sélection de jeux cette semaine</p>
        <a href="pages/shop.php?filter=promo" class="btn btn-primary btn-lg">Voir les Promotions</a>
    </div>
</div>

<!-- ===== NOUVEAUTÉS ===== -->
<?php if (!empty($newGames)): ?>
<section class="section">
    <div class="container">
        <div class="section-header">
            <div>
                <h2 class="section-title"><span>Nouveautés</span></h2>
                <div class="section-line"></div>
            </div>
            <a href="pages/shop.php?filter=new" class="view-all">Voir tout →</a>
        </div>
        <div class="games-grid">
            <?php foreach ($newGames as $game): ?>
                <div class="game-card">
                    <div class="game-card-image">
                        <?= renderGameArtwork($game) ?>
                        <div class="game-card-badges">
                            <span class="badge badge-new">NEW</span>
                        </div>
                        <div class="game-card-overlay">
                            <a href="pages/product.php?slug=<?= urlencode($game['slug']) ?>" class="btn btn-outline btn-sm">Détails</a>
                            <button onclick="addToCart(<?= $game['id'] ?>)" class="btn btn-primary btn-sm">Ajouter</button>
                        </div>
                    </div>
                    <div class="game-card-body">
                        <div class="game-platform"><?= htmlspecialchars($game['platform_name'] ?? '') ?></div>
                        <div class="game-title">
                            <a href="pages/product.php?slug=<?= urlencode($game['slug']) ?>"><?= htmlspecialchars($game['title']) ?></a>
                        </div>
                        <div class="game-price-row">
                            <div class="game-price"><?= number_format($game['price'], 2) ?><?= CURRENCY ?></div>
                            <button onclick="addToCart(<?= $game['id'] ?>)" class="btn-add-cart">+ Panier</button>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<?php include 'includes/footer.php'; ?>
