<?php
require_once __DIR__ . '/cors.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$data = getJsonBody();
$action = $data['action'] ?? ($_GET['action'] ?? '');

if ($method === 'GET') {
    // Check current auth status
    if ($action === 'me' || empty($action)) {
        if (!empty($_SESSION['user_id'])) {
            $stmt = $db->prepare("SELECT id, username, email, first_name, last_name, address, phone, role, created_at FROM users WHERE id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            $user = $stmt->fetch();
            if ($user) {
                sendJson(['success' => true, 'authenticated' => true, 'user' => $user]);
            }
        }
        sendJson(['success' => true, 'authenticated' => false, 'user' => null]);
    }
    sendJson(['success' => false, 'message' => 'Action inconnue'], 400);
}

if ($method === 'POST') {
    if ($action === 'login') {
        $email = trim($data['email'] ?? '');
        $password = trim($data['password'] ?? '');

        if (empty($email) || empty($password)) {
            sendJson(['success' => false, 'message' => 'Email et mot de passe requis'], 422);
        }

        $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];

            // Clean sensitive data before returning
            unset($user['password']);

            sendJson([
                'success' => true,
                'message' => 'Connexion réussie',
                'user' => $user
            ]);
        } else {
            sendJson(['success' => false, 'message' => 'Identifiants invalides'], 401);
        }
    }

    if ($action === 'register') {
        $username = trim($data['username'] ?? '');
        $email = trim($data['email'] ?? '');
        $password = trim($data['password'] ?? '');
        $firstName = trim($data['first_name'] ?? '');
        $lastName = trim($data['last_name'] ?? '');

        if (empty($username) || empty($email) || empty($password)) {
            sendJson(['success' => false, 'message' => 'Veuillez remplir tous les champs obligatoires'], 422);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendJson(['success' => false, 'message' => 'Format d\'email invalide'], 422);
        }

        if (strlen($password) < 6) {
            sendJson(['success' => false, 'message' => 'Le mot de passe doit comporter au moins 6 caractères'], 422);
        }

        // Check if username or email exists
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
        $stmt->execute([$email, $username]);
        if ($stmt->fetch()) {
            sendJson(['success' => false, 'message' => 'Ce nom d\'utilisateur ou cet email est déjà utilisé'], 409);
        }

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $insert = $db->prepare("
            INSERT INTO users (username, email, password, first_name, last_name, role) 
            VALUES (?, ?, ?, ?, ?, 'client')
        ");
        $insert->execute([$username, $email, $hashedPassword, $firstName, $lastName]);

        $userId = $db->lastInsertId();
        $_SESSION['user_id'] = $userId;
        $_SESSION['username'] = $username;
        $_SESSION['role'] = 'client';

        $user = [
            'id' => $userId,
            'username' => $username,
            'email' => $email,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'role' => 'client'
        ];

        sendJson([
            'success' => true,
            'message' => 'Compte créé avec succès',
            'user' => $user
        ], 201);
    }

    if ($action === 'logout') {
        session_unset();
        session_destroy();
        sendJson(['success' => true, 'message' => 'Déconnexion réussie']);
    }

    sendJson(['success' => false, 'message' => 'Action inconnue'], 400);
}
