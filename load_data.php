<?php
$servername = "localhost";
$username = "root"; // Update with your actual MySQL username
$password = ""; // Update with your actual MySQL password (leave empty if none)
$dbname = "dbwebkp"; // Update with your actual database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT id, keterangan, file_data FROM data_table";
$result = $conn->query($sql);

$data = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}

// Output data as JSON
echo json_encode($data);

$conn->close();
?>
