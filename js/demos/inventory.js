// ============================================================
// 17. Sistema para organizar la operación — inventario con reorden
// ============================================================
// La cantidad a pedir la decide reorderQuantity() (js/reorder.js).

function demoInventory(host) {
  const items = [
    { id: "grano", name: "Café en grano (kg)", stock: 14, min: 10, max: 40, emoji: "🫘" },
    { id: "leche", name: "Leche (litros)", stock: 22, min: 12, max: 48, emoji: "🥛" },
    { id: "vasos", name: "Vasos para llevar", stock: 130, min: 100, max: 500, emoji: "🥤" },
  ];
  const orders = []; // órdenes de compra generadas
  let folio = 301;

  function render() {
    host.innerHTML = `
      <div class="inv-sys">
        <table class="inv-sys__table">
          <thead><tr><th>Producto</th><th>Hay</th><th>Nivel</th><th></th></tr></thead>
          <tbody>
            ${items
              .map((it) => {
                const low = it.stock <= it.min;
                const pct = Math.max(0, Math.min(100, (it.stock / it.max) * 100));
                return `<tr class="${low ? "is-low" : ""}">
                  <td>${it.emoji} ${it.name}${low ? `<small>⚠️ Bajo el mínimo (${it.min})</small>` : ""}</td>
                  <td><strong>${it.stock}</strong></td>
                  <td><span class="inv-sys__meter"><span style="width:${pct}%"></span><i style="left:${(it.min / it.max) * 100}%"></i></span></td>
                  <td><button type="button" class="shop__back" data-sell="${it.id}">Vender ${it.id === "vasos" ? 20 : 3}</button></td>
                </tr>`;
              })
              .join("")}
          </tbody>
        </table>
        <div class="inv-sys__orders">
          <p class="inv__label">🧾 Órdenes de compra automáticas</p>
          ${
            orders.length
              ? `<ul>${orders
                  .map(
                    (o) => `<li class="${o.done ? "is-done" : ""}">
                      <span>OC-${o.folio} · ${o.emoji} ${o.qty} × ${o.name}</span>
                      ${o.done ? "<em>✓ Recibida</em>" : o.qty > 0 ? `<button type="button" class="inv__go" data-receive="${o.folio}">Recibir</button>` : "<em>⚠️ Orden en 0</em>"}
                    </li>`
                  )
                  .join("")}</ul>`
              : `<p class="portal__muted">Cuando un producto baje de su mínimo, aquí aparecerá la orden sola.</p>`
          }
        </div>
      </div>
      <p class="demo-hint">Vende hasta que algo baje del mínimo: el sistema arma la orden de compra solo.</p>`;
  }

  host.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.sell) {
      const it = items.find((x) => x.id === b.dataset.sell);
      it.stock -= it.id === "vasos" ? 20 : 3;
      const pending = orders.some((o) => o.id === it.id && !o.done);
      const qty = reorderQuantity(it.stock, it.min, it.max);
      if (it.stock <= it.min && !pending) {
        orders.unshift({ folio: folio++, id: it.id, name: it.name, emoji: it.emoji, qty, done: false });
      }
    } else if (b.dataset.receive) {
      const o = orders.find((x) => x.folio === Number(b.dataset.receive));
      const it = items.find((x) => x.id === o.id);
      it.stock = Math.max(0, it.stock) + o.qty;
      o.done = true;
    } else return;
    render();
  });

  render();
}
