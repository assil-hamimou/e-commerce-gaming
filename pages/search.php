<?php
require_once '../config.php';

$pageTitle = 'Recherche';
$db = getDB();
$query = trim($_GET['q'] ?? '');

$games = [];
if (!empty($query)) {
    $stmt = $db->prepare("
        SELECT g.*, c.name as category_name, p.name as platform_name 
        FROM games g 
        LEFT JOIN categories c ON g.category_id = c.id 
        LEFT JOIN platforms p ON g.platform_id = p.id 
        WHERE g.title LIKE ? OR g.description LIKE ? OR g.publisher LIKE ?
        ORDER BY g.is_featured DESC, g.title ASC
        LIMIT 50
    ");
    $q = "%$query%";
    $stmt->execute([$q, $q, $q]);
    $games = $stmt->fetchAll();
}

include '../includes/header.php';
?>

<div class="container" style="padding: 40px 0;">
    <h1 class="section-title" style="margin-bottom: 20px;">
         Résultats pour "<span><?= htmlspecialchars($query) ?></span>"
    </h1>

    <?php if (empty($query)): ?>
        <div style="text-align: center; padding: 60px; color: var(--text-muted);">
            <div style="font-size: 60px; margin-bottom: 20px;"></div>
            <p>Utilisez la barre de recherche pour trouver vos jeux.</p>
        </div>
    <?php elseif (empty($games)): ?>
        <div style="text-align: center; padding: 60px; color: var(--text-muted);">
            <div style="font-size: 60px; margin-bottom: 20px;"></div>
            <h3>Aucun résultat</h3>
            <p>Aucun jeu trouvé pour "<?= htmlspecialchars($query) ?>"</p>
            <a href="shop.php" class="btn btn-primary" style="margin-top: 20px;">Voir tous les jeux</a>
        </div>
    <?php else: ?>
        <p style="color: var(--text-muted); margin-bottom: 25px;"><?= count($games) ?> jeu(x) trouvé(s)</p>
        <div class="games-grid">
            <?php foreach ($games as $game): ?>
                <div class="game-card">
                    <div class="game-card-image">
                        <?= renderGameArtwork($game) ?>
                        <div class="game-card-badges">
                            <?php if ($game['is_new']): ?><span class="badge badge-new">NEW</span><?php endif; ?>
                            <?php if ($game['old_price']): ?><span class="badge badge-promo">PROMO</span><?php endif; ?>
                        </div>
                        <div class="game-card-overlay">
                            <a href="product.php?slug=<?= urlencode($game['slug']) ?>" class="btn btn-outline btn-sm">Détails</a>
                            <button onclick="addToCart(<?= $game['id'] ?>)" class="btn btn-primary btn-sm">Ajouter</button>
                        </div>
                    </div>
                    <div class="game-card-body">
                        <div class="game-platform"><?= htmlspecialchars($game['platform_name'] ?? '') ?></div>
                        <div class="game-title">
                            <a href="product.php?slug=<?= urlencode($game['slug']) ?>"><?= htmlspecialchars($game['title']) ?></a>
                        </div>
                        <div class="game-price-row">
                            <div class="game-price"><?= number_format($game['price'], 2) ?><?= CURRENCY ?></div>
                            <button onclick="addToCart(<?= $game['id'] ?>)" class="btn-add-cart">+ Panier</button>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>

<?php include '../includes/footer.php'; ?>
