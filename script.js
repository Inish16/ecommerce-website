/* ========== MAIN SCRIPT ========== */

function closeMobile() {
  var menu = document.getElementById('mobileMenu');
  var ham = document.getElementById('hamburger');
  if (!menu || !ham) return;
  menu.classList.remove('open');
  ham.classList.remove('open');
  ham.setAttribute('aria-expanded', 'false');
  ham.setAttribute('aria-label', 'Open menu');
  document.body.style.overflow = '';
}

/* --- Mobile menu --- */
function toggleMobile() {
  var menu = document.getElementById('mobileMenu');
  var ham = document.getElementById('hamburger');
  if (!menu || !ham) return;
  var open = menu.classList.toggle('open');
  ham.classList.toggle('open', open);
  ham.setAttribute('aria-expanded', open ? 'true' : 'false');
  ham.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.style.overflow = open ? 'hidden' : '';
}

/* --- Scroll reveal --- */
var _ro = null;
function attachReveal() {
  if (_ro) _ro.disconnect();
  _ro = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        _ro.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });
  var els = document.querySelectorAll('.reveal:not(.visible)');
  els.forEach(function (el) { _ro.observe(el); });
}

/* --- Nav scroll effect --- */
window.addEventListener('scroll', function () {
  var nav = document.getElementById('mainNav');
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }
}, { passive: true });

/* --- FAQ accordion --- */
function toggleFaq(btn) {
  var item = btn.closest('.faq-item');
  if (!item) return;
  var isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(function (i) {
    i.classList.remove('open');
    var q = i.querySelector('.faq-q');
    if (q) q.setAttribute('aria-expanded', 'false');
  });
  if (!isOpen) {
    item.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  } else {
    btn.setAttribute('aria-expanded', 'false');
  }
}

/* --- Dynamic Product Listing --- */
var _currentAudience = 'all';
var _currentCategory = 'all';
var _currentSort = 'popular';
var _visibleCount = 24; /* Products shown per page */
var _filteredProducts = [];

function selectAudience(btn, audience) {
  _currentAudience = audience;
  _currentCategory = 'all';
  _visibleCount = 24;
  /* Update audience tab active state */
  document.querySelectorAll('.audience-tab').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  /* Rebuild subcategory pills */
  buildCategoryPills(audience);
  /* Re-render products */
  renderProductGrid();
}

function selectCategory(btn, catSlug) {
  _currentCategory = catSlug;
  _visibleCount = 24;
  document.querySelectorAll('#filterBar .filter-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  renderProductGrid();
}

function buildCategoryPills(audience) {
  var bar = document.getElementById('filterBar');
  if (!bar) return;
  var html = '<button class="filter-btn active" data-filter="all" onclick="selectCategory(this,\'all\')">All</button>';
  if (audience === 'all') {
    /* Show audience-level categories */
    var audienceNames = {men:'Men\'s',women:'Women\'s',boys:'Boys\'',girls:'Girls\''};
    ['men','women','boys','girls'].forEach(function(a) {
      html += '<button class="filter-btn" data-filter="' + a + '" onclick="selectCategory(this,\'' + a + '\')">' + audienceNames[a] + '</button>';
    });
  } else {
    var cats = getCategoriesForAudience(audience);
    cats.forEach(function(c) {
      var count = getProductsByCategory(audience, c.slug).length;
      html += '<button class="filter-btn" data-filter="' + c.slug + '" onclick="selectCategory(this,\'' + c.slug + '\')">' + c.name + ' <span class="pill-count">' + count + '</span></button>';
    });
  }
  bar.innerHTML = html;
}

function applySort(sortVal) {
  _currentSort = sortVal;
  _visibleCount = 24;
  renderProductGrid();
}

function getFilteredProducts() {
  var products;
  if (_currentAudience === 'all') {
    if (_currentCategory === 'all') {
      products = PRODUCTS.slice();
    } else if (['men', 'women', 'boys', 'girls'].indexOf(_currentCategory) !== -1) {
      /* _currentCategory is actually an audience name when on "All" tab */
      products = getProductsByAudience(_currentCategory);
    } else {
      /* _currentCategory is a specific category slug (e.g. 'shirts', 'tshirts') across all audiences */
      products = PRODUCTS.filter(function(p) { return p.catSlug === _currentCategory; });
    }
  } else {
    products = getProductsByCategory(_currentAudience, _currentCategory);
  }

  /* Sort */
  if (_currentSort === 'price-low') {
    products.sort(function(a, b) { return a.priceNum - b.priceNum; });
  } else if (_currentSort === 'price-high') {
    products.sort(function(a, b) { return b.priceNum - a.priceNum; });
  } else if (_currentSort === 'newest') {
    products.reverse();
  }
  /* 'popular' keeps original order */

  return products;
}

function renderProductGrid() {
  var grid = document.getElementById('listingsGrid');
  if (!grid) return;

  _filteredProducts = getFilteredProducts();
  var toShow = _filteredProducts.slice(0, _visibleCount);

  /* Update product count */
  var countEl = document.getElementById('productCount');
  if (countEl) countEl.textContent = _filteredProducts.length + ' product' + (_filteredProducts.length !== 1 ? 's' : '');

  /* Build cards */
  var html = '';
  toShow.forEach(function(p) {
    var badgeHtml = p.badge ? '<span class="listing-badge">' + p.badge + '</span>' : '';
    var audienceLabel = '';
    if (_currentAudience === 'all') {
      var labels = {men:"Men's",women:"Women's",boys:"Boys'",girls:"Girls'"};
      audienceLabel = '<span class="listing-audience-tag">' + (labels[p.audience] || '') + '</span>';
    }
    html += '<div class="listing-card reveal" data-cat="' + p.catSlug + '" data-id="' + p.id + '">' +
      '<div class="listing-img-wrap">' +
        '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy">' +
        '<div class="listing-overlay"></div>' +
        badgeHtml +
        audienceLabel +
        '<button type="button" class="listing-qv-btn" onclick="openQuickView(\'' + p.id + '\')" aria-label="Quick view">' +
          '<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="listing-body">' +
        '<p class="listing-cat">' + p.category + '</p>' +
        '<h3 class="listing-name"><a href="product.html?id=' + p.id + '">' + p.name + '</a></h3>' +
        '<p class="listing-desc">' + p.description.substring(0, 70) + '…</p>' +
        '<div class="listing-foot">' +
          '<span class="listing-price">' + p.price + '</span>' +
          '<a href="product.html?id=' + p.id + '" class="listing-order-btn">View Details</a>' +
        '</div>' +
      '</div>' +
    '</div>';
  });

  grid.innerHTML = html;

  /* Animate cards in */
  var cards = grid.querySelectorAll('.listing-card');
  cards.forEach(function(card, i) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(18px)';
    setTimeout(function() {
      card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      card.style.opacity = '1';
      card.style.transform = 'none';
    }, 30 + i * 25);
  });

  /* Load more button */
  var loadMoreWrap = document.getElementById('loadMoreWrap');
  if (loadMoreWrap) {
    loadMoreWrap.style.display = _visibleCount < _filteredProducts.length ? 'flex' : 'none';
    var remaining = _filteredProducts.length - _visibleCount;
    var loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn && remaining > 0) {
      loadMoreBtn.textContent = 'Load More (' + remaining + ' remaining)';
    }
  }

  /* Re-attach scroll reveal */
  attachReveal();
}

