# T-SHIRT Premium Custom Apparel Platform

## 🎯 Project Overview

T-SHIRT is a modern, professional web platform for premium custom T-shirt printing and personalization services. The platform caters to individuals, brands, creators, events, and businesses — featuring a complete e-commerce experience with product browsing, quick view, cart management, and checkout.

---

## 📂 PROJECT STRUCTURE

### Core Files

```
New Project/
│
├── index.html              # Home page (hero, products, testimonials, CTA)
├── about.html              # Company story, mission, and values
├── services.html           # Service offerings and how it works
├── products.html           # Product catalog with filtering & quick view
├── product.html            # Single product detail page (dynamic)
├── cart.html               # Full cart page with order summary
├── checkout.html           # Checkout form with order confirmation
├── contact.html            # Contact form and business information
│
├── style.css               # All styling (~63 KB) - centralized design system
├── script.js               # Main JS - UI logic, modals, page init (~14 KB)
├── products-data.js         # Product catalog data store (single source of truth)
├── cart.js                  # Cart state management (localStorage)
│
├── README.md               # This file
└── PROJECT_SUMMARY.md      # Legacy project documentation
```

---

## 🎨 KEY FEATURES

### **Pages**

1. **Home (index.html)**
   - Hero section with CTA buttons
   - Trust/testimonial strip
   - Benefits showcase
   - Service preview (3 featured services)
   - Featured products (3 latest drops)
   - Testimonials grid
   - About preview
   - Newsletter signup
   - Nav cart icon with badge + sidebar cart

2. **About (about.html)**
   - Company hero section
   - Story/mission section
   - Differentiators (what makes us unique)
   - Statistics showcase
   - Team/culture highlights

3. **Services (services.html)**
   - Full service grid (6 offerings)
   - How it works (4-step process)
   - FAQ section with accordion
   - CTA band

4. **Products (products.html)**
   - Product hero section
   - Category filter bar (All, Custom, Oversized, Corporate, Graphic, Event)
   - 9 product cards with hover effects & quick-view eye button
   - Quick View modal with gallery, size/color selectors, qty stepper
   - Sidebar cart drawer for quick add-to-cart flow
   - Custom CTA banner

5. **Product Detail (product.html)** ✨ NEW
   - Dynamic page populated via URL parameter (`?id=product-slug`)
   - Image gallery with thumbnail navigation
   - Product specs grid (Fabric, Weight, Print method)
   - Size selector buttons
   - Color swatch selector
   - Quantity stepper
   - Add to Cart + Buy Now buttons
   - "You May Also Like" related products section
   - Breadcrumb navigation

6. **Cart (cart.html)** ✨ NEW
   - Cart hero section
   - Cart items list with product image, name, size/color, qty stepper, remove
   - Order summary sidebar (subtotal, shipping, total, promo code)
   - Empty cart state with CTA
   - "Proceed to Checkout" flow

7. **Checkout (checkout.html)** ✨ NEW
   - Checkout hero section
   - Shipping details form (name, email, phone, address, city, state, pincode)
   - Order notes textarea
   - Order summary with item list and totals
   - Client-side validation with visual error states
   - Order confirmation success screen with generated order ID
   - Auto cart clearing on successful order

8. **Contact (contact.html)**
   - Contact hero section
   - Professional contact form with validation
   - Contact information sidebar
   - Business hours, map, social links

---

## 🛒 E-COMMERCE SYSTEM

### **Cart Architecture**
- **State**: `localStorage` via `cart.js` — persists across page navigations
- **API**: `getCart()`, `addToCart()`, `removeFromCart()`, `updateCartItemQty()`, `clearCart()`, `getCartTotal()`, `getCartCount()`
- **Badge**: Auto-updating cart count badge on all pages
- **Sidebar**: Slide-in cart drawer on every page for quick review

### **Product Data Store**
- Centralized in `products-data.js` as a single source of truth
- 9 products with: id, name, category, price, description, gallery (3 images each), sizes, colors, fabric, GSM, print method
- Helper functions: `getProductById()`, `getRelatedProducts()`, `getProductsByCategory()`

### **Quick View Modal**
- Opens from eye icon on product cards
- Image gallery with thumbnail navigation
- Size buttons, color swatches, quantity stepper
- "Add to Cart" adds item and opens sidebar cart
- "View Full Details" links to product detail page

### **Checkout Flow**
```
Products → Quick View / Product Detail → Add to Cart → Sidebar Cart
                                                          ↓
                                              Cart Page → Checkout → Order Confirmation
```

---

## 🛠️ TECHNICAL FEATURES

### **CSS Architecture**
- **Centralized**: Single `style.css` file (no inline styles)
- **Design System**: CSS variables for colors, fonts, spacing
- **Responsive**: Mobile-first approach with breakpoints at 960px, 580px
- **Animations**: Smooth transitions and scroll reveal effects
- **Typography**: 3 custom fonts via Google Fonts
  - Bebas Neue (headers)
  - DM Sans (body)
  - Space Mono (technical/labels)

### **JavaScript Functionality**
Split across 3 files for separation of concerns:

