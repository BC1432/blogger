// Datos de ejemplo para productos
const products = [
    { id: 1, name: 'Café Americano', price: 25.00, category: 'bebidas', image: 'https://placehold.co/600x400' },
    { id: 2, name: 'Café Latte', price: 35.00, category: 'bebidas', image: 'https://placehold.co/600x400' },
    { id: 3, name: 'Sandwich Club', price: 65.00, category: 'comidas', image: 'https://placehold.co/600x400' },
    { id: 4, name: 'Hamburguesa', price: 85.00, category: 'comidas', image: 'https://placehold.co/600x400' },
    { id: 5, name: 'Pastel de Chocolate', price: 45.00, category: 'postres', image: 'https://placehold.co/600x400' },
    { id: 6, name: 'Helado', price: 30.00, category: 'postres', image: 'https://placehold.co/600x400' }
];

// Estado del carrito
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Elementos del DOM
const productsContainer = document.getElementById('products-container');
const cartItems = document.getElementById('cart-items');
const subtotalElement = document.getElementById('subtotal');
const taxElement = document.getElementById('tax');
const totalElement = document.getElementById('total');
const checkoutBtn = document.getElementById('checkout-btn');
const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
const paymentMethod = document.getElementById('payment-method');
const receivedAmount = document.getElementById('received-amount');
const changeAmount = document.getElementById('change-amount');
const confirmPaymentBtn = document.getElementById('confirm-payment');
const categoriesList = document.getElementById('categories-list');

// Funciones de utilidad
const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

// Renderizar productos
function renderProducts(category = 'all') {
    const filteredProducts = category === 'all' 
        ? products 
        : products.filter(product => product.category === category);

    productsContainer.innerHTML = filteredProducts.map(product => `
        <div class="col-md-4 col-lg-3">
            <div class="card product-card h-100">
                <img src="${product.image}" class="card-img-top" alt="${product.name}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${formatCurrency(product.price)}</p>
                    <button class="btn btn-dark mt-auto" onclick="addToCart(${product.id})">
                        Agregar al Carrito
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Manejar categorías
categoriesList.addEventListener('click', (e) => {
    if (e.target.classList.contains('list-group-item')) {
        document.querySelector('.list-group-item.active').classList.remove('active');
        e.target.classList.add('active');
        renderProducts(e.target.dataset.category);
    }
});

// Funciones del carrito
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const cartItem = cart.find(item => item.productId === productId);

    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({
            productId,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    updateCart();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    updateCart();
}

function updateQuantity(productId, delta) {
    const cartItem = cart.find(item => item.productId === productId);
    if (cartItem) {
        cartItem.quantity = Math.max(1, cartItem.quantity + delta);
        updateCart();
    }
}

function updateCart() {
    // Guardar carrito en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    // Actualizar vista del carrito
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="mb-0">${item.name}</h6>
                <button class="btn btn-sm btn-danger d-flex align-items-center justify-content-center" onclick="removeFromCart(${item.productId})" style="width: 32px; height: 32px;">
                    x
                </button>
            </div>
            <div class="d-flex justify-content-between align-items-center">
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-secondary" onclick="updateQuantity(${item.productId}, -1)">-</button>
                    <span class="btn btn-outline-secondary disabled">${item.quantity}</span>
                    <button class="btn btn-outline-secondary" onclick="updateQuantity(${item.productId}, 1)">+</button>
                </div>
                <span>${formatCurrency(item.price * item.quantity)}</span>
            </div>
        </div>
    `).join('');

    // Calcular totales
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    // Actualizar elementos
    subtotalElement.textContent = formatCurrency(subtotal);
    taxElement.textContent = formatCurrency(tax);
    totalElement.textContent = formatCurrency(total);
}

// Manejo de pagos
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    paymentModal.show();
});

paymentMethod.addEventListener('change', () => {
    document.getElementById('cash-payment-section').style.display = 
        paymentMethod.value === 'cash' ? 'block' : 'none';
});

receivedAmount.addEventListener('input', () => {
    const total = parseFloat(totalElement.textContent.replace('$', ''));
    const received = parseFloat(receivedAmount.value) || 0;
    const change = received - total;
    changeAmount.textContent = formatCurrency(Math.max(0, change));
});

confirmPaymentBtn.addEventListener('click', () => {
    const total = parseFloat(totalElement.textContent.replace('$', ''));
    const received = parseFloat(receivedAmount.value) || 0;

    if (paymentMethod.value === 'cash' && received < total) {
        alert('El monto recibido es insuficiente');
        return;
    }

    // Procesar el pago
    alert('¡Pago procesado con éxito!');
    cart = [];
    updateCart();
    paymentModal.hide();
    receivedAmount.value = '';
});

// Función de inicialización
function initializeCart() {
    // Cargar carrito desde localStorage
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    // Actualizar la vista del carrito
    updateCart();
    // Asegurar que la categoría 'todos' esté activa por defecto
    document.querySelector('.list-group-item[data-category="all"]')?.classList.add('active');
}

// Inicializar el carrito cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    initializeCart();
    renderProducts();
});