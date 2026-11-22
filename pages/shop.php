<?php
require_once '../config.php';

$pageTitle = 'Boutique';
$db = getDB();

// Filtres
$where = ['1=1'];
$params = [];

if (!empty($_GET['category'])) {
    $where[] = 'g.category_id = ?';
    $params[] = (int)$_GET['category'];
}

if (!empty($_GET['platform'])) {
    $where[] = 'g.platform_id = ?';
    $params[] = (int)$_GET['platform'];
}

if (!empty($_GET['filter'])) {
    switch ($_GET['filter']) {
        case 'new': $where[] = 'g.is_new = 1'; break;
        case 'featured': $where[] = 'g.is_featured = 1'; break;
        case 'promo': $where[] = 'g.old_price IS NOT NULL'; break;
    }
}

if (!empty($_GET['min_price'])) {
    $where[] = 'g.price >= ?';
    $params[] = (float)$_GET['min_price'];
}
if (!empty($_GET['max_price'])) {
    $where[] = 'g.price <= ?';
    $params[] = (float)$_GET['max_price'];
}

// Tri
$sortOptions = [
    'popular' => 'g.is_featured DESC',
    'price_asc' => 'g.price ASC',
    'price_desc' => 'g.price DESC',
    'newest' => 'g.created_at DESC',
    'title' => 'g.title ASC',
];
$sort = $sortOptions[$_GET['sort'] ?? ''] ?? 'g.is_featured DESC, g.created_at DESC';

// Pagination
$page = max(1, (int)($_GET['page'] ?? 1));
$offset = ($page - 1) * ITEMS_PER_PAGE;

$whereSQL = implode(' AND ', $where);

// Total
$countStmt = $db->prepare("SELECT COUNT(*) FROM games g WHERE $whereSQL");
$countStmt->execute($params);
$totalGames = $countStmt->fetchColumn();
$totalPages = ceil($totalGames / ITEMS_PER_PAGE);

