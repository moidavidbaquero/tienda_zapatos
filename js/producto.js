document.addEventListener("DOMContentLoaded", () => {
  const id = Number(new URLSearchParams(location.search).get("id"));
  const product = productos.find(p => p.id === id);
  const root = document.getElementById("product-detail");

  if (!product) {
    root.innerHTML = `<div class="empty-state"><h1>Producto no encontrado</h1><p>El producto solicitado no existe.</p><a class="btn btn-primary" href="productos.html">Volver al catálogo</a></div>`;
    return;
  }

  document.title = `${product.nombre} | UrbanStep`;
  let selectedColor = product.colores[0];
  let selectedSize = "";
  let quantity = 1;

  root.innerHTML = `
    <div class="detail-layout">
      <div class="detail-gallery">
        <div class="main-detail-image"><img id="main-product-image" src="${product.imagen}" alt="${product.nombre}" onerror="this.src='https://placehold.co/900x900?text=UrbanStep'"></div>
        <div class="thumbs"><button class="thumb active"><img src="${product.imagen}" alt="Vista principal"></button></div>
      </div>
      <div class="detail-info">
        <p class="product-category">${product.marca} · ${product.tipo}</p>
        <h1>${product.nombre}</h1>
        <div class="detail-rating">★★★★★ <span>Excelente elección</span></div>
        <div class="detail-price"><strong>${money(product.precio)}</strong>${product.precioAnterior ? `<del>${money(product.precioAnterior)}</del>` : ""}${product.descuento ? `<span class="discount">-${product.descuento}%</span>` : ""}</div>
        <p class="detail-description">${product.descripcion}</p>
        <div class="detail-specs"><span><strong>Marca:</strong> ${product.marca}</span><span><strong>Material:</strong> ${product.material}</span><span><strong>Stock:</strong> ${product.stock} unidades</span></div>
        <div class="selector-block"><div class="selector-label"><strong>Color:</strong> <span id="selected-color">${selectedColor}</span></div><div id="color-options" class="color-options"></div></div>
        <div class="selector-block"><div class="selector-label"><strong>Talla:</strong> <span id="selected-size">Selecciona una</span></div><div id="size-options" class="size-options"></div></div>
        <div class="quantity-row"><strong>Cantidad</strong><div class="quantity-control"><button id="qty-minus">−</button><span id="qty-value">1</span><button id="qty-plus">+</button></div></div>
        <div class="detail-actions"><button id="add-detail-cart" class="btn btn-primary btn-large">Agregar al carrito</button><button id="buy-now" class="btn btn-dark btn-large">Comprar ahora</button><button id="detail-favorite" class="favorite-large ${isFavorite(product.id) ? "active" : ""}">♡</button></div>
        <p class="stock-note">✓ Disponible para envío · Compra segura · Cambios fáciles</p>
      </div>
    </div>`;

  const colorOptions = document.getElementById("color-options");
  colorOptions.innerHTML = product.colores.map(color => `<button class="color-choice ${color === selectedColor ? "selected" : ""}" data-color="${color}">${color}</button>`).join("");
  colorOptions.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => {
    selectedColor = btn.dataset.color;
    document.getElementById("selected-color").textContent = selectedColor;
    colorOptions.querySelectorAll("button").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    // En una tienda real se puede mapear cada color a una URL de imagen diferente.
    // Aquí se mantiene la imagen principal como demo.
  }));

  const sizeOptions = document.getElementById("size-options");
  sizeOptions.innerHTML = product.tallas.map(size => `<button class="size-choice" data-size="${size}">${size}</button>`).join("");
  sizeOptions.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => {
    selectedSize = btn.dataset.size;
    document.getElementById("selected-size").textContent = selectedSize;
    sizeOptions.querySelectorAll("button").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
  }));

  document.getElementById("qty-minus").addEventListener("click", () => { quantity = Math.max(1, quantity - 1); document.getElementById("qty-value").textContent = quantity; });
  document.getElementById("qty-plus").addEventListener("click", () => { quantity = Math.min(product.stock, quantity + 1); document.getElementById("qty-value").textContent = quantity; });
  document.getElementById("add-detail-cart").addEventListener("click", () => addToCart(product, selectedColor, selectedSize, quantity));
  document.getElementById("buy-now").addEventListener("click", () => { if (addToCart(product, selectedColor, selectedSize, quantity)) location.href = "checkout.html"; });
  document.getElementById("detail-favorite").addEventListener("click", () => { toggleFavorite(product.id); document.getElementById("detail-favorite").classList.toggle("active", isFavorite(product.id)); });

  const related = productos.filter(p => p.id !== product.id && p.categoria === product.categoria).slice(0,4);
  renderProductGrid(related.length ? related : productos.filter(p => p.id !== product.id).slice(0,4), "related-products");
});
