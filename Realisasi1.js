let dataStorage = [];
document.addEventListener('DOMContentLoaded', loadData);
document.getElementById('addButton').addEventListener('click', () => {
    document.getElementById('uploadFormContainer').style.display = 'block';
});
document.getElementById('saveButton').addEventListener('click', saveDataToServer, false);
document.getElementById('uploadForm').addEventListener('submit', handleFormSubmit);

function handleFormSubmit(event) {
    event.preventDefault();
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

        const headers = json[0];
        const relevantColumns = ['Provinsi Distributor', 'Gudang SO Deskripsi', 'Nama Distributor', 'Deskripsi Material', 'Outstanding SO', 'Quantity SO', 'Tanggal SO Released'];
        const columnIndices = relevantColumns.map(col => headers.indexOf(col));

        const missingColumns = relevantColumns.filter((col, index) => columnIndices[index] === -1);

        if (missingColumns.length > 0) {
            alert(`File yang diunggah kehilangan kolom berikut: ${missingColumns.join(', ')}`);
            return;
        }

        const filteredData = json.map(row => {
            return columnIndices.map((index, i) => {
                let cellValue = row[index];
                if (i === relevantColumns.indexOf('Tanggal SO Released') && !isNaN(cellValue)) {
                    const date = new Date((cellValue - 25569) * 86400 * 1000);
                    return date.toISOString().split('T')[0];
                }
                return cellValue;
            });
        });

        const fileData = JSON.stringify([relevantColumns, ...filteredData.slice(1)]);

        const dataToSave = {
            keterangan: keterangan,
            fileData: fileData
        };

        // Save data to the server
        saveDataToServer(dataToSave);

        document.getElementById('uploadForm').reset();
        document.getElementById('uploadFormContainer').style.display = 'none';
        alert('Data berhasil disimpan.');
    };

    reader.readAsArrayBuffer(file);
}

function saveDataToServer(data) {
    fetch('save_data_realisasi.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            loadData();
        } else {
            alert('Error saving data');
        }
    })
    .catch(error => console.error('Error:', error));
}

function loadData() {
    fetch('load_data_realisasi.php')
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            dataStorage = result.data;
            displayData();
        } else {
            alert('Error loading data');
        }
    })
    .catch(error => console.error('Error:', error));
}

