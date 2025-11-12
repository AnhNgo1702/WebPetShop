// State Management
let currentUser = null;
let cart = [];
let currentCategory = 'all';
let currentPage = 1;
const ITEMS_PER_PAGE = 6;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {

    loadUserSession();
    updateCartCount();
    setupEventListeners();
    showView('home');
});

// Load user session from localStorage
function loadUserSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserUI();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('[data-view]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.currentTarget.dataset.view;
            const category = e.currentTarget.dataset.category;

            if (view === 'products' && category) {
                currentCategory = category;
                currentPage = 1;
            }
            showView(view);
        });
    });

    // Category buttons in products view
    document.querySelectorAll('.products-sidebar button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentCategory = e.target.dataset.category;
            currentPage = 1;
            displayProducts();
        });
    });

    // Search
    const searchBtn = document.getElementById('productsSearchBtn');
    const searchInput = document.getElementById('productsSearchInput');

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    // Advanced search
    document.getElementById('advSearchBtn').addEventListener('click', performAdvancedSearch);
    document.getElementById('clearSearchBtn').addEventListener('click', clearSearch);

    // Login/Register forms
    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    });

    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
    });

    // Form submissions
    document.querySelector('#loginForm form').addEventListener('submit', handleLogin);
    document.querySelector('#registerForm form').addEventListener('submit', handleRegister);

    // Cart icon click
    document.querySelector('.cart a').addEventListener('click', (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert('Vui lòng đăng nhập để xem giỏ hàng!');
            showView('login');
            return;
        }
        window.location.href = 'cart.html';
    });
}

// View Management
function showView(viewName) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    const targetView = document.getElementById(viewName + 'View');
    if (targetView) {
        targetView.classList.add('active');

        if (viewName === 'products') {
            displayProducts();
        }
    }
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Products Display
function displayProducts(productsToShow = null) {
    let products = (productsToShow || getDynamicProducts());
    products = products.filter(p=> !p.hidden);
    if (currentCategory !== 'all') {
        products = products.filter(p=>p.category===currentCategory);
    }
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const paginatedProducts = products.slice(start, end);

    const productsList = document.getElementById('productsList');
    productsList.innerHTML = '';

    if (paginatedProducts.length === 0) {
        productsList.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Không tìm thấy sản phẩm nào.</p>';
        document.getElementById('pagination').innerHTML = '';
        return;
    }

    paginatedProducts.forEach(product => {
        const card = createProductCard(product);
        productsList.appendChild(card);
    });

    displayPagination(products.length);
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    const category = getProductsCategory(product.id);
    let detailsHTML = '';

    if (category === 'dog' || category === 'cat') {
        detailsHTML = `
            <p><strong>Xuất xứ:</strong> ${product.origin}</p>
            <p><strong>Mô tả:</strong> ${product.description.split(',')[0]}</p>
        `;
    } else if (category === 'food') {
        detailsHTML = `<p><strong>${product.object}</strong></p>`;
    } else {
        detailsHTML = `<p><strong>Dành cho:</strong> ${product.object}</p>`;
    }

    card.innerHTML = `
        <div class="product-header">
            <i class="fa-solid fa-star"></i>
            <span>${product.name}</span>
        </div>
        <img src="${product.Image}" alt="${product.name}" onerror="this.style.display='none'">
        <div class="product-info">
            <h3>${product.name}</h3>
            ${detailsHTML}
            <p class="price">${formatPrice(product.price)}</p>
            <p class="stock">Còn lại: <span class="${product.stock > 0 ? 'in-stock' : 'out-stock'}">${product.stock}</span></p>
            <button class="btn-add-cart" onclick="addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                Thêm vào giỏ
            </button>
        </div>
    `;

    card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('btn-add-cart')) {
            showProductDetail(product.id);
        }
    });
    return card;
}

function displayPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = i === currentPage ? 'active' : '';
        btn.addEventListener('click', () => {
            currentPage = i;
            displayProducts();
            window.scrollTo(0, 0);
        });
        pagination.appendChild(btn);
    }
}

