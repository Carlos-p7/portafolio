// ============================================================
// 2. Tablero de indicadores
// ============================================================
function demoDashboard(host) {
  const filters = { month: "all", branch: "all" };

  const chips = (name, options) =>
    options
      .map(
        ([value, label]) =>
          `<button type="button" class="dash__chip" data-filter="${name}" data-value="${value}">${label}</button>`
      )
      .join("");

  host.innerHTML = `
    <div class="dash">
      <div class="dash__filters">
        <div class="dash__group" role="group" aria-label="Periodo">
          <span class="dash__label">Periodo</span>
          ${chips("month", [["all", "Todo el semestre"], ...SALES_MONTHS.map((m) => [m, m])])}
        </div>
        <div class="dash__group" role="group" aria-label="Sucursal">
          <span class="dash__label">Sucursal</span>
          ${chips("branch", [["all", "Todas"], ...SALES_BRANCHES.map((b) => [b, b])])}
        </div>
      </div>

      <div class="dash__kpis">
        <div class="dash__hero">
          <span class="dash__kpi-label">Ventas</span>
          <strong class="dash__hero-value" data-kpi="total"></strong>
        </div>
        <div class="dash__kpi">
          <span class="dash__kpi-label">Pedidos</span>
          <strong data-kpi="orders"></strong>
        </div>
        <div class="dash__kpi">
          <span class="dash__kpi-label">Ticket promedio</span>
          <strong data-kpi="avgTicket"></strong>
        </div>
      </div>

      <div class="dash__panels">
        <section class="dash__panel">
          <h5>Ventas por producto</h5>
          <div class="hbars" data-chart="products"></div>
        </section>
        <section class="dash__panel">
          <h5>Ventas por mes</h5>
          <div class="cols" data-chart="months"></div>
        </section>
      </div>

      <p class="dash__insight" aria-live="polite"></p>
      <div class="dash__tip" role="tooltip" hidden></div>
    </div>
    <p class="demo-hint">Cambia el periodo o la sucursal: las cifras y gráficas se actualizan solas. Datos de ejemplo.</p>`;

  const $ = (sel) => host.querySelector(sel);
  const tip = $(".dash__tip");
  const nf = new Intl.NumberFormat("es-MX");

  function render() {
    host.querySelectorAll(".dash__chip").forEach((c) => {
      const on = filters[c.dataset.filter] === c.dataset.value;
      c.classList.toggle("is-on", on);
      c.setAttribute("aria-pressed", on);
    });

    const s = summarizeSales(SALES_ROWS, filters);
    $('[data-kpi="total"]').textContent = money.format(s.total);
    $('[data-kpi="orders"]').textContent = nf.format(s.orders);
    $('[data-kpi="avgTicket"]').textContent = money.format(s.avgTicket);

    // Barras horizontales: una sola serie → un solo color, valor en la punta
    const maxP = Math.max(1, ...s.byProduct.map((p) => p.total));
    $('[data-chart="products"]').innerHTML = s.byProduct.length
      ? s.byProduct
          .map(
            (p) => `
          <div class="hbars__row">
            <span class="hbars__name">${p.product}</span>
            <span class="hbars__track"><span class="hbars__bar" style="width:${(p.total / maxP) * 100}%"></span></span>
            <span class="hbars__value">${money.format(p.total)}</span>
          </div>`
          )
          .join("")
      : `<p class="dash__empty">Sin datos para este filtro</p>`;

    // Columnas por mes: reutiliza el mismo resumen, un mes a la vez
    const byMonth = SALES_MONTHS.map((m) => ({
      month: m,
      total: summarizeSales(SALES_ROWS, { month: m, branch: filters.branch }).total,
    }));
    const maxM = Math.max(1, ...byMonth.map((m) => m.total));
    $('[data-chart="months"]').innerHTML = byMonth
      .map((m) => {
        const active = filters.month === "all" || filters.month === m.month;
        return `
          <button type="button" class="cols__col${active ? " is-active" : ""}" data-month="${m.month}"
                  data-tip="${m.month} · ${money.format(m.total)}" aria-label="${m.month}: ${money.format(m.total)}">
            <span class="cols__bar" style="height:${(m.total / maxM) * 100}%"></span>
            <span class="cols__name">${m.month}</span>
          </button>`;
      })
      .join("");

    // Una frase en lenguaje normal: lo que un dueño querría saber primero
    const top = s.byProduct[0];
    $(".dash__insight").textContent = top
      ? `💡 Lo que más vende ${filters.branch === "all" ? "en todas las sucursales" : "en " + filters.branch} ${
          filters.month === "all" ? "en el semestre" : "en " + filters.month
        } es ${top.product} (${Math.round((top.total / s.total) * 100)}% de las ventas).`
      : "";
  }

  host.addEventListener("click", (e) => {
    const chip = e.target.closest(".dash__chip");
    if (chip) {
      filters[chip.dataset.filter] = chip.dataset.value;
      render();
      return;
    }
    // Tocar una columna filtra por ese mes (y tocarla otra vez lo quita)
    const col = e.target.closest(".cols__col");
    if (col) {
      filters.month = filters.month === col.dataset.month ? "all" : col.dataset.month;
      render();
    }
  });

  // Tooltip de las columnas (el valor también está en aria-label)
  function showTip(col) {
    const box = host.querySelector(".dash").getBoundingClientRect();
    const r = col.getBoundingClientRect();
    tip.textContent = col.dataset.tip;
    tip.hidden = false;
    tip.style.left = r.left - box.left + r.width / 2 + "px";
    tip.style.top = r.top - box.top - 6 + "px";
  }
  host.addEventListener("pointerover", (e) => {
    const col = e.target.closest(".cols__col");
    if (col) showTip(col);
  });
  host.addEventListener("pointerout", (e) => {
    if (e.target.closest(".cols__col")) tip.hidden = true;
  });
  host.addEventListener("focusin", (e) => {
    const col = e.target.closest(".cols__col");
    if (col) showTip(col);
  });
  host.addEventListener("focusout", () => (tip.hidden = true));

  render();
}
