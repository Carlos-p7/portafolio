// ============================================================
// 10. Pronóstico de ventas — historia, tendencia y rango esperado
// ============================================================
// La recta la calcula linearTrend() (js/linear-trend.js). Aquí solo se
// dibuja: historia (línea sólida), pronóstico (punteado) y un rango de
// confianza que se abre mientras más lejos se mira.

function demoForecast(host) {
  const LABELS = ["Jul", "Ago", "Sep", "Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun"];
  const NEXT = ["Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  // Ventas mensuales: tendencia al alza + temporada (diciembre fuerte, enero flojo)
  const SEASON = [0, -3000, 1000, 2500, 6000, 12000, -9000, -5000, 1500, 0, 3000, -2000];
  const HISTORY = SEASON.map((s, i) => 82000 + i * 2300 + s);

  const state = { months: 3, showTrend: false };
  const W = 640, H = 250, PAD = { l: 52, r: 16, t: 16, b: 30 };
  const compact = new Intl.NumberFormat("es-MX", { notation: "compact", maximumFractionDigits: 0 });

  host.innerHTML = `
    <div class="fc">
      <div class="fc__controls">
        <label class="fc__slider">
          <span>¿Cuántos meses quieres ver hacia adelante? <strong data-months></strong></span>
          <input type="range" min="1" max="6" step="1" value="${state.months}" data-range />
        </label>
        <label class="fc__check"><input type="checkbox" data-trend /> Mostrar la tendencia</label>
      </div>
      <div class="fc__chart">
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Ventas mensuales y pronóstico"></svg>
        <div class="dash__tip" role="tooltip" hidden></div>
      </div>
      <div class="fc__legend">
        <span><i class="fc__key fc__key--hist"></i>Ventas reales</span>
        <span><i class="fc__key fc__key--fc"></i>Pronóstico</span>
        <span><i class="fc__key fc__key--band"></i>Rango probable</span>
      </div>
      <p class="dash__insight" aria-live="polite"></p>
    </div>
    <p class="demo-hint">Mueve la barra para ver más meses. Pasa el dedo o el mouse sobre la gráfica.</p>`;

  const svg = host.querySelector("svg");
  const tip = host.querySelector(".dash__tip");
  let points = []; // para el tooltip: { x, y, label, value, low, high, kind }

  function model() {
    const { slope, intercept } = linearTrend(HISTORY);
    const fitted = HISTORY.map((_, x) => intercept + slope * x);
    // Qué tanto se aleja la venta real de la recta (desviación típica del error)
    const sigma = Math.sqrt(HISTORY.reduce((s, y, x) => s + (y - fitted[x]) ** 2, 0) / HISTORY.length);
    const forecast = Array.from({ length: state.months }, (_, k) => {
      const x = HISTORY.length + k;
      const y = intercept + slope * x;
      const spread = 1.5 * sigma * (1 + 0.15 * k); // más lejos → menos certeza
      return { x, y, low: y - spread, high: y + spread };
    });
    return { slope, fitted, forecast };
  }

  function render() {
    host.querySelector("[data-months]").textContent = `${state.months} ${state.months === 1 ? "mes" : "meses"}`;
    const { slope, fitted, forecast } = model();

    const n = HISTORY.length + state.months;
    const all = [...HISTORY, ...forecast.flatMap((f) => [f.low, f.high])];
    // Eje con cifras redondas: paso "bonito" y límites múltiplos de ese paso
    const rawMin = Math.min(...all), rawMax = Math.max(...all);
    const step = [5000, 10000, 20000, 25000, 50000].find((st) => (rawMax - rawMin) / st <= 5) || 100000;
    const lo = Math.floor(rawMin / step) * step;
    const hi = Math.ceil(rawMax / step) * step;
    const X = (i) => PAD.l + (i / (n - 1)) * (W - PAD.l - PAD.r);
    const Y = (v) => PAD.t + (1 - (v - lo) / (hi - lo)) * (H - PAD.t - PAD.b);
    const path = (pts) => pts.map(([x, y], i) => `${i ? "L" : "M"}${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join("");

    const ticks = Array.from({ length: (hi - lo) / step + 1 }, (_, k) => lo + k * step);
    const last = HISTORY.length - 1;
    const band =
      path([[last, HISTORY[last]], ...forecast.map((f) => [f.x, f.high])]) +
      forecast
        .slice()
        .reverse()
        .map((f) => `L${X(f.x).toFixed(1)},${Y(f.low).toFixed(1)}`)
        .join("") +
      "Z";

    svg.innerHTML = `
      ${ticks
        .map(
          (t) => `<line class="fc__grid" x1="${PAD.l}" x2="${W - PAD.r}" y1="${Y(t)}" y2="${Y(t)}"/>
                  <text class="fc__axis" x="${PAD.l - 8}" y="${Y(t) + 4}" text-anchor="end">$${compact.format(t)}</text>`
        )
        .join("")}
      ${[...LABELS, ...NEXT.slice(0, state.months)]
        .map((l, i) => `<text class="fc__axis" x="${X(i)}" y="${H - 8}" text-anchor="middle">${l}</text>`)
        .join("")}
      <line class="fc__today" x1="${X(last)}" x2="${X(last)}" y1="${PAD.t}" y2="${H - PAD.b}"/>
      <text class="fc__axis" x="${X(last) + 5}" y="${PAD.t + 10}">Hoy</text>
      <path class="fc__band" d="${band}"/>
      ${state.showTrend ? `<path class="fc__trend" d="${path(fitted.map((y, x) => [x, y]))}"/>` : ""}
      <path class="fc__hist" d="${path(HISTORY.map((y, x) => [x, y]))}"/>
      <path class="fc__fc" d="${path([[last, HISTORY[last]], ...forecast.map((f) => [f.x, f.y])])}"/>
      <circle class="fc__dot" cx="${X(last)}" cy="${Y(HISTORY[last])}" r="5"/>
      <line class="fc__cross" y1="${PAD.t}" y2="${H - PAD.b}" visibility="hidden"/>
      <rect class="fc__hit" x="${PAD.l}" y="${PAD.t}" width="${W - PAD.l - PAD.r}" height="${H - PAD.t - PAD.b}"/>`;

    points = [
      ...HISTORY.map((v, i) => ({ x: X(i), y: Y(v), label: LABELS[i], value: v, kind: "real" })),
      ...forecast.map((f, k) => ({ x: X(f.x), y: Y(f.y), label: NEXT[k], value: f.y, low: f.low, high: f.high, kind: "fc" })),
    ];

    const end = forecast[forecast.length - 1];
    host.querySelector(".dash__insight").textContent =
      `📈 Tus ventas ${slope >= 0 ? "crecen" : "bajan"} en promedio ${money.format(Math.abs(slope))} al mes. ` +
      `Para ${NEXT[state.months - 1]} esperamos entre ${money.format(end.low)} y ${money.format(end.high)}.`;
  }

  // Crosshair + tooltip: busca el mes más cercano al cursor
  function onMove(e) {
    const box = svg.getBoundingClientRect();
    const sx = ((e.clientX - box.left) / box.width) * W;
    const p = points.reduce((best, q) => (Math.abs(q.x - sx) < Math.abs(best.x - sx) ? q : best), points[0]);
    const cross = svg.querySelector(".fc__cross");
    cross.setAttribute("x1", p.x);
    cross.setAttribute("x2", p.x);
    cross.setAttribute("visibility", "visible");
    tip.textContent =
      p.kind === "real"
        ? `${p.label} · ${money.format(p.value)}`
        : `${p.label} · ${money.format(p.value)} (entre ${compact.format(p.low)} y ${compact.format(p.high)})`;
    tip.hidden = false;
    tip.style.left = (p.x / W) * box.width + "px";
    tip.style.top = (p.y / H) * box.height - 8 + "px";
  }
  function onLeave() {
    tip.hidden = true;
    svg.querySelector(".fc__cross")?.setAttribute("visibility", "hidden");
  }
  svg.addEventListener("pointermove", onMove);
  svg.addEventListener("pointerleave", onLeave);

  host.querySelector("[data-range]").addEventListener("input", (e) => {
    state.months = Number(e.target.value);
    onLeave();
    render();
  });
  host.querySelector("[data-trend]").addEventListener("change", (e) => {
    state.showTrend = e.target.checked;
    render();
  });

  render();
}
