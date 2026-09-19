// ============================================================
// 3. Tienda en línea
// ============================================================
function demoShop(host) {
  const PRODUCTS = [
    { id: "cafe", name: "Café de olla 250 g", price: 120, emoji: "☕" },
    { id: "taza", name: "Taza de cerámica", price: 180, emoji: "🍵" },
    { id: "galletas", name: "Galletas de avena", price: 65, emoji: "🍪" },
    { id: "prensa", name: "Prensa francesa", price: 390, emoji: "🫖" },
  ];
  const FREE_SHIPPING = 400;
  const SHIPPING = 60;
  const STEPS = ["Elige", "Carrito", "Pago", "¡Listo!"];

  const cart = {}; // { id: cantidad }
  let step = 0;
  let method = "card";

  const count = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const subtotal = () => PRODUCTS.reduce((sum, p) => sum + (cart[p.id] || 0) * p.price, 0);
  const shipping = () => (subtotal() >= FREE_SHIPPING ? 0 : SHIPPING);
  const total = () => subtotal() + shipping();

  function qtyControl(p) {
    const q = cart[p.id] || 0;
    return q
      ? `<span class="qty">
           <button type="button" data-dec="${p.id}" aria-label="Quitar uno">−</button>
           <span>${q}</span>
           <button type="button" data-inc="${p.id}" aria-label="Agregar uno">+</button>
         </span>`
      : `<button type="button" class="shop__add" data-inc="${p.id}">Agregar</button>`;
  }

  function stepper() {
    return `<ol class="shop__steps">${STEPS.map(
      (s, i) => `<li class="${i < step ? "is-done" : i === step ? "is-now" : ""}"><span>${i < step ? "✓" : i + 1}</span>${s}</li>`
    ).join("")}</ol>`;
  }

  function viewCatalog() {
    return `
      <div class="shop__grid">
        ${PRODUCTS.map(
          (p) => `
          <div class="shop__item">
            <div class="shop__pic">${p.emoji}</div>
            <p class="shop__name">${p.name}</p>
            <p class="shop__price">${money.format(p.price)}</p>
            ${qtyControl(p)}
          </div>`
        ).join("")}
      </div>
      <div class="shop__bar${count() ? "" : " is-empty"}">
        <span>🛒 ${count()} ${count() === 1 ? "producto" : "productos"} · <strong>${money.format(subtotal())}</strong></span>
        <button type="button" class="shop__cta" data-go="1" ${count() ? "" : "disabled"}>Ver carrito →</button>
      </div>`;
  }

  function viewCart() {
    const missing = FREE_SHIPPING - subtotal();
    return `
      <ul class="shop__lines">
        ${PRODUCTS.filter((p) => cart[p.id])
          .map(
            (p) => `
          <li><span class="shop__line-pic">${p.emoji}</span>
            <span class="shop__line-name">${p.name}<small>${money.format(p.price)} c/u</small></span>
            ${qtyControl(p)}
            <strong>${money.format(p.price * cart[p.id])}</strong></li>`
          )
          .join("")}
      </ul>
      <div class="shop__ship">
        ${missing > 0
          ? `🚚 Te faltan <strong>${money.format(missing)}</strong> para envío gratis`
          : "🎉 ¡Tienes envío gratis!"}
        <span class="shop__meter"><span style="width:${Math.min(100, (subtotal() / FREE_SHIPPING) * 100)}%"></span></span>
      </div>
      <dl class="shop__totals">
        <div><dt>Productos</dt><dd>${money.format(subtotal())}</dd></div>
        <div><dt>Envío</dt><dd>${shipping() ? money.format(shipping()) : "Gratis"}</dd></div>
        <div class="is-total"><dt>Total</dt><dd>${money.format(total())}</dd></div>
      </dl>
      <div class="shop__nav">
        <button type="button" class="shop__back" data-go="0">← Seguir comprando</button>
        <button type="button" class="shop__cta" data-go="2">Ir a pagar →</button>
      </div>`;
  }

  function viewPay() {
    const methods = [
      ["card", "💳", "Tarjeta"],
      ["transfer", "🏦", "Transferencia"],
      ["store", "🏪", "Pago en tienda"],
    ];
    return `
      <p class="shop__sub">¿Cómo quieres pagar?</p>
      <div class="shop__methods" role="radiogroup" aria-label="Método de pago">
        ${methods
          .map(
            ([id, ico, label]) =>
              `<button type="button" role="radio" aria-checked="${method === id}" class="shop__method${method === id ? " is-on" : ""}" data-method="${id}"><span>${ico}</span>${label}</button>`
          )
          .join("")}
      </div>
      <div class="shop__paybox">
        ${method === "card"
          ? `<div class="shop__card"><span>Tarjeta de prueba</span><strong>•••• •••• •••• 4242</strong><small>Simulación: no se cobra nada</small></div>`
          : method === "transfer"
          ? `<p>Al confirmar verás la cuenta CLABE y tu pedido se libera en cuanto llegue el pago.</p>`
          : `<p>Recibirás una referencia para pagar en efectivo en tiendas de conveniencia.</p>`}
      </div>
      <div class="shop__nav">
        <button type="button" class="shop__back" data-go="1">← Carrito</button>
        <button type="button" class="shop__cta" data-pay>Pagar ${money.format(total())}</button>
      </div>`;
  }

  function viewDone() {
    return `
      <div class="shop__done">
        <div class="shop__check">✓</div>
        <h5>¡Pedido confirmado!</h5>
        <p>Pedido <strong>#A-1043</strong> por ${money.format(total())}. Te enviamos el recibo por correo.</p>
        <div class="shop__owner">
          <strong>Mientras tanto, a ti te llega:</strong>
          <span>🔔 Aviso de pedido nuevo en tu panel</span>
          <span>📦 La lista de qué empacar y a dónde enviarlo</span>
          <span>💰 El pago directo a tu cuenta</span>
        </div>
        <button type="button" class="shop__back" data-restart>Volver a empezar</button>
      </div>`;
  }

  function render() {
    const views = [viewCatalog, viewCart, viewPay, viewDone];
    host.innerHTML = `<div class="shop">${stepper()}<div class="shop__view">${views[step]()}</div></div>
      <p class="demo-hint">${
        ["Agrega productos al carrito y avanza.", "Cambia cantidades: el envío y el total se recalculan.", "Elige cómo pagar. Nada se cobra de verdad.", "Así termina la compra para tu cliente."][step]
      }</p>`;
  }

  host.addEventListener("click", async (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.inc) cart[t.dataset.inc] = (cart[t.dataset.inc] || 0) + 1;
    else if (t.dataset.dec) {
      cart[t.dataset.dec] -= 1;
      if (!cart[t.dataset.dec]) delete cart[t.dataset.dec];
      if (step === 1 && !count()) step = 0;
    } else if (t.dataset.go) step = Number(t.dataset.go);
    else if (t.dataset.method) method = t.dataset.method;
    else if ("pay" in t.dataset) {
      t.disabled = true;
      t.textContent = "Procesando pago seguro…";
      await wait(1300);
      step = 3;
    } else if ("restart" in t.dataset) {
      Object.keys(cart).forEach((k) => delete cart[k]);
      step = 0;
    } else return;
    render();
  });

  render();
}
