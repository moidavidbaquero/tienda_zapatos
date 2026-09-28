document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("checkout-form");
  const summary = document.getElementById("checkout-summary");
  const layout = document.getElementById("checkout-layout");
  const success = document.getElementById("checkout-success");
  const cart = getCart();

  if (!cart.length) {
    layout.innerHTML = `<div class="empty-state"><h2>No tienes productos para comprar</h2><p>Regresa al catálogo para agregar productos.</p><a class="btn btn-primary" href="productos.html">Ver productos</a></div>`;
    return;
  }

  function renderSummary() {
    const subtotal = cart.reduce((s,item) => { const p=productos.find(x=>x.id===item.id); return s+(p?p.precio*item.cantidad:0); },0);
    const discount = cart.reduce((s,item) => { const p=productos.find(x=>x.id===item.id); return s+(p?.precioAnterior ? (p.precioAnterior-p.precio)*item.cantidad : 0); },0);
    const shipping = subtotal >= 250000 ? 0 : 15000;
    summary.innerHTML = `<h2>Tu pedido</h2>${cart.map(item => { const p=productos.find(x=>x.id===item.id); return `<div class="mini-product"><img src="${p.imagen}" alt="${p.nombre}"><div><strong>${p.nombre}</strong><small>${item.color} · Talla ${item.talla} · x${item.cantidad}</small></div><b>${money(p.precio*item.cantidad)}</b></div>`; }).join("")}<hr><div class="summary-line"><span>Subtotal</span><strong>${money(subtotal)}</strong></div><div class="summary-line"><span>Descuento</span><strong class="saving">-${money(discount)}</strong></div><div class="summary-line"><span>Envío</span><strong>${shipping ? money(shipping) : "Gratis"}</strong></div><div class="summary-total"><span>Total</span><strong>${money(subtotal+shipping)}</strong></div>`;
  }
  renderSummary();

  const saved = readStorage(STORAGE.checkout, {});
  Object.entries(saved).forEach(([key,value]) => { const field = form.elements[key]; if(field && typeof value === "string") field.value = value; });

  form.querySelectorAll('input, select').forEach(field => field.addEventListener("input", () => {
    const data = Object.fromEntries(new FormData(form).entries());
    delete data.pago;
    writeStorage(STORAGE.checkout, data);
  }));

  form.querySelectorAll('input[name="pago"]').forEach(radio => radio.addEventListener("change", () => {
    document.getElementById("payment-extra").innerHTML = radio.value === "tarjeta"
      ? `<div class="payment-demo-fields"><label>Número de tarjeta<input placeholder="0000 0000 0000 0000" inputmode="numeric"></label><label>Vencimiento<input placeholder="MM/AA"></label><label>CVV<input placeholder="123" inputmode="numeric"></label></div>`
      : `<p class="demo-payment">Has seleccionado <strong>${radio.parentElement.querySelector("strong").textContent}</strong>. Esta interfaz es simulada y no ejecuta ningún pago.</p>`;
  }));
  form.querySelector('input[name="pago"]:checked').dispatchEvent(new Event("change"));

  form.addEventListener("submit", e => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll("[required]").forEach(field => {
      const error = field.parentElement.querySelector(".field-error");
      let message = "";
      if (!field.value.trim()) message = "Este campo es obligatorio.";
      if (field.type === "email" && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) message = "Ingresa un correo válido.";
      if (field.name === "postal" && field.value && !/^\d{4,6}$/.test(field.value)) message = "Código postal inválido.";
      if (field.name === "telefono" && field.value && !/^[0-9+\s()-]{7,20}$/.test(field.value)) message = "Teléfono inválido.";
      if (error) error.textContent = message;
      field.classList.toggle("invalid", !!message);
      if (message) valid = false;
    });
    if (!valid) {
      document.getElementById("checkout-alert").textContent = "Revisa los campos marcados antes de continuar.";
      return;
    }

    const order = `US-${Date.now().toString().slice(-8)}-${Math.floor(100+Math.random()*900)}`;
    saveCart([]);
    localStorage.removeItem(STORAGE.checkout);
    layout.classList.add("hidden");
    success.classList.remove("hidden");
    success.innerHTML = `<div class="success-icon">✓</div><p class="eyebrow">PEDIDO CONFIRMADO</p><h1>¡Compra realizada correctamente!</h1><p>Gracias por confiar en UrbanStep. Tu pedido de demostración ha sido registrado.</p><div class="order-number">Número de pedido <strong>${order}</strong></div><a class="btn btn-primary" href="index.html">Volver al inicio</a>`;
    window.scrollTo({top:0,behavior:"smooth"});
  });
});
