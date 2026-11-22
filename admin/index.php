<?php
require_once '../config.php';

// Protection admin
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    header('Location: ../pages/login.php');
    exit;
}

$pageTitle = 'Administration';
$db = getDB();

// Statistiques
$totalGames = $db->query("SELECT COUNT(*) FROM games")->fetchColumn();
$totalUsers = $db->query("SELECT COUNT(*) FROM users WHERE role = 'client'")->fetchColumn();
$totalOrders = $db->query("SELECT COUNT(*) FROM orders")->fetchColumn();
$totalRevenue = $db->query("SELECT COALESCE(SUM(total), 0) FROM orders WHERE status != 'cancelled'")->fetchColumn();

// Dernières commandes
$recentOrders = $db->query("
    SELECT o.*, u.username, u.email 
    FROM orders o 
    LEFT JOIN users u ON o.user_id = u.id 
    ORDER BY o.created_at DESC 
    LIMIT 10
")->fetchAll();

// Jeux (avec CRUD)
$action = $_GET['action'] ?? 'dashboard';
$message = '';
$statusLabels = [
    'pending' => 'En attente',
    'processing' => 'En cours',
    'shipped' => 'Envoyée',
    'delivered' => 'Terminée',
    'cancelled' => 'Annulée',
];

// Supprimer un jeu
if ($action === 'delete_game' && isset($_GET['id'])) {
    $db->prepare("DELETE FROM games WHERE id = ?")->execute([(int)$_GET['id']]);
    $message = '<div class="alert alert-success"> Jeu supprimé.</div>';
    $action = 'games';
}

// Ajouter un jeu
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_game'])) {
    $fields = ['title','slug','short_description','description','price','old_price','stock','category_id','platform_id','publisher','release_date','rating'];
    $values = [];
    foreach ($fields as $f) {
        $values[$f] = trim($_POST[$f] ?? '');
        if ($values[$f] === '') $values[$f] = null;
    }
    $values['is_featured'] = isset($_POST['is_featured']) ? 1 : 0;
    $values['is_new'] = isset($_POST['is_new']) ? 1 : 0;

    $db->prepare("INSERT INTO games (title,slug,short_description,description,price,old_price,stock,category_id,platform_id,publisher,release_date,rating,is_featured,is_new) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
       ->execute(array_values($values));
    $message = '<div class="alert alert-success"> Jeu ajouté avec succès !</div>';
    $action = 'games';
}

// Mise à jour statut commande
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_order'])) {
    $allowedStatuses = array_keys($statusLabels);
    $status = $_POST['status'] ?? '';
    if (in_array($status, $allowedStatuses, true)) {
        $db->prepare("UPDATE orders SET status = ? WHERE id = ?")
           ->execute([$status, (int)$_POST['order_id']]);
        $message = '<div class="alert alert-success">Statut de la commande mis à jour.</div>';
    } else {
        $message = '<div class="alert alert-error">Statut de commande invalide.</div>';
    }
    $action = 'orders';
}

// Ajouter des unités au stock existant.
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_stock'])) {
    $gameId = (int)($_POST['game_id'] ?? 0);
    $quantity = filter_var($_POST['stock_quantity'] ?? null, FILTER_VALIDATE_INT);
    if ($gameId > 0 && $quantity !== false && $quantity > 0 && $quantity <= 100000) {
        $stockUpdate = $db->prepare('UPDATE games SET stock = stock + ? WHERE id = ?');
        $stockUpdate->execute([$quantity, $gameId]);
        $message = $stockUpdate->rowCount()
            ? '<div class="alert alert-success">Stock ajouté.</div>'
            : '<div class="alert alert-error">Produit introuvable ou quantité invalide.</div>';
    } else {
        $message = '<div class="alert alert-error">Saisissez une quantité positive valide.</div>';
    }
    $action = 'stock';
}