#### `script.js` — UI Logic
1. **Mobile Navigation** — `toggleMobile()`, `closeMobile()`
2. **Scroll Effects** — `attachReveal()` (Intersection Observer)
3. **Form Handling** — `handleSubmit(e)`, `handleCheckout(e)` with validation
4. **User Interactions** — `subscribeNewsletter()`, `toggleFaq()`, `filterItems()`
5. **Quick View Modal** — `openQuickView()`, `closeQuickView()`, gallery/selectors
6. **Product Detail Init** — `initProductDetailPage()` (URL param → dynamic render)
7. **Cart Page Init** — `initCartPage()`, `renderCartPage()`, qty/remove handlers
8. **Checkout Init** — `initCheckoutPage()`, `renderCheckoutSummary()`
9. **ESC Key Handler** — closes modals and sidebar cart

#### `cart.js` — State Management
- localStorage-based cart CRUD
- Sidebar cart open/close/render
- Cart badge count updates
- Cart total calculations

#### `products-data.js` — Data Store
- Product catalog array
- Lookup and filter helpers

---

## 🎨 DESIGN SYSTEM

### **Colors**
```css
--black: #0F0F0F (Primary)
--black-2: #111111 (Secondary)
--orange: #FF6B00 (Accent)
--white: #FFFFFF (Text)
--gray-100: #F5F5F5 (Light backgrounds)
```

### **Typography**
- **Headings**: Bebas Neue (letter-spacing: 2-5px)
- **Body**: DM Sans (font-weight: 300-700)
- **Labels**: Space Mono (font-size: 10-12px)

### **Spacing**
- Base unit: 4px
- Common: 8px, 14px, 18px, 22px, 28px

### **Breakpoints**
- Desktop: 1200px+
- Tablet: 961px - 1199px
- Mobile: 580px - 960px
- Small Mobile: < 580px

---

## 🔗 NAVIGATION MAP

```
Home ─┬─ About
      ├─ Services
      ├─ Products ──→ Product Detail ──→ Cart ──→ Checkout
      ├─ Contact
      └─ Cart (nav icon / sidebar on all pages)
```

All pages share:
- Navbar with cart icon + badge
- Mobile hamburger menu with cart link
- Sidebar cart drawer
- Newsletter footer
- Social media links

---

## 📧 CONTACT INFORMATION

**Email**: hello@tshirt.in, orders@tshirt.in
**Phone**: +91 98765 43210
**Social**: Instagram, Facebook, WhatsApp, Pinterest (@tshirtbranding)
**Address**: 42 Printing Hub Complex, Andheri East, Mumbai - 400069, India
**Hours**: Mon–Sat 9:00 AM – 7:00 PM IST

---

## 📋 FIXES & IMPROVEMENTS APPLIED

✅ **Fixed Footer Nesting** — services.html and contact.html had malformed `</a>` / `</div>` nesting
✅ **Removed Dead Code** — Unused `.page` CSS class system and `validPages` JS variable removed
✅ **Added Cart System** — Full localStorage cart with sidebar drawer on every page
✅ **Added Quick View** — Eye-icon modal on product cards with gallery & selectors
✅ **Added Product Detail** — Dynamic single product page with URL params
✅ **Added Cart Page** — Full cart with qty adjustments, remove, and order summary
✅ **Added Checkout** — Shipping form with validation and order confirmation
✅ **Added Nav Cart Icon** — Shopping bag icon with live badge count on all pages
✅ **Centralized Product Data** — Single `products-data.js` as source of truth
✅ **Consistent Mobile Menu** — Cart link added to all mobile menus

---

## 🚀 DEPLOYMENT GUIDE

### Prerequisites
- Web server with HTTP support
- Modern browser (Chrome, Firefox, Safari, Edge)
- No backend needed (static site)

### Steps
1. Upload all files to web server
2. Ensure `style.css`, `script.js`, `cart.js`, and `products-data.js` are in root
3. Test all links, forms, and cart flow
4. Verify responsive design on mobile

### Local Development
```bash
# Start a local server
python3 -m http.server 8080
# Then open http://localhost:8080
```

### Hosting Options
- Netlify (free tier available)
- Vercel
- GitHub Pages
- Traditional web hosting

---

## 🔍 BROWSER SUPPORT

- ✓ Chrome 90+
- ✓ Firefox 88+
- ✓ Safari 14+
- ✓ Edge 90+
- ✓ Mobile browsers (iOS Safari, Chrome Mobile)

---

## ♿ ACCESSIBILITY

- ARIA labels on interactive elements (cart, modals, buttons)
- Semantic HTML structure
- Keyboard navigation support (ESC closes modals)
- Color contrast compliance
- Responsive text sizing
- Focus indicators visible

---

## 📈 SEO OPTIMIZATION

- Meta descriptions on all pages
- Keyword-rich titles
- Dynamic page titles (product detail)
- Mobile responsive
- Fast loading times
- Proper heading hierarchy (single H1 per page)
- Image alt attributes

---

## 📝 FUTURE ENHANCEMENTS

1. Backend integration for form submissions and orders
2. Payment gateway integration (Razorpay / Stripe)
3. Product search & sort functionality
4. User accounts & order history
5. Wishlist feature
6. Live chat support
7. Analytics dashboard
8. CMS for content management
9. Inventory management system
10. Order tracking & email notifications

---

**Last Updated**: June 12, 2026
**Status**: Production Ready ✓
**Version**: 2.0 — E-Commerce Edition
