<?php
require_once '../config.php';

$pageTitle = 'Créer un compte';
$error = '';
$success = '';

if (isset($_SESSION['user_id'])) {
    header('Location: ../index.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm = $_POST['confirm_password'] ?? '';
    $firstName = trim($_POST['first_name'] ?? '');
    $lastName = trim($_POST['last_name'] ?? '');

    if (empty($username) || empty($email) || empty($password)) {
        $error = 'Veuillez remplir tous les champs obligatoires.';
    } elseif ($password !== $confirm) {
        $error = 'Les mots de passe ne correspondent pas.';
    } elseif (strlen($password) < 6) {
        $error = 'Le mot de passe doit comporter au moins 6 caractères.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Email invalide.';
    } else {
        $db = getDB();
        $check = $db->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
        $check->execute([$email, $username]);
        if ($check->fetch()) {
            $error = 'Cet email ou ce nom d\'utilisateur est déjà utilisé.';
        } else {
            $hashed = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $db->prepare("INSERT INTO users (username, email, password, first_name, last_name) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$username, $email, $hashed, $firstName, $lastName]);
            header('Location: login.php?registered=1');
            exit;
        }
    }
}

include '../includes/header.php';
?>

<div class="container">
    <div class="auth-container" style="max-width: 540px;">
        <h2>Créer un Compte</h2>
        <p style="text-align: center; color: var(--text-muted); margin-bottom: 25px; font-size: 14px;">
            Créez votre compte A2SIL
        </p>

        <?php if ($error): ?>
            <div class="alert alert-error"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>

        <form method="POST">
            <div class="d-grid-2">
                <div class="form-group">
                    <label>Prénom</label>
                    <input type="text" name="first_name" class="form-control" placeholder="Jean"
                           value="<?= htmlspecialchars($_POST['first_name'] ?? '') ?>">
                </div>
                <div class="form-group">
                    <label>Nom</label>
                    <input type="text" name="last_name" class="form-control" placeholder="Dupont"
                           value="<?= htmlspecialchars($_POST['last_name'] ?? '') ?>">
                </div>
            </div>
            <div class="form-group">
                <label>Nom d'utilisateur *</label>
                <input type="text" name="username" class="form-control" placeholder="gamer123" required
                       value="<?= htmlspecialchars($_POST['username'] ?? '') ?>">
            </div>
            <div class="form-group">
                <label>Email *</label>
                <input type="email" name="email" class="form-control" placeholder="votre@email.com" required
                       value="<?= htmlspecialchars($_POST['email'] ?? '') ?>">
            </div>
            <div class="d-grid-2">
                <div class="form-group">
                    <label>Mot de passe *</label>
                    <input type="password" name="password" class="form-control" placeholder="Min. 6 caractères" required>
                </div>
                <div class="form-group">
                    <label>Confirmer *</label>
                    <input type="password" name="confirm_password" class="form-control" placeholder="••••••••" required>
                </div>
            </div>

            <button type="submit" class="btn btn-primary btn-block btn-lg" style="margin-top: 10px;">
                 Créer mon Compte
            </button>
        </form>

        <p style="text-align: center; margin-top: 20px; color: var(--text-muted); font-size: 14px;">
            Déjà un compte ? <a href="login.php" style="color: var(--accent);">Se connecter</a>
        </p>
    </div>
</div>

<?php include '../includes/footer.php'; ?>
