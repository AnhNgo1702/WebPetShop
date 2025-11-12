// Cart Page Management
let currentUser = null;
let cartItems = [];
const SHIPPING_FEE = 30000;

// Initialize cart page
document.addEventListener('DOMContentLoaded', () => {
    loadUserSession();
    if (!currentUser) {
        alert('Vui lòng đăng nhập để xem giỏ hàng!');
        window.location.href = 'index.html';
        return;
    }
    
    loadCart();
    setupEventListeners();
    displayUserInfo();
});

// Load user session
function loadUserSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
}

// Display user info
function displayUserInfo() {
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (currentUser) {
        userNameDisplay.innerHTML = `
            <i class="fa-solid fa-user"></i> 
            <span>${currentUser.username}</span>
        `;
        
        document.getElementById('userAddressDisplay').innerHTML = `
            <strong>Họ tên:</strong> ${currentUser.username}<br>
            <strong>Số điện thoại:</strong> ${currentUser.phone}<br>
            <strong>Địa chỉ:</strong> ${currentUser.address}
        `;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Address type selection
    document.querySelectorAll('input[name="addressType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'default') {
                document.getElementById('defaultAddress').style.display = 'block';
                document.getElementById('newAddressForm').style.display = 'none';
            } else {
                document.getElementById('defaultAddress').style.display = 'none';
                document.getElementById('newAddressForm').style.display = 'block';
            }
        });
    });
}

// Load cart from localStorage
function loadCart() {
    const cartKey = `cart_${currentUser.email}`;
    cartItems = JSON.parse(localStorage.getItem(cartKey)) || [];
    
    if (cartItems.length === 0) {
        showEmptyCart();
    } else {
        displayCartItems();
    }
}

// Show empty cart message
function showEmptyCart() {
    document.getElementById('emptyCart').style.display = 'flex';
    document.getElementById('cartContent').style.display = 'none';
}

