// ============================================================
// 8. Facturación electrónica — de venta a factura en un clic
// ============================================================
// Todo se elige tocando (nada se captura a mano), que es justo lo que se
// vende: el sistema ya tiene los datos del cliente y de los productos.

function demoInvoice(host) {
  const CLIENTS = [
    { id: "a", name: "Comercializadora del Valle", rfc: "CVA190312AB1", email: "compras@delvalle.mx" },
    { id: "b", name: "María Fernanda Ruiz", rfc: "RUFM880504QK2", email: "mafer.ruiz@correo.mx" },
  ];
  const ITEMS = [
    { id: "cafe", name: "Café de grano 1 kg", price: 380 },
    { id: "eventos", name: "Servicio de café para eventos", price: 2500 },
    { id: "taza", name: "Taza de cerámica", price: 180 },
  ];
  const IVA = 0.16;
  const state = { client: "a", qty: { cafe: 2 }, step: "edit" };

  const lines = () => ITEMS.filter((i) => state.qty[i.id]).map((i) => ({ ...i, q: state.qty[i.id] }));
  const subtotal = () => lines().reduce((s, l) => s + l.q * l.price, 0);

  // Folio con forma de UUID (el que da el SAT es parecido); aquí es de mentira
  const fakeUuid = () =>
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) =>
      ((Math.random() * 16) | (c === "y" ? 8 : 0)).toString(16).slice(-1).toUpperCase()
    );

  const fmt = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

  function viewEdit() {
    return `
      <p class="inv__label">1. ¿A quién le facturas?</p>
      <div class="inv__clients">
        ${CLIENTS.map(
          (c) => `<button type="button" class="inv__client${state.client === c.id ? " is-on" : ""}" data-client="${c.id}">
            <strong>${c.name}</strong><small>RFC ${c.rfc}</small></button>`
        ).join("")}
      </div>
      <p class="inv__label">2. ¿Qué le vendiste?</p>
      <ul class="inv__items">
        ${ITEMS.map(
          (i) => `<li><span>${i.name}<small>${fmt.format(i.price)}</small></span>
            <span class="qty">
              <button type="button" data-dec="${i.id}" aria-label="Menos">−</button>
              <span>${state.qty[i.id] || 0}</span>
              <button type="button" data-inc="${i.id}" aria-label="Más">+</button>
            </span></li>`
        ).join("")}
      </ul>
      ${totalsHTML()}
      <button type="button" class="inv__go" data-stamp ${subtotal() ? "" : "disabled"}>🧾 Generar factura</button>`;
  }

  function totalsHTML() {
    const sub = subtotal();
    return `<dl class="shop__totals">
        <div><dt>Subtotal</dt><dd>${fmt.format(sub)}</dd></div>
        <div><dt>IVA 16%</dt><dd>${fmt.format(sub * IVA)}</dd></div>
        <div class="is-total"><dt>Total</dt><dd>${fmt.format(sub * (1 + IVA))}</dd></div>
      </dl>`;
  }

  function viewDone() {
    const c = CLIENTS.find((x) => x.id === state.client);
    return `
      <div class="inv__doc">
        <div class="inv__doc-head">
          <div><strong>Café Aurora S.A. de C.V.</strong><small>RFC CAU150101XY9</small></div>
          <span class="inv__stamp">TIMBRADA ✓</span>
        </div>
        <p class="inv__to">Para: <strong>${c.name}</strong> · RFC ${c.rfc}</p>
        <ul class="inv__doc-lines">
          ${lines().map((l) => `<li><span>${l.q} × ${l.name}</span><span>${fmt.format(l.q * l.price)}</span></li>`).join("")}
        </ul>
        ${totalsHTML()}
        <p class="inv__uuid">Folio fiscal: ${fakeUuid()}</p>
      </div>
      <ul class="inv__checks">
        <li>✅ Validada y timbrada por un proveedor autorizado del SAT</li>
        <li>✅ PDF y XML enviados a <strong>${c.email}</strong></li>
        <li>✅ Guardada en tu historial para cuando la necesites</li>
      </ul>
      <button type="button" class="shop__back" data-new>Hacer otra factura</button>`;
  }

  function render() {
    host.innerHTML = `<div class="inv">${state.step === "edit" ? viewEdit() : viewDone()}</div>
      <p class="demo-hint">${state.step === "edit" ? "Elige cliente y productos; el IVA se calcula solo." : "Así queda la factura, sin capturar un solo dato."}</p>`;
  }

  host.addEventListener("click", async (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.client) state.client = b.dataset.client;
    else if (b.dataset.inc) state.qty[b.dataset.inc] = (state.qty[b.dataset.inc] || 0) + 1;
    else if (b.dataset.dec) state.qty[b.dataset.dec] = Math.max(0, (state.qty[b.dataset.dec] || 0) - 1);
    else if ("stamp" in b.dataset) {
      b.disabled = true;
      for (const msg of ["Revisando datos…", "Timbrando con el SAT…", "Enviando al cliente…"]) {
        b.textContent = msg;
        await wait(650);
      }
      state.step = "done";
    } else if ("new" in b.dataset) {
      state.step = "edit";
      state.qty = {};
    } else return;
    render();
  });

  render();
}
