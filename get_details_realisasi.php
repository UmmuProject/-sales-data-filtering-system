<?php
header('Content-Type: application/json');

$host = 'localhost';
$username = 'root';
$password = '';
$database = 'dbwebkp';

try {
    $conn = new mysqli($host, $username, $password, $database);
    if ($conn->connect_error) {
        throw new Exception('Koneksi gagal: ' . $conn->connect_error);
    }

    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if ($id <= 0) {
        throw new Exception('ID tidak valid');
    }

    $sql = "SELECT file_data FROM data_table_realisasi2 WHERE id = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception('Prepare statement failed: ' . $conn->error);
    }

    $stmt->bind_param('i', $id);
    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }

    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        throw new Exception('Data tidak ditemukan');
    }

    $row = $result->fetch_assoc();
    $fileData = json_decode($row['file_data'], true);
    
    if ($fileData === null) {
        throw new Exception('Data JSON tidak valid di database: ' . json_last_error_msg());
    }

    // Skip header row and process data
    $data = array_slice($fileData, 1);
    
    echo json_encode([
        'success' => true,
        'data' => $data
    ]);

} catch (Exception $e) {
    error_log('Error in get_details_realisasi.php: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
}
?>