// Jeux
$stmt = $db->prepare("
    SELECT g.*, c.name as category_name, p.name as platform_name 
    FROM games g 
    LEFT JOIN categories c ON g.category_id = c.id 
    LEFT JOIN platforms p ON g.platform_id = p.id 
    WHERE $whereSQL
    ORDER BY $sort
    LIMIT " . ITEMS_PER_PAGE . " OFFSET $offset
");
$stmt->execute($params);
$games = $stmt->fetchAll();

// Données pour filtres
$categories = $db->query("SELECT * FROM categories")->fetchAll();
$platforms = $db->query("SELECT * FROM platforms")->fetchAll();


include '../includes/header.php';
?>

<div class="container">
    <div style="padding: 25px 0 10px;">
        <h1 class="section-title"> Boutique <span>Jeux Vidéo</span></h1>
        <p style="color: var(--text-muted); margin-top: 8px;"><?= $totalGames ?> jeux trouvés</p>
    </div>

    <div class="shop-layout">
        <!-- Filtres -->
        <aside class="filters-sidebar">
            <form method="GET" id="filter-form">
                <?php foreach ($_GET as $k => $v): if ($k !== 'page'): ?>
                    <input type="hidden" name="<?= htmlspecialchars($k) ?>" value="<?= htmlspecialchars($v) ?>">
                <?php endif; endforeach; ?>

                <div class="filter-group">
                    <h4> Plateformes</h4>
                    <?php foreach ($platforms as $plat): ?>
                        <label class="filter-option">
                            <input type="radio" name="platform" value="<?= $plat['id'] ?>" 
                                   <?= (isset($_GET['platform']) && $_GET['platform'] == $plat['id']) ? 'checked' : '' ?>
                                   onchange="document.getElementById('filter-form').submit()">
                            <?= htmlspecialchars($plat['name']) ?>
                        </label>
                    <?php endforeach; ?>
                    <?php if (!empty($_GET['platform'])): ?>
                        <a href="?" style="font-size: 12px; color: var(--danger);">✕ Effacer</a>
                    <?php endif; ?>
                </div>

                <div class="filter-group">
                    <h4> Genre</h4>
                    <?php foreach ($categories as $cat): ?>
                        <label class="filter-option">
                            <input type="radio" name="category" value="<?= $cat['id'] ?>"
                                   <?= (isset($_GET['category']) && $_GET['category'] == $cat['id']) ? 'checked' : '' ?>
                                   onchange="document.getElementById('filter-form').submit()">
                            <?= htmlspecialchars($cat['name']) ?>
                        </label>
                    <?php endforeach; ?>
                </div>

                <div class="filter-group">
                    <h4> Prix ( DH)</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                        <input type="number" name="min_price" placeholder="Min" class="form-control" 
                               value="<?= htmlspecialchars($_GET['min_price'] ?? '') ?>" style="padding: 8px 10px; font-size: 13px;">
                        <input type="number" name="max_price" placeholder="Max" class="form-control"
                               value="<?= htmlspecialchars($_GET['max_price'] ?? '') ?>" style="padding: 8px 10px; font-size: 13px;">
                    </div>
                    <button type="submit" class="btn btn-primary btn-sm" style="margin-top: 10px; width: 100%;">Appliquer</button>
                </div>

                <div class="filter-group">
                    <h4> Filtres Rapides</h4>
                    <label class="filter-option">
                        <input type="radio" name="filter" value="new"
                               <?= ($_GET['filter'] ?? '') === 'new' ? 'checked' : '' ?>
                               onchange="document.getElementById('filter-form').submit()">
                         Nouveautés
                    </label>
                    <label class="filter-option">
                        <input type="radio" name="filter" value="promo"
                               <?= ($_GET['filter'] ?? '') === 'promo' ? 'checked' : '' ?>
                               onchange="document.getElementById('filter-form').submit()">
                         Promotions
                    </label>
                    <label class="filter-option">
                        <input type="radio" name="filter" value="featured"
                               <?= ($_GET['filter'] ?? '') === 'featured' ? 'checked' : '' ?>
                               onchange="document.getElementById('filter-form').submit()">
                         Populaires
                    </label>
                </div>

                <a href="shop.php" class="btn btn-outline btn-sm btn-block"> Réinitialiser</a>
            </form>
        </aside>

        <!-- Produits -->
        <main>
            <!-- Tri -->
            <div class="flex-between" style="margin-bottom: 20px;">
                <span style="color: var(--text-muted); font-size: 14px;"><?= $totalGames ?> jeux</span>
                <form method="GET">
                    <?php foreach ($_GET as $k => $v): if ($k !== 'sort'): ?>
                        <input type="hidden" name="<?= htmlspecialchars($k) ?>" value="<?= htmlspecialchars($v) ?>">
                    <?php endif; endforeach; ?>
                    <select name="sort" class="form-control" style="width: auto; padding: 8px 12px; font-size: 14px;" 
                            onchange="this.form.submit()">
                        <option value="popular" <?= ($_GET['sort'] ?? '') === 'popular' ? 'selected' : '' ?>>Popularité</option>
                        <option value="newest" <?= ($_GET['sort'] ?? '') === 'newest' ? 'selected' : '' ?>>Plus récents</option>
                        <option value="price_asc" <?= ($_GET['sort'] ?? '') === 'price_asc' ? 'selected' : '' ?>>Prix croissant</option>
                        <option value="price_desc" <?= ($_GET['sort'] ?? '') === 'price_desc' ? 'selected' : '' ?>>Prix décroissant</option>
                        <option value="title" <?= ($_GET['sort'] ?? '') === 'title' ? 'selected' : '' ?>>Titre A-Z</option>
                    </select>
                </form>
            </div>

            <?php if (empty($games)): ?>
                <div style="text-align: center; padding: 60px; color: var(--text-muted);">
                    <div style="font-size: 60px; margin-bottom: 20px;"></div>
                    <h3>Aucun jeu trouvé</h3>
                    <p>Essayez de modifier vos filtres.</p>
                    <a href="shop.php" class="btn btn-primary" style="margin-top: 20px;">Réinitialiser les filtres</a>
                </div>
            <?php else: ?>
                <div class="games-grid">
                    <?php foreach ($games as $game): 
                        $discount = $game['old_price'] ? round((1 - $game['price']/$game['old_price']) * 100) : 0;
                    ?>
                        <div class="game-card">
                            <div class="game-card-image">
                                <?= renderGameArtwork($game) ?>
                                <div class="game-card-badges">
                                    <?php if ($game['is_new']): ?><span class="badge badge-new">NEW</span><?php endif; ?>
                                    <?php if ($discount > 0): ?><span class="badge badge-promo">-<?= $discount ?>%</span><?php endif; ?>
                                    <?php if ($game['is_featured']): ?><span class="badge badge-featured"> TOP</span><?php endif; ?>
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

                <!-- Pagination -->
                <?php if ($totalPages > 1): ?>
                    <div class="pagination">
                        <?php for ($i = 1; $i <= $totalPages; $i++): 
                            $params_p = $_GET;
                            $params_p['page'] = $i;
                        ?>
                            <a href="?<?= http_build_query($params_p) ?>" class="page-btn <?= $i === $page ? 'active' : '' ?>"><?= $i ?></a>
                        <?php endfor; ?>
                    </div>
                <?php endif; ?>
            <?php endif; ?>
        </main>
    </div>
</div>

<?php include '../includes/footer.php'; ?>