function loadMoreProducts() {
  _visibleCount += 24;
  renderProductGrid();
  /* Scroll to the newly loaded section */
}

/* Legacy filterItems — redirect to new system */
function filterItems(btn, cat) {
  selectCategory(btn, cat);
}

/* --- Contact form --- */
function handleSubmit(e) {
  e.preventDefault();
  var form = document.getElementById('contactForm');
  var success = document.getElementById('formSuccess');
  
  /* Reset previous error states */
  document.querySelectorAll('#contactForm input, #contactForm textarea, #contactForm select').forEach(function(el) {
    el.style.borderColor = '';
    el.style.boxShadow = '';
  });
  
  /* Basic validation */
  var name = document.getElementById('inp-name').value.trim();
  var email = document.getElementById('inp-email').value.trim();
  var subject = document.getElementById('inp-subject').value.trim();
  var message = document.getElementById('inp-message').value.trim();
  var isValid = true;
  
  if (!name) {
    document.getElementById('inp-name').style.borderColor = 'var(--orange)';
    document.getElementById('inp-name').style.boxShadow = '0 0 0 2px rgba(255, 107, 0, 0.08)';
    isValid = false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('inp-email').style.borderColor = 'var(--orange)';
    document.getElementById('inp-email').style.boxShadow = '0 0 0 2px rgba(255, 107, 0, 0.08)';
    isValid = false;
  }
  if (!subject) {
    document.getElementById('inp-subject').style.borderColor = 'var(--orange)';
    document.getElementById('inp-subject').style.boxShadow = '0 0 0 2px rgba(255, 107, 0, 0.08)';
    isValid = false;
  }
  if (!message) {
    document.getElementById('inp-message').style.borderColor = 'var(--orange)';
    document.getElementById('inp-message').style.boxShadow = '0 0 0 2px rgba(255, 107, 0, 0.08)';
    isValid = false;
  }
  
  if (!isValid) return;
  
  form.style.display = 'none';
  success.style.display = 'block';
  setTimeout(function () {
    success.style.display = 'none';
    form.style.display = 'block';
    form.reset();
    /* Reset border colors */
    document.querySelectorAll('#contactForm input, #contactForm textarea, #contactForm select').forEach(function(el) {
      el.style.borderColor = '';
      el.style.boxShadow = '';
    });
  }, 5000);
}

/* --- Newsletter --- */
function subscribeNewsletter() {
  var inp = document.getElementById('newsletter-email');
  if (!inp || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim())) {
    if (inp) { 
      inp.style.borderColor = 'var(--orange)';
      inp.style.boxShadow = '0 0 0 2px rgba(255, 107, 0, 0.08)';
      inp.focus(); 
    }
    return;
  }
  inp.value = '✓ Subscribed!';
  inp.disabled = true;
  inp.style.borderColor = 'var(--orange)';
  inp.style.color = 'var(--orange)';
  setTimeout(function() {
    inp.value = '';
    inp.disabled = false;
    inp.style.borderColor = '';
    inp.style.color = '';
    inp.style.boxShadow = '';
  }, 3000);
}

/* ========== QUICK VIEW MODAL ========== */

var _qvProduct = null;
var _qvSize = '';
var _qvColor = '';
var _qvQty = 1;

function openQuickView(productId) {
  var product = getProductById(productId);
  if (!product) return;
  _qvProduct = product;
  _qvSize = product.sizes[0] || '';
  _qvColor = product.colorNames[0] || '';
  _qvQty = 1;

  /* Populate modal */
  var modal = document.getElementById('qvModal');
  var overlay = document.getElementById('qvOverlay');
  if (!modal || !overlay) return;

  document.getElementById('qvMainImg').src = product.gallery[0];
  document.getElementById('qvMainImg').alt = product.name;
  document.getElementById('qvCat').textContent = product.category;
  document.getElementById('qvName').textContent = product.name;
  document.getElementById('qvPrice').textContent = '₹' + product.priceNum.toLocaleString('en-IN');
  document.getElementById('qvDesc').textContent = product.description;
  document.getElementById('qvQtyVal').textContent = _qvQty;
  document.getElementById('qvViewLink').href = 'product.html?id=' + product.id;

  /* Thumbs */
  var thumbsHtml = '';
  product.gallery.forEach(function(img, i) {
    thumbsHtml += '<button type="button" class="qv-thumb' + (i === 0 ? ' active' : '') + '" onclick="qvThumb(this,' + i + ')">' +
      '<img src="' + img + '" alt="View ' + (i + 1) + '">' +
    '</button>';
  });
  document.getElementById('qvThumbs').innerHTML = thumbsHtml;

  /* Sizes */
  var sizesHtml = '';
  product.sizes.forEach(function(s, i) {
    sizesHtml += '<button type="button" class="size-btn' + (i === 0 ? ' active' : '') + '" onclick="qvSelectSize(this,\'' + s + '\')">' + s + '</button>';
  });
  document.getElementById('qvSizes').innerHTML = sizesHtml;

  /* Colors */
  var colorsHtml = '';
  product.colors.forEach(function(c, i) {
    colorsHtml += '<button type="button" class="color-swatch' + (i === 0 ? ' active' : '') + '" title="' + product.colorNames[i] + '" onclick="qvSelectColor(this,\'' + product.colorNames[i] + '\')">' +
      '<span class="color-swatch-inner" style="background:' + c + '"></span>' +
    '</button>';
  });
  document.getElementById('qvColors').innerHTML = colorsHtml;

  overlay.classList.add('open');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  var modal = document.getElementById('qvModal');
  var overlay = document.getElementById('qvOverlay');
  if (modal) modal.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
  _qvProduct = null;
}

