function calculateCart() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => {
    const p = productos.find(product => product.id === item.id);
    return sum + (p ? p.precio * item.cantidad : 0);
  }, 0);
  const discount = cart.reduce((sum, item) => {
    const p = productos.find(product => product.id === item.id);
    return sum + (p && p.precioAnterior ? (p.precioAnterior - p.precio) * item.cantidad : 0);
  }, 0);
  const shipping = subtotal === 0 ? 0 : (subtotal >= 250000 ? 0 : 15000);
  return {subtotal, discount, shipping, total: subtotal + shipping};
}

function renderCart() {
  const root = document.getElementById("cart-content");
  const cart = getCart();
  if (!cart.length) {
    root.innerHTML = `<div class="empty-state cart-empty"><div class="empty-icon">🛒</div><h2>Tu carrito está vacío</h2><p>Agrega tus zapatos favoritos y aparecerán aquí.</p><a href="productos.html" class="btn btn-primary">Explorar productos</a></div>`;
    return;
  }

  const totals = calculateCart();
  root.innerHTML = `
    <div class="cart-layout">
      <section class="cart-items">
        <div class="cart-top"><strong>${cart.reduce((s,i)=>s+i.cantidad,0)} producto(s)</strong><button id="clear-cart" class="text-button danger">Vaciar carrito</button></div>
        ${cart.map(item => {
          const p = productos.find(product => product.id === item.id);
          if (!p) return "";
          return `<article class="cart-item">
            <a href="producto.html?id=${p.id}" class="cart-item-image"><img src="${p.imagen}" alt="${p.nombre}" onerror="this.src='https://placehold.co/300x300?text=UrbanStep'"></a>
            <div class="cart-item-info"><p class="product-category">${p.categoria} · ${p.tipo}</p><h3><a href="producto.html?id=${p.id}">${p.nombre}</a></h3><p>Color: <strong>${item.color}</strong> · Talla: <strong>${item.talla}</strong></p><span class="unit-price">${money(p.precio)} / unidad</span></div>
            <div class="cart-item-qty"><div class="quantity-control"><button data-action="minus" data-id="${p.id}" data-color="${item.color}" data-size="${item.talla}">−</button><span>${item.cantidad}</span><button data-action="plus" data-id="${p.id}" data-color="${item.color}" data-size="${item.talla}">+</button></div></div>
            <strong class="cart-subtotal">${money(p.precio * item.cantidad)}</strong>
            <button class="remove-item" data-id="${p.id}" data-color="${item.color}" data-size="${item.talla}" aria-label="Eliminar">×</button>
          </article>`;
        }).join("")}
      </section>
      <aside class="summary-card">
        <h2>Resumen del pedido</h2>
        <div class="summary-line"><span>Subtotal</span><strong>${money(totals.subtotal)}</strong></div>
        <div class="summary-line"><span>Descuento</span><strong class="saving">-${money(totals.discount)}</strong></div>
        <div class="summary-line"><span>Envío</span><strong>${totals.shipping ? money(totals.shipping) : "Gratis"}</strong></div>
        <hr><div class="summary-total"><span>Total</span><strong>${money(totals.total)}</strong></div>
        <p class="free-shipping">${totals.shipping ? `Te faltan ${money(Math.max(0,250000-totals.subtotal))} para envío gratis.` : "¡Tienes envío gratis!"}</p>
        <a class="btn btn-primary btn-block btn-large" href="checkout.html">Continuar al checkout</a>
        <a class="btn btn-outline btn-block" href="productos.html">Seguir comprando</a>
      </aside>
    </div>`;

  root.querySelector("#clear-cart").addEventListener("click", () => {
    if (confirm("¿Vaciar todo el carrito?")) { saveCart([]); renderCart(); }
  });
  root.querySelectorAll("[data-action]").forEach(btn => btn.addEventListener("click", () => {
    changeCartQuantity(Number(btn.dataset.id), btn.dataset.color, Number(btn.dataset.size), btn.dataset.action === "plus" ? 1 : -1);
    renderCart();
  }));
  root.querySelectorAll(".remove-item").forEach(btn => btn.addEventListener("click", () => {
    removeFromCart(Number(btn.dataset.id), btn.dataset.color, Number(btn.dataset.size));
    renderCart();
  }));
}

document.addEventListener("DOMContentLoaded", renderCart);
