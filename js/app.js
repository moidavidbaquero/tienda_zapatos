const STORAGE = {
  cart: "urbanstep_cart",
  favorites: "urbanstep_favorites",
  users: "urbanstep_users",
  session: "urbanstep_session",
  checkout: "urbanstep_checkout"
};

const money = value => new Intl.NumberFormat("es-CO", {style:"currency", currency:"COP", maximumFractionDigits:0}).format(value);

function readStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function writeStorage(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

function getCart() { return readStorage(STORAGE.cart, []); }
function saveCart(cart) { writeStorage(STORAGE.cart, cart); updateHeaderCounters(); }
function getFavorites() { return readStorage(STORAGE.favorites, []); }
function saveFavorites(ids) { writeStorage(STORAGE.favorites, ids); updateHeaderCounters(); }

function updateHeaderCounters() {
  const cartCount = getCart().reduce((sum, item) => sum + item.cantidad, 0);
  const favCount = getFavorites().length;
  document.querySelectorAll("#cart-count").forEach(el => el.textContent = cartCount);
  document.querySelectorAll("#favorites-count").forEach(el => el.textContent = favCount);
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function toggleFavorite(id) {
  let favorites = getFavorites();
  if (favorites.includes(id)) {
    favorites = favorites.filter(favId => favId !== id);
    showToast("Producto eliminado de favoritos");
  } else {
    favorites.push(id);
    showToast("Producto agregado a favoritos");
  }
  saveFavorites(favorites);
  document.querySelectorAll(`[data-favorite-id="${id}"]`).forEach(btn => {
    btn.classList.toggle("active", favorites.includes(id));
    btn.setAttribute("aria-label", favorites.includes(id) ? "Quitar de favoritos" : "Agregar a favoritos");
  });
}

function isFavorite(id) { return getFavorites().includes(id); }

function addToCart(product, color, talla, cantidad = 1) {
  if (!color || !talla) {
    showToast("Selecciona color y talla antes de continuar", "error");
    return false;
  }
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id && item.color === color && Number(item.talla) === Number(talla));
  const desired = existing ? existing.cantidad + cantidad : cantidad;
  if (desired > product.stock) {
    showToast(`Stock disponible: ${product.stock}`, "error");
    return false;
  }
  if (existing) existing.cantidad = desired;
  else cart.push({id: product.id, color, talla: Number(talla), cantidad});
  saveCart(cart);
  showToast("Producto agregado al carrito");
  return true;
}

function removeFromCart(id, color, talla) {
  const cart = getCart().filter(item => !(item.id === id && item.color === color && Number(item.talla) === Number(talla)));
  saveCart(cart);
  showToast("Producto eliminado");
}

function changeCartQuantity(id, color, talla, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id && i.color === color && Number(i.talla) === Number(talla));
  const product = productos.find(p => p.id === id);
  if (!item || !product) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) return removeFromCart(id, color, talla);
  if (item.cantidad > product.stock) { item.cantidad = product.stock; showToast("Alcanzaste el stock disponible", "error"); }
  saveCart(cart);
}

function renderProductCard(product) {
  const favorite = isFavorite(product.id);
  const oldPrice = product.precioAnterior ? `<del>${money(product.precioAnterior)}</del>` : "";
  const discount = product.descuento ? `<span class="discount">-${product.descuento}%</span>` : "";
  return `
    <article class="product-card">
      <div class="product-image-wrap">
        <a href="producto.html?id=${product.id}" class="product-image-link">
          <img src="${product.imagen}" alt="${product.nombre}" loading="lazy" onerror="this.src='https://placehold.co/700x700?text=UrbanStep'">
        </a>
        ${discount}
        <button class="favorite-btn ${favorite ? "active" : ""}" data-favorite-id="${product.id}" aria-label="${favorite ? "Quitar de favoritos" : "Agregar a favoritos"}">♡</button>
      </div>
      <div class="product-info">
        <p class="product-category">${product.categoria} · ${product.tipo}</p>
        <h3><a href="producto.html?id=${product.id}">${product.nombre}</a></h3>
        <div class="product-price"><strong>${money(product.precio)}</strong>${oldPrice}</div>
        <div class="product-meta"><span>${product.colores.length} colores</span><span>Tallas ${product.tallas[0]}-${product.tallas[product.tallas.length-1]}</span></div>
        <div class="color-dots">${product.colores.slice(0,5).map(c => `<span class="color-dot" title="${c}"></span>`).join("")}</div>
        <div class="card-actions"><a class="btn btn-outline" href="producto.html?id=${product.id}">Ver producto</a><button class="btn btn-dark add-card-btn" data-id="${product.id}">Agregar</button></div>
      </div>
    </article>`;
}

function renderProductGrid(list, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!list.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">⌕</div><h2>No hay productos disponibles</h2><p>Prueba cambiando los filtros o realizando otra búsqueda.</p><a class="btn btn-primary" href="productos.html">Ver catálogo</a></div>`;
    return;
  }
  container.innerHTML = list.map(renderProductCard).join("");
  container.querySelectorAll(".favorite-btn").forEach(btn => btn.addEventListener("click", () => toggleFavorite(Number(btn.dataset.favoriteId))));
  container.querySelectorAll(".add-card-btn").forEach(btn => btn.addEventListener("click", () => {
    const product = productos.find(p => p.id === Number(btn.dataset.id));
    showToast("Selecciona color y talla antes de agregar", "error");
    setTimeout(() => { location.href = `producto.html?id=${product.id}`; }, 450);
  }));
}

function initHeader() {
  updateHeaderCounters();
  const menuToggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("main-nav");
  if (menuToggle && nav) menuToggle.addEventListener("click", () => nav.classList.toggle("open"));

  const form = document.getElementById("header-search");
  if (form) form.addEventListener("submit", e => {
    e.preventDefault();
    const input = document.getElementById("header-search-input");
    const q = input?.value.trim();
    location.href = q ? `productos.html?q=${encodeURIComponent(q)}` : "productos.html";
  });
}

document.addEventListener("DOMContentLoaded", initHeader);
