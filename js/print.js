// Función para generar el PDF de la orden
function generateOrderPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const orderDetails = document.getElementById('order-details').innerText;
    
    // Configurar estilo del PDF
    doc.setFont('helvetica');
    doc.setFontSize(12);
    
    // Agregar contenido
    const lines = orderDetails.split('\n');
    let yPos = 20;
    
    lines.forEach(line => {
        if (yPos > 280) {
            doc.addPage();
            yPos = 20;
        }
        doc.text(line, 20, yPos);
        yPos += 10;
    });
    
    // Guardar el PDF
    doc.save('orden.pdf');
}

// Función para formatear la fecha
function formatDate(date) {
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Función para mostrar el detalle de la orden
function showOrderDetails() {
    const orderDate = formatDate(new Date());
    const orderNumber = Math.floor(Math.random() * 10000);
    
    let itemsHtml = '';
    cart.forEach(item => {
        itemsHtml += `
        <tr>
            <td>${item.name}</td>
            <td class="text-center">${item.quantity}</td>
            <td class="text-end">${formatCurrency(item.price)}</td>
            <td class="text-end">${formatCurrency(item.price * item.quantity)}</td>
        </tr>`;
    });
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    
    document.getElementById('order-details').innerHTML = `
        <div class="text-center mb-4">
            <h4>Detalle de Orden #${orderNumber}</h4>
            <p class="text-muted">${orderDate}</p>
        </div>
        
        <table class="table table-dark table-striped">
            <thead>
                <tr>
                    <th>Producto</th>
                    <th class="text-center">Cantidad</th>
                    <th class="text-end">Precio</th>
                    <th class="text-end">Total</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3" class="text-end">Subtotal:</td>
                    <td class="text-end">${formatCurrency(subtotal)}</td>
                </tr>
                <tr>
                    <td colspan="3" class="text-end">ITBIS (18%):</td>
                    <td class="text-end">${formatCurrency(tax)}</td>
                </tr>
                <tr>
                    <td colspan="3" class="text-end"><strong>Total:</strong></td>
                    <td class="text-end"><strong>${formatCurrency(total)}</strong></td>
                </tr>
            </tfoot>
        </table>
        
        <div class="text-center mt-4">
            <p><strong>Método de Pago:</strong> ${document.getElementById('payment-method').value}</p>
        </div>
    `;
}