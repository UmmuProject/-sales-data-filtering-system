<?php
$servername = "localhost";
$username = "root"; 
$password = ""; 
$dbname = "dbwebkp";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$id = $_GET['id'];

$sql = "SELECT file_data FROM data_table WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$stmt->bind_result($file_data);
$stmt->fetch();

echo $file_data;

$stmt->close();
$conn->close();
?>
