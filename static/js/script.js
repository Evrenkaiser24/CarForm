// Función para poner el precio en moneda mexicana
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
}

let currentFilter = '';

// filtro para la barra de busqueda de la tabla
function filterTable(query) {
    const tableBody = document.getElementById('carsTableBody');
    if (!tableBody) return;
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    const q = (query || '').trim().toLowerCase();
    rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length === 0) return;
        const dataCells = cells.slice(0, -1);
        const text = dataCells.map(td => td.innerText.trim().toLowerCase()).join(' ');
        if (!q) {
            row.style.display = '';
        } else {
            row.style.display = text.includes(q) ? '' : 'none';
        }
    });
}
// funcion para cargar los autos desde la API
async function loadCars() {
    try {
        const response = await fetch('/api/cars');
        const cars = await response.json();
        displayCars(cars);
    } catch (error) {
        console.error('Error loading cars:', error);
    }
}

// funcion para mostrar los autos en la tabla
function displayCars(cars) {
    const tableBody = document.getElementById('carsTableBody');
    tableBody.innerHTML = '';
    cars.forEach(car => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-uppercase">${car.make}</td>
            <td class="text-uppercase">${car.model}</td>
            <td>${car.year}</td>
            <td class="text-uppercase">${car.color}</td>
            <td>${formatCurrency(car.cost)}</td>
            <td>${car.engine}</td>
            <td>${car.doors}</td>
            <td>
                <button type="button" class="btn btn-warning btn-sm me-2" onclick="editCar('${car._id}')" aria-label="Editar ${car.make} ${car.model}"><i class="bi bi-pencil me-1"></i>Editar</button><br>
                <button type="button" class="btn btn-danger btn-sm" onclick="deleteCar('${car._id}')" aria-label="Eliminar ${car.make} ${car.model}"><i class="bi bi-trash me-1"></i>Eliminar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    if (currentFilter) filterTable(currentFilter);
}

let editingCarId = null;

window.editCar = function(id) {
    fetch(`/api/cars/${id}`)
        .then(res => res.json())
        .then(car => {
            document.getElementById('make').value = car.make;
            document.getElementById('model').value = car.model;
            document.getElementById('year').value = car.year;
            document.getElementById('color').value = car.color;
            document.getElementById('cost').value = car.cost;
            document.getElementById('engine').value = car.engine;
            document.getElementById('doors').value = car.doors;
            editingCarId = id;
            const btn = document.getElementById('submitBtn');
            btn.textContent = 'Guardar edición';
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-warning');
        });
}

window.deleteCar = function(id) {
    if (confirm('¿Seguro que deseas eliminar este registro?')) {
        fetch(`/api/cars/${id}`, {
            method: 'DELETE'
        })
        .then(res => res.json())
        .then(() => {
            loadCars();
            // Si se estaba editando este registro, resetea el formulario
            if (editingCarId === id) {
                resetForm();
            }
        });
    }
}

// funcion para resetear el formulario
function resetForm() {
    document.getElementById('carForm').reset();
    editingCarId = null;
    const btn = document.getElementById('submitBtn');
    btn.textContent = 'Registrar vehículo';
    btn.classList.remove('btn-warning');
    btn.classList.add('btn-primary');
}

document.getElementById('carForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    const formData = {
        make: document.getElementById('make').value,
        model: document.getElementById('model').value,
        year: parseInt(document.getElementById('year').value),
        color: document.getElementById('color').value,
        cost: parseFloat(document.getElementById('cost').value),
        engine: document.getElementById('engine').value,
        doors: parseInt(document.getElementById('doors').value)
    };
    try {
        let response;
        if (editingCarId) {
            response = await fetch(`/api/cars/${editingCarId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
        } else {
            response = await fetch('/api/cars', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
        }
        if (response.ok) {
            resetForm();
            loadCars();
        } else {
            console.error('Error saving car');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Función para exportar a PDF con formato "ejecutivo"
window.exportToPDF = async function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const companyInfo = {
        name: "NOMBRE DE LA EMPRESA",
        address: "Av. Principal #123",
        city: "Ciudad de Chihuahua",
        phone: "(+52) 614-123-4567",
        email: "contacto@cobimsa.com",
        rfc: "ABCD123456ABC"
    };

    try {
        const img = new Image();
        img.src = '/static/img/logo.svg';
        await new Promise((resolve, reject) => {
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 40;
                canvas.height = 40;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, 40, 40);
                
                doc.addImage(canvas.toDataURL(), 'PNG', 85, 10, 40, 40);
                resolve();
            };
            img.onerror = reject;
        });
    } catch (error) {
        console.error('Error loading logo:', error);
    }

    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text(companyInfo.name, 105, 60, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(52, 73, 94);
    doc.text([
        `Dirección: ${companyInfo.address}`,
        `${companyInfo.city}`,
        `Tel: ${companyInfo.phone}`,
        `Email: ${companyInfo.email}`,
        `RFC: ${companyInfo.rfc}`
    ], 105, 70, { align: "center" });

    
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text("Registro de Automóviles", 105, 90, { align: "center" });// Título del reporte
    // Fecha del reporte
    const today = new Date().toLocaleDateString('es-MX', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    doc.setFontSize(10);
    doc.text(`Fecha del reporte: ${today}`, 105, 70, { align: "center" });

    // Obtener datos de la tabla
    const tableBody = [];
    const table = document.getElementById('carsTableBody'); //utilizamos el id de la tabla
    const rows = table.getElementsByTagName('tr');
    
    for (const row of rows) {
        if (row.style.display !== 'none') { 
            const cells = row.getElementsByTagName('td');
            tableBody.push([
                cells[0].textContent, // Marca
                cells[1].textContent, // Modelo
                cells[2].textContent, // Año
                cells[3].textContent, // Color
                cells[4].textContent, // Costo
                cells[5].textContent, // Motor
                cells[6].textContent  // Puertas
            ]);
        }
    }

    doc.autoTable({
        startY: 100,
        head: [['Marca', 'Modelo', 'Año', 'Color', 'Costo', 'Motor', 'Puertas']],
        body: tableBody,
        theme: 'grid',
        styles: {
            fontSize: 8,
            cellPadding: 3,
            lineColor: [44, 62, 80],
            lineWidth: 0.1
        },
        headStyles: {
            fillColor: [44, 62, 80],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240]
        }
    });

    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
            `Página ${i} de ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: "center" }
        );
        doc.text(
            `${companyInfo.name} - Documento generado el ${today}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 5,
            { align: "center" }
        );
    }

    doc.save('Registro_Automoviles.pdf');
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentFilter = e.target.value || '';
            filterTable(currentFilter);
        });
    }
    loadCars();
});