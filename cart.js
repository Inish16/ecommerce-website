/* ========== CART MODULE (localStorage) ========== */

var CART_KEY = 'tshirt_cart';

function getCart() {
  try {
    var data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) { /* storage full or disabled */ }
  updateCartBadge();
}

function addToCart(id, size, color, qty) {
  var cart = getCart();
  /* Check if same product+size+color exists */
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === id && cart[i].size === size && cart[i].color === color) {
      cart[i].qty += qty;
      saveCart(cart);
      return cart;
    }
  }
  /* Get product info */
  var product = getProductById(id);
  if (!product) return cart;
  cart.push({
    id: id,
    name: product.name,
    image: product.image,
    price: product.priceNum,
    size: size,
    color: color,
    qty: qty
  });
  saveCart(cart);
  return cart;
}

function removeFromCart(index) {
  var cart = getCart();
  if (index >= 0 && index < cart.length) {
    cart.splice(index, 1);
    saveCart(cart);
  }
  return cart;
}

function updateCartItemQty(index, qty) {
  var cart = getCart();
  if (index >= 0 && index < cart.length) {
    cart[index].qty = Math.max(1, qty);
    saveCart(cart);
  }
  return cart;
}

function getCartCount() {
  var cart = getCart();
  var count = 0;
  for (var i = 0; i < cart.length; i++) {
    count += cart[i].qty;
  }
  return count;
}

function getCartTotal() {
  var cart = getCart();
  var total = 0;
  for (var i = 0; i < cart.length; i++) {
    total += cart[i].price * cart[i].qty;
  }
  return total;
}

function clearCart() {
  saveCart([]);
}

function updateCartBadge() {
  var badges = document.querySelectorAll('.cart-badge');
  var count = getCartCount();
  badges.forEach(function (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
}

/* ========== SIDEBAR CART RENDERING ========== */

function openSidebarCart() {
  var sidebar = document.getElementById('cartSidebar');
  var overlay = document.getElementById('cartOverlay');
  if (!sidebar || !overlay) return;
  renderSidebarCart();
  sidebar.classList.add('open');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSidebarCart() {
  var sidebar = document.getElementById('cartSidebar');
  var overlay = document.getElementById('cartOverlay');
  if (!sidebar || !overlay) return;
  sidebar.classList.remove('open');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function renderSidebarCart() {
  var container = document.getElementById('sidebarCartItems');
  var subtotalEl = document.getElementById('sidebarSubtotal');
  var countEl = document.getElementById('sidebarCartCount');
  var emptyEl = document.getElementById('sidebarEmpty');
  var filledEl = document.getElementById('sidebarFilled');
  if (!container) return;

  var cart = getCart();

  if (cart.length === 0) {
    if (emptyEl) emptyEl.style.display = 'flex';
    if (filledEl) filledEl.style.display = 'none';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (filledEl) filledEl.style.display = 'flex';
  if (countEl) countEl.textContent = getCartCount();

  var html = '';
  cart.forEach(function (item, idx) {
    html += '<div class="sc-item">' +
      '<img src="' + item.image + '" alt="' + item.name + '" class="sc-item-img">' +
      '<div class="sc-item-info">' +
        '<p class="sc-item-name">' + item.name + '</p>' +
        '<p class="sc-item-meta">' + item.size + ' · ' + item.color + '</p>' +
        '<div class="sc-item-bottom">' +
          '<div class="qty-stepper">' +
            '<button type="button" onclick="sidebarQty(' + idx + ',-1)" aria-label="Decrease">−</button>' +
            '<span>' + item.qty + '</span>' +
            '<button type="button" onclick="sidebarQty(' + idx + ',1)" aria-label="Increase">+</button>' +
          '</div>' +
          '<span class="sc-item-price">₹' + (item.price * item.qty).toLocaleString('en-IN') + '</span>' +
        '</div>' +
      '</div>' +
      '<button type="button" class="sc-item-remove" onclick="sidebarRemove(' + idx + ')" aria-label="Remove">' +
        '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button>' +
    '</div>';
  });

  container.innerHTML = html;
  if (subtotalEl) subtotalEl.textContent = '₹' + getCartTotal().toLocaleString('en-IN');
}

function sidebarQty(index, delta) {
  var cart = getCart();
  if (index >= 0 && index < cart.length) {
    var newQty = cart[index].qty + delta;
    if (newQty < 1) {
      removeFromCart(index);
    } else {
      updateCartItemQty(index, newQty);
    }
    renderSidebarCart();
    updateCartBadge();
  }
}

function sidebarRemove(index) {
  removeFromCart(index);
  renderSidebarCart();
  updateCartBadge();
}
