<?php
require_once __DIR__ . '/cors.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$userId = $_SESSION['user_id'] ?? null;
$sessionId = session_id();

if ($method === 'GET') {
    if (!$userId) {
        sendJson(['success' => false, 'message' => 'Veuillez vous connecter pour voir vos commandes'], 401);
    }

    $stmt = $db->prepare("
        SELECT o.*, 
               (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS items_count
        FROM orders o
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
    ");
    $stmt->execute([$userId]);
    $orders = $stmt->fetchAll();

    foreach ($orders as &$order) {
        $itemsStmt = $db->prepare("
            SELECT oi.*, g.title, g.slug, g.image, p.name AS platform_name
            FROM order_items oi
            JOIN games g ON oi.game_id = g.id
            LEFT JOIN platforms p ON g.platform_id = p.id
            WHERE oi.order_id = ?
        ");
        $itemsStmt->execute([$order['id']]);
        $order['items'] = $itemsStmt->fetchAll();
    }

    sendJson([
        'success' => true,
        'orders' => $orders
    ]);
}

if ($method === 'POST') {
    $data = getJsonBody();
    $shippingAddress = trim($data['shipping_address'] ?? '');
    $paymentMethod = trim($data['payment_method'] ?? 'À confirmer');

    if (empty($shippingAddress)) {
        sendJson(['success' => false, 'message' => 'Votre e-mail de réception est requis'], 422);
    }
    if (!filter_var($shippingAddress, FILTER_VALIDATE_EMAIL)) {
        sendJson(['success' => false, 'message' => 'Veuillez saisir une adresse e-mail valide'], 422);
    }

    // Retrieve items from cart
    if ($userId) {
        $cartStmt = $db->prepare("
            SELECT c.*, g.price, g.stock, g.title 
            FROM cart c 
            JOIN games g ON c.game_id = g.id 
            WHERE c.user_id = ?
        ");
        $cartStmt->execute([$userId]);
    } else {
        $cartStmt = $db->prepare("
            SELECT c.*, g.price, g.stock, g.title 
            FROM cart c 
            JOIN games g ON c.game_id = g.id 
            WHERE c.session_id = ?
        ");
        $cartStmt->execute([$sessionId]);
    }
    $cartItems = $cartStmt->fetchAll();

    if (empty($cartItems)) {
        sendJson(['success' => false, 'message' => 'Votre panier est vide'], 400);
    }

    // Begin transaction
    $db->beginTransaction();

    try {
        $total = 0.0;
        foreach ($cartItems as $item) {
            $total += (float)$item['price'] * (int)$item['quantity'];
        }

        // Insert order
        $orderStmt = $db->prepare("
            INSERT INTO orders (user_id, total, status, shipping_address, payment_method) 
            VALUES (?, ?, 'pending', ?, ?)
        ");
        $orderStmt->execute([$userId, $total, $shippingAddress, $paymentMethod]);
        $orderId = $db->lastInsertId();

        // Insert order items & reduce stock
        $itemInsert = $db->prepare("
            INSERT INTO order_items (order_id, game_id, quantity, unit_price) 
            VALUES (?, ?, ?, ?)
        ");
        $stockReduce = $db->prepare("
            UPDATE games SET stock = GREATEST(0, stock - ?) WHERE id = ?
        ");

        foreach ($cartItems as $item) {
            $itemInsert->execute([$orderId, $item['game_id'], $item['quantity'], $item['price']]);
            $stockReduce->execute([$item['quantity'], $item['game_id']]);
        }

        // Clear cart
        if ($userId) {
            $db->prepare("DELETE FROM cart WHERE user_id = ?")->execute([$userId]);
        } else {
            $db->prepare("DELETE FROM cart WHERE session_id = ?")->execute([$sessionId]);
        }

        $db->commit();

        sendJson([
            'success' => true,
            'message' => 'Commande validée avec succès !',
            'order_id' => $orderId,
            'total' => $total
        ], 201);
    } catch (Exception $e) {
        $db->rollBack();
        sendJson(['success' => false, 'message' => 'Erreur lors de la validation: ' . $e->getMessage()], 500);
    }
}