function qvThumb(btn, idx) {
  if (!_qvProduct) return;
  document.getElementById('qvMainImg').src = _qvProduct.gallery[idx];
  document.querySelectorAll('#qvThumbs .qv-thumb').forEach(function(t) { t.classList.remove('active'); });
  btn.classList.add('active');
}

function qvSelectSize(btn, size) {
  _qvSize = size;
  document.querySelectorAll('#qvSizes .size-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
}

function qvSelectColor(btn, color) {
  _qvColor = color;
  document.querySelectorAll('#qvColors .color-swatch').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
}

function qvQty(delta) {
  _qvQty = Math.max(1, _qvQty + delta);
  var el = document.getElementById('qvQtyVal');
  if (el) el.textContent = _qvQty;
}

function qvAddToCart() {
  if (!_qvProduct) return;
  addToCart(_qvProduct.id, _qvSize, _qvColor, _qvQty);
  closeQuickView();
  openSidebarCart();
}

/* ========== SIZE/COLOR/QTY for product detail page ========== */

var _pdSize = '';
var _pdColor = '';
var _pdQty = 1;

function pdSelectSize(btn, size) {
  _pdSize = size;
  document.querySelectorAll('#pdSizes .size-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
}

function pdSelectColor(btn, color) {
  _pdColor = color;
  document.querySelectorAll('#pdColors .color-swatch').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
}

function pdQty(delta) {
  _pdQty = Math.max(1, _pdQty + delta);
  var el = document.getElementById('pdQtyVal');
  if (el) el.textContent = _pdQty;
}

function pdThumb(btn, idx) {
  var imgs = document.querySelectorAll('#pdGallery .pd-main-img');
  var product = window._currentProduct;
  if (!product) return;
  document.getElementById('pdMainImg').src = product.gallery[idx];
  document.querySelectorAll('#pdThumbs .pd-thumb').forEach(function(t) { t.classList.remove('active'); });
  btn.classList.add('active');
}

function pdAddToCart() {
  var product = window._currentProduct;
  if (!product) return;
  addToCart(product.id, _pdSize, _pdColor, _pdQty);
  openSidebarCart();
}

function pdBuyNow() {
  var product = window._currentProduct;
  if (!product) return;
  addToCart(product.id, _pdSize, _pdColor, _pdQty);
  window.location.href = 'checkout.html';
}

/* ========== PRODUCT DETAIL PAGE INIT ========== */

function initProductDetailPage() {
  var params = new URLSearchParams(window.location.search);
  var id = params.get('id');
  if (!id) return;

  var product = getProductById(id);
  if (!product) {
    document.querySelector('.pd-layout').innerHTML = '<div class="cart-empty" style="grid-column:1/-1"><h3>PRODUCT NOT FOUND</h3><p>The product you\'re looking for doesn\'t exist.</p><a href="products.html" class="btn-primary" style="margin-top:18px">Browse Products</a></div>';
    return;
  }

  window._currentProduct = product;
  _pdSize = product.sizes[0] || '';
  _pdColor = product.colorNames[0] || '';
  _pdQty = 1;

  /* Set page title & breadcrumb */
  document.title = product.name + ' - T-SHIRT | Premium Custom & Printed Tees';
  document.getElementById('bcProductName').textContent = product.name;

  /* Main image */
  document.getElementById('pdMainImg').src = product.gallery[0];
  document.getElementById('pdMainImg').alt = product.name;

  /* Thumbs */
  var thumbsHtml = '';
  product.gallery.forEach(function(img, i) {
    thumbsHtml += '<button type="button" class="pd-thumb' + (i === 0 ? ' active' : '') + '" onclick="pdThumb(this,' + i + ')">' +
      '<img src="' + img + '" alt="' + product.name + ' view ' + (i + 1) + '">' +
    '</button>';
  });
  document.getElementById('pdThumbs').innerHTML = thumbsHtml;

  /* Info */
  document.getElementById('pdCat').textContent = product.category;
  document.getElementById('pdName').textContent = product.name;
  document.getElementById('pdPrice').textContent = '₹' + product.priceNum.toLocaleString('en-IN');
  document.getElementById('pdDesc').textContent = product.description;
  document.getElementById('pdFabric').textContent = product.fabric;
  document.getElementById('pdGsm').textContent = product.gsm;
  document.getElementById('pdPrint').textContent = product.printMethod;

  /* Sizes */
  var sizesHtml = '';
  product.sizes.forEach(function(s, i) {
    sizesHtml += '<button type="button" class="size-btn' + (i === 0 ? ' active' : '') + '" onclick="pdSelectSize(this,\'' + s + '\')">' + s + '</button>';
  });
  document.getElementById('pdSizes').innerHTML = sizesHtml;

  /* Colors */
  var colorsHtml = '';
  product.colors.forEach(function(c, i) {
    colorsHtml += '<button type="button" class="color-swatch' + (i === 0 ? ' active' : '') + '" title="' + product.colorNames[i] + '" onclick="pdSelectColor(this,\'' + product.colorNames[i] + '\')">' +
      '<span class="color-swatch-inner" style="background:' + c + '"></span>' +
    '</button>';
  });
  document.getElementById('pdColors').innerHTML = colorsHtml;

  /* Related products */
  var related = getRelatedProducts(id, 3);
  var relHtml = '';
  related.forEach(function(p) {
    relHtml += '<div class="product-card reveal">' +
      '<a href="product.html?id=' + p.id + '">' +
      '<div class="product-img-wrap">' +
        '<img src="' + p.image + '" alt="' + p.name + '">' +
        '<div class="product-overlay"></div>' +
      '</div>' +
      '<div class="product-info">' +
        '<p class="product-tag">' + p.category + '</p>' +
        '<h3 class="product-name">' + p.name + '</h3>' +
        '<p class="product-price">' + p.price + '</p>' +
      '</div>' +
      '</a>' +
    '</div>';
  });
  document.getElementById('relatedGrid').innerHTML = relHtml;
}



/* ========== NAV CART CLICK ========== */

function navCartClick(e) {
  /* On cart.html or checkout.html, just navigate */
  var path = window.location.pathname;
  if (path.indexOf('cart.html') !== -1 || path.indexOf('checkout.html') !== -1) {
    return; /* let the <a> navigate */
  }
  e.preventDefault();
  openSidebarCart();
}

/* ========== PROMO CODES ========== */

var PROMO_CODES = {
  'FIRST10': { type: 'percent', value: 10, minOrder: 0, label: '10% OFF' },
  'BULK20': { type: 'percent', value: 20, minOrder: 2000, label: '20% OFF (min ₹2,000)' }
};

var PROMO_KEY = 'tshirt_promo';

function getAppliedPromo() {
  try {
    var data = localStorage.getItem(PROMO_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) { return null; }
}

function savePromo(promo) {
  try {
    localStorage.setItem(PROMO_KEY, JSON.stringify(promo));
  } catch (e) { /* storage full */ }
}

function clearPromo() {
  try { localStorage.removeItem(PROMO_KEY); } catch (e) {}
}

function calculateDiscount(subtotal) {
  var promo = getAppliedPromo();
  if (!promo) return 0;
  var code = PROMO_CODES[promo.code];
  if (!code) return 0;
  if (subtotal < code.minOrder) return 0;
  if (code.type === 'percent') {
    return Math.round(subtotal * code.value / 100);
  }
  return 0;
}

function applyPromoCode() {
  var input = document.querySelector('.os-promo input');
  var feedback = document.getElementById('promoFeedback');
  if (!input || !feedback) return;

  var code = input.value.trim().toUpperCase();
  feedback.className = 'promo-feedback';

  if (!code) {
    feedback.textContent = 'Please enter a promo code';
    feedback.className = 'promo-feedback error';
    return;
  }

  var promo = PROMO_CODES[code];
  if (!promo) {
    feedback.textContent = 'Invalid promo code';
    feedback.className = 'promo-feedback error';
    clearPromo();
    renderCartPage();
    return;
  }

  var subtotal = getCartTotal();
  if (subtotal < promo.minOrder) {
    feedback.textContent = 'Minimum order ₹' + promo.minOrder.toLocaleString('en-IN') + ' required';
    feedback.className = 'promo-feedback error';
    return;
  }

  savePromo({ code: code });
  feedback.textContent = '✓ ' + promo.label + ' applied!';
  feedback.className = 'promo-feedback success';
  input.value = code;
  input.disabled = true;
  renderCartPage();
}

/* ========== ORDER STORAGE ========== */

var ORDERS_KEY = 'tshirt_orders';

function getOrders() {
  try {
    var data = localStorage.getItem(ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) { return []; }
}

function saveOrder(order) {
  var orders = getOrders();
  orders.push(order);
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch (e) { /* storage full */ }
}

function getOrderById(orderId) {
  var orders = getOrders();
  for (var i = 0; i < orders.length; i++) {
    if (orders[i].id === orderId) return orders[i];
  }
  return null;
}

function formatDate(date) {
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var d = new Date(date);
  return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

function addDays(date, days) {
  var d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/* ========== PAYMENT METHOD SELECTION ========== */

var _selectedPayment = 'cod';

function selectPaymentMethod(method) {
  _selectedPayment = method;
  document.querySelectorAll('.payment-option').forEach(function(opt) {
    opt.classList.remove('active');
  });
  var el = document.querySelector('.payment-option[data-method="' + method + '"]');
  if (el) el.classList.add('active');

  /* Update COD fee in summary */
  updateCheckoutTotals();
}

function updateCheckoutTotals() {
  var subtotal = getCartTotal();
  var discount = calculateDiscount(subtotal);
  var afterDiscount = subtotal - discount;
  var shipping = afterDiscount >= 999 ? 0 : 99;
  var codFee = _selectedPayment === 'cod' ? 49 : 0;
  var total = afterDiscount + shipping + codFee;

  var subEl = document.getElementById('coSubtotal');
  var shipEl = document.getElementById('coShipping');
  var totEl = document.getElementById('coTotal');
  var codFeeEl = document.getElementById('coCodFee');
  var discountEl = document.getElementById('coDiscount');

  if (subEl) subEl.textContent = '₹' + subtotal.toLocaleString('en-IN');
  if (shipEl) shipEl.textContent = shipping === 0 ? 'Free' : '₹' + shipping;
  if (totEl) totEl.textContent = '₹' + total.toLocaleString('en-IN');

  if (codFeeEl) {
    codFeeEl.style.display = codFee > 0 ? 'flex' : 'none';
    var codValEl = codFeeEl.querySelector('.os-row-val');
    if (codValEl) codValEl.textContent = '₹' + codFee;
  }

  if (discountEl) {
    if (discount > 0) {
      discountEl.classList.add('show');
      var discValEl = discountEl.querySelector('.os-row-val');
      if (discValEl) discValEl.textContent = '-₹' + discount.toLocaleString('en-IN');
    } else {
      discountEl.classList.remove('show');
    }
  }
}

/* ========== ORDER TRACKING ========== */

function trackOrder() {
  var input = document.getElementById('trackInput');
  var resultContainer = document.getElementById('trackResult');
  if (!input || !resultContainer) return;

  var orderId = input.value.trim().toUpperCase();
  if (!orderId) {
    input.style.borderColor = 'var(--orange)';
    return;
  }

  var order = getOrderById(orderId);
  if (!order) {
    resultContainer.innerHTML = '<div class="track-error">' +
      '<svg class="track-error-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>' +
      '<h3>ORDER NOT FOUND</h3>' +
      '<p>We couldn\'t find an order with ID <strong>' + orderId + '</strong>. Please check your order confirmation email and try again.</p>' +
    '</div>';
    return;
  }

  /* Determine order status based on age */
  var orderDate = new Date(order.date);
  var now = new Date();
  var daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
  var status, statusClass, steps;

  if (daysDiff < 1) {
    status = 'Processing';
    statusClass = 'processing';
    steps = [true, false, false, false];
  } else if (daysDiff < 3) {
    status = 'Processing';
    statusClass = 'processing';
    steps = [true, true, false, false];
  } else if (daysDiff < 5) {
    status = 'Shipped';
    statusClass = 'shipped';
    steps = [true, true, true, false];
  } else {
    status = 'Delivered';
    statusClass = 'delivered';
    steps = [true, true, true, true];
  }

  var stepLabels = ['Ordered', 'Processing', 'Shipped', 'Delivered'];
  var stepDates = [
    formatDate(orderDate),
    daysDiff >= 1 ? formatDate(addDays(orderDate, 1)) : '—',
    daysDiff >= 3 ? formatDate(addDays(orderDate, 3)) : '—',
    daysDiff >= 5 ? formatDate(addDays(orderDate, 5)) : 'Est. ' + formatDate(addDays(orderDate, 7))
  ];

  var completedCount = steps.filter(function(s) { return s; }).length;
  var progressWidth = completedCount <= 1 ? 0 : ((completedCount - 1) / 3 * 100);

  var html = '<div class="track-result">';
  html += '<div class="track-result-header">';
  html += '<div><p class="track-order-id">' + order.id + '</p><p class="track-order-date">Placed on ' + formatDate(order.date) + '</p></div>';
  html += '<span class="track-status-badge ' + statusClass + '">' + status + '</span>';
  html += '</div>';

  /* Status tracker */
  html += '<div class="status-tracker">';
  html += '<div class="status-tracker-progress" style="width:calc(' + progressWidth + '% - 30px)"></div>';
  for (var i = 0; i < 4; i++) {
    var stepClass = steps[i] ? (i === completedCount - 1 && status !== 'Delivered' ? 'active' : 'completed') : '';
    html += '<div class="status-step ' + stepClass + '">';
    html += '<div class="status-dot"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>';
    html += '<span class="status-step-label">' + stepLabels[i] + '</span>';
    html += '<span class="status-step-date">' + stepDates[i] + '</span>';
    html += '</div>';
  }
  html += '</div>';

  /* Items */
  html += '<div class="track-divider"></div>';
  html += '<div class="track-items-list">';
  order.items.forEach(function(item) {
    html += '<div class="track-item">';
    html += '<img src="' + item.image + '" alt="' + item.name + '" class="track-item-img">';
    html += '<div><p class="track-item-name">' + item.name + '</p><p class="track-item-meta">' + item.size + ' · ' + item.color + ' × ' + item.qty + '</p></div>';
    html += '<span class="track-item-price">₹' + (item.price * item.qty).toLocaleString('en-IN') + '</span>';
    html += '</div>';
  });
  html += '</div>';

  /* Summary */
  html += '<div class="track-summary-grid">';
  html += '<div class="track-summary-card"><h4>Shipping Address</h4><p>' + order.shipping.name + '<br>' + order.shipping.address + '<br>' + order.shipping.city + ', ' + order.shipping.state + ' ' + order.shipping.pincode + '</p></div>';
  html += '<div class="track-summary-card"><h4>Payment Method</h4><p>' + order.payment + '</p></div>';
  html += '</div>';

  /* Totals */
  html += '<div class="track-totals">';
  html += '<div class="track-total-row"><span>Subtotal</span><span>₹' + order.subtotal.toLocaleString('en-IN') + '</span></div>';
  if (order.discount && order.discount > 0) {
    html += '<div class="track-total-row"><span>Discount</span><span style="color:#2ECC71">-₹' + order.discount.toLocaleString('en-IN') + '</span></div>';
  }
  html += '<div class="track-total-row"><span>Shipping</span><span>' + (order.shippingCost === 0 ? 'Free' : '₹' + order.shippingCost) + '</span></div>';
  if (order.codFee && order.codFee > 0) {
    html += '<div class="track-total-row"><span>COD Fee</span><span>₹' + order.codFee + '</span></div>';
  }
  html += '<div class="track-total-row total"><span>Total</span><span>₹' + order.total.toLocaleString('en-IN') + '</span></div>';
  html += '</div>';

  /* Actions */
  html += '<div class="track-actions">';
  if (status === 'Delivered') {
    html += '<a href="returns.html?order=' + order.id + '" class="btn-primary">Request Return / Exchange</a>';
  }
  html += '<a href="products.html" class="btn-outline">Continue Shopping</a>';
  html += '</div>';

  html += '</div>';
  resultContainer.innerHTML = html;
}

/* ========== RETURN / EXCHANGE ========== */

var _returnOrder = null;
var _returnType = 'return';

function lookupOrderForReturn() {
  var input = document.getElementById('returnOrderId');
  var resultContainer = document.getElementById('returnLookupResult');
  if (!input || !resultContainer) return;

  var orderId = input.value.trim().toUpperCase();
  if (!orderId) {
    input.style.borderColor = 'var(--orange)';
    return;
  }

  var order = getOrderById(orderId);
  if (!order) {
    resultContainer.innerHTML = '<p style="color:#E74C3C;font-size:13px;padding:14px 0">Order not found. Please check your Order ID and try again.</p>';
    _returnOrder = null;
    document.getElementById('returnFormFields').style.display = 'none';
    return;
  }

  _returnOrder = order;
  var html = '<div class="order-lookup-result">';
  html += '<p class="lookup-order-id">' + order.id + ' — ' + formatDate(order.date) + '</p>';
  order.items.forEach(function(item, idx) {
    html += '<div class="return-item-check">';
    html += '<input type="checkbox" id="return-item-' + idx + '" name="return-items" value="' + idx + '" checked>';
    html += '<img src="' + item.image + '" alt="' + item.name + '" class="return-item-img">';
    html += '<div class="return-item-info"><p class="return-item-name">' + item.name + '</p><p class="return-item-meta">' + item.size + ' · ' + item.color + ' × ' + item.qty + '</p></div>';
    html += '</div>';
  });
  html += '</div>';
  resultContainer.innerHTML = html;
  document.getElementById('returnFormFields').style.display = 'block';
}

function selectReturnType(type) {
  _returnType = type;
  document.querySelectorAll('.return-type-btn').forEach(function(btn) { btn.classList.remove('active'); });
  document.querySelector('.return-type-btn[data-type="' + type + '"]').classList.add('active');

  var exchangeFields = document.getElementById('exchangeFields');
  if (exchangeFields) {
    if (type === 'exchange') {
      exchangeFields.classList.add('show');
    } else {
      exchangeFields.classList.remove('show');
    }
  }
}

function handleReturnRequest(e) {
  e.preventDefault();
  if (!_returnOrder) return;

  /* Validate at least one item selected */
  var checkedItems = document.querySelectorAll('input[name="return-items"]:checked');
  if (checkedItems.length === 0) {
    alert('Please select at least one item to return/exchange.');
    return;
  }

  var reason = document.getElementById('returnReason');
  if (reason && !reason.value) {
    reason.style.borderColor = 'var(--orange)';
    return;
  }

  /* Generate return ID */
  var returnId = 'RT-' + Date.now().toString(36).toUpperCase();
  document.getElementById('returnIdDisplay').textContent = returnId;

  /* Show success */
  document.getElementById('returnFormCard').style.display = 'none';
  document.getElementById('returnSuccess').style.display = 'block';
  window.scrollTo({ top: document.getElementById('returnSuccess').offsetTop - 100, behavior: 'smooth' });
}

/* ========== ESC KEY HANDLER ========== */

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeQuickView();
    closeSidebarCart();
  }
});

/* ========== UPDATED CART PAGE ========== */
/* (Override renderCartPage to include discount) */

var _origRenderCartPage = typeof renderCartPage === 'function' ? renderCartPage : null;

/* ========== UPDATED CHECKOUT ========== */

function initCheckoutPage() {
  var cart = getCart();
  if (cart.length === 0) {
    window.location.href = 'cart.html';
    return;
  }
  _selectedPayment = 'cod';
  renderCheckoutSummary();

  /* Pre-fill from URL if order ID for return */
  var params = new URLSearchParams(window.location.search);
  var promoCode = getAppliedPromo();
  if (promoCode) {
    updateCheckoutTotals();
  }
}

function renderCheckoutSummary() {
  var container = document.getElementById('checkoutItems');
  if (!container) return;

  var cart = getCart();
  if (cart.length === 0) {
    window.location.href = 'cart.html';
    return;
  }

  var html = '';
  cart.forEach(function(item) {
    html += '<div class="co-item">' +
      '<img src="' + item.image + '" alt="' + item.name + '" class="co-item-img">' +
      '<div class="co-item-info">' +
        '<p class="co-item-name">' + item.name + '</p>' +
        '<p class="co-item-meta">' + item.size + ' · ' + item.color + ' × ' + item.qty + '</p>' +
      '</div>' +
      '<span class="co-item-price">₹' + (item.price * item.qty).toLocaleString('en-IN') + '</span>' +
    '</div>';
  });
  container.innerHTML = html;
  updateCheckoutTotals();
}

function handleCheckout(e) {
  e.preventDefault();

  /* Reset errors */
  document.querySelectorAll('#checkoutForm input, #checkoutForm textarea').forEach(function(el) {
    el.style.borderColor = '';
    el.style.boxShadow = '';
  });

  /* Validate required fields */
  var fields = ['co-name', 'co-email', 'co-phone', 'co-address', 'co-city', 'co-state', 'co-pincode'];
  var isValid = true;

  fields.forEach(function(id) {
    var el = document.getElementById(id);
    if (el && !el.value.trim()) {
      el.style.borderColor = 'var(--orange)';
      el.style.boxShadow = '0 0 0 2px rgba(255, 107, 0, 0.08)';
      isValid = false;
    }
  });

  /* Email validation */
  var emailEl = document.getElementById('co-email');
  if (emailEl && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) {
    emailEl.style.borderColor = 'var(--orange)';
    emailEl.style.boxShadow = '0 0 0 2px rgba(255, 107, 0, 0.08)';
    isValid = false;
  }

  if (!isValid) return;

  /* Build order */
  var cart = getCart();
  var subtotal = getCartTotal();
  var discount = calculateDiscount(subtotal);
  var afterDiscount = subtotal - discount;
  var shippingCost = afterDiscount >= 999 ? 0 : 99;
  var codFee = _selectedPayment === 'cod' ? 49 : 0;
  var total = afterDiscount + shippingCost + codFee;
  var orderId = 'TS-' + Date.now().toString(36).toUpperCase();

  var paymentLabels = {
    'cod': 'Cash on Delivery',
    'upi': 'UPI Payment',
    'card': 'Credit / Debit Card'
  };

  var order = {
    id: orderId,
    date: new Date().toISOString(),
    items: cart,
    shipping: {
      name: document.getElementById('co-name').value.trim(),
      email: document.getElementById('co-email').value.trim(),
      phone: document.getElementById('co-phone').value.trim(),
      address: document.getElementById('co-address').value.trim(),
      city: document.getElementById('co-city').value.trim(),
      state: document.getElementById('co-state').value.trim(),
      pincode: document.getElementById('co-pincode').value.trim()
    },
    payment: paymentLabels[_selectedPayment] || 'Cash on Delivery',
    subtotal: subtotal,
    discount: discount,
    shippingCost: shippingCost,
    codFee: codFee,
    total: total,
    status: 'Processing',
    promoCode: getAppliedPromo() ? getAppliedPromo().code : null
  };

  saveOrder(order);

  /* Update success screen */
  document.getElementById('orderIdDisplay').textContent = orderId;

  var estDelivery = formatDate(addDays(new Date(), 7));
  var detailsHtml = '<div class="success-order-details">';
  detailsHtml += '<div class="success-detail-row"><span>Order ID</span><span style="color:var(--orange);font-family:var(--font-mono);letter-spacing:1px">' + orderId + '</span></div>';
  detailsHtml += '<div class="success-detail-row"><span>Items</span><span>' + cart.length + ' item(s)</span></div>';
  detailsHtml += '<div class="success-detail-row"><span>Payment</span><span>' + order.payment + '</span></div>';
  detailsHtml += '<div class="success-detail-row"><span>Total</span><span style="color:var(--orange)">₹' + total.toLocaleString('en-IN') + '</span></div>';
  detailsHtml += '<div class="success-detail-row"><span>Est. Delivery</span><span>' + estDelivery + '</span></div>';
  detailsHtml += '</div>';

  var detailsContainer = document.getElementById('successOrderDetails');
  if (detailsContainer) detailsContainer.innerHTML = detailsHtml;

  /* Show success */
  document.getElementById('checkoutContent').style.display = 'none';
  document.getElementById('checkoutSuccess').style.display = 'block';

  /* Clear cart & promo */
  clearCart();
  clearPromo();
  updateCartBadge();
}

/* ========== UPDATED CART PAGE RENDER ========== */

function renderCartPage() {
  var container = document.getElementById('cartItemsList');
  var summaryEl = document.getElementById('cartSummary');
  var emptyEl = document.getElementById('cartEmpty');
  if (!container) return;

  var cart = getCart();

  if (cart.length === 0) {
    container.style.display = 'none';
    if (summaryEl) summaryEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'block';
    clearPromo();
    return;
  }

  container.style.display = 'block';
  if (summaryEl) summaryEl.style.display = 'block';
  if (emptyEl) emptyEl.style.display = 'none';

  var html = '';
  cart.forEach(function(item, idx) {
    html += '<div class="cart-row">' +
      '<img src="' + item.image + '" alt="' + item.name + '" class="cart-row-img">' +
      '<div>' +
        '<p class="cart-row-name">' + item.name + '</p>' +
        '<p class="cart-row-meta">' + item.size + ' · ' + item.color + '</p>' +
      '</div>' +
      '<div class="qty-stepper">' +
        '<button type="button" onclick="cartPageQty(' + idx + ',-1)" aria-label="Decrease">−</button>' +
        '<span>' + item.qty + '</span>' +
        '<button type="button" onclick="cartPageQty(' + idx + ',1)" aria-label="Increase">+</button>' +
      '</div>' +
      '<span class="cart-row-price">₹' + (item.price * item.qty).toLocaleString('en-IN') + '</span>' +
      '<button type="button" class="cart-row-remove" onclick="cartPageRemove(' + idx + ')" aria-label="Remove">' +
        '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button>' +
    '</div>';
  });
  container.innerHTML = html;

  /* Update summary with promo discount */
  var subtotal = getCartTotal();
  var discount = calculateDiscount(subtotal);
  var afterDiscount = subtotal - discount;
  var shipping = afterDiscount >= 999 ? 0 : 99;
  var total = afterDiscount + shipping;

  var subEl = document.getElementById('cartSubtotal');
  var shipEl = document.getElementById('cartShipping');
  var totEl = document.getElementById('cartTotal');
  var discountEl = document.getElementById('cartDiscountRow');

  if (subEl) subEl.textContent = '₹' + subtotal.toLocaleString('en-IN');
  if (shipEl) shipEl.textContent = shipping === 0 ? 'Free' : '₹' + shipping;
  if (totEl) totEl.textContent = '₹' + total.toLocaleString('en-IN');

  if (discountEl) {
    if (discount > 0) {
      discountEl.classList.add('show');
      var discValEl = discountEl.querySelector('.os-row-val');
      if (discValEl) discValEl.textContent = '-₹' + discount.toLocaleString('en-IN');
    } else {
      discountEl.classList.remove('show');
    }
  }
}

function cartPageQty(index, delta) {
  var cart = getCart();
  if (index >= 0 && index < cart.length) {
    var newQty = cart[index].qty + delta;
    if (newQty < 1) {
      removeFromCart(index);
    } else {
      updateCartItemQty(index, newQty);
    }
    renderCartPage();
    updateCartBadge();
  }
}

function cartPageRemove(index) {
  removeFromCart(index);
  renderCartPage();
  updateCartBadge();
}

function initCartPage() {
  renderCartPage();

  /* Restore promo if applied */
  var promo = getAppliedPromo();
  if (promo) {
    var input = document.querySelector('.os-promo input');
    var feedback = document.getElementById('promoFeedback');
    if (input) {
      input.value = promo.code;
      input.disabled = true;
    }
    if (feedback) {
      var codeData = PROMO_CODES[promo.code];
      feedback.textContent = '✓ ' + (codeData ? codeData.label : '') + ' applied!';
      feedback.className = 'promo-feedback success';
    }
  }
}

/* ========== TRACK ORDER PAGE INIT ========== */

function initTrackOrderPage() {
  var params = new URLSearchParams(window.location.search);
  var orderId = params.get('id');
  if (orderId) {
    var input = document.getElementById('trackInput');
    if (input) {
      input.value = orderId;
      trackOrder();
    }
  }
}

/* ========== RETURN PAGE INIT ========== */

function initReturnPage() {
  var params = new URLSearchParams(window.location.search);
  var orderId = params.get('order');
  if (orderId) {
    var input = document.getElementById('returnOrderId');
    if (input) {
      input.value = orderId;
      lookupOrderForReturn();
    }
  }
}

/* --- Init on load --- */
window.addEventListener('DOMContentLoaded', function () {
  attachReveal();
  updateCartBadge();

  /* Init page-specific logic */
  if (document.getElementById('listingsGrid') && document.getElementById('audienceTabs')) {
    var params = new URLSearchParams(window.location.search);
    var urlAudience = params.get('audience') || 'all';
    var urlCategory = params.get('category') || 'all';

    _currentAudience = urlAudience;
    _currentCategory = urlCategory;

    // Update active state in audience tabs
    document.querySelectorAll('.audience-tab').forEach(function(b) {
      if (b.getAttribute('data-audience') === urlAudience) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    // Rebuild the category pills
    buildCategoryPills(urlAudience);

    // Set active category pill if not 'all'
    if (urlCategory !== 'all') {
      document.querySelectorAll('#filterBar .filter-btn').forEach(function(b) {
        if (b.getAttribute('data-filter') === urlCategory) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
    }

    renderProductGrid();
  }
  if (document.getElementById('pdMainImg')) {
    initProductDetailPage();
    setTimeout(attachReveal, 100);
  }
  if (document.getElementById('cartItemsList')) {
    initCartPage();
  }
  if (document.getElementById('checkoutForm')) {
    initCheckoutPage();
  }
  if (document.getElementById('trackInput')) {
    initTrackOrderPage();
  }
  if (document.getElementById('returnOrderId')) {
    initReturnPage();
  }
  if (document.getElementById('latestDropsSlider')) {
    initHomepageSliders();
    setTimeout(attachReveal, 100);
  }
});

/* ========== HOMEPAGE SLIDERS ========== */

function initHomepageSliders() {
  if (typeof PRODUCTS === 'undefined') return;

  // 1. Latest Drops (first 8 products)
  var latest = PRODUCTS.slice(0, 8);
  renderSliderItems('latestDropsSlider', latest);

  // 2. Bestsellers (products with "Bestseller" badge)
  var bestsellers = PRODUCTS.filter(function(p) { return p.badge === 'Bestseller'; }).slice(0, 8);
  renderSliderItems('bestsellersSlider', bestsellers);

  // 3. Summer Collection (Bikinis and summer-themed items)
  var summer = PRODUCTS.filter(function(p) {
    var name = p.name.toLowerCase();
    var desc = p.description.toLowerCase();
    return p.catSlug === 'bikini' || 
           p.catSlug === 'western' ||
           name.includes('summer') || name.includes('linen') || name.includes('beach') || name.includes('swim') ||
           desc.includes('summer') || desc.includes('linen') || desc.includes('beach') || desc.includes('swim');
  }).slice(0, 10);
  
  if (summer.length < 4) {
    var extra = PRODUCTS.filter(function(p) { return summer.indexOf(p) === -1; }).slice(0, 4);
    summer = summer.concat(extra);
  }
  renderSliderItems('summerSlider', summer);
}

function renderSliderItems(containerId, products) {
  var container = document.getElementById(containerId);
  if (!container) return;
  
  var html = '';
  products.forEach(function(p) {
    html += '<div class="product-card slider-card reveal">' +
      '<a href="product.html?id=' + p.id + '">' +
      '<div class="product-img-wrap">' +
        '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy">' +
        (p.badge ? '<span class="product-badge">' + p.badge + '</span>' : '') +
        '<div class="product-overlay"></div>' +
      '</div>' +
      '</a>' +
      '<div class="product-info">' +
        '<p class="product-tag">' + p.category + '</p>' +
        '<h3 class="product-name"><a href="product.html?id=' + p.id + '">' + p.name + '</a></h3>' +
        '<p class="product-price">' + p.price + '</p>' +
      '</div>' +
      '<button type="button" class="product-action" onclick="addToCart(\'' + p.id + '\', \'M\', \'' + (p.colorNames[0] || 'Default') + '\', 1)">Add to Cart</button>' +
    '</div>';
  });
  container.innerHTML = html;
  
  // Setup autoscroll
  startAutoscroll(containerId);
  if (!container.parentElement.hasAttribute('data-autoscroll')) {
    container.parentElement.setAttribute('data-autoscroll', 'true');
    container.parentElement.addEventListener('mouseenter', function() { stopAutoscroll(containerId); });
    container.parentElement.addEventListener('mouseleave', function() { startAutoscroll(containerId); });
    container.parentElement.addEventListener('touchstart', function() { stopAutoscroll(containerId); }, {passive: true});
    container.parentElement.addEventListener('touchend', function() { startAutoscroll(containerId); });
  }
}

var _sliderIntervals = {};

function startAutoscroll(sliderId) {
  if (_sliderIntervals[sliderId]) clearInterval(_sliderIntervals[sliderId]);
  _sliderIntervals[sliderId] = setInterval(function() {
    scrollSlider(sliderId, 1);
  }, 4000);
}

function stopAutoscroll(sliderId) {
  if (_sliderIntervals[sliderId]) clearInterval(_sliderIntervals[sliderId]);
}

function scrollSlider(sliderId, direction) {
  var slider = document.getElementById(sliderId);
  if (slider) {
    var card = slider.querySelector('.product-card');
    var scrollAmount = 320;
    if (card) {
      var style = window.getComputedStyle(card);
      var margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
      scrollAmount = (card.offsetWidth + (isNaN(margin) ? 24 : margin));
    }
    
    // Endless scroll detection
    var isAtEnd = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 5;
    var isAtStart = slider.scrollLeft <= 5;

    if (direction === 1 && isAtEnd) {
      slider.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (direction === -1 && isAtStart) {
      slider.scrollTo({ left: slider.scrollWidth, behavior: 'smooth' });
    } else {
      slider.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
    }
  }
}

/* ========== AUTH & ACCOUNTS ========== */

var USER_KEY = 'tshirt_current_user';
var USERS_DB_KEY = 'tshirt_users_db';

function getDbUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_DB_KEY)) || [];
  } catch(e) { return []; }
}

function saveDbUsers(users) {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch(e) { return null; }
}

function loginUser(email, password) {
  var users = getDbUsers();
  var user = users.find(function(u) { return u.email === email && u.password === password; });
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return true;
  }
  return false;
}

function registerUser(userObj) {
  var users = getDbUsers();
  if (users.find(function(u) { return u.email === userObj.email; })) return false;
  userObj.id = 'USR-' + Date.now();
  userObj.addresses = [];
  users.push(userObj);
  saveDbUsers(users);
  localStorage.setItem(USER_KEY, JSON.stringify(userObj));
  return true;
}

function logoutUser() {
  localStorage.removeItem(USER_KEY);
  window.location.href = 'index.html';
}

function updateCurrentUser(newData) {
  var currentUser = getCurrentUser();
  if (!currentUser) return;
  var users = getDbUsers();
  var index = users.findIndex(function(u) { return u.id === currentUser.id; });
  if (index !== -1) {
    users[index] = Object.assign({}, users[index], newData);
    saveDbUsers(users);
    localStorage.setItem(USER_KEY, JSON.stringify(users[index]));
  }
}

function mockGoogleLogin() {
  var mockUser = {
    email: 'googleuser@example.com',
    name: 'Google User',
    phone: '1234567890',
    password: 'mock_google_pwd'
  };
  var users = getDbUsers();
  var existing = users.find(function(u) { return u.email === mockUser.email; });
  if (existing) {
    localStorage.setItem(USER_KEY, JSON.stringify(existing));
  } else {
    registerUser(mockUser);
  }
  window.location.href = 'account.html';
}

function updateNavForAuth() {
  var currentUser = getCurrentUser();
  var actionsContainer = document.querySelector('.nav-actions');
  if (!actionsContainer) return;
  
  var getQuoteBtn = actionsContainer.querySelector('.btn-nav');
  var existingUserBtn = actionsContainer.querySelector('.nav-user-btn');
  var existingLoginBtn = actionsContainer.querySelector('.nav-login-btn');
  
  if (currentUser) {
    if (getQuoteBtn) getQuoteBtn.style.display = 'none';
    if (existingLoginBtn) existingLoginBtn.remove();
    if (!existingUserBtn) {
      var userLink = document.createElement('a');
      userLink.href = 'account.html';
      userLink.className = 'nav-user-btn btn-nav';
      userLink.textContent = 'My Account';
      actionsContainer.appendChild(userLink);
    }
  } else {
    if (getQuoteBtn) getQuoteBtn.style.display = 'none'; // Replaced Get Quote with Login
    if (existingUserBtn) existingUserBtn.remove();
    if (!existingLoginBtn) {
      var loginLink = document.createElement('a');
      loginLink.href = 'login.html';
      loginLink.className = 'nav-login-btn btn-nav';
      loginLink.textContent = 'Log In';
      actionsContainer.appendChild(loginLink);
    }
  }
}

document.addEventListener('DOMContentLoaded', updateNavForAuth);