function displayData() {
    const tableBody = document.querySelector('#keteranganTable tbody');
    tableBody.innerHTML = '';

    dataStorage.forEach((data, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${data.keterangan}</td>
            <td>
                <button onclick="viewDetails(${index})">Details</button>
                <button onclick="deleteData(${index})">Delete</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function viewDetails(index) {
    const dataId = dataStorage[index].id;

    fetch(`get_details_realisasi.php?id=${encodeURIComponent(dataId)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(result => {
            console.log('Raw response:', result);
            if (result.success) {
                const data = result.data;
                console.log('Processed data:', data);

                const detailWindow = window.open('', '_blank');
                detailWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Details Realisasi</title>
                        <meta charset="UTF-8">
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                margin: 20px;
                                padding: 0;
                                background-color: #f8f9fa;
                            }
                            .container {
                                max-width: 1200px;
                                margin: 0 auto;
                                background-color: white;
                                padding: 30px;
                                border-radius: 8px;
                                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                            }
                            h1 {
                                color: #333;
                                margin-bottom: 20px;
                                text-align: center;
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-top: 20px;
                                background-color: white;
                                border-radius: 8px;
                                overflow: hidden;
                                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                            }
                            th, td {
                                padding: 15px;
                                text-align: left;
                                border-bottom: 1px solid #ddd;
                                font-size: 14px;
                            }
                            th {
                                background-color: #f4f6f8;
                                font-weight: bold;
                                color: #333;
                                text-transform: uppercase;
                            }
                            tr:hover {
                                background-color: #f5f5f5;
                            }
                            #filterContainer {
                                display: flex;
                                gap: 15px;
                                margin: 20px 0;
                                padding: 15px;
                                border: 1px solid #ddd;
                                background-color: #f9f9f9;
                                border-radius: 6px;
                                flex-wrap: nowrap;
                            }
                            .filter-group {
                                display: flex;
                                flex-direction: column;
                                gap: 5px;
                                width: 18%;
                            }
                            label {
                                font-weight: bold;
                                color: #555;
                                font-size: 14px;
                            }
                            select {
                                padding: 8px;
                                border: 1px solid #ddd;
                                border-radius: 4px;
                                font-size: 14px;
                                min-width: 150px;
                            }
                            select:focus {
                                outline: none;
                                border-color: #4a90e2;
                                box-shadow: 0 0 5px rgba(74,144,226,0.2);
                            }
                            #totalsRow {
                                font-weight: bold;
                                background-color: #f4f6f8;
                            }
                            .number-cell {
                                text-align: right;
                                font-weight: bold;
                                color: #2d3e50;
                                padding-right: 20px;
                            }
                            .number-cell:hover {
                                background-color: #f1f1f1;
                            }
                            td, th {
                                border: 1px solid #ddd;
                                padding: 12px;
                            }
                            .filter-group select {
                                width: 100%;
                            }
                        </style>
                    </head>
                    <body>
                    <div class="container">
                        <h1>Details Realisasi</h1>
                        
                        <div id="filterContainer">
                            <div class="filter-group">
                                <label for="provinceFilter">Provinsi:</label>
                                <select id="provinceFilter" onchange="filterData()">
                                    <option value="">Semua Provinsi</option>
                                    ${Array.from(new Set(data.map(row => row[0]))).sort().map(province => 
                                        `<option value="${province}">${province}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <label for="gudangFilter">Gudang:</label>
                                <select id="gudangFilter" onchange="filterData()">
                                    <option value="">Semua Gudang</option>
                                    ${Array.from(new Set(data.map(row => row[1]))).sort().map(gudang => 
                                        `<option value="${gudang}">${gudang}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <label for="materialFilter">Material:</label>
                                <select id="materialFilter" onchange="filterData()">
                                    <option value="">Semua Material</option>
                                    ${Array.from(new Set(data.map(row => row[3]))).sort().map(material => 
                                        `<option value="${material}">${material}</option>`
                                    ).join('')}
                                </select>
                            </div>

                            <div class="filter-group">
                                <label for="monthFilter">Bulan:</label>
                                <select id="monthFilter" onchange="filterData()">
                                    <option value="">Semua Bulan</option>
                                    ${Array.from(new Set(data.map(row => row[6].split('-')[1]))).sort().map(month => 
                                        `<option value="${month}">${month}</option>`
                                    ).join('')}
                                </select>
                            </div>

                            <div class="filter-group">
                                <label for="yearFilter">Tahun:</label>
                                <select id="yearFilter" onchange="filterData()">
                                    <option value="">Semua Tahun</option>
                                    ${Array.from(new Set(data.map(row => row[6].split('-')[0]))).sort().map(year => 
                                        `<option value="${year}">${year}</option>`
                                    ).join('')}
                                </select>
                            </div>
                        </div>

                        <table id="detailTable">
                            <thead>
                                <tr>
                                    <th>Provinsi</th>
                                    <th>Gudang</th>
                                    <th>Distributor</th>
                                    <th>Material</th>
                                    <th class="number-cell">Outstanding SO</th>
                                    <th class="number-cell">Quantity SO</th>
                                    <th>Tanggal SO</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.map(row => `
                                    <tr>
                                        <td>${row[0]}</td>
                                        <td>${row[1]}</td>
                                        <td>${row[2]}</td>
                                        <td>${row[3]}</td>
                                        <td class="number-cell">${Number(row[4]).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td class="number-cell">${Number(row[5]).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td>${row[6]}</td>
                                    </tr>
                                `).join('')}
                                <tr id="totalsRow">
                                    <td colspan="4" style="text-align: right"><strong>Total:</strong></td>
                                    <td class="number-cell" id="totalOutstandingSO"></td>
                                    <td class="number-cell" id="totalQuantitySO"></td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <script>
                        function filterData() {
                            const selectedProvince = document.getElementById('provinceFilter').value;
                            const selectedGudang = document.getElementById('gudangFilter').value;
                            const selectedMaterial = document.getElementById('materialFilter').value;
                            const selectedMonth = document.getElementById('monthFilter').value;
                            const selectedYear = document.getElementById('yearFilter').value;

                            const table = document.getElementById('detailTable');
                            const rows = table.getElementsByTagName('tr');
                            let totalOutstandingSO = 0;
                            let totalQuantitySO = 0;

                            for (let i = 1; i < rows.length - 1; i++) {
                                const cells = rows[i].getElementsByTagName('td');
                                if (cells.length === 0) continue;

                                const provinceMatch = !selectedProvince || cells[0].textContent === selectedProvince;
                                const gudangMatch = !selectedGudang || cells[1].textContent === selectedGudang;
                                const materialMatch = !selectedMaterial || cells[3].textContent === selectedMaterial;
                                const date = cells[6].textContent;
                                const monthMatch = !selectedMonth || date.split('-')[1] === selectedMonth;
                                const yearMatch = !selectedYear || date.split('-')[0] === selectedYear;

                                if (provinceMatch && gudangMatch && materialMatch && monthMatch && yearMatch) {
                                    rows[i].style.display = '';
                                    
                                    const outstanding = parseFloat(cells[4].textContent.replace(/,/g, '').trim());
                                    const quantity = parseFloat(cells[5].textContent.replace(/,/g, '').trim());
                                    
                                    if (!isNaN(outstanding)) totalOutstandingSO += outstanding;
                                    if (!isNaN(quantity)) totalQuantitySO += quantity;
                                } else {
                                    rows[i].style.display = 'none';
                                }
                            }

                            document.getElementById('totalOutstandingSO').textContent = 
                                totalOutstandingSO.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                            document.getElementById('totalQuantitySO').textContent = 
                                totalQuantitySO.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        }

                        filterData();
                    </script>
                    </body>
                    </html>
                `);
                detailWindow.document.close();
            } else {
                console.error('Error:', result.message);
                alert('Error mengambil data: ' + result.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error: ' + error.message);
        });
}


function deleteData(index) {
    if (confirm('Are you sure you want to delete this data?')) {
        fetch('delete_data_realisasi.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: dataStorage[index].id })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                loadData();
            } else {
                alert('Error deleting data');
            }
        })
        .catch(error => console.error('Error:', error));
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
