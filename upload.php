<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "stok_data";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $keterangan = $_POST['keterangan'];

    // Handle file upload
    if (isset($_FILES['excelFile']) && $_FILES['excelFile']['error'] == 0) {
        $fileTmpPath = $_FILES['excelFile']['tmp_name'];

        require 'vendor/autoload.php';
        $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($fileTmpPath);
        $sheet = $spreadsheet->getActiveSheet();
        $data = $sheet->toArray();

        // Filter and process the data
        $headers = $data[0];
        $relevantColumns = ['Plant', 'Plant Desc.', 'S.Loc Desc.', 'Material', 'Material Desc.', 'Unrestricted-Use Stock'];
        $columnIndices = array_map(function($col) use ($headers) {
            return array_search($col, $headers);
        }, $relevantColumns);

        $filteredData = array_filter($data, function($row, $index) use ($columnIndices) {
            return $index === 0 || !in_array($row[$columnIndices[0]], ['F239', 'F3BG', 'F3BT', 'F343']);
        }, ARRAY_FILTER_USE_BOTH);

        $filteredData = array_map(function($row) use ($columnIndices) {
            return array_intersect_key($row, array_flip($columnIndices));
        }, $filteredData);

        $fileData = json_encode($filteredData);

        // Save data to database
        $stmt = $conn->prepare("INSERT INTO keterangan (keterangan, file_data) VALUES (?, ?)");
        $stmt->bind_param("ss", $keterangan, $fileData);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            echo "Data saved successfully!";
        } else {
            echo "Error saving data.";
        }

        $stmt->close();
    } else {
        echo "File upload error.";
    }
}

$conn->close();
?>