$games_list = $db->query("SELECT g.*, p.name as platform_name, c.name as category_name FROM games g LEFT JOIN platforms p ON g.platform_id = p.id LEFT JOIN categories c ON g.category_id = c.id ORDER BY g.id DESC")->fetchAll();
$orderItems = [];
if ($action === 'orders') {
    $itemsStmt = $db->query("SELECT order_id, title, quantity FROM order_items oi JOIN games g ON g.id = oi.game_id ORDER BY order_id DESC, oi.id");
    foreach ($itemsStmt->fetchAll() as $item) {
        $orderItems[$item['order_id']][] = $item;
    }
}
$categories = $db->query("SELECT * FROM categories")->fetchAll();
$platforms = $db->query("SELECT * FROM platforms")->fetchAll();
$users_list = $db->query("SELECT * FROM users ORDER BY created_at DESC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - <?= SITE_NAME ?></title>
    <link rel="stylesheet" href="<?= SITE_URL ?>/assets/css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        .admin-wrapper { display: grid; grid-template-columns: 220px 1fr; min-height: 100vh; }
        .admin-sidebar { background: #182236; border-right: 1px solid #2F4A63; padding: 20px; }
        .admin-logo { font-family: Orbitron; font-size: 18px; font-weight: 900; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 1px solid var(--border); }
        .admin-logo span { color: var(--accent); }
        .admin-nav a { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; color: var(--text-muted); font-weight: 600; margin-bottom: 4px; transition: all 0.2s; }
        .admin-nav a:hover, .admin-nav a.active { background: #2F4A63; color: #CFEAE0; }
        .admin-content { padding: 30px; background: #131B2B; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { text-align: left; padding: 12px 15px; background: var(--bg-card); border-bottom: 2px solid var(--border); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); }
        .data-table td { padding: 12px 15px; border-bottom: 1px solid var(--border); font-size: 14px; }
        .data-table tr:hover td { background: rgba(255,255,255,0.03); }
        .status-badge { padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }
        .status-pending { background: rgba(245,158,11,0.2); color: #f59e0b; }
        .status-processing { background: rgba(6,182,212,0.2); color: #06b6d4; }
        .status-shipped { background: rgba(91,145,163,0.2); color: #CFEAE0; }
        .status-delivered { background: rgba(34,197,94,0.2); color: #22c55e; }
        .status-cancelled { background: rgba(239,68,68,0.2); color: #ef4444; }
        .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
        .modal-bg { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 1000; align-items: center; justify-content: center; }
        .modal-bg.open { display: flex; }
        .modal { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 30px; max-width: 650px; width: 90%; max-height: 90vh; overflow-y: auto; }
    </style>
</head>
<body>
<div class="admin-wrapper">
    <!-- Sidebar -->
    <aside class="admin-sidebar">
        <div class="admin-logo">A2SIL <small style="font-family: Rajdhani; font-size: 12px; color: var(--text-muted);">Admin</small></div>
        <nav class="admin-nav">
            <a href="?action=dashboard" class="<?= $action === 'dashboard' ? 'active' : '' ?>">Tableau de bord</a>
            <a href="?action=games" class="<?= $action === 'games' ? 'active' : '' ?>">Produits</a>
            <a href="?action=stock" class="<?= $action === 'stock' ? 'active' : '' ?>">Gestion du stock</a>
            <a href="?action=orders" class="<?= $action === 'orders' ? 'active' : '' ?>">Commandes</a>
            <a href="?action=users" class="<?= $action === 'users' ? 'active' : '' ?>">Utilisateurs</a>
            <a href="../index.php" style="margin-top: 20px; border-top: 1px solid var(--border); padding-top: 20px;">Voir le site</a>
            <a href="../pages/logout.php" style="color: var(--danger);">Déconnexion</a>
        </nav>
    </aside>

    <!-- Contenu -->
    <main class="admin-content">
        <?= $message ?>

        <?php if ($action === 'dashboard'): ?>
            <div class="admin-header">
                <h1 style="font-family: Orbitron; font-size: 22px;">Tableau de bord</h1>
                <span style="color: var(--text-muted); font-size: 13px;">Bienvenue, <?= htmlspecialchars($_SESSION['username'] ?? 'Admin') ?></span>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value" style="color: var(--accent2);"><?= number_format($totalRevenue, 0, ',', ' ') ?> DH</div>
                    <div class="stat-label">Chiffre d'affaires</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: var(--primary);"><?= $totalOrders ?></div>
                    <div class="stat-label">Commandes</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: var(--accent);"><?= $totalGames ?></div>
                    <div class="stat-label">Produits</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: var(--success);"><?= $totalUsers ?></div>
                    <div class="stat-label">Clients</div>
                </div>
            </div>

            <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 20px;">
                <h3 style="margin-bottom: 20px;">Dernières commandes</h3>
                <table class="data-table">
                    <thead><tr><th>#</th><th>Client</th><th>Total</th><th>Statut</th><th>Date</th></tr></thead>
                    <tbody>
                        <?php foreach (array_slice($recentOrders, 0, 5) as $order): ?>
                            <tr>
                                <td>#<?= $order['id'] ?></td>
                                <td><?= htmlspecialchars($order['username'] ?? 'Invité') ?></td>
                                <td style="color: var(--accent2); font-weight: 700;"><?= number_format($order['total'], 2) ?> DH</td>
                                <td><span class="status-badge status-<?= $order['status'] ?>"><?= htmlspecialchars($statusLabels[$order['status']] ?? $order['status']) ?></span></td>
                                <td style="color: var(--text-muted); font-size: 13px;"><?= date('d/m/Y', strtotime($order['created_at'])) ?></td>
                            </tr>
                        <?php endforeach; ?>
                        <?php if (empty($recentOrders)): ?>
                            <tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Aucune commande</td></tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>

        <?php elseif ($action === 'games'): ?>
            <div class="admin-header">
                <h1 style="font-family: Orbitron; font-size: 22px;">Produits</h1>
                <button onclick="document.getElementById('addGameModal').classList.add('open')" class="btn btn-primary">+ Ajouter un produit</button>
            </div>

            <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden;">
                <table class="data-table">
                    <thead><tr><th>#</th><th>Titre</th><th>Plateforme</th><th>Genre</th><th>Prix</th><th>Stock</th><th>Actions</th></tr></thead>
                    <tbody>
                        <?php foreach ($games_list as $g): ?>
                            <tr>
                                <td><?= $g['id'] ?></td>
                                <td style="font-weight: 600;"><?= htmlspecialchars($g['title']) ?></td>
                                <td><?= htmlspecialchars($g['platform_name'] ?? '-') ?></td>
                                <td><?= htmlspecialchars($g['category_name'] ?? '-') ?></td>
                                <td style="color: var(--accent2); font-weight: 700;"><?= number_format($g['price'], 2) ?> DH</td>
                                <td>
                                    <span style="color: <?= $g['stock'] > 0 ? 'var(--success)' : 'var(--danger)' ?>">
                                        <?= $g['stock'] ?>
                                    </span>
                                </td>
                                <td>
                                    <a href="?action=delete_game&id=<?= $g['id'] ?>" class="btn btn-danger btn-sm" onclick="return confirm('Supprimer ce produit ?')">Supprimer</a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

            <!-- Modal Ajouter Jeu -->
            <div id="addGameModal" class="modal-bg" onclick="if(event.target===this)this.classList.remove('open')">
                <div class="modal">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                        <h2 style="font-family: Orbitron; font-size: 18px;">Ajouter un produit</h2>
                        <button onclick="document.getElementById('addGameModal').classList.remove('open')" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer;">✕</button>
                    </div>
                    <form method="POST">
                        <div class="d-grid-2">
                            <div class="form-group">
                                <label>Titre *</label>
                                <input type="text" name="title" class="form-control" required placeholder="Spider-Man 2">
                            </div>
                            <div class="form-group">
                                <label>Slug *</label>
                                <input type="text" name="slug" class="form-control" required placeholder="spider-man-2">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Description courte</label>
                            <input type="text" name="short_description" class="form-control" placeholder="Résumé en 1 ligne">
                        </div>
                        <div class="form-group">
                            <label>Description complète</label>
                            <textarea name="description" class="form-control" rows="3"></textarea>
                        </div>
                        <div class="d-grid-2">
                            <div class="form-group">
                                <label>Prix (DH) *</label>
                                <input type="number" step="0.01" name="price" class="form-control" required placeholder="69.99">
                            </div>
                            <div class="form-group">
                                <label>Ancien prix (DH)</label>
                                <input type="number" step="0.01" name="old_price" class="form-control" placeholder="79.99">
                            </div>
                        </div>
                        <div class="d-grid-2">
                            <div class="form-group">
                                <label>Stock</label>
                                <input type="number" name="stock" class="form-control" value="10">
                            </div>
                            <div class="form-group">
                                <label>Éditeur</label>
                                <input type="text" name="publisher" class="form-control" placeholder="Sony">
                            </div>
                        </div>
                        <div class="d-grid-2">
                            <div class="form-group">
                                <label>Catégorie</label>
                                <select name="category_id" class="form-control">
                                    <?php foreach ($categories as $c): ?>
                                        <option value="<?= $c['id'] ?>"><?= $c['icon'] ?> <?= htmlspecialchars($c['name']) ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Plateforme</label>
                                <select name="platform_id" class="form-control">
                                    <?php foreach ($platforms as $p): ?>
                                        <option value="<?= $p['id'] ?>"><?= htmlspecialchars($p['name']) ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                        </div>
                        <div class="d-grid-2">
                            <div class="form-group">
                                <label>Date de sortie</label>
                                <input type="date" name="release_date" class="form-control">
                            </div>
                            <div class="form-group">
                                <label>Classification PEGI</label>
                                <select name="rating" class="form-control">
                                    <option value="PEGI 3">PEGI 3</option>
                                    <option value="PEGI 7">PEGI 7</option>
                                    <option value="PEGI 12">PEGI 12</option>
                                    <option value="PEGI 16" selected>PEGI 16</option>
                                    <option value="PEGI 18">PEGI 18</option>
                                </select>
                            </div>
                        </div>
                        <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                            <label class="filter-option"><input type="checkbox" name="is_featured">  Jeu populaire</label>
                            <label class="filter-option"><input type="checkbox" name="is_new">  Nouveauté</label>
                        </div>
                        <button type="submit" name="add_game" class="btn btn-primary btn-lg btn-block"> Ajouter le Jeu</button>
                    </form>
                </div>
            </div>

        <?php elseif ($action === 'stock'): ?>
            <div class="admin-header">
                <h1 style="font-family: Orbitron; font-size: 22px;">Gestion du stock</h1>
                <span style="color: var(--text-muted);">Ajoutez les quantités reçues pour un produit.</span>
            </div>
            <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden;">
                <table class="data-table">
                    <thead><tr><th>Produit</th><th>Stock actuel</th><th>Ajouter des unités</th></tr></thead>
                    <tbody>
                        <?php foreach ($games_list as $g): ?>
                            <tr>
                                <td style="font-weight: 600;"><?= htmlspecialchars($g['title']) ?></td>
                                <td style="color: <?= (int)$g['stock'] > 0 ? 'var(--success)' : 'var(--danger)' ?>"><?= (int)$g['stock'] ?></td>
                                <td>
                                    <form method="POST" action="?action=stock" style="display:flex;align-items:center;gap:8px;max-width:280px;">
                                        <input type="hidden" name="game_id" value="<?= (int)$g['id'] ?>">
                                        <input type="number" name="stock_quantity" min="1" max="100000" step="1" class="form-control" placeholder="Quantité" required style="width:120px;">
                                        <button type="submit" name="add_stock" class="btn btn-primary btn-sm">Ajouter</button>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

        <?php elseif ($action === 'orders'): ?>
            <div class="admin-header">
                <h1 style="font-family: Orbitron; font-size: 22px;">Commandes</h1>
            </div>
            <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden;">
                <table class="data-table">
                    <thead><tr><th>#</th><th>Client</th><th>Articles</th><th>Total</th><th>Statut</th><th>Date</th><th>Modifier</th></tr></thead>
                    <tbody>
                        <?php foreach ($recentOrders as $order): ?>
                            <tr>
                                <td>#<?= $order['id'] ?></td>
                                <td><?= htmlspecialchars($order['username'] ?? 'Invité') ?><br><small style="color: var(--text-muted)"><?= htmlspecialchars($order['email'] ?? '') ?></small></td>
                                <td>
                                    <?php foreach ($orderItems[$order['id']] ?? [] as $item): ?>
                                        <div><?= htmlspecialchars($item['title']) ?> × <?= (int)$item['quantity'] ?></div>
                                    <?php endforeach; ?>
                                    <?php if (empty($orderItems[$order['id']])): ?><span style="color:var(--text-muted)">Détails indisponibles</span><?php endif; ?>
                                </td>
                                <td style="color: var(--accent2); font-weight: 700;"><?= number_format($order['total'], 2) ?> DH</td>
                                <td><span class="status-badge status-<?= $order['status'] ?>"><?= htmlspecialchars($statusLabels[$order['status']] ?? $order['status']) ?></span></td>
                                <td style="color: var(--text-muted); font-size: 13px;"><?= date('d/m/Y H:i', strtotime($order['created_at'])) ?></td>
                                <td>
                                    <form method="POST" style="display: flex; gap: 5px;">
                                        <input type="hidden" name="order_id" value="<?= $order['id'] ?>">
                                        <select name="status" class="form-control" style="padding: 5px 8px; font-size: 13px;">
                                            <?php foreach (['pending','processing','shipped','delivered','cancelled'] as $s): ?>
                                                <option value="<?= $s ?>" <?= $order['status'] === $s ? 'selected' : '' ?>><?= htmlspecialchars($statusLabels[$s]) ?></option>
                                            <?php endforeach; ?>
                                        </select>
                                        <button type="submit" name="update_order" class="btn btn-accent btn-sm">✓</button>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                        <?php if (empty($recentOrders)): ?>
                            <tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px;">Aucune commande</td></tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>

        <?php elseif ($action === 'users'): ?>
            <div class="admin-header">
                <h1 style="font-family: Orbitron; font-size: 22px;">Utilisateurs</h1>
                <span style="color: var(--text-muted);"><?= count($users_list) ?> membres</span>
            </div>
            <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden;">
                <table class="data-table">
                    <thead><tr><th>#</th><th>Utilisateur</th><th>Email</th><th>Rôle</th><th>Inscrit le</th></tr></thead>
                    <tbody>
                        <?php foreach ($users_list as $u): ?>
                            <tr>
                                <td><?= $u['id'] ?></td>
                                <td style="font-weight: 600;">
                                    @<?= htmlspecialchars($u['username']) ?>
                                    <?php if ($u['first_name']): ?><br><small style="color: var(--text-muted)"><?= htmlspecialchars($u['first_name'] . ' ' . $u['last_name']) ?></small><?php endif; ?>
                                </td>
                                <td><?= htmlspecialchars($u['email']) ?></td>
                                <td><span class="status-badge <?= $u['role'] === 'admin' ? 'status-shipped' : 'status-delivered' ?>"><?= ucfirst($u['role']) ?></span></td>
                                <td style="color: var(--text-muted); font-size: 13px;"><?= date('d/m/Y', strtotime($u['created_at'])) ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    </main>
</div>

<script src="<?= SITE_URL ?>/assets/js/main.js"></script>
</body>
</html>
