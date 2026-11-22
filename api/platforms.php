<?php
require_once __DIR__ . '/cors.php';

$db = getDB();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(['success' => false, 'message' => 'Méthode non autorisée'], 405);
}

// Fetch platforms with game counts
$sql = "
    SELECT p.*, COUNT(g.id) AS games_count
    FROM platforms p
    LEFT JOIN games g ON g.platform_id = p.id
    GROUP BY p.id
    ORDER BY p.name ASC
";
$platforms = $db->query($sql)->fetchAll();

sendJson([
    'success' => true,
    'platforms' => $platforms
]);
