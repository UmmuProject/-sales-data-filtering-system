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

// Get data from POST request
$keterangan = $_POST['keterangan'];
$fileData = $_POST['fileData'];

// Prepare and bind
$stmt = $conn->prepare("INSERT INTO data_table (keterangan, file_data) VALUES (?, ?)");
$stmt->bind_param("ss", $keterangan, $fileData);

// Execute the statement
if ($stmt->execute()) {
    echo "New record created successfully";
} else {
    echo "Error: " . $stmt->error;
}

// Close connection
$stmt->close();
$conn->close();
?>
