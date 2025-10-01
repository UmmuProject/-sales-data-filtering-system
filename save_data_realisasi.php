<?php
header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "dbwebkp";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
}

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['keterangan']) && isset($data['fileData'])) {
    $keterangan = $conn->real_escape_string($data['keterangan']);
    $fileData = $conn->real_escape_string($data['fileData']);

    // Insert data into table
    $sql = "INSERT INTO data_table_realisasi2 (keterangan, file_data) VALUES ('$keterangan', '$fileData')";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(['success' => true, 'message' => 'New record created successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $sql . '<br>' . $conn->error]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
}

$conn->close();
?>

