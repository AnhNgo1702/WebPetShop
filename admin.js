/* admin.js
   Admin panel using localStorage.
   - Supports: users, categories, products, orders (orders OR orders_*), imports, inventory, reports
   - Default admin: admin / 123456
*/

(function () {
  // small LS wrapper
  const LS = {
    get(k, fallback = null) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } },
    remove(k) { try { localStorage.removeItem(k); } catch (e) { } }
  };

  // IDs and defaults
  function uid() {
    return Math.floor(Math.random() * 1_000_000_000); // số nguyên từ 0 đến 999,999,999
  }
  function fmtMoney(n) { return (Number(n) || 0).toLocaleString('vi-VN') + 'đ'; }
  function todayISO() { return new Date().toISOString(); }

  // ensure default data
  function ensureDefaults() {
    if (!LS.get('users')) {
      LS.set('users', [
        { email: 'admin@petshop.com', username: 'Admin', phone: '0900000000', address: 'Head Office', password: '123456', locked: false, role: 'admin' },
        { email: 'user1@example.com', username: 'Nguyễn A', phone: '0912345678', address: 'Hà Nội', password: 'user123', locked: false, role: 'customer' }
      ]);
    }
    if (!LS.get('categories')) {
      LS.set('categories', [
        { id: 'cat_dog', name: 'Chó', hidden: false },
        { id: 'cat_cat', name: 'Mèo', hidden: false },
        { id: 'cat_food', name: 'Thức ăn', hidden: false },
        { id: 'cat_other', name: 'Khác', hidden: false }
      ]);
    }
    // create sample orders in both formats:
    if (!LS.get('orders') && !hasOrdersPrefix()) {
      const sampleOrders = [
        { orderId: 'DH' + Date.now(), date: new Date().toISOString(), recipientName: 'Nguyễn A', address: 'HN', paymentMethod: 'Tiền mặt', items: [{ productId: 'p1', name: 'Chó Poodle', quantity: 1, price: 600000 }], total: 600000, status: 'Đang xử lý' },
        { orderId: 'DH' + (Date.now() + 1), date: new Date().toISOString(), recipientName: 'Trần B', address: 'HCM', paymentMethod: 'Chuyển khoản', items: [{ productId: 'p2', name: 'Mèo Anh', quantity: 2, price: 350000 }], total: 700000, status: 'Đã giao' },
      ];
      LS.set('orders', sampleOrders);
      // also create orders_user@example.com format to be compatible
      LS.set('orders_user1@example.com', [sampleOrders[0]]);
    }
    if (!LS.get('imports')) LS.set('imports', []);
    if (!LS.get('settings')) LS.set('settings', { lowStockThreshold: 5 });
  }

  function hasOrdersPrefix() {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('orders_')) return true;
    }
    return false;
  }

  // AUTH
  const ADMIN_USER = 'admin';
  const ADMIN_PASS = '123456';
  function isLoggedIn() { return LS.get('adminLoggedIn', false); }
  function setLoggedIn(v) { LS.set('adminLoggedIn', !!v); }

  // UI helpers
  const $ = id => document.getElementById(id);
  function showView(name) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const el = $(name);
    if (el) el.classList.add('active');
    document.querySelectorAll('.menu li').forEach(li => li.classList.remove('active'));
    const menuItem = document.querySelector('.menu li[data-view="' + name + '"]');
    if (menuItem) menuItem.classList.add('active');
  }

  // collect orders from 'orders' and orders_*
  function collectOrders() {
    let orders = [];

    // Lấy từ 'orders'
    const mainOrders = LS.get('orders', []);
    if (Array.isArray(mainOrders)) {
      orders = orders.concat(mainOrders);
    }

    // Lấy từ tất cả 'orders_*'
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('orders_')) {
        try {
          const arr = JSON.parse(localStorage.getItem(k)) || [];
          arr.forEach(o => {
            o._owner = k.replace('orders_', '');
            orders.push(o);
          });
        } catch (e) { }
      }
    }
    return orders;
  }

  // RENDER Functions
  function renderStats() {
    const users = LS.get('users', []);
    const products = LS.get('products', []);
    const orders = collectOrders();
    const revenue = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);
    $('statUsers').textContent = users.length;
    $('statProducts').textContent = products.length;
    $('statOrders').textContent = orders.length;
    $('statRevenue').textContent = fmtMoney(revenue);
  }

  // USERS
  function renderUsers(filter = '') {
    const tbody = $('usersTable'); tbody.innerHTML = '';
    const users = (LS.get('users', []) || []).filter(u => {
      if (!filter) return true;
      const s = (u.email + ' ' + (u.username || '')).toLowerCase();
      return s.includes(filter.toLowerCase());
    });
    users.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${u.email}</td><td>${u.username}</td><td>${u.phone || ''}</td><td>${u.address || ''}</td><td>${u.role || 'customer'}</td><td>${u.locked ? '<span style="color:red">Khóa</span>' : 'Hoạt động'}</td>
        <td>
          <button class="btn" data-email="${u.email}" data-act="reset" style="background-color: yellowgreen; color: white; border-radius: 5px; padding: 2px; border: none">Reset PW</button>
          <button class="btn" data-email="${u.email}" data-act="toggle" style="background-color: blue; color: white; border-radius: 5px; padding: 2px; border: none">${u.locked ? 'Mở khóa' : 'Khóa'}</button>
          <button class="btn" data-email="${u.email}" data-act="edit" style="background-color: purple; color: white; border-radius: 5px; padding: 2px; border: none">Sửa</button>
          <button class="btn" data-email="${u.email}" data-act="del" style="background-color: red; color: white; border-radius: 5px; padding: 2px; border: none">Xóa</button>
        </td>`;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('button').forEach(btn => {
      btn.onclick = () => {
        const email = btn.dataset.email; const act = btn.dataset.act;
        let users = LS.get('users', []);
        const idx = users.findIndex(x => x.email === email);
        if (idx < 0) return alert('Không tìm thấy user');
        if (act === 'reset') { users[idx].password = '123456'; LS.set('users', users); alert('Mật khẩu reset thành 123456'); }
        if (act === 'toggle') { users[idx].locked = !users[idx].locked; LS.set('users', users); renderUsers($('userSearch').value); }
        if (act === 'del') { if (confirm('Xóa user?')) { users.splice(idx, 1); LS.set('users', users); renderUsers($('userSearch').value); } }
        if (act === 'edit') { openUserEditor(users[idx]); }
      };
    });
  }

  function openUserEditor(user) {
    const modal = createModal(user ? 'Sửa user' : 'Thêm user');
    const u = user ? { ...user } : { email: '', username: '', phone: '', address: '', password: '123456', role: 'customer', locked: false };
    modal.body.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:8px">
        <label>Email <input id="mu_email" value="${u.email}" ${user ? 'disabled' : ''}></label>
        <label>Họ tên <input id="mu_name" value="${u.username}"></label>
        <label>Phone <input id="mu_phone" value="${u.phone || ''}"></label>
        <label>Địa chỉ <input id="mu_addr" value="${u.address || ''}"></label>
        <label>Mật khẩu <input id="mu_pw" value="${u.password || '123456'}"></label>
        <label>Vai trò
          <select id="mu_role"><option value="customer"${u.role === 'customer' ? ' selected' : ''}>Khách</option><option value="admin"${u.role === 'admin' ? ' selected' : ''}>Admin</option></select>
        </label>
        <label><input id="mu_locked" type="checkbox" ${u.locked ? 'checked' : ''}> Khóa tài khoản</label>
        <div style="text-align:right"><button id="mu_save" class="btn">Lưu</button> <button id="mu_cancel" class="btn">Đóng</button></div>
      </div>
    `;
    modal.show();
    modal.body.querySelector('#mu_cancel').onclick = modal.close;
    modal.body.querySelector('#mu_save').onclick = () => {
      const email = modal.body.querySelector('#mu_email').value.trim();
      const username = modal.body.querySelector('#mu_name').value.trim();
      if (!email || !username) return alert('Email và tên bắt buộc');
      let users = LS.get('users', []);
      if (!user && users.some(x => x.email === email)) return alert('Email đã tồn tại');
      const obj = {
        email, username,
        phone: modal.body.querySelector('#mu_phone').value.trim(),
        address: modal.body.querySelector('#mu_addr').value.trim(),
        password: modal.body.querySelector('#mu_pw').value || '123456',
        role: modal.body.querySelector('#mu_role').value,
        locked: modal.body.querySelector('#mu_locked').checked
      };
      if (user) {
        const i = users.findIndex(x => x.email === user.email);
        if (i >= 0) users[i] = obj;
      } else users.push(obj);
      LS.set('users', users);
      modal.close();
      renderUsers($('userSearch').value);
    };
  }

  // CATEGORIES
  function renderCategories(q = '') {
    const tbody = $('catsTable'); tbody.innerHTML = '';
    const cats = (LS.get('categories', []) || []).filter(c => !q || c.name.toLowerCase().includes(q.toLowerCase()));
    cats.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${c.name}</td><td>${c.hidden ? 'Yes' : 'No'}</td><td>
        <button class="btn" data-id="${c.id}" data-act="edit" style="background-color: purple; color: white; border-radius: 5px; padding: 2px; border: none">Sửa</button>
        <button class="btn" data-id="${c.id}" data-act="toggle" style="background-color: blue; color: white; border-radius: 5px; padding: 2px; border: none">${c.hidden ? 'Hiện' : 'Ẩn'}</button>
        <button class="btn" data-id="${c.id}" data-act="del" style="background-color: red; color: white; border-radius: 5px; padding: 2px; border: none">Xóa</button>
      </td>`;
      tbody.appendChild(tr);
    });
    tbody.querySelectorAll('button').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id; const act = btn.dataset.act;
        let cats = LS.get('categories', []);
        const idx = cats.findIndex(x => x.id === id);
        if (act === 'edit') { openCatEditor(cats[idx]); }
        if (act === 'toggle') { cats[idx].hidden = !cats[idx].hidden; LS.set('categories', cats); renderCategories($('catSearch').value); renderProducts(); fillCatFilters(); }
        if (act === 'del') {
          if (confirm('Xóa loại?')) {
            const cid = cats[idx].id; cats.splice(idx, 1); LS.set('categories', cats); // unlink
            let prods = LS.get('products', []); prods.forEach(p => { if (p.category === cid) p.category = 'cat_other'; }); LS.set('products', prods);
            renderCategories($('catSearch').value); renderProducts(); fillCatFilters();
          }
        }
      };
    });
  }

  function openCatEditor(cat) {
    const modal = createModal(cat ? 'Sửa loại' : 'Thêm loại');
    modal.body.innerHTML = `<div style="display:flex;flex-direction:column;gap:8px">
      <label>Tên <input id="cat_name" value="${cat ? cat.name : ''}"></label>
      <label><input id="cat_hidden" type="checkbox" ${cat && cat.hidden ? 'checked' : ''}> Ẩn</label>
      <div style="text-align:right"><button id="cat_save" class="btn">Lưu</button> <button id="cat_cancel" class="btn">Đóng</button></div>
    </div>`;
    modal.show();
    modal.body.querySelector('#cat_cancel').onclick = modal.close;
    modal.body.querySelector('#cat_save').onclick = () => {
      const name = modal.body.querySelector('#cat_name').value.trim();
      const hidden = modal.body.querySelector('#cat_hidden').checked;
      if (!name) return alert('Tên bắt buộc');
      let cats = LS.get('categories', []);
      if (cat) { const i = cats.findIndex(x => x.id === cat.id); cats[i].name = name; cats[i].hidden = hidden; }
      else cats.push({ id: 'cat_' + Date.now(), name, hidden });
      LS.set('categories', cats);
      modal.close(); renderCategories(); renderProducts(); fillCatFilters();
    };
  }

  // PRODUCTS
  function getCategoryName(cat) {
    switch (cat) {
      case 'dog': return 'Chó';
      case 'cat': return 'Mèo';
      case 'food': return 'Đồ ăn';
      case 'other': return 'Khác';
      default: return '(Không rõ)';
    }
  }

  function renderProducts() {
    const tbody = $('prodsTable');
    tbody.innerHTML = '';

    const all = LS.get('products', []) || [];
    const cats = LS.get('categories', []) || [];

    // Lấy giá trị bộ lọc
    const filterCat = $('filterByCat')?.value || '';
    const q = $('prodSearch')?.value?.toLowerCase() || '';
    const minProfit = Number($('filterMinProfit')?.value) || 0;
    const maxProfit = Number($('filterMaxProfit')?.value) || Infinity;
    const minCost = Number($('filterMinCost')?.value) || 0;
    const maxCost = Number($('filterMaxCost')?.value) || Infinity;
    const minPrice = Number($('filterMinPrice')?.value) || 0;
    const maxPrice = Number($('filterMaxPrice')?.value) || Infinity;

    // Lọc sản phẩm
    const filtered = all.filter(p => {
      const matchCat = !filterCat || p.category === filterCat;
      const matchText = !q || (p.name + ' ' + (p.code || '')).toLowerCase().includes(q);
      const profit = p.profitPercent != null ? p.profitPercent : calcProfitPercent(p.cost, p.price);
      const matchProfit = profit >= minProfit && profit <= maxProfit;
      const matchCost = (p.cost || 0) >= minCost && (p.cost || 0) <= maxCost;
      const matchPrice = (p.price || 0) >= minPrice && (p.price || 0) <= maxPrice;
      return matchCat && matchText && matchProfit && matchCost && matchPrice;
    });

    // Hiển thị bảng
    filtered.forEach(p => {
      const catName = getCategoryName(p.category);
      const profit = p.profitPercent != null ? p.profitPercent : calcProfitPercent(p.cost, p.price);
      const tr = document.createElement('tr');
      tr.innerHTML = `
      <td>${p.code || ''}</td>
      <td>${p.name}</td>
      <td>${catName}</td>
      <td>${fmtMoney(p.cost)}</td>
      <td>${p.price ? fmtMoney(p.price) : '-'}</td>
      <td>${profit}%</td>
      <td>${p.stock || 0}</td>
      <td>${p.hidden ? 'Yes' : 'No'}</td>
      <td>
        <button class="btn" data-id="${p.id}" data-act="edit" style="background-color: purple; color: white; border-radius: 5px; padding: 2px; border: none">Sửa</button>
        <button class="btn" data-id="${p.id}" data-act="toggle" style="background-color: blue; color: white; border-radius: 5px; padding: 2px; border: none">${p.hidden ? 'Hiện' : 'Ẩn'}</button>
        <button class="btn" data-id="${p.id}" data-act="del" style="background-color: red; color: white; border-radius: 5px; padding: 2px; border: none">Xóa</button>
      </td>
    `;
      tbody.appendChild(tr);
    });

    // Gắn sự kiện
    tbody.querySelectorAll('button').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const act = btn.dataset.act;
        let prods = LS.get('products', []);
        const idx = prods.findIndex(x => x.id === Number(id));
        if (idx < 0) return;

        if (act === 'edit') openProdEditor(prods[idx]);
        if (act === 'toggle') {
          prods[idx].hidden = !prods[idx].hidden;
          LS.set('products', prods);
          renderProducts();
          renderInventoryAndStats();
        }
        if (act === 'del') {
          if (confirm('Xóa sản phẩm?')) {
            prods.splice(idx, 1);
            LS.set('products', prods);
            renderProducts();
            renderInventoryAndStats();
          }
        }
      };
    });
  }

  function openProdEditor(prod) {
    const modal = createModal(prod ? 'Sửa sản phẩm' : 'Thêm sản phẩm');
    const cats = LS.get('categories', []) || [];
    const p = prod ? { ...prod } : {
      id: uid(), code: '', name: '', category: cats[0] ? cats[0].id.replace('cat_', '') : 'other',
      Image: '', description: '', cost: 0, price: 0, stock: 0, hidden: false, origin: '', object: ''
    };

    modal.body.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:8px">
      <label>Mã <input id="p_code" value="${p.code}"></label>
      <label>Tên <input id="p_name" value="${p.name}"></label>
      <label>Loại 
        <select id="p_cat">
          ${cats.map(c => `<option value="${c.id.replace('cat_', '')}" ${c.id.replace('cat_', '') === p.category ? 'selected' : ''}>${c.name}</option>`).join('')}
        </select>
      </label>
      <label>Hình <input id="p_image" type="file" accept="image/*"></label>
      <small style="color:gray;">* Vui lòng copy ảnh vào thư mục <code>images/</code> cùng cấp với <code>index.html</code></small>
      <label>Mô tả <textarea id="p_desc">${p.description || ''}</textarea></label>
      <label>Giá vốn <input id="p_cost" type="number" value="${p.cost || 0}"></label>
      <label>Giá bán <input id="p_price" type="number" value="${p.price || 0}"></label>
      <label>Tồn <input id="p_stock" type="number" value="${p.stock || 0}"></label>
      <label><input id="p_hidden" type="checkbox" ${p.hidden ? 'checked' : ''}> Ẩn</label>
      <label id="originRow" style="display:none">Xuất xứ <input id="p_origin" value="${p.origin || ''}"></label>
      <label id="objectRow" style="display:none">Thông tin object <input id="p_object" value="${p.object || ''}"></label>
      <div style="text-align:right">
        <button id="p_save" class="btn">Lưu</button>
        <button id="p_cancel" class="btn">Đóng</button>
      </div>
    </div>
  `;

    modal.show();

    // Cập nhật hiển thị các trường phụ thuộc vào loại sản phẩm
    const updateDynamicFields = () => {
      const val = $('p_cat').value;
      $('originRow').style.display = ['dog', 'cat', 'food'].includes(val) ? 'block' : 'none';
      $('objectRow').style.display = ['food', 'other'].includes(val) ? 'block' : 'none';
    };
    updateDynamicFields();
    $('p_cat').addEventListener('change', updateDynamicFields);

    $('p_cancel').onclick = modal.close;

    $('p_save').onclick = () => {
      const obj = {
        id: p.id,
        code: $('p_code').value.trim(),
        name: $('p_name').value.trim(),
        category: $('p_cat').value,
        Image: $('p_image').files[0] ? 'images/' + $('p_image').files[0].name : p.Image,
        description: $('p_desc').value.trim(),
        cost: Number($('p_cost').value) || 0,
        price: Number($('p_price').value) || 0,
        stock: Number($('p_stock').value) || 0,
        hidden: $('p_hidden').checked,
        profitPercent: calcProfitPercent(Number($('p_cost').value), Number($('p_price').value))
      };

      if (['dog', 'cat', 'food'].includes(obj.category)) {
        obj.origin = $('p_origin')?.value?.trim() || '';
      }
      if (['food', 'other'].includes(obj.category)) {
        obj.object = $('p_object')?.value?.trim() || '';
      }

      let prods = LS.get('products', []);
      if (prod) {
        const i = prods.findIndex(x => x.id === p.id);
        prods[i] = obj;
      } else {
        prods.push(obj);
      }

      LS.set('products', prods);
      modal.close();
      renderProducts();
      renderInventoryAndStats();
      fillCatFilters();
    };
  }
  // tính lợi nhuận
  function calcProfitPercent(cost, price) {
    if (!cost || !price || cost === 0) return 0;
    return Math.round(((price - cost) / cost) * 100);
  }
  // ORDERS
  function renderOrders() {
    const tbody = $('ordersTable');
    tbody.innerHTML = '';

    const orders = filterOrdersCollect();

    // Hiển thị số lượng đơn hàng đã lọc
    if ($('ordersCount')) {
      $('ordersCount').textContent = `Tìm thấy ${orders.length} đơn hàng`;
    }

    // Nếu không có đơn hàng nào khớp
    if (orders.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="7" style="text-align:center">Không có đơn hàng nào khớp với bộ lọc</td>`;
      tbody.appendChild(tr);
      return;
    }

    // Hiển thị danh sách đơn hàng
    orders.forEach((o, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${o.orderId || o.id || ''}</td>
      <td>${o.recipientName || o._owner || ''}</td>
      <td>${new Date(o.date).toLocaleString()}</td>
      <td>${fmtMoney(o.total)}</td>
      <td>${o.status || ''}</td>
      <td>
        <button class="btn" data-id="${o.orderId || o.id}" data-act="view" style="background-color: red; color: white; border-radius: 5px; padding: 2px; border: none">Xem</button>
        <button class="btn" data-id="${o.orderId || o.id}" data-act="update" style="background-color: blue; color: white; border-radius: 5px; padding: 2px; border: none">Cập nhật</button>
      </td>`;
      tbody.appendChild(tr);
    });

    // Gắn sự kiện cho nút Xem/Cập nhật
    tbody.querySelectorAll('button').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const act = btn.dataset.act;
        const all = collectOrders();
        const o = all.find(x => (x.orderId || x.id) == id);
        if (!o) return alert('Không tìm thấy đơn');
        if (act === 'view') openOrderView(o);
        if (act === 'update') openOrderUpdater(o);
      };
    });
  }
  function filterOrdersCollect() {
    let orders = collectOrders();
    const q = ($('orderSearch').value || '').toLowerCase();
    const st = $('orderStatusFilter').value;
    const cat = $('orderCategoryFilter').value;
    const from = $('orderFrom').value;
    const to = $('orderTo').value;
    orders = orders.filter(o => {
      if (q) {
        const s = ((o.orderId || '') + ' ' + (o.recipientName || '') + ' ' + (o._owner || '')).toLowerCase();
        if (!s.includes(q)) return false;
      }
      if (st && (o.status || '') !== st) return false;
      if (from && new Date(o.date) < new Date(from)) return false;
      if (to && new Date(o.date) > new Date(to + 'T23:59:59')) return false;
      if (cat) {
        // include order if any item belongs to category
        const prods = LS.get('products', []);
        const catIds = [cat];
        const ok = (o.items || []).some(it => {
          const p = prods.find(pp => pp.id == it.productId);
          return p && catIds.includes(p.category);
        });
        if (!ok) return false;
      }
      return true;
    });
    return orders.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function openOrderView(o) {
    const modal = createModal('Chi tiết đơn hàng');
    const itemsHtml = (o.items || []).map(it => {
      const prod = LS.get('products', []).find(p => p.id == it.productId);
      const name = prod ? prod.name : it.name || it.productId;
      const code = prod ? prod.code : '';
      return `<li>${name} x ${it.quantity} x ${fmtMoney(it.price)}</li>`;
    }).join('');
    modal.body.innerHTML = `<div style="text-align:left">
      <p><strong>Mã:</strong> ${o.orderId || o.id}</p>
      <p><strong>Khách:</strong> ${o.recipientName || o._owner}</p>
      <p><strong>Địa chỉ:</strong> ${o.address || ''}</p>
      <p><strong>Ngày:</strong> ${new Date(o.date).toLocaleString()}</p>
      <p><strong>Tổng:</strong> ${fmtMoney(o.total)}</p>
      <p><strong>Trạng thái:</strong> ${o.status || ''}</p>
      <p><strong>Sản phẩm:</strong></p><ul>${itemsHtml}</ul>
      <div style="text-align:right"><button id="closeo" class="btn">Đóng</button></div></div>`;
    modal.show();
    modal.body.querySelector('#closeo').onclick = modal.close;
  }

  function openOrderUpdater(o) {
    const modal = createModal('Cập nhật trạng thái');
    modal.body.innerHTML = `<div style="display:flex;flex-direction:column;gap:8px">
      <p>Mã: ${o.orderId || o.id}</p><p>Khách: ${o.recipientName || o._owner}</p>
      <label>Trạng thái
        <select id="upd_status">
          <option${o.status === 'Đang xử lý' ? ' selected' : ''}>Đang xử lý</option>
          <option${o.status === 'Đã xử lý' ? ' selected' : ''}>Đã xử lý</option>
          <option${o.status === 'Đã giao' ? ' selected' : ''}>Đã giao</option>
          <option${o.status === 'Hủy' ? ' selected' : ''}>Hủy</option>
        </select>
      </label>
      <div style="text-align:right"><button id="upd_save" class="btn">Lưu</button> <button id="upd_cancel" class="btn">Hủy</button></div>
    </div>`;
    modal.show();
    modal.body.querySelector('#upd_cancel').onclick = modal.close;
    modal.body.querySelector('#upd_save').onclick = () => {
      const newStatus = modal.body.querySelector('#upd_status').value;
      // find and update in localStorage (either orders or orders_*)
      // update first matching
      if (updateOrderInStorage(o, newStatus)) {
        modal.close();
        renderOrders();
        alert('Đã cập nhật trạng thái');
      } else alert('Không tìm thấy đơn để cập nhật');

    };
  }

  function updateOrderInStorage(orderObj, newStatus) {
    // check 'orders'
    let arr = LS.get('orders', null);
    if (arr) {
      const idx = arr.findIndex(x => (x.orderId || x.id) === (orderObj.orderId || orderObj.id));
      if (idx >= 0) { arr[idx].status = newStatus; LS.set('orders', arr); return true; }
    }
    // check orders_*
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('orders_')) {
        try {
          const a = JSON.parse(localStorage.getItem(k)) || [];
          const idx = a.findIndex(x => (x.orderId || x.id) === (orderObj.orderId || orderObj.id));
          if (idx >= 0) { a[idx].status = newStatus; localStorage.setItem(k, JSON.stringify(a)); return true; }
        } catch (e) { }
      }
    }
    return false;
  }


  // IMPORTS
  function renderImports() {
    const tbody = $('importsTable');
    tbody.innerHTML = '';

    // Lấy giá trị từ bộ lọc
    const from = $('impFrom').value;
    const to = $('impTo').value;
    const status = $('impStatus').value;
    const minItems = Number($('impMinItems').value) || 0;
    const maxItems = Number($('impMaxItems').value) || Infinity;
    const minTotal = Number($('impMinTotal').value) || 0;
    const maxTotal = Number($('impMaxTotal').value) || Infinity;
    const searchId = ($('impSearchId').value || '').toLowerCase();

    const imports = (LS.get('imports', []) || []).filter(r => {
      const d = new Date(r.date);
      const total = (r.items || []).reduce((sum, it) => sum + (Number(it.qty) * Number(it.cost)), 0);
      const itemCount = (r.items || []).length;

      return (!searchId || String(r.id).toLowerCase().includes(searchId)) &&
        (!from || d >= new Date(from)) &&
        (!to || d <= new Date(to + 'T23:59:59')) &&
        (!status || r.status === status) &&
        itemCount >= minItems &&
        itemCount <= maxItems &&
        total >= minTotal &&
        total <= maxTotal;
    });

    // Hiển thị danh sách
    imports.forEach(r => {
      const total = (r.items || []).reduce((sum, it) => sum + (Number(it.qty) * Number(it.cost)), 0);
      const tr = document.createElement('tr');
      tr.innerHTML = `
      <td>${r.id}</td>
      <td>${r.date}</td>
      <td>${r.status || 'draft'}</td>
      <td>${(r.items || []).length}</td>
      <td>${fmtMoney(total)}</td>
      <td>
        <button class="btn" data-id="${r.id}" data-act="edit" style="background-color: blue; color: white; border-radius: 5px; padding: 2px; border: none">Xem/Sửa</button>
        ${r.status !== 'completed' ? `<button class="btn" data-id="${r.id}" data-act="complete" style="background-color: yellowgreen; color: white; border-radius: 5px; padding: 2px; border: none">Hoàn thành</button>` : ''}
        <button class="btn" data-id="${r.id}" data-act="del" style="background-color: red; color: white; border-radius: 5px; padding: 2px; border: none">Xóa</button>
      </td>
    `;
      tbody.appendChild(tr);
    });

    // Gắn sự kiện cho nút hành động
    tbody.querySelectorAll('button').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const act = btn.dataset.act;
        if (act === 'edit') {
          const r = (LS.get('imports', []) || []).find(x => x.id === Number(id));
          openImportEditor(r);
        }
        if (act === 'complete') {
          if (confirm('Hoàn thành phiếu nhập?')) {
            completeImport(id);
            renderImports();
            renderProducts();
            renderInventoryAndStats();
          }
        }
        if (act === 'del') {
          if (confirm('Xóa phiếu nhập?')) {
            let a = LS.get('imports', []);
            a = a.filter(x => x.id !== Number(id));
            LS.set('imports', a);
            renderImports();
          }
        }
      };
    });
  }

  function openImportEditor(rec) {
    const modal = createModal(rec ? 'Sửa phiếu nhập' : 'Tạo phiếu nhập');
    const products = LS.get('products', []) || [];
    const r = rec ? JSON.parse(JSON.stringify(rec)) : {
      id: uid(),
      date: new Date().toISOString().slice(0, 10),
      items: [],
      status: 'draft'
    };

    modal.body.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:8px;min-width:320px">
      <div>Phiếu: <strong>${r.id}</strong> - Ngày <input id="imp_date" value="${r.date}"></div>
      <div style="display:flex;gap:8px;align-items:center">
        <select id="imp_prod">
          ${products.map(p => `<option value="${p.id}">${p.name} (${p.code || ''})</option>`).join('')}
        </select>
        <input id="imp_qty" type="number" placeholder="Số lượng" style="width:100px">
        <input id="imp_cost" type="number" placeholder="Giá nhập" style="width:120px">
        <button id="imp_add" class="btn">Thêm</button>
      </div>
      <div style="max-height:240px;overflow:auto">
        <table style="width:100%">
          <thead><tr><th>Sản phẩm</th><th>SL</th><th>Giá</th><th>Hành động</th></tr></thead>
          <tbody id="imp_items"></tbody>
        </table>
      </div>
      <div style="text-align:right">
        <p><strong>Tổng tiền:</strong> <span id="imp_total">0đ</span></p>
        <button id="imp_save" class="btn">Lưu</button>
        <button id="imp_complete" class="btn">Hoàn thành</button>
        <button id="imp_close" class="btn">Đóng</button>
      </div>
    </div>
  `;

    modal.show();
    const itemsTbody = modal.body.querySelector('#imp_items');

    function refreshItems() {
      itemsTbody.innerHTML = '';
      r.items.forEach((it, idx) => {
        const prod = products.find(p => p.id === it.productId) || { name: '(đã xóa)' };
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${prod.name}</td><td>${it.qty}</td><td>${fmtMoney(it.cost)}</td><td><button class="btn rm" data-i="${idx}">Xóa</button></td>`;
        itemsTbody.appendChild(tr);
      });
      itemsTbody.querySelectorAll('.rm').forEach(b => {
        b.onclick = () => {
          r.items.splice(Number(b.dataset.i), 1);
          refreshItems();
        };
      });
      const total = r.items.reduce((sum, it) => sum + (Number(it.qty) * Number(it.cost)), 0);
      modal.body.querySelector('#imp_total').innerText = fmtMoney(total);
    }

    refreshItems();

    modal.body.querySelector('#imp_add').onclick = () => {
      const pid = Number(modal.body.querySelector('#imp_prod').value);
      const qty = Number(modal.body.querySelector('#imp_qty').value) || 0;
      const cost = Number(modal.body.querySelector('#imp_cost').value) || 0;
      if (!pid || qty <= 0) return alert('Chọn sản phẩm và số lượng > 0');
      r.items.push({ productId: pid, qty, cost });
      refreshItems();
    };

    modal.body.querySelector('#imp_close').onclick = modal.close;

    modal.body.querySelector('#imp_save').onclick = () => {
      r.date = modal.body.querySelector('#imp_date').value;
      let arr = LS.get('imports', []);
      if (rec) {
        const idx = arr.findIndex(x => x.id === r.id);
        if (idx >= 0) arr[idx] = r;
      } else {
        arr.push(r);
      }
      LS.set('imports', arr);
      modal.close();
      renderImports();
      renderProducts();
    };

    modal.body.querySelector('#imp_complete').onclick = () => {
      if (!confirm('Hoàn thành phiếu nhập?')) return;
      r.status = 'completed';
      let arr = LS.get('imports', []);
      if (rec) {
        const idx = arr.findIndex(x => x.id === r.id);
        if (idx >= 0) arr[idx] = r;
      } else {
        arr.push(r);
      }
      LS.set('imports', arr);
      r.items.forEach(it => {
        let prods = LS.get('products', []);
        const p = prods.find(x => x.id === it.productId);
        if (p) {
          p.stock = (p.stock || 0) + Number(it.qty || 0);
          LS.set('products', prods);
        }
      });
      modal.close();
      renderImports();
      renderProducts();
      renderInventoryAndStats();
    };
  }

  function completeImport(id) {
    let arr = LS.get('imports', []) || []; const idx = arr.findIndex(x => x.id === Number(id));; if (idx < 0) return;
    arr[idx].status = 'completed';
    arr[idx].items.forEach(it => { let prods = LS.get('products', []); const p = prods.find(x => x.id === it.productId); if (p) p.stock = (p.stock || 0) + Number(it.qty || 0); LS.set('products', prods); });
    LS.set('imports', arr);
  }

  // INVENTORY & REPORTS
  function renderInventoryAndStats() {
    const tbody = $('invTable');
    tbody.innerHTML = '';

    const products = LS.get('products', []) || [];
    const settings = LS.get('settings', { lowStockThreshold: 5 });

    // Lấy giá trị từ bộ lọc
    const q = ($('invSearch')?.value || '').toLowerCase();
    const cat = $('invFilterCat')?.value;
    const minStock = Number($('invMinStock')?.value) || 0;
    const maxStock = Number($('invMaxStock')?.value) || Infinity;
    const onlyLow = $('invOnlyLow')?.checked;

    // Lọc sản phẩm
    const filtered = products.filter(p => {
      const s = ((p.code || '') + ' ' + (p.name || '')).toLowerCase();
      const stock = Number(p.stock || 0);
      const matchText = !q || s.includes(q);
      const matchCat = !cat || p.category === cat;
      const matchStock = stock >= minStock && stock <= maxStock;
      const matchLow = !onlyLow || stock <= settings.lowStockThreshold;
      return matchText && matchCat && matchStock && matchLow;
    });

    // Hiển thị bảng
    filtered.forEach(p => {
      const catName = getCategoryName(p.category);
      const warn = (p.stock || 0) <= settings.lowStockThreshold ? '⚠️' : '';
      const tr = document.createElement('tr');
      tr.innerHTML = `
      <td>${p.code || ''}</td>
      <td>${p.name}</td>
      <td>${catName}</td>
      <td>${p.stock || 0}</td>
      <td>${warn}</td>
    `;
      tbody.appendChild(tr);
    });
  }

  function genReport() {
    console.log('Đã gọi genReport');
    const from = $('reportFrom').value; const to = $('reportTo').value; const cat = $('reportCatFilter').value;
    let orders = collectOrders();
    orders = orders.filter(o => {
      if (from && new Date(o.date) < new Date(from)) return false;
      if (to && new Date(o.date) > new Date(to + 'T23:59:59')) return false;
      return true;
    });
    let total = 0; let count = 0;
    const prodMap = {}; // id -> {name, qty, total}
    const products = LS.get('products', []);
    orders.forEach(o => {
      count++;
      total += Number(o.total) || 0;
      (o.items || []).forEach(it => {
        // if category filter, check product's category
        const p = products.find(pp => pp.id == it.productId);
        if (cat && (!p || p.category !== cat)) return;
        if (!prodMap[it.productId]) prodMap[it.productId] = { name: it.name || (p ? p.name : it.productId), qty: 0, total: 0 };
        prodMap[it.productId].qty += Number(it.quantity || 0);
        prodMap[it.productId].total += (Number(it.price) || 0) * Number(it.quantity || 0);
      });
    });
    $('rep_total').textContent = fmtMoney(total);
    $('rep_count').textContent = count;
    const tbody = $('rep_table'); tbody.innerHTML = '';
    const arr = Object.keys(prodMap).map(k => ({ id: k, ...prodMap[k] })).sort((a, b) => b.qty - a.qty);
    arr.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.name}</td><td>${r.qty}</td><td>${fmtMoney(r.total)}</td>`;
      tbody.appendChild(tr);
    });
  }

  // EXPORT CSV
  function exportOrdersCSV() {
    const orders = filterOrdersCollect();
    if (!orders.length) return alert('Không có đơn hàng để xuất');
    const rows = [];
    rows.push(['Mã đơn', 'Ngày', 'Khách', 'Địa chỉ', 'SĐT', 'Thanh toán', 'Trạng thái', 'Tổng', 'Sản phẩm (tên x sl x giá)']);
    orders.forEach(o => {
      const items = (o.items || []).map(it => `${it.name || it.productId} x${it.quantity} x${it.price}`).join(' | ');
      rows.push([o.orderId || o.id, new Date(o.date).toLocaleString(), o.recipientName || '', o.address || '', o.phone || '', o.paymentMethod || '', o.status || '', o.total, items]);
    });
    const csv = rows.map(r => r.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click(); URL.revokeObjectURL(url);
  }

  // Modal helper
  function createModal(title = '') {
    const overlay = document.createElement('div'); overlay.style.position = 'fixed'; overlay.style.inset = 0; overlay.style.background = 'rgba(0,0,0,0.45)'; overlay.style.display = 'flex'; overlay.style.alignItems = 'center'; overlay.style.justifyContent = 'center'; overlay.style.zIndex = 9999;
    const box = document.createElement('div'); box.style.background = '#fff'; box.style.padding = '12px'; box.style.borderRadius = '8px'; box.style.maxHeight = '86vh'; box.style.overflow = 'auto'; box.style.minWidth = '320px';
    const hd = document.createElement('div'); hd.innerHTML = `<strong>${title}</strong>`;
    const bd = document.createElement('div'); bd.style.marginTop = '8px';
    box.appendChild(hd); box.appendChild(bd); overlay.appendChild(box);
    function show() { document.body.appendChild(overlay); }
    function close() { overlay.remove(); }
    return { overlay, box, header: hd, body: bd, show, close };
  }

  // init UI wiring
  function bindUI() {
    // Đăng nhập
    $('btnLogin').onclick = () => {
      const u = $('adminUser').value.trim();
      const p = $('adminPass').value;
      if (u === ADMIN_USER && p === ADMIN_PASS) {
        setLoggedIn(true);
        $('loginSection').style.display = 'none';
        $('adminApp').style.display = 'block';
        $('adminDisplay').textContent = 'Admin';
        initAfterLogin();
      } else {
        $('loginErr').style.display = 'block';
        setTimeout(() => $('loginErr').style.display = 'none', 2500);
      }
    };

    // Sidebar
    document.querySelectorAll('.menu li[data-view]').forEach(li => {
      li.onclick = () => showView(li.dataset.view);
    });

    // $('menuLogout').onclick = () => logout();
    $('btnLogout').onclick = () => logout();

    $('btnToggleSidebar').onclick = () => {
      const sb = $('sidebar');
      sb.style.width = sb.style.width === '64px' ? '220px' : '64px';
      sb.querySelectorAll('li span').forEach(s => {
        s.style.display = sb.style.width === '64px' ? 'none' : 'inline';
      });
    };

    // Người dùng
    $('userSearch').addEventListener('input', () => renderUsers($('userSearch').value));
    $('btnAddUser').onclick = () => openUserEditor();

    // Loại sản phẩm
    $('catSearch').addEventListener('input', () => renderCategories($('catSearch').value));
    $('btnAddCat').onclick = () => openCatEditor();

    // Sản phẩm
    $('filterByCat').addEventListener('change', () => renderProducts());
    $('prodSearch').addEventListener('input', () => renderProducts());
    $('btnAddProd').onclick = () => openProdEditor();
    $('filterMinProfit').addEventListener('input', renderProducts);
    $('filterMaxProfit').addEventListener('input', renderProducts);
    $('filterMinCost').addEventListener('input', renderProducts);
    $('filterMaxCost').addEventListener('input', renderProducts);
    $('filterMinPrice').addEventListener('input', renderProducts);
    $('filterMaxPrice').addEventListener('input', renderProducts);

    $('btnResetFilter').addEventListener('click', () => {
      $('filterByCat').value = '';
      $('prodSearch').value = '';
      $('filterMinProfit').value = '';
      $('filterMaxProfit').value = '';
      $('filterMinCost').value = '';
      $('filterMaxCost').value = '';
      $('filterMinPrice').value = '';
      $('filterMaxPrice').value = '';
      renderProducts();
    });

    // Đơn hàng
    document.getElementById('btnFilterOrders').addEventListener('click', () => {
      bindUI();
      renderOrders(); // Gọi lại hàm hiển thị đơn hàng
    });

    // Tự động lọc khi thay đổi input
    $('orderSearch').addEventListener('input', () => renderOrders());
    $('orderStatusFilter').addEventListener('change', () => renderOrders());
    $('orderCategoryFilter').addEventListener('change', () => renderOrders());
    $('orderFrom').addEventListener('change', () => renderOrders());
    $('orderTo').addEventListener('change', () => renderOrders());


    // Nhập hàng
    $('btnNewImport').onclick = () => openImportEditor();
    $('btnFilterImports').onclick = () => renderImports();
    // Tìm kiếm theo ID
    $('impSearchId').addEventListener('input', () => renderImports());

    // Reset bộ lọc
    $('btnResetImports').onclick = () => {
      $('impFrom').value = '';
      $('impTo').value = '';
      $('impStatus').value = '';
      $('impMinItems').value = '';
      $('impMaxItems').value = '';
      $('impMinTotal').value = '';
      $('impMaxTotal').value = '';
      $('impSearchId').value = '';
      renderImports();
    };

    // Tồn kho
    $('invSearch').addEventListener('input', () => renderInventoryAndStats());
    $('invFilterCat').addEventListener('change', () => renderInventoryAndStats());
    $('invMinStock').addEventListener('input', () => renderInventoryAndStats());
    $('invMaxStock').addEventListener('input', () => renderInventoryAndStats());
    $('invOnlyLow').addEventListener('change', () => renderInventoryAndStats());

    $('btnResetInventory').onclick = () => {
      $('invSearch').value = '';
      $('invFilterCat').value = '';
      $('invMinStock').value = '';
      $('invMaxStock').value = '';
      $('invOnlyLow').checked = false;
      renderInventoryAndStats();
    };
    // Báo cáo
    $('btnGenReport').onclick = () => genReport();
    $('reportFrom').addEventListener('change', genReport);
    $('reportTo').addEventListener('change', genReport);
    $('reportCatFilter').addEventListener('change', genReport);
  }

  function logout() {
    setLoggedIn(false);
    $('adminApp').style.display = 'none';
    $('loginSection').style.display = 'flex';
  }

  // fill filters
  function fillCatFilters() {
    const cats = LS.get('categories', []) || [];
    const selIds = ['filterByCat', 'orderCategoryFilter', 'invFilterCat', 'reportCatFilter'];
    selIds.forEach(id => {
      const el = $(id);
      if (!el) return;
      const cur = el.value;
      el.innerHTML = '<option value="">-- Tất cả loại --</option>' +
        cats.map(c => `<option value="${c.id.replace('cat_', '')}">${c.name}</option>`).join('');
      if (cur) el.value = cur;
    });
  }

  // open after login actions
  function initAfterLogin() {
    fillCatFilters();
    renderUsers();
    renderCategories();
    renderProducts();
    renderImports();
    renderInventoryAndStats();
    renderOrders();
    renderStats();
    genReport();
  }

  // init app
  function init() {
    ensureDefaults();
    bindUI();
    // either show admin or login
    if (isLoggedIn()) {
      $('loginSection').style.display = 'none';
      $('adminApp').style.display = 'block';
      initAfterLogin();
    } else {
      $('loginSection').style.display = 'flex';
      $('adminApp').style.display = 'none';
    }
  }

  // expose small helper to window for debug if needed
  window.__adminLS = LS;

  // start
  document.addEventListener('DOMContentLoaded', init);

})();
