<?php
require_once __DIR__ . '/cors.php';

$db = getDB();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(['success' => false, 'message' => 'Méthode non autorisée'], 405);
}

// Fetch categories with game counts
$sql = "
    SELECT c.*, COUNT(g.id) AS games_count
    FROM categories c
    LEFT JOIN games g ON g.category_id = c.id
    GROUP BY c.id
    ORDER BY c.name ASC
";
$categories = $db->query($sql)->fetchAll();

sendJson([
    'success' => true,
    'categories' => $categories
]);
