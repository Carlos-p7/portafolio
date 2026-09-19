// ============================================================
// 20. Conectar tu sistema administrativo — sin captura doble
// ============================================================

function demoErpSync(host) {
  const PRODUCTS = ["Café de olla 250 g", "Taza de cerámica", "Prensa francesa", "Galletas de avena"];
  const state = { connected: false, rows: [], next: 1051 };

  function render() {
    const pending = state.rows.filter((r) => !r.synced).length;
    host.innerHTML = `
      <div class="erp">
        <div class="auto__toggle">
          <button type="button" data-conn="0" class="${state.connected ? "" : "is-on"}">✍️ Sin conexión</button>
          <button type="button" data-conn="1" class="${state.connected ? "is-on" : ""}">🔗 Conectado</button>
        </div>
        <div class="erp__cols">
          <section><p class="cms__tag">🛒 Tu tienda en línea</p>
            <ul>${state.rows.map((r) => `<li>#${r.id} · ${r.what}</li>`).join("") || "<li class='portal__muted'>Sin pedidos</li>"}</ul></section>
          <section><p class="cms__tag">🏢 Tu sistema administrativo</p>
            <ul>${
              state.rows
                .map((r) =>
                  r.synced
                    ? `<li class="is-ok">#${r.id} · ${r.what} <em>✓ ${r.how}</em></li>`
                    : `<li class="is-pending">#${r.id} · <em>⚠️ Falta capturar</em> <button type="button" class="shop__back" data-type="${r.id}">Capturar a mano</button></li>`
                )
                .join("") || "<li class='portal__muted'>Sin pedidos</li>"
            }</ul></section>
        </div>
        <div class="erp__foot">
          <button type="button" class="inv__go" data-order>📩 Llega un pedido</button>
          <span>${
            state.connected
              ? "Cada pedido pasa solo, con inventario y factura listos."
              : pending
              ? `<strong>${pending}</strong> pedido${pending === 1 ? "" : "s"} esperando que alguien ${pending === 1 ? "lo" : "los"} capture otra vez.`
              : "Cada pedido hay que capturarlo dos veces."
          }</span>
        </div>
      </div>
      <p class="demo-hint">Recibe pedidos sin conexión y luego conectado. Compara el trabajo doble.</p>`;
  }

  host.addEventListener("click", async (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.conn !== undefined) {
      state.connected = b.dataset.conn === "1";
      render();
    } else if ("order" in b.dataset) {
      const row = { id: state.next++, what: PRODUCTS[state.rows.length % PRODUCTS.length], synced: false };
      state.rows.unshift(row);
      render();
      if (state.connected) {
        await wait(700);
        row.synced = true;
        row.how = "automático, 1 seg";
        render();
      }
    } else if (b.dataset.type) {
      b.disabled = true;
      b.textContent = "Capturando…";
      await wait(1400);
      const row = state.rows.find((r) => r.id === Number(b.dataset.type));
      row.synced = true;
      row.how = "a mano, 4 min";
      render();
    }
  });

  render();
}

// ============================================================
// 21. Mover tu información a un sistema nuevo — migración verificada
// ============================================================

function demoMigration(host) {
  const TABLES = [
    { name: "Clientes", total: 1240, errors: 3 },
    { name: "Productos", total: 356, errors: 0 },
    { name: "Ventas históricas", total: 18902, errors: 7 },
  ];
  const nf = new Intl.NumberFormat("es-MX");
  let stage = "ready"; // ready → moving → checking → done

  host.innerHTML = `
    <div class="mig">
      <div class="mig__systems">
        <div class="mig__old"><small>Sistema viejo</small><strong>ADMIN-2009.exe</strong></div>
        <span class="mig__arrow">➜</span>
        <div class="mig__new"><small>Sistema nuevo</small><strong>En la nube ☁️</strong></div>
      </div>
      <ul class="mig__tables">
        ${TABLES.map(
          (t, i) => `<li data-t="${i}"><span>${t.name}</span>
            <span class="mig__bar"><span></span></span>
            <em>0 / ${nf.format(t.total)}</em></li>`
        ).join("")}
      </ul>
      <div class="mig__check" hidden></div>
      <div class="dq__actions"><button type="button" class="inv__go" data-go>🚚 Iniciar migración</button></div>
    </div>
    <p class="demo-hint">Mira cómo se mueve todo, se revisa y se comprueba que no se perdió nada.</p>`;

  const go = host.querySelector("[data-go]");
  const check = host.querySelector(".mig__check");

  async function run() {
    stage = "moving";
    go.disabled = true;
    go.textContent = "Migrando…";
    check.hidden = true;
    for (const [i, t] of TABLES.entries()) {
      const li = host.querySelector(`[data-t="${i}"]`);
      li.className = "is-doing";
      for (let f = 1; f <= 12; f++) {
        await wait(60);
        li.querySelector(".mig__bar span").style.width = (f / 12) * 100 + "%";
        li.querySelector("em").textContent = `${nf.format(Math.round((t.total * f) / 12))} / ${nf.format(t.total)}`;
      }
      li.className = t.errors ? "is-warn" : "is-done";
      li.querySelector("em").textContent = t.errors ? `⚠️ ${t.errors} con error` : "✓ Completo";
    }
    stage = "checking";
    go.textContent = "Corrigiendo y comparando…";
    await wait(900);
    TABLES.forEach((t, i) => {
      const li = host.querySelector(`[data-t="${i}"]`);
      li.className = "is-done";
      li.querySelector("em").textContent = t.errors ? `✓ ${t.errors} corregidos` : "✓ Completo";
    });
    const errors = TABLES.reduce((s, t) => s + t.errors, 0);
    check.hidden = false;
    check.innerHTML = `
      <p>✅ <strong>Todo cuadra.</strong> Mismos totales en los dos sistemas:</p>
      <ul>
        <li>Clientes: ${nf.format(TABLES[0].total)} = ${nf.format(TABLES[0].total)}</li>
        <li>Ventas del 2025: $4,812,330 = $4,812,330</li>
        <li>${errors} registros con errores (fechas y RFC) se corrigieron antes de pasar</li>
      </ul>`;
    stage = "done";
    go.disabled = false;
    go.textContent = "↺ Repetir migración";
  }

  go.addEventListener("click", () => {
    if (stage === "moving" || stage === "checking") return;
    host.querySelectorAll(".mig__tables li").forEach((li, i) => {
      li.className = "";
      li.querySelector(".mig__bar span").style.width = "0";
      li.querySelector("em").textContent = `0 / ${nf.format(TABLES[i].total)}`;
    });
    run();
  });
}
