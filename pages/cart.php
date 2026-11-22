<?php
require_once '../config.php';

$pageTitle = 'Mon Panier';
$db = getDB();

$userId = $_SESSION['user_id'] ?? null;
$sessionId = session_id();

// Récupérer le panier
if ($userId) {
    $stmt = $db->prepare("
        SELECT c.*, g.title, g.price, g.image, g.slug, g.stock, p.name as platform_name 
        FROM cart c 
        JOIN games g ON c.game_id = g.id 
        LEFT JOIN platforms p ON g.platform_id = p.id
        WHERE c.user_id = ?
    ");
    $stmt->execute([$userId]);
} else {
    $stmt = $db->prepare("
        SELECT c.*, g.title, g.price, g.image, g.slug, g.stock, p.name as platform_name 
        FROM cart c 
        JOIN games g ON c.game_id = g.id 
        LEFT JOIN platforms p ON g.platform_id = p.id
        WHERE c.session_id = ?
    ");
    $stmt->execute([$sessionId]);
}
$cartItems = $stmt->fetchAll();

$total = array_sum(array_map(fn($i) => $i['price'] * $i['quantity'], $cartItems));
$itemCount = array_sum(array_column($cartItems, 'quantity'));

$success = $_SESSION['success'] ?? null;
$error = $_SESSION['error'] ?? null;
unset($_SESSION['success'], $_SESSION['error']);


include '../includes/header.php';
?>

<div class="container" style="padding: 40px 0;">
    <h1 class="section-title" style="margin-bottom: 30px;"> Mon <span>Panier</span>
        <span style="font-size: 18px; color: var(--text-muted); font-family: Rajdhani; font-weight: 400;">(<?= $itemCount ?> article<?= $itemCount > 1 ? 's' : '' ?>)</span>
    </h1>

    <?php if ($success): ?><div class="alert alert-success"><?= htmlspecialchars($success) ?></div><?php endif; ?>
    <?php if ($error): ?><div class="alert alert-error"><?= htmlspecialchars($error) ?></div><?php endif; ?>

    <?php if (empty($cartItems)): ?>
        <div style="text-align: center; padding: 80px 20px;">
            <div style="font-size: 80px; margin-bottom: 20px;"></div>
            <h2 style="margin-bottom: 15px;">Votre panier est vide</h2>
            <p style="color: var(--text-muted); margin-bottom: 30px;">Découvrez notre sélection de jeux vidéo</p>
            <a href="shop.php" class="btn btn-primary btn-lg"> Voir la Boutique</a>
        </div>
    <?php else: ?>
        <div style="display: grid; grid-template-columns: 1fr 350px; gap: 30px; align-items: start;">
            <!-- Articles -->
            <div>
                <table class="cart-table">
                    <thead>
                        <tr>
                            <th>Jeu</th>
                            <th>Prix</th>
                            <th>Quantité</th>
                            <th>Total</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($cartItems as $item): ?>
                            <tr>
                                <td>
                                    <div class="cart-game-info">
                                        <div class="cart-game-art"><?= renderGameArtwork($item) ?></div>
                                        <div>
                                            <div class="cart-game-name"><?= htmlspecialchars($item['title']) ?></div>
                                            <div class="cart-game-platform"><?= htmlspecialchars($item['platform_name'] ?? '') ?></div>
                                        </div>
                                    </div>
                                </td>
                                <td style="font-weight: 600;"><?= number_format($item['price'], 2) ?><?= CURRENCY ?></td>
                                <td>
                                    <div class="qty-control">
                                        <form method="POST" action="cart-action.php" style="display: inline;">
                                            <input type="hidden" name="action" value="decrease">
                                            <input type="hidden" name="cart_id" value="<?= $item['id'] ?>">
                                            <button type="submit" class="qty-btn">−</button>
                                        </form>
                                        <span style="font-weight: 700; min-width: 20px; text-align: center;"><?= $item['quantity'] ?></span>
                                        <form method="POST" action="cart-action.php" style="display: inline;">
                                            <input type="hidden" name="action" value="increase">
                                            <input type="hidden" name="cart_id" value="<?= $item['id'] ?>">
                                            <button type="submit" class="qty-btn">+</button>
                                        </form>
                                    </div>
                                </td>
                                <td style="font-weight: 700; color: var(--accent2);">
                                    <?= number_format($item['price'] * $item['quantity'], 2) ?><?= CURRENCY ?>
                                </td>
                                <td>
                                    <form method="POST" action="cart-action.php">
                                        <input type="hidden" name="action" value="remove">
                                        <input type="hidden" name="cart_id" value="<?= $item['id'] ?>">
                                        <button type="submit" class="btn btn-danger btn-sm" onclick="return confirm('Supprimer ce jeu ?')"></button>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>

                <div style="display: flex; gap: 10px;">
                    <a href="shop.php" class="btn btn-outline">← Continuer les achats</a>
                </div>
            </div>

            <!-- Résumé commande -->
            <div class="cart-summary">
                <h3>Votre commande</h3>
                <div class="summary-row">
                    <span>Sous-total (<?= $itemCount ?> articles)</span>
                    <span><?= number_format($total, 2) ?><?= CURRENCY ?></span>
                </div>
                <div class="summary-row">
                    <span>Frais de livraison</span>
                    <span>Inclus</span>
                </div>
                <div class="summary-total">
                    <span>Total</span>
                    <span><?= number_format($total, 2) ?><?= CURRENCY ?></span>
                </div>

                <?php if (isset($_SESSION['user_id'])): ?>
                    <a href="checkout.php" class="btn btn-primary btn-lg btn-block" style="margin-top: 15px;">
                         Passer la Commande
                    </a>
                <?php else: ?>
                    <a href="login.php?redirect=checkout" class="btn btn-primary btn-lg btn-block" style="margin-top: 15px;">
                         Se connecter pour commander
                    </a>
                <?php endif; ?>

            </div>
        </div>
    <?php endif; ?>
</div>

<?php include '../includes/footer.php'; ?>
