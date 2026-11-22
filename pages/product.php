<?php
require_once '../config.php';

$db = getDB();
$slug = $_GET['slug'] ?? '';

if (empty($slug)) {
    header('Location: shop.php');
    exit;
}

$stmt = $db->prepare("
    SELECT g.*, c.name as category_name, p.name as platform_name 
    FROM games g 
    LEFT JOIN categories c ON g.category_id = c.id 
    LEFT JOIN platforms p ON g.platform_id = p.id 
    WHERE g.slug = ?
");
$stmt->execute([$slug]);
$game = $stmt->fetch();

if (!$game) {
    header('Location: shop.php');
    exit;
}

$pageTitle = $game['title'];

// Avis
$reviews = $db->prepare("
    SELECT r.*, u.username FROM reviews r 
    JOIN users u ON r.user_id = u.id 
    WHERE r.game_id = ? ORDER BY r.created_at DESC
");
$reviews->execute([$game['id']]);
$reviews = $reviews->fetchAll();

// Note moyenne
$avgStmt = $db->prepare("SELECT AVG(rating), COUNT(*) FROM reviews WHERE game_id = ?");
$avgStmt->execute([$game['id']]);
[$avgRating, $reviewCount] = $avgStmt->fetch(PDO::FETCH_NUM);

// Jeux similaires
$similar = $db->prepare("
    SELECT g.*, p.name as platform_name FROM games g
    LEFT JOIN platforms p ON g.platform_id = p.id
    WHERE g.category_id = ? AND g.id != ? LIMIT 4
");
$similar->execute([$game['category_id'], $game['id']]);
$similarGames = $similar->fetchAll();

// Soumettre un avis
$reviewMsg = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['submit_review'])) {
    if (!isset($_SESSION['user_id'])) {
        $reviewMsg = '<div class="alert alert-error">Vous devez être connecté pour laisser un avis.</div>';
    } else {
        $db->prepare("INSERT INTO reviews (game_id, user_id, rating, comment) VALUES (?, ?, ?, ?)")
           ->execute([$game['id'], $_SESSION['user_id'], (int)$_POST['rating'], htmlspecialchars($_POST['comment'])]);
        $reviewMsg = '<div class="alert alert-success"> Votre avis a été publié !</div>';
    }
}


include '../includes/header.php';
?>

<div class="container">
    <!-- Fil d'Ariane -->
    <div style="padding: 20px 0; font-size: 14px; color: var(--text-muted);">
        <a href="../index.php">Accueil</a> › <a href="shop.php">Boutique</a> › <?= htmlspecialchars($game['title']) ?>
    </div>

    <!-- Détail produit -->
    <div class="product-detail">
        <div>
            <div class="product-image-box">
                <?= renderGameArtwork($game) ?>
            </div>
        </div>

        <div>
            <div style="display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap;">
                <?php if ($game['is_new']): ?><span class="badge badge-new"> NOUVEAU</span><?php endif; ?>
                <?php if ($game['old_price']): ?><span class="badge badge-promo"> PROMO</span><?php endif; ?>
                <?php if ($game['is_featured']): ?><span class="badge badge-featured"> POPULAIRE</span><?php endif; ?>
            </div>

            <h1 class="product-title"><?= htmlspecialchars($game['title']) ?></h1>

            <div class="product-meta">
                <span> <?= htmlspecialchars($game['platform_name'] ?? '') ?></span>
                <span> <?= htmlspecialchars($game['category_name'] ?? '') ?></span>
                <?php if ($game['publisher']): ?><span> <?= htmlspecialchars($game['publisher']) ?></span><?php endif; ?>
                <?php if ($game['release_date']): ?><span> <?= date('d/m/Y', strtotime($game['release_date'])) ?></span><?php endif; ?>
                <?php if ($game['rating']): ?><span> <?= htmlspecialchars($game['rating']) ?></span><?php endif; ?>
            </div>

            <?php if ($avgRating): ?>
                <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                    <div style="color: var(--accent2); font-size: 20px;">
                        <?php for ($i = 1; $i <= 5; $i++): ?>
                            <?= $i <= round($avgRating) ? '' : '☆' ?>
                        <?php endfor; ?>
                    </div>
                    <span style="color: var(--text-muted); font-size: 14px;"><?= number_format($avgRating, 1) ?>/5 (<?= $reviewCount ?> avis)</span>
                </div>
            <?php endif; ?>

            <div class="product-price">
                <?= number_format($game['price'], 2) ?><?= CURRENCY ?>
                <?php if ($game['old_price']): ?>
                    <span style="font-size: 20px; color: var(--text-muted); text-decoration: line-through; margin-left: 15px;">
                        <?= number_format($game['old_price'], 2) ?><?= CURRENCY ?>
                    </span>
                <?php endif; ?>
            </div>

            <p class="product-description"><?= nl2br(htmlspecialchars($game['description'] ?? '')) ?></p>

            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <span style="color: var(--text-muted); font-size: 14px;">
                    Stock : <?= $game['stock'] > 0 
                        ? '<span style="color: var(--success)"> En stock (' . $game['stock'] . ')</span>' 
                        : '<span style="color: var(--danger)">❌ Rupture de stock</span>' ?>
                </span>
            </div>

            <?php if ($game['stock'] > 0): ?>
                <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                    <button onclick="addToCart(<?= $game['id'] ?>)" class="btn btn-primary btn-lg"> Ajouter au Panier</button>
                    <a href="../pages/cart.php" class="btn btn-accent btn-lg"> Acheter Maintenant</a>
                    <button class="btn btn-outline btn-lg" onclick="showNotification(' Ajouté aux favoris !', 'info')"></button>
                </div>
            <?php else: ?>
                <button class="btn btn-outline btn-lg" disabled style="opacity: 0.5;">Rupture de stock</button>
            <?php endif; ?>
        </div>
    </div>

    <!-- Section Avis -->
    <div style="margin-top: 60px; border-top: 1px solid var(--border); padding-top: 40px;">
        <h2 class="section-title" style="margin-bottom: 30px;"> Avis des <span>Joueurs</span></h2>

        <?= $reviewMsg ?>

        <?php if (isset($_SESSION['user_id'])): ?>
            <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                <h3 style="margin-bottom: 20px; font-size: 16px;">Laisser un avis</h3>
                <form method="POST">
                    <div class="form-group">
                        <label>Note</label>
                        <select name="rating" class="form-control" required style="width: auto;">
                            <option value="5"> Excellent</option>
                            <option value="4"> Très bien</option>
                            <option value="3"> Bien</option>
                            <option value="2"> Passable</option>
                            <option value="1"> Décevant</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Commentaire</label>
                        <textarea name="comment" class="form-control" rows="4" placeholder="Partagez votre expérience avec ce jeu..."></textarea>
                    </div>
                    <button type="submit" name="submit_review" class="btn btn-primary">Publier l'avis</button>
                </form>
            </div>
        <?php else: ?>
            <div class="alert alert-info">
                <a href="login.php" style="color: inherit; text-decoration: underline;">Connectez-vous</a> pour laisser un avis.
            </div>
        <?php endif; ?>

        <?php if (empty($reviews)): ?>
            <p style="color: var(--text-muted); text-align: center; padding: 30px;">Aucun avis pour ce jeu. Soyez le premier !</p>
        <?php else: ?>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <?php foreach ($reviews as $review): ?>
                    <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <div>
                                <strong>@<?= htmlspecialchars($review['username']) ?></strong>
                                <span style="color: var(--accent2); margin-left: 10px;">
                                    <?= str_repeat('', $review['rating']) ?>
                                </span>
                            </div>
                            <span style="color: var(--text-muted); font-size: 13px;">
                                <?= date('d/m/Y', strtotime($review['created_at'])) ?>
                            </span>
                        </div>
                        <p style="color: var(--text-muted);"><?= nl2br(htmlspecialchars($review['comment'])) ?></p>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>

    <!-- Jeux similaires -->
    <?php if (!empty($similarGames)): ?>
    <div style="margin-top: 60px; border-top: 1px solid var(--border); padding-top: 40px;">
        <h2 class="section-title" style="margin-bottom: 25px;"> Jeux <span>Similaires</span></h2>
        <div class="games-grid">
            <?php foreach ($similarGames as $sg): ?>
                <div class="game-card">
                    <div class="game-card-image">
                        <?= renderGameArtwork($sg) ?>
                        <div class="game-card-overlay">
                            <a href="product.php?slug=<?= urlencode($sg['slug']) ?>" class="btn btn-outline btn-sm">Détails</a>
                        </div>
                    </div>
                    <div class="game-card-body">
                        <div class="game-platform"><?= htmlspecialchars($sg['platform_name'] ?? '') ?></div>
                        <div class="game-title"><a href="product.php?slug=<?= urlencode($sg['slug']) ?>"><?= htmlspecialchars($sg['title']) ?></a></div>
                        <div class="game-price-row">
                            <div class="game-price"><?= number_format($sg['price'], 2) ?><?= CURRENCY ?></div>
                            <button onclick="addToCart(<?= $sg['id'] ?>)" class="btn-add-cart">+ Panier</button>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
    <?php endif; ?>
</div>

<?php include '../includes/footer.php'; ?>