// Product Detail Modal
function showProductDetail(productId) {
    const product = getProductsById(productId);
    if (!product) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <div class="product-detail">
                <img src="${product.Image}" alt="${product.name}" onerror="this.style.display='none'">
                <div class="detail-info">
                    <h2>${product.name}</h2>
                    <p class="price">${formatPrice(product.price)}</p>
                    <p><strong>Mô tả:</strong> ${product.description}</p>
                    <p><strong>Xuất xứ:</strong> ${product.origin}</p>
                    <p><strong>Tình trạng:</strong> <span class="${product.stock > 0 ? 'in-stock' : 'out-stock'}">${product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}</span></p>
                    <button class="btn-add-cart" onclick="addToCart(${product.id}); document.querySelector('.modal').remove();" ${product.stock === 0 ? 'disabled' : ''}>
                        <i class="fa-solid fa-cart-plus"></i> Thêm vào giỏ hàng
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// Search Functions
function performSearch() {
    const keyword = document.getElementById('productsSearchInput').value.trim();
    if (!keyword) {
        currentCategory = 'all';
        currentPage = 1;
        displayProducts();
        return;
    }
    const allProducts = getDynamicProducts();
    const results = allProducts.filter(p=>p.name.toLowerCase().includes(keyword.toLowerCase()) && !p.hidden);
    currentPage = 1;
    currentCategory = 'all'; //reset loại khi tìm
    displayProducts(results);
}

function performAdvancedSearch() {
    const category = document.querySelector('.advanced-search select').value;
    const minPrice = parseFloat(document.getElementById('avdSearchMinPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('avdSearchMaxPrice').value) || Infinity;

    let products = getDynamicProducts();
    products = products.filter(p=> !p.hidden);
    if (category) {
        products = products.filter(p => p.category === category);
    }

    products = products.filter(p => p.price >= minPrice && p.price <= maxPrice);

    currentPage = 1;
    currentCategory = 'all';//reset loại
    displayProducts(products);
}

function clearSearch() {
    document.getElementById('productsSearchInput').value = '';
    document.querySelector('.advanced-search select').value = '';
    document.getElementById('avdSearchMinPrice').value = '';
    document.getElementById('avdSearchMaxPrice').value = '';
    currentCategory = 'all';
    currentPage = 1;
    displayProducts();
}

// Cart Management
function addToCart(productId) {
    if (!currentUser) {
        alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
        showView('login');
        return;
    }

    const product = getProductsById(productId);
    if (!product || product.stock === 0) {
        alert('Sản phẩm đã hết hàng!');
        return;
    }

    const cartKey = `cart_${currentUser.email}`;
    let userCart = JSON.parse(localStorage.getItem(cartKey)) || [];

    const existingItem = userCart.find(item => item.productId === productId);

    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } else {
            alert('Đã đạt số lượng tối đa trong kho!');
            return;
        }
    } else {
        userCart.push({
            productId: productId,
            quantity: 1
        });
    }

    localStorage.setItem(cartKey, JSON.stringify(userCart));
    updateCartCount();
    alert('Đã thêm sản phẩm vào giỏ hàng!');
}

function updateCartCount() {
    if (!currentUser) {
        document.getElementById('cartCount').textContent = '0';
        return;
    }

    const cartKey = `cart_${currentUser.email}`;
    const userCart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const totalItems = userCart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
}

// Authentication
function handleRegister(e) {
    e.preventDefault();

    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const phone = document.getElementById('regPhone').value.trim();
    const address = document.getElementById('regAddress').value.trim();

    if (!username || !email || !password || !phone || !address) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];

    if (users.find(u => u.email === email)) {
        alert('Email đã tồn tại!');
        return;
    }

    const newUser = {
        username,
        email,
        password,
        phone,
        address,
        createdAt: new Date().toISOString(),
        locked: false
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    alert('Đăng ký thành công! Vui lòng đăng nhập.');
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    e.target.reset();
}

function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        showModalMessage('Email hoặc mật khẩu không đúng!');
        return;
    }

    if (user.locked) {
        showModalMessage('⚠️ Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.');
        return;
    }

    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));

    updateUserUI();
    updateCartCount();
    showModalMessage('🎉 Đăng nhập thành công!');
    showView('home');
    e.target.reset();
}

