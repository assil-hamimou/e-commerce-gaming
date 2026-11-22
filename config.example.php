<?php
// Copy this file to config.php and set values for your local server.
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'gamestore_db');

define('SITE_NAME', 'A2SIL');
define('SITE_URL', 'http://localhost:8080/game-store');
define('CURRENCY', ' DH');

define('ITEMS_PER_PAGE', 12);

function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8",
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]
            );
        } catch (PDOException $e) {
            die("Erreur de connexion : " . $e->getMessage());
        }
    }
    return $pdo;
}

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}
