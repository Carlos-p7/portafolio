// ============================================================
// 12. Predicciones con IA — ¿este cliente está por irse?
// ============================================================
// Un modelo de regresión logística ya "entrenado" (pesos fijos): el
// visitante mueve los datos de un cliente y ve cambiar el riesgo y el porqué.

function demoChurn(host) {
  const FEATURES = [
    { id: "months", label: "Meses como cliente", min: 1, max: 36, unit: "meses", weight: -0.06, base: 12 },
    { id: "visits", label: "Visitas el último mes", min: 0, max: 12, unit: "visitas", weight: -0.35, base: 4 },
    { id: "days", label: "Días desde su última compra", min: 0, max: 90, unit: "días", weight: 0.045, base: 15 },
    { id: "complaints", label: "Quejas recientes", min: 0, max: 3, unit: "quejas", weight: 0.8, base: 0 },
  ];
  const BIAS = -0.9; // riesgo de un cliente "típico" (con los valores base)

  // Cómo se explica cada dato cuando empuja el riesgo hacia arriba o hacia abajo
  const WHY = {
    months: (v, up) => (up ? `Es cliente nuevo (${v} meses)` : `Lleva ${v} meses contigo`),
    visits: (v, up) =>
      up
        ? v === 0
          ? "No vino ni una vez el último mes"
          : `Solo vino ${v} ${v === 1 ? "vez" : "veces"} el último mes`
        : `Vino ${v} veces el último mes`,
    days: (v, up) => (up ? `Hace ${v} días que no compra` : `Compró hace ${v} días`),
    complaints: (v, up) => (up ? `Tiene ${v} ${v === 1 ? "queja" : "quejas"} reciente${v === 1 ? "" : "s"}` : "Sin quejas"),
  };

  const PRESETS = {
    "😊 Cliente fiel": { months: 30, visits: 9, days: 3, complaints: 0 },
    "😐 Se está enfriando": { months: 14, visits: 3, days: 25, complaints: 0 },
    "😟 A punto de irse": { months: 4, visits: 0, days: 70, complaints: 2 },
  };

  const values = { ...PRESETS["😐 Se está enfriando"] };

  host.innerHTML = `
    <div class="churn">
      <div class="churn__presets">
        ${Object.keys(PRESETS).map((p) => `<button type="button" class="dash__chip" data-preset="${p}">${p}</button>`).join("")}
      </div>
      <div class="churn__grid">
        <div class="churn__inputs">
          ${FEATURES.map(
            (f) => `<label class="fc__slider">
              <span>${f.label}: <strong data-val="${f.id}"></strong></span>
              <input type="range" min="${f.min}" max="${f.max}" step="1" data-f="${f.id}" />
            </label>`
          ).join("")}
        </div>
        <div class="churn__result">
          <div class="churn__gauge">
            <svg viewBox="0 0 200 116" aria-hidden="true">
              <path class="churn__track" d="M20 100 A80 80 0 0 1 180 100"/>
              <path class="churn__fill" d="M20 100 A80 80 0 0 1 180 100" pathLength="100"/>
            </svg>
            <strong class="churn__pct"></strong>
            <span class="churn__level"></span>
          </div>
          <p class="churn__label">Probabilidad de que deje de comprar en los próximos 30 días</p>
        </div>
      </div>
      <div class="churn__why">
        <p class="inv__label">¿Por qué?</p>
        <ul></ul>
      </div>
      <p class="dash__insight churn__todo"></p>
    </div>
    <p class="demo-hint">Elige un cliente de ejemplo o mueve las barras: el modelo recalcula el riesgo al instante.</p>`;

  const sigmoid = (z) => 1 / (1 + Math.exp(-z));

  function render() {
    // Contribución de cada dato comparado con un cliente típico
    const parts = FEATURES.map((f) => ({ f, v: values[f.id], c: f.weight * (values[f.id] - f.base) }));
    const z = BIAS + parts.reduce((s, p) => s + p.c, 0);
    const risk = sigmoid(z);
    const pct = Math.round(risk * 100);
    const level = pct >= 60 ? "high" : pct >= 30 ? "mid" : "low";
    const LEVELS = {
      low: ["✅ Riesgo bajo", "Todo bien: sigue atendiéndolo como hasta ahora."],
      mid: ["⚠️ Riesgo medio", "Buen momento para un mensaje personal o una promoción."],
      high: ["🔴 Riesgo alto", "Actúa hoy: llámalo o mándale un cupón de regreso."],
    };

    FEATURES.forEach((f) => {
      host.querySelector(`[data-f="${f.id}"]`).value = values[f.id];
      host.querySelector(`[data-val="${f.id}"]`).textContent = `${values[f.id]} ${f.unit}`;
    });
    host.querySelector(".churn").dataset.level = level;
    host.querySelector(".churn__fill").style.strokeDasharray = `${pct} 100`;
    host.querySelector(".churn__pct").textContent = `${pct}%`;
    host.querySelector(".churn__level").textContent = LEVELS[level][0];
    host.querySelector(".churn__todo").textContent = `💡 ${LEVELS[level][1]}`;

    // Las 3 razones que más pesan (hacia arriba o hacia abajo)
    const top = parts
      .filter((p) => Math.abs(p.c) > 0.05)
      .sort((a, b) => Math.abs(b.c) - Math.abs(a.c))
      .slice(0, 3);
    host.querySelector(".churn__why ul").innerHTML = top.length
      ? top
          .map(
            (p) =>
              `<li class="${p.c > 0 ? "is-up" : "is-down"}"><span>${p.c > 0 ? "▲" : "▼"}</span>${WHY[p.f.id](p.v, p.c > 0)}<em>${
                p.c > 0 ? "sube" : "baja"
              } el riesgo</em></li>`
          )
          .join("")
      : "<li>Es un cliente típico: nada destaca.</li>";
    host.querySelectorAll("[data-preset]").forEach((b) => {
      const p = PRESETS[b.dataset.preset];
      b.classList.toggle("is-on", FEATURES.every((f) => p[f.id] === values[f.id]));
    });
  }

  host.addEventListener("input", (e) => {
    const f = e.target.dataset.f;
    if (!f) return;
    values[f] = Number(e.target.value);
    render();
  });
  host.addEventListener("click", (e) => {
    const b = e.target.closest("[data-preset]");
    if (!b) return;
    Object.assign(values, PRESETS[b.dataset.preset]);
    render();
  });

  render();
}