function showModalMessage(message) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:400px;text-align:center">
            <span class="close">&times;</span>
            <p style="font-size:16px;padding:12px">${message}</p>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUserUI();
    updateCartCount();
    showView('home');
    alert('Đã đăng xuất!');
}

function updateUserUI() {
    const userSection = document.getElementById('userSection');

    if (currentUser) {
        userSection.innerHTML = `
            <div class="user-menu">
                <button class="user-btn">
                    <i class="fa-regular fa-user"></i> ${currentUser.username}
                </button>
                <div class="user-dropdown">
                    <a href="#" onclick="showProfile(); return false;">Thông tin cá nhân</a>
                    <a href="#" onclick="showOrders(); return false;">Đơn hàng của tôi</a>
                    <a href="#" onclick="logout(); return false;">Đăng xuất</a>
                </div>
            </div>
        `;
    } else {
        userSection.innerHTML = `
            <a href="#" data-view="login" id="loginBtn">
                <i class="fa-regular fa-user"></i> Đăng nhập
            </a>
        `;

        document.getElementById('loginBtn').addEventListener('click', (e) => {
            e.preventDefault();
            showView('login');
        });
    }
}

function showProfile() {
    if (!currentUser) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Thông tin cá nhân</h2>
            <form id="profileForm">
                <div class="form-group">
                    <label>Tên tài khoản:</label>
                    <input type="text" value="${currentUser.username}" id="editUsername" required>
                </div>
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" value="${currentUser.email}" disabled>
                </div>
                <div class="form-group">
                    <label>Số điện thoại:</label>
                    <input type="text" value="${currentUser.phone}" id="editPhone" required>
                </div>
                <div class="form-group">
                    <label>Địa chỉ:</label>
                    <input type="text" value="${currentUser.address}" id="editAddress" required>
                </div>
                <button type="submit" class="btn-primary">Cập nhật</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    modal.querySelector('#profileForm').addEventListener('submit', (e) => {
        e.preventDefault();

        currentUser.username = document.getElementById('editUsername').value;
        currentUser.phone = document.getElementById('editPhone').value;
        currentUser.address = document.getElementById('editAddress').value;

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const index = users.findIndex(u => u.email === currentUser.email);
        if (index !== -1) {
            users[index] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }

        updateUserUI();
        alert('Cập nhật thông tin thành công!');
        modal.remove();
    });
}

function showOrders() {
    if (!currentUser) return;

    const ordersKey = `orders_${currentUser.email}`;
    const orders = JSON.parse(localStorage.getItem(ordersKey)) || [];

    const modal = document.createElement('div');
    modal.className = 'modal';

    let ordersHTML = '';
    if (orders.length === 0) {
        ordersHTML = '<p style="text-align:center;">Bạn chưa có đơn hàng nào.</p>';
    } else {
        ordersHTML = orders.map((order, index) => `
            <div class="order-item">
                <h4>Đơn hàng #${order.orderId}</h4>
                <p><strong>Ngày đặt:</strong> ${new Date(order.date).toLocaleString('vi-VN')}</p>
                <p><strong>Tổng tiền:</strong> ${formatPrice(order.total)}</p>
                <p><strong>Địa chỉ:</strong> ${order.address}</p>
                <p><strong>Thanh toán:</strong> ${order.paymentMethod}</p>
                <p><strong>Trạng thái:</strong> <span class="order-status">${order.status || 'Đang xử lý'}</span></p>
                <details>
                    <summary>Chi tiết sản phẩm</summary>
                    <ul>
                        ${order.items.map(item => {
            const product = getProductsById(item.productId);
            return `<li>${product ? product.name : 'Sản phẩm'} x ${item.quantity} - ${formatPrice(item.price * item.quantity)}</li>`;
        }).join('')}
                    </ul>
                </details>
            </div>
        `).join('');
    }

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <span class="close">&times;</span>
            <h2>Đơn hàng của tôi</h2>
            <div class="orders-list">
                ${ordersHTML}
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// Utility Functions
function formatPrice(price) {
    return price.toLocaleString('vi-VN') + 'đ';
}