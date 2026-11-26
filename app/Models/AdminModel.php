<?php
/** Data access for the admin area. Keep SQL and persistence out of templates. */
final class AdminModel
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /** Return the counts and revenue shown on the admin overview. */
    public function getDashboardStats(): array
    {
        return [
            'totalGames' => (int)$this->db->query('SELECT COUNT(*) FROM games')->fetchColumn(),
            'totalUsers' => (int)$this->db->query("SELECT COUNT(*) FROM users WHERE role = 'client'")->fetchColumn(),
            'totalOrders' => (int)$this->db->query('SELECT COUNT(*) FROM orders')->fetchColumn(),
            'totalRevenue' => (float)$this->db->query("SELECT COALESCE(SUM(total), 0) FROM orders WHERE status != 'cancelled'")->fetchColumn(),
            'pendingOrders' => (int)$this->db->query("SELECT COUNT(*) FROM orders WHERE status = 'pending'")->fetchColumn(),
            'lowStockCount' => (int)$this->db->query('SELECT COUNT(*) FROM games WHERE stock <= 5')->fetchColumn(),
        ];
    }

    /** Fetch product and lookup records used by the admin views. */
    public function getCatalogData(): array
    {
        return [
            'games_list' => $this->db->query('SELECT g.*, p.name AS platform_name, c.name AS category_name FROM games g LEFT JOIN platforms p ON g.platform_id = p.id LEFT JOIN categories c ON g.category_id = c.id ORDER BY g.id DESC')->fetchAll(),
            'categories' => $this->db->query('SELECT * FROM categories')->fetchAll(),
            'platforms' => $this->db->query('SELECT * FROM platforms')->fetchAll(),
            'users_list' => $this->db->query('SELECT * FROM users ORDER BY created_at DESC')->fetchAll(),
        ];
    }

    /** Fetch recent orders and their customer information. */
    public function getRecentOrders(): array
    {
        return $this->db->query('SELECT o.*, u.username, u.email FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 10')->fetchAll();
    }

    /** Fetch line items for the orders table, indexed by order ID for the view. */
    public function getOrderItems(): array
    {
        $items = [];
        $rows = $this->db->query('SELECT order_id, title, quantity FROM order_items oi JOIN games g ON g.id = oi.game_id ORDER BY order_id DESC, oi.id')->fetchAll();
        foreach ($rows as $item) {
            $items[$item['order_id']][] = $item;
        }
        return $items;
    }

    /** Create a product from validated form fields. */
    public function addGame(array $values): void
    {
        $sql = 'INSERT INTO games (title,slug,short_description,description,price,old_price,stock,category_id,platform_id,publisher,release_date,rating,is_featured,is_new) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        $this->db->prepare($sql)->execute(array_values($values));
    }

    /** Remove a product selected by its numeric database ID. */
    public function deleteGame(int $gameId): void
    {
        $this->db->prepare('DELETE FROM games WHERE id = ?')->execute([$gameId]);
    }

    /** Set a validated order lifecycle status. */
    public function updateOrderStatus(string $status, int $orderId): void
    {
        $this->db->prepare('UPDATE orders SET status = ? WHERE id = ?')->execute([$status, $orderId]);
    }

    /** Add received units to an existing product's available stock. */
    public function addStock(int $gameId, int $quantity): bool
    {
        $statement = $this->db->prepare('UPDATE games SET stock = stock + ? WHERE id = ?');
        $statement->execute([$quantity, $gameId]);
        return $statement->rowCount() > 0;
    }
}
