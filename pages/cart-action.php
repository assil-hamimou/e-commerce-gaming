<?php
require_once '../config.php';

$db = getDB();

// Traitement des actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $isAjax = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) || 
              strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false ||
              isset($_POST['ajax']);

    $userId = $_SESSION['user_id'] ?? null;
    $sessionId = session_id();

    if ($action === 'add') {
        $gameId = (int)($_POST['game_id'] ?? 0);
        $qty = max(1, (int)($_POST['quantity'] ?? 1));

        // Vérifier stock
        $stmt = $db->prepare("SELECT stock FROM games WHERE id = ?");
        $stmt->execute([$gameId]);
        $game = $stmt->fetch();

        if (!$game || $game['stock'] < 1) {
            if ($isAjax) {
                echo json_encode(['success' => false, 'message' => 'Jeu indisponible']);
                exit;
            }
            $_SESSION['error'] = 'Jeu indisponible.';
            header('Location: cart.php');
            exit;
        }

        // Vérifier si déjà dans le panier
        if ($userId) {
            $check = $db->prepare("SELECT id, quantity FROM cart WHERE user_id = ? AND game_id = ?");
            $check->execute([$userId, $gameId]);
        } else {
            $check = $db->prepare("SELECT id, quantity FROM cart WHERE session_id = ? AND game_id = ?");
            $check->execute([$sessionId, $gameId]);
        }
        $existing = $check->fetch();

        if ($existing) {
            $db->prepare("UPDATE cart SET quantity = quantity + ? WHERE id = ?")
               ->execute([$qty, $existing['id']]);
        } else {
            $db->prepare("INSERT INTO cart (user_id, session_id, game_id, quantity) VALUES (?, ?, ?, ?)")
               ->execute([$userId, $sessionId, $gameId, $qty]);
        }

        // Compter
        if ($userId) {
            $countStmt = $db->prepare("SELECT SUM(quantity) FROM cart WHERE user_id = ?");
            $countStmt->execute([$userId]);
        } else {
            $countStmt = $db->prepare("SELECT SUM(quantity) FROM cart WHERE session_id = ?");
            $countStmt->execute([$sessionId]);
        }
        $count = (int)$countStmt->fetchColumn();

        if ($isAjax) {
            echo json_encode(['success' => true, 'count' => $count]);
            exit;
        }
        $_SESSION['success'] = 'Jeu ajouté au panier !';
        header('Location: cart.php');
        exit;
    }

    if ($action === 'remove') {
        $cartId = (int)$_POST['cart_id'];
        $db->prepare("DELETE FROM cart WHERE id = ?")->execute([$cartId]);
        if ($isAjax) { echo json_encode(['success' => true]); exit; }
        header('Location: cart.php');
        exit;
    }

    if ($action === 'increase') {
        $cartId = (int)$_POST['cart_id'];
        $db->prepare("UPDATE cart SET quantity = quantity + 1 WHERE id = ?")->execute([$cartId]);
        if ($isAjax) { echo json_encode(['success' => true]); exit; }
        header('Location: cart.php');
        exit;
    }

    if ($action === 'decrease') {
        $cartId = (int)$_POST['cart_id'];
        $check = $db->prepare("SELECT quantity FROM cart WHERE id = ?");
        $check->execute([$cartId]);
        $item = $check->fetch();
        if ($item && $item['quantity'] > 1) {
            $db->prepare("UPDATE cart SET quantity = quantity - 1 WHERE id = ?")->execute([$cartId]);
        } else {
            $db->prepare("DELETE FROM cart WHERE id = ?")->execute([$cartId]);
        }
        if ($isAjax) { echo json_encode(['success' => true]); exit; }
        header('Location: cart.php');
        exit;
    }
}

// Redirection par défaut
header('Location: cart.php');
exit;