// Display cart items
function displayCartItems() {
    document.getElementById('emptyCart').style.display = 'none';
    document.getElementById('cartContent').style.display = 'grid';
    
    const tbody = document.getElementById('cartItemsList');
    tbody.innerHTML = '';
    
    let subtotal = 0;
    
    cartItems.forEach((item, index) => {
        const product = getProductsById(item.productId);
        if (!product) return;
        
        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="product-cell">
                <img src="${product.Image}" alt="${product.name}" onerror="this.style.display='none'">
                <div class="product-name">
                    <strong>${product.name}</strong>
                    <small>Xuất xứ: ${product.origin}</small>
                </div>
            </td>
            <td class="price-cell">${formatPrice(product.price)}</td>
            <td class="quantity-cell">
                <div class="quantity-control">
                    <button onclick="updateQuantity(${index}, -1)" ${item.quantity <= 1 ? 'disabled' : ''}>
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <input type="number" value="${item.quantity}" min="1" max="${product.stock}" 
                           onchange="setQuantity(${index}, this.value)">
                    <button onclick="updateQuantity(${index}, 1)" ${item.quantity >= product.stock ? 'disabled' : ''}>
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
                <small class="stock-info">Còn ${product.stock} sản phẩm</small>
            </td>
            <td class="total-cell">${formatPrice(itemTotal)}</td>
            <td class="remove-cell">
                <button class="btn-remove" onclick="removeItem(${index})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    updateSummary(subtotal);
}

// Update quantity
function updateQuantity(index, change) {
    const item = cartItems[index];
    const product = getProductsById(item.productId);
    
    if (!product) return;
    
    const newQuantity = item.quantity + change;
    
    if (newQuantity < 1 || newQuantity > product.stock) {
        return;
    }
    
    item.quantity = newQuantity;
    saveCart();
    displayCartItems();
}

// Set quantity directly
function setQuantity(index, value) {
    const quantity = parseInt(value);
    const item = cartItems[index];
    const product = getProductsById(item.productId);
    
    if (!product) return;
    
    if (quantity < 1) {
        item.quantity = 1;
    } else if (quantity > product.stock) {
        item.quantity = product.stock;
        alert(`Số lượng tối đa trong kho: ${product.stock}`);
    } else {
        item.quantity = quantity;
    }
    
    saveCart();
    displayCartItems();
}

// Remove item from cart
function removeItem(index) {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
        cartItems.splice(index, 1);
        saveCart();
        
        if (cartItems.length === 0) {
            showEmptyCart();
        } else {
            displayCartItems();
        }
    }
}

// Save cart to localStorage
function saveCart() {
    const cartKey = `cart_${currentUser.email}`;
    localStorage.setItem(cartKey, JSON.stringify(cartItems));
}

// Update summary
function updateSummary(subtotal) {
    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('shipping').textContent = formatPrice(SHIPPING_FEE);
    document.getElementById('total').textContent = formatPrice(subtotal + SHIPPING_FEE);
}

// Proceed to checkout
function proceedToCheckout() {
    if (cartItems.length === 0) {
        alert('Giỏ hàng trống!');
        return;
    }
    
    // Get delivery address
    let deliveryAddress = '';
    const addressType = document.querySelector('input[name="addressType"]:checked').value;
    
    if (addressType === 'default') {
        deliveryAddress = `${currentUser.username}, ${currentUser.phone}, ${currentUser.address}`;
    } else {
        const name = document.getElementById('newName').value.trim();
        const phone = document.getElementById('newPhone').value.trim();
        const street = document.getElementById('newStreet').value.trim();
        const ward = document.getElementById('newWard').value.trim();
        const district = document.getElementById('newDistrict').value.trim();
        const city = document.getElementById('newCity').value.trim();
        
        if (!name || !phone || !street || !ward || !district || !city) {
            alert('Vui lòng điền đầy đủ thông tin giao hàng!');
            return;
        }
        
        deliveryAddress = `${name}, ${phone}, ${street}, ${ward}, ${district}, ${city}`;
    }
    
    // Get payment method
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    let paymentMethodText = '';
    switch(paymentMethod) {
        case 'cash':
            paymentMethodText = 'Tiền mặt khi nhận hàng';
            break;
        case 'transfer':
            paymentMethodText = 'Chuyển khoản ngân hàng';
            break;
        case 'online':
            paymentMethodText = 'Thanh toán trực tuyến';
            break;
    }
    
    // Calculate total
    let subtotal = 0;
    const orderItems = cartItems.map(item => {
        const product = getProductsById(item.productId);
        subtotal += product.price * item.quantity;
        return {
            productId: item.productId,
            quantity: item.quantity,
            price: product.price
        };
    });
    
    const total = subtotal + SHIPPING_FEE;
    
    // Show order confirmation
    showOrderConfirmation(deliveryAddress, paymentMethodText, orderItems, subtotal, total);
}

// Show order confirmation modal
function showOrderConfirmation(address, paymentMethod, items, subtotal, total) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    let itemsHTML = '';
    items.forEach(item => {
        const product = getProductsById(item.productId);
        itemsHTML += `
            <div class="order-item">
                <img src="${product.Image}" alt="${product.name}" onerror="this.style.display='none'">
                <div class="order-item-info">
                    <strong>${product.name}</strong>
                    <p>Số lượng: ${item.quantity} x ${formatPrice(item.price)}</p>
                    <p class="item-total">${formatPrice(item.price * item.quantity)}</p>
                </div>
            </div>
        `;
    });
    
    modal.innerHTML = `
        <div class="modal-content confirmation-modal">
            <span class="close">&times;</span>
            <h2><i class="fa-solid fa-check-circle"></i> Xác nhận đơn hàng</h2>
            
            <div class="confirmation-section">
                <h3>Thông tin giao hàng</h3>
                <p>${address}</p>
            </div>
            
            <div class="confirmation-section">
                <h3>Phương thức thanh toán</h3>
                <p>${paymentMethod}</p>
            </div>
            
            <div class="confirmation-section">
                <h3>Sản phẩm đã đặt</h3>
                <div class="order-items-list">
                    ${itemsHTML}
                </div>
            </div>
            
            <div class="confirmation-total">
                <div class="total-row">
                    <span>Tạm tính:</span>
                    <span>${formatPrice(subtotal)}</span>
                </div>
                <div class="total-row">
                    <span>Phí vận chuyển:</span>
                    <span>${formatPrice(SHIPPING_FEE)}</span>
                </div>
                <div class="total-row final-total">
                    <span>Tổng cộng:</span>
                    <span>${formatPrice(total)}</span>
                </div>
            </div>
            
            <div class="confirmation-buttons">
                <button class="btn-confirm" onclick="confirmOrder('${address}', '${paymentMethod}', ${total})">
                    Xác nhận đặt hàng
                </button>
                <button class="btn-cancel" onclick="closeModal()">
                    Quay lại
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// Close modal
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) modal.remove();
}

// Confirm order
function confirmOrder(address, paymentMethod, total) {
    // Create order
    const order = {
        orderId: generateOrderId(),
        date: new Date().toISOString(),
        items: cartItems.map(item => {
            const product = getProductsById(item.productId);
            return {
                productId: item.productId,
                quantity: item.quantity,
                price: product.price
            };
        }),
        address: address,
        paymentMethod: paymentMethod,
        total: total,
        status: 'Đang xử lý'
    };
    
    // Save order
    const ordersKey = `orders_${currentUser.email}`;
    let orders = JSON.parse(localStorage.getItem(ordersKey)) || [];
    orders.push(order);
    localStorage.setItem(ordersKey, JSON.stringify(orders));
    
    // Update product stock
    cartItems.forEach(item => {
        updateProductStock(item.productId, item.quantity);
    });
    
    // Clear cart
    const cartKey = `cart_${currentUser.email}`;
    localStorage.removeItem(cartKey);
    
    // Show success message
    closeModal();
    showSuccessMessage(order.orderId);
}

// Generate order ID
function generateOrderId() {
    return 'DH' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Update product stock
function updateProductStock(productId, quantity) {
    let allProducts = getDynamicProducts();
    const product = allProducts.find(p => p.id === productId);
    
    if (product) {
        product.stock -= quantity;
        if (product.stock < 0) product.stock = 0;
    }
    
    localStorage.setItem('products', JSON.stringify(allProducts));
}

// Show success message
function showSuccessMessage(orderId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content success-modal">
            <div class="success-icon">
                <i class="fa-solid fa-check-circle"></i>
            </div>
            <h2>Đặt hàng thành công!</h2>
            <p>Mã đơn hàng của bạn là: <strong>${orderId}</strong></p>
            <p>Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.</p>
            <p>Cảm ơn bạn đã tin tưởng Pet Shop!</p>
            <button class="btn-primary" onclick="window.location.href='index.html'">
                Về trang chủ
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Format price
function formatPrice(price) {
    return price.toLocaleString('vi-VN') + 'đ';
}