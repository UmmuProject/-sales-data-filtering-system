document.addEventListener('DOMContentLoaded', loadDataFromServer);

document.getElementById('addButton').addEventListener('click', () => {
    document.getElementById('uploadFormContainer').style.display = 'block';
});

function handleFormSubmit() {
    const keterangan = document.getElementById('keterangan').value;
    const fileInput = document.getElementById('excelFile');
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Get column indices for relevant columns
        const headers = json[0];
        const relevantColumns = ['Plant', 'Plant Desc.', 'S.Loc Desc.', 'Material', 'Material Desc.', 'Unrestricted-Use Stock'];
        const columnIndices = relevantColumns.map(col => headers.indexOf(col));

       // Hapus filter, kirim semua data
const filteredData = json
.map(row => columnIndices.map(index => row[index]));

        // Send data to server
        fetch('save_data.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                keterangan: keterangan,
                fileData: JSON.stringify(filteredData)
            })
        }).then(response => response.text())
          .then(result => {
              alert(result);
              loadDataFromServer(); // Refresh the data on the page
          });

        document.getElementById('uploadForm').reset();
        document.getElementById('uploadFormContainer').style.display = 'none';
    };

    reader.readAsArrayBuffer(file);
}

function loadDataFromServer() {
    fetch('load_data.php')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#keteranganTable tbody');
            tableBody.innerHTML = '';

            data.forEach((dataItem) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${dataItem.keterangan}</td>
                    <td>
                        <button onclick="viewDetails(${dataItem.id})">Details</button>
                        <button onclick="deleteData(${dataItem.id})">Delete</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        });
}

function viewDetails(id) {
    fetch(`get_details.php?id=${id}`)
        .then(response => response.json())
        .then(data => {
            // Debug: Tampilkan struktur data awal
            console.log("Data awal:", data);
        
            // Temukan indeks kolom 'Plant'
            const plantColumnIndex = data[0].findIndex(header => header === 'Plant');
            console.log("Indeks kolom 'Plant':", plantColumnIndex);
    
            // Debug: Tampilkan beberapa baris data untuk memastikan struktur
            console.log("Contoh baris data:", data[1]);
            
            // Filter data untuk menghapus baris dengan 'Plant' yang tidak diinginkan
            const filteredData = data.filter((row, index) => {
                if (index === 0) return true; // Baris header tetap
                const plantCode = row[plantColumnIndex];
                return !['F239', 'F3BG', 'F3BT', 'F343'].includes(plantCode);
            });
    
            // Debug: Tampilkan hasil filter
            console.log("Data setelah filter:", filteredData);
    
            // Membuka jendela baru untuk menampilkan detail
            const detailWindow = window.open('', '_blank');
            detailWindow.document.write('<html><head><title>Details</title><style>body{font-family: Arial, sans-serif;}table{width: 100%; border-collapse: collapse;}th, td{padding: 8px; text-align: left; border-bottom: 1px solid #ddd;}th{background-color: #f2f2f2;}tr:hover{background-color: #f5f5f5;}#searchInput, #filterColumn{margin-bottom: 12px; padding: 8px; border: 1px solid #ddd;}</style></head><body>');
            detailWindow.document.write(`
                <label for="filterColumn">Filter by:</label>
                <select id="filterColumn">
                    ${data[0].map((header, index) => `<option value="${index}">${header}</option>`).join('')}
                </select>
                <input type="text" id="searchInput" onkeyup="filterTable()" placeholder="Search...">
                <table id="detailTable" border="1">
                    <thead>
                        <tr>
                            ${data[0].map(header => `<th>${header}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredData.slice(1).map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
                    </tbody>
                </table>
                <script>
                    function filterTable() {
                        const input = document.getElementById('searchInput').value.toLowerCase();
                        const filterColumn = document.getElementById('filterColumn').value;
                        const rows = document.querySelectorAll('#detailTable tbody tr');

                        rows.forEach(row => {
                            const cells = row.querySelectorAll('td');
                            const cellText = cells[filterColumn].textContent.toLowerCase();
                            row.style.display = cellText.includes(input) ? '' : 'none';
                        });
                    }
                </script>
            `);
            detailWindow.document.write('</body></html>');
        });
}


function deleteData(id) {
    if (confirm('Are you sure you want to delete this data?')) {
        fetch('delete_data.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ id: id })
        }).then(response => response.text())
          .then(result => {
              alert(result);
              loadDataFromServer(); // Refresh the data on the page
          });
    }
}

function openSidebar() {
    document.querySelector('.sidebar').style.width = '250px';
    document.querySelector('.main-content').style.marginLeft = '250px';
}

function closeSidebar() {
    document.querySelector('.sidebar').style.width = '0';
    document.querySelector('.main-content').style.marginLeft = '0';
}

function toggleSubmenu(event) {
    event.preventDefault();
    const submenu = event.target.nextElementSibling;
    submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
}