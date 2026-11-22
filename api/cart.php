<?php
require_once __DIR__ . '/cors.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$userId = $_SESSION['user_id'] ?? null;
$sessionId = session_id();

// Helper to fetch cart items
function fetchCartItems($db, $userId, $sessionId) {
    if ($userId) {
        $stmt = $db->prepare("
            SELECT c.id AS cart_item_id, c.quantity, c.game_id,
                   g.title, g.slug, g.price, g.old_price, g.stock, g.image,
                   cat.name AS category_name, p.name AS platform_name
            FROM cart c
            JOIN games g ON c.game_id = g.id
            LEFT JOIN categories cat ON g.category_id = cat.id
            LEFT JOIN platforms p ON g.platform_id = p.id
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
        ");
        $stmt->execute([$userId]);
    } else {
        $stmt = $db->prepare("
            SELECT c.id AS cart_item_id, c.quantity, c.game_id,
                   g.title, g.slug, g.price, g.old_price, g.stock, g.image,
                   cat.name AS category_name, p.name AS platform_name
            FROM cart c
            JOIN games g ON c.game_id = g.id
            LEFT JOIN categories cat ON g.category_id = cat.id
            LEFT JOIN platforms p ON g.platform_id = p.id
            WHERE c.session_id = ?
            ORDER BY c.created_at DESC
        ");
        $stmt->execute([$sessionId]);
    }
    $items = $stmt->fetchAll();

    $totalPrice = 0.0;
    $totalCount = 0;
    foreach ($items as &$item) {
        $subtotal = (float)$item['price'] * (int)$item['quantity'];
        $item['subtotal'] = round($subtotal, 2);
        $totalPrice += $subtotal;
        $totalCount += (int)$item['quantity'];
    }

    return [
        'items' => $items,
        'totalPrice' => round($totalPrice, 2),
        'totalCount' => $totalCount
    ];
}

if ($method === 'GET') {
    $cartData = fetchCartItems($db, $userId, $sessionId);
    sendJson([
        'success' => true,
        'cart' => $cartData
    ]);
}

if ($method === 'POST') {
    $data = getJsonBody();
    $action = $data['action'] ?? '';

    if ($action === 'add') {
        $gameId = (int)($data['game_id'] ?? 0);
        $qty = max(1, (int)($data['quantity'] ?? 1));

        // Verify game existence & stock
        $stmt = $db->prepare("SELECT id, title, stock, price FROM games WHERE id = ?");
        $stmt->execute([$gameId]);
        $game = $stmt->fetch();

        if (!$game) {
            sendJson(['success' => false, 'message' => 'Jeu introuvable'], 404);
        }

        if ($game['stock'] < 1) {
            sendJson(['success' => false, 'message' => 'Rupture de stock pour ce jeu'], 400);
        }

        // Check if item already exists in cart
        if ($userId) {
            $check = $db->prepare("SELECT id, quantity FROM cart WHERE user_id = ? AND game_id = ?");
            $check->execute([$userId, $gameId]);
        } else {
            $check = $db->prepare("SELECT id, quantity FROM cart WHERE session_id = ? AND game_id = ?");
            $check->execute([$sessionId, $gameId]);
        }
        $existing = $check->fetch();

        if ($existing) {
            $newQty = $existing['quantity'] + $qty;
            if ($newQty > $game['stock']) {
                $newQty = $game['stock'];
            }
            $db->prepare("UPDATE cart SET quantity = ? WHERE id = ?")
               ->execute([$newQty, $existing['id']]);
        } else {
            $db->prepare("INSERT INTO cart (user_id, session_id, game_id, quantity) VALUES (?, ?, ?, ?)")
               ->execute([$userId, $sessionId, $gameId, min($qty, $game['stock'])]);
        }

        $cartData = fetchCartItems($db, $userId, $sessionId);
        sendJson([
            'success' => true,
            'message' => 'Jeu ajouté au panier',
            'cart' => $cartData
        ]);
    }

    if ($action === 'update') {
        $cartItemId = (int)($data['cart_item_id'] ?? 0);
        $qty = (int)($data['quantity'] ?? 1);

        if ($cartItemId <= 0) {
            sendJson(['success' => false, 'message' => 'Identifiant de panier invalide'], 400);
        }

        if ($qty <= 0) {
            // Delete item
            $del = $userId 
                ? $db->prepare("DELETE FROM cart WHERE id = ? AND user_id = ?") 
                : $db->prepare("DELETE FROM cart WHERE id = ? AND session_id = ?");
            $del->execute([$cartItemId, $userId ?: $sessionId]);
        } else {
            // Check stock
            $stmt = $db->prepare("
                SELECT g.stock 
                FROM cart c 
                JOIN games g ON c.game_id = g.id 
                WHERE c.id = ?
            ");
            $stmt->execute([$cartItemId]);
            $stock = $stmt->fetchColumn();

            $finalQty = ($stock !== false && $qty > $stock) ? (int)$stock : $qty;

            $upd = $userId 
                ? $db->prepare("UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?")
                : $db->prepare("UPDATE cart SET quantity = ? WHERE id = ? AND session_id = ?");
            $upd->execute([$finalQty, $cartItemId, $userId ?: $sessionId]);
        }

        $cartData = fetchCartItems($db, $userId, $sessionId);
        sendJson([
            'success' => true,
            'message' => 'Panier mis à jour',
            'cart' => $cartData
        ]);
    }

    if ($action === 'remove') {
        $cartItemId = (int)($data['cart_item_id'] ?? 0);
        $del = $userId 
            ? $db->prepare("DELETE FROM cart WHERE id = ? AND user_id = ?") 
            : $db->prepare("DELETE FROM cart WHERE id = ? AND session_id = ?");
        $del->execute([$cartItemId, $userId ?: $sessionId]);

        $cartData = fetchCartItems($db, $userId, $sessionId);
        sendJson([
            'success' => true,
            'message' => 'Article retiré du panier',
            'cart' => $cartData
        ]);
    }

    if ($action === 'clear') {
        $del = $userId 
            ? $db->prepare("DELETE FROM cart WHERE user_id = ?") 
            : $db->prepare("DELETE FROM cart WHERE session_id = ?");
        $del->execute([$userId ?: $sessionId]);

        $cartData = fetchCartItems($db, $userId, $sessionId);
        sendJson([
            'success' => true,
            'message' => 'Panier vidé',
            'cart' => $cartData
        ]);
    }

    sendJson(['success' => false, 'message' => 'Action inconnue'], 400);
}
