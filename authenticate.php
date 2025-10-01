<?php
// Konfigurasi database
$host = 'localhost';
$dbname = 'ummu_login';
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
    $stmt = $pdo->prepare("SELECT * FROM table_login WHERE username = :username");
    $stmt->bindParam(':username', $inputUsername);
    $stmt->execute();

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($inputPassword, $user['password'])) {
        // Jika autentikasi berhasil
        header("Location: index.html");
        exit();
    } else {
        // Jika autentikasi gagal
        header("Location: Login.html?error=Username atau Password salah");
        exit();
    }
}
?>
