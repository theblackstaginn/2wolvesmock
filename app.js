/* app.js — 2WolvesMock (CART + QUICK VIEW)
   - Year
   - Quick view lightbox with qty + add to cart
   - Cart drawer (pickup only), stored in localStorage
*/

(() => {
  "use strict";

  // ---------- Helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const money = (n) => {
    if (typeof n !== "number" || !Number.isFinite(n)) return "—";
    return `$${n.toFixed(2)}`;
  };

  const lockScroll = (locked) => {
    document.documentElement.style.overflow = locked ? "hidden" : "";
    document.body.style.overflow = locked ? "hidden" : "";
  };

  // ---------- Footer year ----------
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---------- State ----------
  const STORAGE_KEY = "twolves_cart_v1";

  /** cart shape: { [sku]: { sku, title, img, price:number|null, qty:number } } */
  let cart = {};

  const loadCart = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      cart = raw ? JSON.parse(raw) : {};
      if (!cart || typeof cart !== "object") cart = {};
    } catch {
      cart = {};
    }
  };

  const saveCart = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch {}
  };

  const cartCount = () => {
    return Object.values(cart).reduce((sum, it) => sum + (it.qty || 0), 0);
  };

  const cartTotal = () => {
    // If any item has no price, total is unknown
    const items = Object.values(cart);
    if (items.some(it => typeof it.price !== "number")) return null;
    return items.reduce((sum, it) => sum + it.price * it.qty, 0);
  };

  // ---------- Quick View elements ----------
  const lightbox = $("#lightbox");
  const lbTitle = $("#lightboxTitle");
  const lbImg = $("#lightboxImg");
  const lbPrice = $("#lightboxPrice");
  const qtyInput = $("#qtyInput");
  const addBtn = $("#addToCartBtn");
  const viewCartBtn = $("#viewCartBtn");

  // ---------- Cart elements ----------
  const cartEl = $("#cart");
  const cartItemsEl = $("#cartItems");
  const cartCountEl = $("#cartCount");
  const cartTotalItemsEl = $("#cartTotalItems");
  const cartTotalPriceEl = $("#cartTotalPrice");
  const pickupEmailBtn = $("#pickupEmailBtn");

  // Current product being viewed
  let current = null;

  const setCartBadge = () => {
    if (cartCountEl) cartCountEl.textContent = String(cartCount());
  };

  // ---------- Lightbox open/close ----------
  const isLightboxOpen = () => lightbox?.getAttribute("aria-hidden") === "false";
  const openLightbox = (product) => {
    if (!lightbox || !lbTitle || !lbImg || !qtyInput || !addBtn) return;
    if (!product?.img) return;

    current = product;

    lbTitle.textContent = product.title || "";
    lbImg.src = product.img;
    lbImg.alt = product.title || "";
    qtyInput.value = "1";

    if (lbPrice) {
      lbPrice.textContent =
        typeof product.price === "number" ? `Price: ${money(product.price)}` : "Price: —";
    }

    lightbox.setAttribute("aria-hidden", "false");
    lockScroll(true);
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.setAttribute("aria-hidden", "true");
    if (lbImg) { lbImg.src = ""; lbImg.alt = ""; }
    if (lbTitle) lbTitle.textContent = "";
    if (lbPrice) lbPrice.textContent = "";
    current = null;
    lockScroll(false);
  };

  // ---------- Cart open/close ----------
  const isCartOpen = () => cartEl?.getAttribute("aria-hidden") === "false";

  const openCart = () => {
    if (!cartEl) return;
    cartEl.setAttribute("aria-hidden", "false");
    lockScroll(true);
    renderCart();
  };

  const closeCart = () => {
    if (!cartEl) return;
    cartEl.setAttribute("aria-hidden", "true");
    lockScroll(false);
  };

  // ---------- Cart mutations ----------
  const addToCart = (product, qty) => {
    if (!product?.sku) return;
    const q = Math.max(1, Math.min(99, Number(qty) || 1));

    const existing = cart[product.sku];
    if (existing) {
      existing.qty = Math.max(1, Math.min(99, existing.qty + q));
    } else {
      cart[product.sku] = {
        sku: product.sku,
        title: product.title || "Item",
        img: product.img || "",
        price: typeof product.price === "number" ? product.price : null,
        qty: q
      };
    }
    saveCart();
    setCartBadge();
  };

  const setQty = (sku, qty) => {
    const it = cart[sku];
    if (!it) return;
    const q = Number(qty) || 0;
    if (q <= 0) delete cart[sku];
    else it.qty = Math.max(1, Math.min(99, q));
    saveCart();
    setCartBadge();
    renderCart();
  };

  const removeItem = (sku) => {
    delete cart[sku];
    saveCart();
    setCartBadge();
    renderCart();
  };

  // ---------- Cart rendering ----------
  const renderCart = () => {
    if (!cartItemsEl || !cartTotalItemsEl || !cartTotalPriceEl) return;

    const items = Object.values(cart);
    cartTotalItemsEl.textContent = String(cartCount());

    const total = cartTotal();
    cartTotalPriceEl.textContent = total === null ? "—" : money(total);

    if (!items.length) {
      cartItemsEl.innerHTML = `<p style="color:rgba(242,244,246,.70);margin:0;">Cart is empty.</p>`;
    } else {
      cartItemsEl.innerHTML = items.map(it => {
        const priceStr = typeof it.price === "number" ? money(it.price) : "—";
        return `
          <div class="cart-item" data-sku="${it.sku}">
            <div class="cart-thumb">
              <img src="${it.img}" alt="${it.title}">
            </div>
            <div class="cart-meta">
              <div class="cart-name">${it.title}</div>
              <div class="cart-line">
                <span>Price: ${priceStr}</span>
                <div class="cart-qty">
                  <button type="button" data-act="dec" aria-label="Decrease quantity">−</button>
                  <span>Qty: <strong>${it.qty}</strong></span>
                  <button type="button" data-act="inc" aria-label="Increase quantity">+</button>
                </div>
                <button class="cart-remove" type="button" data-act="remove">Remove</button>
              </div>
            </div>
          </div>
        `;
      }).join("");
    }

    // Build pickup email link
    if (pickupEmailBtn) {
      const lines = items.map(it => `- ${it.title} (qty ${it.qty})`);
      const subject = encodeURIComponent("Pickup Order Request — 2 Wolves Apothecary");
      const body = encodeURIComponent(
        `Hi! I'd like to request pickup for:\n\n${lines.join("\n")}\n\nPreferred pickup day/time:\nName:\nPhone:\n\nThanks!`
      );
      pickupEmailBtn.href = `mailto:thefarm1965@gmail.com?subject=${subject}&body=${body}`;
    }
  };

  // ---------- Wire up UI ----------
  loadCart();
  setCartBadge();

  // Open quick view by clicking cards
  document.addEventListener("click", (e) => {
    // Close lightbox
    if (e.target.closest?.(".lightbox-close") || e.target.closest?.(".lightbox-backdrop")) {
      if (isLightboxOpen()) { e.preventDefault(); closeLightbox(); }
      return;
    }

    // Close cart
    if (e.target.closest?.(".cart-close") || e.target.closest?.(".cart-backdrop")) {
      if (isCartOpen()) { e.preventDefault(); closeCart(); }
      return;
    }

    // Open cart from button
    if (e.target.closest?.(".cart-open")) {
      e.preventDefault();
      openCart();
      return;
    }

    // Cart item actions
    const cartItem = e.target.closest?.(".cart-item");
    if (cartItem && e.target.closest?.("[data-act]")) {
      e.preventDefault();
      const sku = cartItem.getAttribute("data-sku");
      const act = e.target.closest("[data-act]").getAttribute("data-act");
      const it = cart[sku];
      if (!it) return;

      if (act === "inc") setQty(sku, it.qty + 1);
      if (act === "dec") setQty(sku, it.qty - 1);
      if (act === "remove") removeItem(sku);
      return;
    }

    // Open quick view from cards
    const card = e.target.closest?.(".card");
    if (card) {
      e.preventDefault();
      const product = {
        sku: (card.dataset.sku || "").trim(),
        title: (card.dataset.title || "").trim(),
        img: (card.dataset.img || "").trim(),
        price: card.dataset.price ? Number(card.dataset.price) : null
      };
      openLightbox(product);
    }
  });

  // Add to cart inside quick view
  addBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!current) return;

    const qty = Number(qtyInput?.value || 1);
    addToCart(current, qty);

    // Optional behavior: open cart after adding
    closeLightbox();
    openCart();
  });

  // View cart from quick view
  viewCartBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    closeLightbox();
    openCart();
  });

  // Escape closes whichever is open (desktop)
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (isLightboxOpen()) closeLightbox();
    if (isCartOpen()) closeCart();
  });
})();