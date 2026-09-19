// ============================================================
// 4. Automatizar tareas
// ============================================================
function demoAutomation(host) {
  const TASKS = [
    { ico: "📧", text: "Leer el correo del pedido", manual: 3, auto: 1 },
    { ico: "📋", text: "Copiar los datos a Excel", manual: 5, auto: 1 },
    { ico: "🧾", text: "Hacer la factura", manual: 6, auto: 2 },
    { ico: "📲", text: "Avisar al cliente", manual: 2, auto: 1 },
  ];
  // manual: minutos por pedido · auto: segundos por pedido
  const PER_DAY = 20;
  let mode = "manual";
  let running = false;

  const manualMin = TASKS.reduce((s, t) => s + t.manual, 0);
  const autoSec = TASKS.reduce((s, t) => s + t.auto, 0);

  host.innerHTML = `
    <div class="auto">
      <div class="auto__toggle" role="radiogroup" aria-label="Modo">
        <button type="button" role="radio" data-mode="manual">👤 A mano</button>
        <button type="button" role="radio" data-mode="auto">⚡ Automático</button>
      </div>
      <p class="auto__story">Cada vez que te llega un pedido por correo, alguien tiene que:</p>
      <ol class="auto__tasks">
        ${TASKS.map(
          (t) => `<li><span class="auto__ico">${t.ico}</span><span class="auto__text">${t.text}</span><span class="auto__time"></span></li>`
        ).join("")}
      </ol>
      <div class="auto__run">
        <button type="button" class="auto__go">📩 Simular pedido nuevo</button>
        <div class="auto__clock" aria-live="polite"><span class="auto__clock-value">0</span></div>
      </div>
      <div class="auto__compare">
        <p>Con <strong>${PER_DAY} pedidos al día</strong>:</p>
        <div class="auto__cmp-row" data-row="manual">
          <span>👤 A mano</span>
          <span class="auto__cmp-track"><span class="auto__cmp-bar" style="width:100%"></span></span>
          <strong>${formatDuration(manualMin * 60 * PER_DAY)}</strong>
        </div>
        <div class="auto__cmp-row" data-row="auto">
          <span>⚡ Automático</span>
          <span class="auto__cmp-track"><span class="auto__cmp-bar" style="width:${Math.max(1, (autoSec / (manualMin * 60)) * 100)}%"></span></span>
          <strong>${formatDuration(autoSec * PER_DAY)}</strong>
        </div>
      </div>
    </div>
    <p class="demo-hint">Elige un modo y simula un pedido. Luego prueba el otro.</p>`;

  const items = [...host.querySelectorAll(".auto__tasks li")];
  const clock = host.querySelector(".auto__clock-value");
  const goBtn = host.querySelector(".auto__go");

  function formatDuration(sec) {
    if (sec < 60) return `${sec} seg`;
    if (sec < 3600) return `${Math.round(sec / 60)} min`;
    const h = Math.floor(sec / 3600);
    const m = Math.round((sec % 3600) / 60);
    return m ? `${h} h ${m} min` : `${h} h`;
  }

  function setMode(m) {
    mode = m;
    host.querySelector(".auto").dataset.mode = m;
    host.querySelectorAll("[data-mode]").forEach((b) => {
      b.classList.toggle("is-on", b.dataset.mode === m);
      b.setAttribute("aria-checked", b.dataset.mode === m);
    });
    host.querySelectorAll(".auto__cmp-row").forEach((r) => r.classList.toggle("is-on", r.dataset.row === m));
    items.forEach((li) => {
      li.className = "";
      li.querySelector(".auto__time").textContent = "";
    });
    clock.textContent = "0";
  }

  async function run() {
    if (running) return;
    running = true;
    goBtn.disabled = true;
    setMode(mode);
    let elapsed = 0; // en segundos simulados
    for (const [i, t] of TASKS.entries()) {
      const li = items[i];
      li.className = "is-doing";
      const cost = mode === "manual" ? t.manual * 60 : t.auto;
      // A mano cada paso "tarda" en pantalla; automático pasa volando
      const frames = mode === "manual" ? 24 : 5;
      for (let f = 1; f <= frames; f++) {
        await wait(mode === "manual" ? 45 : 40);
        clock.textContent = formatDuration(Math.round(elapsed + (cost * f) / frames));
      }
      elapsed += cost;
      li.className = "is-done";
      li.querySelector(".auto__time").textContent = formatDuration(cost);
    }
    goBtn.disabled = false;
    goBtn.textContent = "📩 Simular otro pedido";
    running = false;
  }

  host.addEventListener("click", (e) => {
    const m = e.target.closest("[data-mode]");
    if (m && !running) setMode(m.dataset.mode);
    if (e.target.closest(".auto__go")) run();
  });

  setMode("manual");
}
