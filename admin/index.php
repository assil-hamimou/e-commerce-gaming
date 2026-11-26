<?php
// The admin entry point checks access, runs the controller, and exposes its view data.
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../app/Models/AdminModel.php';
require_once __DIR__ . '/../app/Controllers/AdminController.php';

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    header('Location: ../pages/login.php');
    exit;
}

$pageTitle = 'Administration';
$viewData = (new AdminController(new AdminModel(getDB())))->handle($_GET, $_POST, $_SERVER['REQUEST_METHOD']);
extract($viewData, EXTR_SKIP);
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
        .admin-wrapper { display: grid; grid-template-columns: 240px minmax(0, 1fr); min-height: 100vh; background: #131B2B; }
        .admin-sidebar { position: sticky; top: 0; align-self: start; min-height: 100vh; background: rgba(24,34,54,.9); border-right: 1px solid rgba(207,234,224,.1); padding: 24px 18px; }
        .admin-logo { font-family: Orbitron; font-size: 18px; font-weight: 900; margin-bottom: 30px; padding: 0 8px 18px; border-bottom: 1px solid var(--border); letter-spacing: .04em; }
        .admin-logo span { color: var(--accent); }
        .admin-nav a { display: flex; align-items: center; gap: 10px; padding: 11px 12px; border-radius: 12px; color: var(--text-muted); font-weight: 600; margin-bottom: 5px; transition: background .18s ease,color .18s ease,transform .18s ease; }
        .admin-nav a:hover, .admin-nav a.active { background: #2F4A63; color: #CFEAE0; }
        .admin-nav a:hover { transform: translateX(2px); }
        .admin-content { min-width: 0; padding: clamp(20px, 4vw, 48px); background: transparent; }
        .data-table { width: 100%; min-width: 720px; border-collapse: collapse; }
        .data-table th { text-align: left; padding: 14px 15px; background: rgba(255,255,255,.025); border-bottom: 1px solid var(--border); font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: var(--text-muted); white-space: nowrap; }
        .data-table td { padding: 14px 15px; border-bottom: 1px solid rgba(207,234,224,.08); font-size: 13px; vertical-align: middle; }
        .data-table tr:hover td { background: rgba(255,255,255,0.03); }
        .admin-header h1 { font-size: clamp(22px, 3vw, 30px) !important; letter-spacing: -.03em; }
        .admin-header > span { border: 1px solid rgba(207,234,224,.1); border-radius: 999px; padding: 9px 13px; background: rgba(255,255,255,.025); }
        .stats-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
        .stat-card { border-radius: 20px; background: linear-gradient(150deg, rgba(28,41,64,.95), rgba(22,32,50,.98)); border-color: rgba(207,234,224,.1); transition: transform .18s ease,border-color .18s ease; }
        .stat-card:hover { transform: translateY(-2px); border-color: rgba(207,234,224,.22); }
        .stat-value { font-size: clamp(22px, 2.5vw, 30px); }
        .stat-label { color: #8ba8b4; }
        .admin-shortcuts { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; margin: 0 0 28px; }
        .admin-shortcut { display:flex; justify-content:space-between; align-items:center; gap:16px; padding:18px 20px; border:1px solid rgba(207,234,224,.1); border-radius:18px; background:rgba(255,255,255,.025); transition:background .18s ease,border-color .18s ease,transform .18s ease; }
        .admin-shortcut:hover { background:rgba(255,255,255,.055); border-color:rgba(207,234,224,.23); transform:translateY(-1px); }
        .admin-shortcut strong { display:block; color:#f1f7f5; font-size:14px; }
        .admin-shortcut small { display:block; margin-top:4px; color:#8ba8b4; font-size:12px; }
        .admin-shortcut b { color:#CFEAE0; font-size:20px; }
        .admin-table-panel { overflow-x:auto; border:1px solid rgba(207,234,224,.1); border-radius:20px; background:rgba(24,34,54,.7); }
        .admin-table-panel h3 { margin:0; padding:20px 20px 4px; font-size:16px; }
        .status-badge { padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }
        .status-pending { background: rgba(245,158,11,0.2); color: #f59e0b; }
        .status-processing { background: rgba(6,182,212,0.2); color: #06b6d4; }
        .status-shipped { background: rgba(91,145,163,0.2); color: #CFEAE0; }
        .status-delivered { background: rgba(34,197,94,0.2); color: #22c55e; }
        .status-cancelled { background: rgba(239,68,68,0.2); color: #ef4444; }
        /* Native selects use the browser's menu surface; define both states for readable Windows menus. */
        .admin-status-select { min-width: 142px; padding: 9px 34px 9px 12px !important; color: #f4f7fb !important; background-color: #182236 !important; border: 1px solid #55718a !important; border-radius: 10px !important; color-scheme: dark; }
        .admin-status-select option { color: #f4f7fb !important; background: #182236 !important; }
        .admin-wrapper { color-scheme: dark; }
        .admin-status-select:focus { outline: 3px solid rgba(122, 210, 190, .45); outline-offset: 1px; }
        .admin-actions { display:flex; flex-wrap:wrap; gap:10px; margin:0 0 22px; }
        .admin-action-button { display:inline-flex; align-items:center; justify-content:center; min-height:42px; padding:0 16px; border:1px solid #55718a; border-radius:11px; color:#f4f7fb; background:#24364b; font-weight:700; font-size:13px; transition:background .15s ease,border-color .15s ease; }
        .admin-action-button:hover { background:#304b63; border-color:#8eb8c3; }
        .admin-orders-form { display:flex; flex-wrap:wrap; align-items:center; gap:8px; min-width:230px; }
        .admin-orders-form .btn { min-height:38px; padding:0 13px; white-space:nowrap; }
        .admin-section-heading { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px 4px; }
        .admin-section-heading h3 { margin:0; font-size:16px; }
        .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
        .modal-bg { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 1000; align-items: center; justify-content: center; }
        .modal-bg.open { display: flex; }
        .modal { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 30px; max-width: 650px; width: 90%; max-height: 90vh; overflow-y: auto; }
        @media (max-width: 980px) { .stats-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } }
        @media (max-width: 720px) {
            .admin-wrapper { grid-template-columns: 1fr; }
            .admin-sidebar { position: relative; min-height: auto; padding: 16px; border-right: 0; border-bottom: 1px solid rgba(207,234,224,.1); }
            .admin-logo { margin-bottom: 12px; padding-bottom: 12px; }
            .admin-nav { display:flex; gap:6px; overflow-x:auto; padding-bottom:4px; }
            .admin-nav a { white-space:nowrap; margin:0; }
            .admin-content { padding:20px 16px 32px; }
            .admin-header { align-items:flex-start; flex-direction:column; gap:12px; }
            .admin-shortcuts { grid-template-columns:1fr; }
            .data-table { min-width:680px; }
        }
        @media (max-width: 420px) { .stats-grid { grid-template-columns:1fr; } }
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
                    <div class="stat-label">Montant des commandes</div>
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

            <div class="admin-shortcuts" aria-label="Raccourcis de gestion">
                <a href="?action=orders" class="admin-shortcut">
                    <span><strong>Commandes à traiter</strong><small>Consulter et mettre à jour les demandes.</small></span>
                    <b><?= (int)$pendingOrders ?></b>
                </a>
                <a href="?action=stock" class="admin-shortcut">
                    <span><strong>Produits bientôt épuisés</strong><small>Vérifier le stock à 5 unités ou moins.</small></span>
                    <b><?= (int)$lowStockCount ?></b>
                </a>
            </div>

            <div class="admin-actions" aria-label="Actions rapides">
                <a href="?action=games" class="admin-action-button">Ajouter un produit</a>
                <a href="?action=stock" class="admin-action-button">Ajouter du stock</a>
                <a href="?action=orders" class="admin-action-button">Gérer les commandes</a>
            </div>

            <div class="admin-table-panel">
                <div class="admin-section-heading"><h3>Dernières commandes</h3><a href="?action=orders" class="admin-action-button">Voir toutes</a></div>
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

            <div class="admin-table-panel">
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
            <div class="admin-table-panel">
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
            <div class="admin-table-panel">
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
                                    <form method="POST" class="admin-orders-form">
                                        <input type="hidden" name="order_id" value="<?= $order['id'] ?>">
                                        <select name="status" class="form-control admin-status-select" aria-label="Nouveau statut pour la commande <?= (int)$order['id'] ?>">
                                            <?php foreach (['pending','processing','shipped','delivered','cancelled'] as $s): ?>
                                                <option value="<?= $s ?>" style="color:#f4f7fb;background-color:#182236" <?= $order['status'] === $s ? 'selected' : '' ?>><?= htmlspecialchars($statusLabels[$s]) ?></option>
                                            <?php endforeach; ?>
                                        </select>
                                        <button type="submit" name="update_order" class="btn btn-accent btn-sm">Enregistrer</button>
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
            <div class="admin-table-panel">
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
