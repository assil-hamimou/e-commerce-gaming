<?php
require_once '../config.php';

if (empty($_SESSION['user_id'])) {
    header('Location: login.php?redirect=checkout');
    exit;
}

$db = getDB();
$pageTitle = 'Finaliser la commande';
$error = '';
$userId = (int)$_SESSION['user_id'];

$cartStmt = $db->prepare("SELECT c.game_id, c.quantity, g.title, g.price, g.stock FROM cart c JOIN games g ON g.id=c.game_id WHERE c.user_id=?");
$cartStmt->execute([$userId]);
$items = $cartStmt->fetchAll();

if (empty($items)) {
    header('Location: cart.php');
    exit;
}

$total = array_sum(array_map(static fn($item) => (float)$item['price'] * (int)$item['quantity'], $items));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Saisissez une adresse e-mail valide pour recevoir votre commande.';
    } else {
        try {
            $db->beginTransaction();

            foreach ($items as $item) {
                if ((int)$item['stock'] < (int)$item['quantity']) {
                    throw new RuntimeException('Le stock de « ' . $item['title'] . ' » vient de changer. Vérifiez votre panier.');
                }
            }

            $orderStmt = $db->prepare("INSERT INTO orders (user_id, total, status, shipping_address, payment_method) VALUES (?, ?, 'pending', ?, ?)");
            $orderStmt->execute([$userId, $total, $email, 'À confirmer']);
            $orderId = (int)$db->lastInsertId();

            $itemStmt = $db->prepare('INSERT INTO order_items (order_id, game_id, quantity, unit_price) VALUES (?, ?, ?, ?)');
            $stockStmt = $db->prepare('UPDATE games SET stock=stock-? WHERE id=? AND stock>=?');
            foreach ($items as $item) {
                $itemStmt->execute([$orderId, $item['game_id'], $item['quantity'], $item['price']]);
                $stockStmt->execute([$item['quantity'], $item['game_id'], $item['quantity']]);
                if ($stockStmt->rowCount() !== 1) {
                    throw new RuntimeException('Le stock a changé pendant la commande. Vérifiez votre panier.');
                }
            }

            $db->prepare('DELETE FROM cart WHERE user_id=?')->execute([$userId]);
            $db->commit();
            $_SESSION['success'] = 'Commande #' . $orderId . ' enregistrée. Le paiement sera confirmé avec vous.';
            header('Location: cart.php');
            exit;
        } catch (Throwable $exception) {
            if ($db->inTransaction()) $db->rollBack();
            $error = $exception instanceof RuntimeException ? $exception->getMessage() : 'La commande n’a pas pu être enregistrée. Réessayez.';
        }
    }
}

include '../includes/header.php';
?>

<main class="container" style="padding: 40px 0; max-width: 760px;">
    <h1 class="section-title">Finaliser la <span>commande</span></h1>
    <p style="color: var(--text-muted); margin: 10px 0 24px;">Vos articles sont numériques. Indiquez l’e-mail où nous pouvons vous contacter au sujet de la commande.</p>

    <?php if ($error): ?><div class="alert alert-error"><?= htmlspecialchars($error) ?></div><?php endif; ?>

    <div class="card" style="padding: 24px;">
        <h2 style="margin-bottom: 16px;">Récapitulatif</h2>
        <?php foreach ($items as $item): ?>
            <div style="display:flex; justify-content:space-between; gap:16px; padding:12px 0; border-bottom:1px solid var(--border);">
                <span><?= htmlspecialchars($item['title']) ?> × <?= (int)$item['quantity'] ?></span>
                <strong><?= number_format((float)$item['price'] * (int)$item['quantity'], 2) ?><?= CURRENCY ?></strong>
            </div>
        <?php endforeach; ?>
        <div style="display:flex; justify-content:space-between; gap:16px; padding:18px 0; font-size:18px; font-weight:700;">
            <span>Total</span><span><?= number_format($total, 2) ?><?= CURRENCY ?></span>
        </div>

        <form method="POST">
            <label for="delivery-email">E-mail de réception</label>
            <input id="delivery-email" type="email" name="email" class="form-control" value="<?= htmlspecialchars($_POST['email'] ?? '') ?>" placeholder="nom@exemple.com" required>
            <p style="color:var(--text-muted); font-size:13px; margin:10px 0 18px;">La commande sera enregistrée et son paiement restera à confirmer.</p>
            <button type="submit" class="btn btn-primary btn-lg btn-block">Confirmer la commande</button>
        </form>
    </div>
</main>

<?php include '../includes/footer.php'; ?>
