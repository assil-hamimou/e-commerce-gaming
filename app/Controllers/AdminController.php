<?php
/** Handles admin requests and prepares plain data for the admin view. */
final class AdminController
{
    private const GAME_FIELDS = ['title','slug','short_description','description','price','old_price','stock','category_id','platform_id','publisher','release_date','rating'];
    private const ORDER_STATUSES = ['pending','processing','shipped','delivered','cancelled'];
    private $model;

    public function __construct(AdminModel $model)
    {
        $this->model = $model;
    }

    /** Process the requested admin action and return the view data it needs. */
    public function handle(array $get, array $post, string $method): array
    {
        $action = $get['action'] ?? 'dashboard';
        $message = '';
        $statusLabels = ['pending' => 'En attente', 'processing' => 'En cours', 'shipped' => 'Envoyée', 'delivered' => 'Terminée', 'cancelled' => 'Annulée'];

        // Route product creation, order updates, and stock receipts to the model.
        if ($method === 'POST' && isset($post['add_game'])) {
            $values = [];
            foreach (self::GAME_FIELDS as $field) {
                $value = trim($post[$field] ?? '');
                $values[$field] = $value === '' ? null : $value;
            }
            $values['is_featured'] = isset($post['is_featured']) ? 1 : 0;
            $values['is_new'] = isset($post['is_new']) ? 1 : 0;
            $this->model->addGame($values);
            $message = '<div class="alert alert-success">Jeu ajouté avec succès !</div>';
            $action = 'games';
        } elseif ($method === 'POST' && isset($post['update_order'])) {
            $status = $post['status'] ?? '';
            if (in_array($status, self::ORDER_STATUSES, true)) {
                $this->model->updateOrderStatus($status, (int)($post['order_id'] ?? 0));
                $message = '<div class="alert alert-success">Statut de la commande mis à jour.</div>';
            } else {
                $message = '<div class="alert alert-error">Statut de commande invalide.</div>';
            }
            $action = 'orders';
        } elseif ($method === 'POST' && isset($post['add_stock'])) {
            $gameId = filter_var($post['game_id'] ?? null, FILTER_VALIDATE_INT);
            $quantity = filter_var($post['stock_quantity'] ?? null, FILTER_VALIDATE_INT);
            if ($gameId && $quantity && $gameId > 0 && $quantity > 0 && $quantity <= 100000) {
                $message = $this->model->addStock($gameId, $quantity)
                    ? '<div class="alert alert-success">Stock ajouté.</div>'
                    : '<div class="alert alert-error">Produit introuvable ou quantité invalide.</div>';
            } else {
                $message = '<div class="alert alert-error">Saisissez une quantité positive valide.</div>';
            }
            $action = 'stock';
        } elseif ($action === 'delete_game' && isset($get['id'])) {
            $this->model->deleteGame((int)$get['id']);
            $message = '<div class="alert alert-success">Jeu supprimé.</div>';
            $action = 'games';
        }

        // Load shared page data after writes so the view shows the latest values.
        $catalogData = $this->model->getCatalogData();
        return array_merge($this->model->getDashboardStats(), $catalogData, [
            'action' => $action,
            'message' => $message,
            'statusLabels' => $statusLabels,
            'recentOrders' => $this->model->getRecentOrders(),
            'orderItems' => $action === 'orders' ? $this->model->getOrderItems() : [],
        ]);
    }
}
