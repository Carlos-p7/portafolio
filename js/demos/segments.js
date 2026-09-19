// ============================================================
// 11. Conoce a tus tipos de clientes — agrupación con k-means
// ============================================================
// El paso "¿a qué grupo va cada cliente?" lo resuelve nearestCentroid()
// (js/nearest-centroid.js). Aquí van los datos, el paso "mover centros" y
// la animación de cada vuelta del algoritmo.

function demoSegments(host) {
  const MAX_VISITS = 12;
  const MAX_SPEND = 600;
  const K = 3;

  // Números pseudoaleatorios con semilla: siempre salen los mismos clientes
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const around = (cx, cy, sx, sy, n) =>
    Array.from({ length: n }, () => ({
      visits: Math.max(0.5, Math.min(MAX_VISITS - 0.3, cx + (rand() - 0.5) * sx)),
      spend: Math.max(20, Math.min(MAX_SPEND - 10, cy + (rand() - 0.5) * sy)),
    }));
  const CUSTOMERS = [
    ...around(9, 170, 4, 160, 16), // vienen mucho, gastan poco
    ...around(3, 470, 3.5, 170, 12), // vienen poco, gastan mucho
    ...around(1.8, 120, 2.5, 150, 14), // casi no vienen
  ];

  // Para medir distancias, las dos medidas deben estar en la misma escala
  // (si no, $ pesaría 50 veces más que las visitas): se llevan a 0–1.
  const norm = (c) => ({ x: c.visits / MAX_VISITS, y: c.spend / MAX_SPEND });
  const POINTS = CUSTOMERS.map(norm);

  const START = [
    { x: 0.35, y: 0.35 },
    { x: 0.45, y: 0.45 },
    { x: 0.4, y: 0.25 },
  ];

  // Nombre de cada grupo según cómo quedó su centro
  const PERSONAS = {
    big: { name: "💎 Gastan mucho", action: "Ofréceles un programa VIP o productos premium." },
    loyal: { name: "🔁 Vienen seguido", action: "Prémialos con sellos o descuentos por visita." },
    cold: { name: "💤 Se están alejando", action: "Mándales un cupón de regreso por WhatsApp." },
  };

  const W = 560, H = 290, PAD = { l: 50, r: 14, t: 14, b: 38 };
  const X = (v) => PAD.l + v * (W - PAD.l - PAD.r);
  const Y = (v) => PAD.t + (1 - v) * (H - PAD.t - PAD.b);

  let centroids = START.map((c) => ({ ...c }));
  let groups = null; // índice de grupo por cliente (null = aún sin agrupar)
  let names = null; // nombre de persona por índice de grupo
  let step = 0;
  let running = false;

  host.innerHTML = `
    <div class="seg">
      <div class="fc__chart">
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Clientes según visitas y gasto"></svg>
        <div class="dash__tip" role="tooltip" hidden></div>
      </div>
      <div class="seg__bar">
        <button type="button" class="inv__go" data-run>🔍 Encontrar grupos</button>
        <span class="seg__step" aria-live="polite"></span>
      </div>
      <div class="seg__groups"></div>
    </div>
    <p class="demo-hint">Cada punto es un cliente. Toca el botón y mira cómo el algoritmo los agrupa solo.</p>`;

  const svg = host.querySelector("svg");
  const tip = host.querySelector(".dash__tip");
  const stepEl = host.querySelector(".seg__step");
  const groupsEl = host.querySelector(".seg__groups");
  const runBtn = host.querySelector("[data-run]");

  function assign() {
    return POINTS.map((p) => nearestCentroid(p, centroids));
  }

  // Paso 2 de k-means: cada centro va al promedio de sus clientes
  function moveCentroids(g) {
    return centroids.map((c, k) => {
      const mine = POINTS.filter((_, i) => g[i] === k);
      if (!mine.length) return c; // grupo vacío: el centro se queda donde está
      return {
        x: mine.reduce((s, p) => s + p.x, 0) / mine.length,
        y: mine.reduce((s, p) => s + p.y, 0) / mine.length,
      };
    });
  }

  function nameGroups() {
    const order = centroids.map((c, k) => ({ c, k }));
    const big = order.reduce((a, b) => (b.c.y > a.c.y ? b : a)).k;
    const rest = order.filter((o) => o.k !== big);
    const loyal = rest.reduce((a, b) => (b.c.x > a.c.x ? b : a)).k;
    const out = {};
    out[big] = "big";
    out[loyal] = "loyal";
    rest.filter((o) => o.k !== loyal).forEach((o) => (out[o.k] = "cold"));
    return out;
  }

  function render() {
    const xt = [0, 3, 6, 9, 12];
    const yt = [0, 200, 400, 600];
    svg.innerHTML = `
      ${yt.map((t) => `<line class="fc__grid" x1="${PAD.l}" x2="${W - PAD.r}" y1="${Y(t / MAX_SPEND)}" y2="${Y(t / MAX_SPEND)}"/>
        <text class="fc__axis" x="${PAD.l - 8}" y="${Y(t / MAX_SPEND) + 4}" text-anchor="end">$${t}</text>`).join("")}
      ${xt.map((t) => `<text class="fc__axis" x="${X(t / MAX_VISITS)}" y="${H - 20}" text-anchor="middle">${t}</text>`).join("")}
      <text class="fc__axis" x="${(PAD.l + W - PAD.r) / 2}" y="${H - 4}" text-anchor="middle">Visitas al mes →</text>
      <text class="fc__axis" x="12" y="${PAD.t + 4}" transform="rotate(-90 12 ${PAD.t + 4})" text-anchor="end">Gasto promedio →</text>
      ${POINTS.map(
        (p, i) =>
          `<circle class="seg__pt${groups ? " g" + groups[i] : ""}" data-i="${i}" cx="${X(p.x)}" cy="${Y(p.y)}" r="5"/>`
      ).join("")}
      ${groups
        ? centroids
            .map(
              (c, k) => `<g class="seg__center g${k}" transform="translate(${X(c.x)} ${Y(c.y)})">
                <rect x="-8" y="-8" width="16" height="16" rx="3" transform="rotate(45)"/></g>`
            )
            .join("")
        : ""}`;
    renderGroups();
  }

  function renderGroups() {
    if (!groups || !names) {
      groupsEl.innerHTML = "";
      return;
    }
    groupsEl.innerHTML = centroids
      .map((c, k) => {
        const members = CUSTOMERS.filter((_, i) => groups[i] === k);
        const p = PERSONAS[names[k]];
        const avgV = members.reduce((s, m) => s + m.visits, 0) / (members.length || 1);
        const avgS = members.reduce((s, m) => s + m.spend, 0) / (members.length || 1);
        return `<div class="seg__card">
          <p class="seg__name"><i class="seg__key g${k}"></i>${p.name}</p>
          <p class="seg__stats"><strong>${members.length}</strong> clientes · ${avgV.toFixed(1)} visitas/mes · ${money.format(avgS)} por visita</p>
          <p class="seg__action">👉 ${p.action}</p>
        </div>`;
      })
      .join("");
  }

  async function run() {
    if (running) return;
    running = true;
    runBtn.disabled = true;
    centroids = START.map((c) => ({ ...c }));
    names = null;
    step = 0;
    let prev = null;
    // Máximo 10 vueltas; normalmente se estabiliza en 3–5
    while (step < 10) {
      step += 1;
      groups = assign();
      stepEl.textContent = `Vuelta ${step}: cada cliente se va con el centro más cercano…`;
      render();
      await wait(700);
      const same = prev && prev.every((g, i) => g === groups[i]);
      if (same) break;
      prev = groups;
      centroids = moveCentroids(groups);
      stepEl.textContent = `Vuelta ${step}: los centros se mueven al promedio de su grupo…`;
      render();
      await wait(700);
    }
    names = nameGroups();
    stepEl.textContent = `✅ Listo en ${step} vueltas: nadie cambió de grupo.`;
    render();
    runBtn.disabled = false;
    runBtn.textContent = "↺ Volver a agrupar";
    running = false;
  }

  runBtn.addEventListener("click", run);

  // Tooltip por cliente (el punto es el objetivo del hover)
  svg.addEventListener("pointerover", (e) => {
    const pt = e.target.closest(".seg__pt");
    if (!pt) return;
    const c = CUSTOMERS[pt.dataset.i];
    const box = svg.getBoundingClientRect();
    const group = groups && names ? ` · ${PERSONAS[names[groups[pt.dataset.i]]].name}` : "";
    tip.textContent = `Cliente ${Number(pt.dataset.i) + 1}: ${c.visits.toFixed(0)} visitas · ${money.format(c.spend)}${group}`;
    tip.hidden = false;
    tip.style.left = (Number(pt.getAttribute("cx")) / W) * box.width + "px";
    tip.style.top = (Number(pt.getAttribute("cy")) / H) * box.height - 10 + "px";
  });
  svg.addEventListener("pointerout", (e) => {
    if (e.target.closest(".seg__pt")) tip.hidden = true;
  });

  render();
}
