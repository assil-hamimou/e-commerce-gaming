<?php
require_once __DIR__ . '/cors.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    sendJson(['success' => false, 'message' => 'Méthode non autorisée'], 405);
}

// 1. Get single game by ID or slug
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$slug = isset($_GET['slug']) ? trim($_GET['slug']) : null;

if ($id || $slug) {
    $sql = "
        SELECT g.*, 
               c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon,
               p.name AS platform_name, p.slug AS platform_slug
        FROM games g
        LEFT JOIN categories c ON g.category_id = c.id
        LEFT JOIN platforms p ON g.platform_id = p.id
        WHERE " . ($id ? "g.id = ?" : "g.slug = ?") . "
        LIMIT 1
    ";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([$id ?? $slug]);
    $game = $stmt->fetch();

    if (!$game) {
        sendJson(['success' => false, 'message' => 'Jeu introuvable'], 404);
    }

    // Fetch reviews for this game
    $reviewsStmt = $db->prepare("
        SELECT r.*, u.username, u.first_name, u.last_name 
        FROM reviews r 
        LEFT JOIN users u ON r.user_id = u.id 
        WHERE r.game_id = ? 
        ORDER BY r.created_at DESC
    ");
    $reviewsStmt->execute([$game['id']]);
    $reviews = $reviewsStmt->fetchAll();

    // Fetch similar games (same category)
    $similarStmt = $db->prepare("
        SELECT g.*, c.name AS category_name, p.name AS platform_name
        FROM games g
        LEFT JOIN categories c ON g.category_id = c.id
        LEFT JOIN platforms p ON g.platform_id = p.id
        WHERE g.category_id = ? AND g.id != ?
        LIMIT 4
    ");
    $similarStmt->execute([$game['category_id'], $game['id']]);
    $similar = $similarStmt->fetchAll();

    sendJson([
        'success' => true,
        'game' => $game,
        'reviews' => $reviews,
        'similar' => $similar
    ]);
}

// 2. Query list of games with filters
$search = trim($_GET['search'] ?? '');
$category = trim($_GET['category'] ?? '');
$platform = trim($_GET['platform'] ?? '');
$featured = isset($_GET['featured']) ? (bool)$_GET['featured'] : null;
$isNew = isset($_GET['new']) ? (bool)$_GET['new'] : null;
$promo = isset($_GET['promo']) ? (bool)$_GET['promo'] : null;
$sort = trim($_GET['sort'] ?? 'newest');
$page = max(1, (int)($_GET['page'] ?? 1));
$limit = min(50, max(1, (int)($_GET['limit'] ?? 12)));
$offset = ($page - 1) * $limit;

$where = ["1=1"];
$params = [];

if ($search !== '') {
    $where[] = "(g.title LIKE ? OR g.description LIKE ? OR g.publisher LIKE ?)";
    $term = "%$search%";
    $params[] = $term;
    $params[] = $term;
    $params[] = $term;
}

if ($category !== '') {
    if (is_numeric($category)) {
        $where[] = "g.category_id = ?";
        $params[] = (int)$category;
    } else {
        $where[] = "c.slug = ?";
        $params[] = $category;
    }
}

if ($platform !== '') {
    if (is_numeric($platform)) {
        $where[] = "g.platform_id = ?";
        $params[] = (int)$platform;
    } else {
        $where[] = "p.slug = ?";
        $params[] = $platform;
    }
}

if ($featured !== null) {
    $where[] = "g.is_featured = ?";
    $params[] = $featured ? 1 : 0;
}

if ($isNew !== null) {
    $where[] = "g.is_new = ?";
    $params[] = $isNew ? 1 : 0;
}

if ($promo !== null && $promo) {
    $where[] = "g.old_price IS NOT NULL AND g.old_price > g.price";
}

$minPrice = isset($_GET['min_price']) && is_numeric($_GET['min_price']) ? (float)$_GET['min_price'] : null;
$maxPrice = isset($_GET['max_price']) && is_numeric($_GET['max_price']) ? (float)$_GET['max_price'] : null;

if ($minPrice !== null) {
    $where[] = "g.price >= ?";
    $params[] = $minPrice;
}
if ($maxPrice !== null) {
    $where[] = "g.price <= ?";
    $params[] = $maxPrice;
}

$whereSql = implode(" AND ", $where);

// Count total matching
$countSql = "
    SELECT COUNT(*) 
    FROM games g
    LEFT JOIN categories c ON g.category_id = c.id
    LEFT JOIN platforms p ON g.platform_id = p.id
    WHERE $whereSql
";
$countStmt = $db->prepare($countSql);
$countStmt->execute($params);
$total = (int)$countStmt->fetchColumn();

// Sorting
$orderBy = match ($sort) {
    'price_asc' => 'g.price ASC',
    'price_desc' => 'g.price DESC',
    'title_asc' => 'g.title ASC',
    'title_desc' => 'g.title DESC',
    'oldest' => 'g.id ASC',
    default => 'g.id DESC'
};

// Fetch games
$sql = "
    SELECT g.*, 
           c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon,
           p.name AS platform_name, p.slug AS platform_slug
    FROM games g
    LEFT JOIN categories c ON g.category_id = c.id
    LEFT JOIN platforms p ON g.platform_id = p.id
    WHERE $whereSql
    ORDER BY $orderBy
    LIMIT $limit OFFSET $offset
";
$stmt = $db->prepare($sql);
$stmt->execute($params);
$games = $stmt->fetchAll();

sendJson([
    'success' => true,
    'games' => $games,
    'total' => $total,
    'page' => $page,
    'limit' => $limit,
    'totalPages' => ceil($total / $limit)
]);
