<?php
header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "dbwebkp";

$id = json_decode(file_get_contents('php://input'), true)['id'] ?? '';

if (empty($id)) {
    echo json_encode(['success' => false, 'message' => 'ID is required']);
    exit;
}

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
}

$sql = "DELETE FROM data_table_realisasi2 WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Record deleted successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error deleting record: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
