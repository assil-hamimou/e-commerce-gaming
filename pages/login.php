<?php
require_once '../config.php';

$pageTitle = 'Connexion';
$error = '';

if (isset($_SESSION['user_id'])) {
    header('Location: ../index.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        $error = 'Veuillez remplir tous les champs.';
    } else {
        $db = getDB();
        $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];

            $redirect = $_GET['redirect'] ?? '';
            if ($redirect === 'checkout') {
                header('Location: checkout.php');
            } else {
                header('Location: ../index.php');
            }
            exit;
        } else {
            $error = 'Email ou mot de passe incorrect.';
        }
    }
}

include '../includes/header.php';
?>

<div class="container">
    <div class="auth-container">
        <h2>Connexion</h2>
        <p style="text-align: center; color: var(--text-muted); margin-bottom: 25px; font-size: 14px;">
            Accédez à votre compte A2SIL
        </p>

        <?php if ($error): ?>
            <div class="alert alert-error"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>
        <?php if (isset($_GET['registered'])): ?>
            <div class="alert alert-success"> Compte créé ! Vous pouvez vous connecter.</div>
        <?php endif; ?>

        <form method="POST">
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" class="form-control" placeholder="votre@email.com" required
                       value="<?= htmlspecialchars($_POST['email'] ?? '') ?>">
            </div>
            <div class="form-group">
                <label>Mot de passe</label>
                <input type="password" name="password" class="form-control" placeholder="••••••••" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block btn-lg" style="margin-top: 10px;">
                 Se Connecter
            </button>
        </form>

        <p style="text-align: center; margin-top: 20px; color: var(--text-muted); font-size: 14px;">
            Pas encore de compte ? 
            <a href="register.php" style="color: var(--accent);">Créer un compte</a>
        </p>

        <div style="text-align: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border);">
        </div>
    </div>
</div>

<?php include '../includes/footer.php'; ?>
