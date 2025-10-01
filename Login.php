<?php
// Konfigurasi database
$host = 'localhost';
$dbname = 'dbwebkp';
$username = 'root';
$password = ''; // Ganti sesuai konfigurasi database Anda

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Koneksi ke database gagal: " . $e->getMessage());
}

// Tangkap data dari form login
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $inputUsername = $_POST['username'];
    $inputPassword = $_POST['password'];

    // Query untuk memeriksa username dan password
    $stmt = $pdo->prepare("SELECT * FROM table_login WHERE username = :username AND password = :password");
    $stmt->bindParam(':username', $inputUsername);
    $stmt->bindParam(':password', $inputPassword);
    $stmt->execute();

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Jika autentikasi berhasil
        session_start();
        $_SESSION['user_id'] = $user['id_user']; // Menggunakan id_user sesuai struktur database
        $_SESSION['username'] = $user['username'];
        header("Location: index.html");
        exit();
    } else {
        // Jika autentikasi gagal
        $error = "Username atau Password salah";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Page</title>
    <link rel="stylesheet" href="Login.css">
</head>
<body>
    <div class="background">
        <video autoplay muted loop id="bg-video">
            <source src="BgVid.mp4" type="video/mp4">
            Your browser does not support the video tag.
        </video>
        <div class="login-container">
            <div class="logo">
                <img src="Logo.png" alt="Pusri Logo">
            </div>
            <form class="login-form" method="POST">
                <div class="input-group">
                    <input type="text" id="username" name="username" placeholder="Username" required>
                </div>
                <div class="input-group">
                    <input type="password" id="password" name="password" placeholder="Password" required>
                </div>
                <div class="show-password">
                    <input type="checkbox" id="show-password" onclick="togglePassword()">
                    <label for="show-password">Show Password</label>
                </div>
                <button type="submit" class="login-button">Login</button>
                <?php if (isset($error)): ?>
                    <div class="error-message"><?php echo htmlspecialchars($error); ?></div>
                <?php endif; ?>
            </form>
        </div>
    </div>
    <script>
    function togglePassword() {
        const passwordField = document.getElementById('password');
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
        } else {
            passwordField.type = 'password';
        }
    }
    </script>
</body>
</html>