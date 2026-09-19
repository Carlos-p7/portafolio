// ============================================================
// 18. Plataforma en línea por suscripción — planes y datos separados
// ============================================================
// Dos ideas para alguien no técnico: (1) cada plan desbloquea módulos y
// (2) cada empresa cliente ve SOLO su información, aunque usen la misma app.

function demoSaas(host) {
  const PLANS = [
    { id: "basic", name: "Básico", price: 299, modules: ["agenda"] },
    { id: "pro", name: "Pro", price: 699, modules: ["agenda", "clientes", "reportes"] },
    { id: "biz", name: "Empresa", price: 1499, modules: ["agenda", "clientes", "reportes", "equipo"] },
  ];
  const MODULES = {
    agenda: "📅 Agenda de citas",
    clientes: "👥 Base de clientes",
    reportes: "📈 Reportes",
    equipo: "🧑‍🤝‍🧑 Varios usuarios",
  };
  const TENANTS = {
    a: { name: "Estética Luna", color: "#e11d48", next: "Corte con Sofía · 11:00", count: 184 },
    b: { name: "Taller Hermanos Ríos", color: "#2563eb", next: "Afinación Versa · 9:30", count: 67 },
  };
  const state = { plan: "pro", tenant: "a" };

  function render() {
    const plan = PLANS.find((p) => p.id === state.plan);
    const t = TENANTS[state.tenant];
    host.innerHTML = `
      <div class="saas">
        <p class="inv__label">1. Tus clientes eligen un plan</p>
        <div class="saas__plans">
          ${PLANS.map(
            (p) => `<button type="button" class="saas__plan${p.id === state.plan ? " is-on" : ""}" data-plan="${p.id}">
              <strong>${p.name}</strong><span>${money.format(p.price)}<small>/mes</small></span></button>`
          ).join("")}
        </div>
        <p class="inv__label">2. Cada empresa entra y ve solo lo suyo</p>
        <div class="auto__toggle">
          ${Object.entries(TENANTS)
            .map(([id, x]) => `<button type="button" data-tenant="${id}" class="${id === state.tenant ? "is-on" : ""}">${x.name}</button>`)
            .join("")}
        </div>
        <div class="saas__app" style="--t:${t.color}">
          <div class="saas__bar"><strong>${t.name}</strong><span>Plan ${plan.name}</span></div>
          <div class="saas__mods">
            ${Object.entries(MODULES)
              .map(([id, label]) => {
                const on = plan.modules.includes(id);
                const body = !on
                  ? "🔒 Disponible en un plan mayor"
                  : id === "agenda"
                  ? `Próxima: ${t.next}`
                  : id === "clientes"
                  ? `${t.count} clientes registrados`
                  : id === "reportes"
                  ? "Ventas del mes ↑ 12%"
                  : "3 usuarios activos";
                return `<div class="saas__mod${on ? "" : " is-locked"}"><strong>${label}</strong><span>${body}</span></div>`;
              })
              .join("")}
          </div>
        </div>
      </div>
      <p class="demo-hint">Cambia de plan y de empresa: los módulos se abren según lo que pagan y los datos nunca se mezclan.</p>`;
  }

  host.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.plan) state.plan = b.dataset.plan;
    else if (b.dataset.tenant) state.tenant = b.dataset.tenant;
    else return;
    render();
  });

  render();
}

// ============================================================
// 19. Servicio central que conecta tus aplicaciones
// ============================================================
// Un "centro" recibe cada evento y avisa a cada app conectada: sin que
// nadie copie datos de un sistema a otro.

function demoHub(host) {
  const APPS = [
    { id: "tienda", ico: "🛒", name: "Tienda en línea", x: 50, y: 17 },
    { id: "inv", ico: "📦", name: "Inventario", x: 88, y: 50 },
    { id: "conta", ico: "🧾", name: "Contabilidad", x: 50, y: 83 },
    { id: "wa", ico: "💬", name: "WhatsApp", x: 12, y: 50 },
  ];
  const EVENTS = {
    venta: { label: "🛒 Nueva venta en la tienda", from: "tienda", effects: { inv: "−1 pieza", conta: "Ingreso registrado", wa: "Confirmación enviada" } },
    stock: { label: "📦 Se acabó un producto", from: "inv", effects: { tienda: "Marcado como agotado", wa: "Aviso a interesados" } },
  };
  const log = [];
  let busy = false;

  host.innerHTML = `
    <div class="hub">
      <div class="hub__map">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          ${APPS.map((a) => `<line x1="50" y1="50" x2="${a.x}" y2="${a.y}" data-line="${a.id}"/>`).join("")}
        </svg>
        <div class="hub__core">⚙️<small>Servicio central</small></div>
        ${APPS.map(
          (a) => `<div class="hub__app" data-app="${a.id}" style="left:${a.x}%;top:${a.y}%"><span>${a.ico}</span>${a.name}<small></small></div>`
        ).join("")}
      </div>
      <div class="hub__actions">
        ${Object.entries(EVENTS).map(([id, ev]) => `<button type="button" class="inv__go" data-event="${id}">${ev.label}</button>`).join("")}
      </div>
      <ul class="hub__log" aria-live="polite"></ul>
    </div>
    <p class="demo-hint">Dispara un evento y mira cómo se entera cada sistema, en segundos y sin capturar nada.</p>`;

  const $ = (s) => host.querySelector(s);
  const time = () => new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  async function fire(id) {
    if (busy) return;
    busy = true;
    host.querySelectorAll("[data-event]").forEach((b) => (b.disabled = true));
    host.querySelectorAll(".hub__app small").forEach((s) => (s.textContent = ""));
    host.querySelectorAll(".hub__app, .hub__map line").forEach((el) => el.classList.remove("is-hot", "is-src"));
    const ev = EVENTS[id];

    $(`[data-app="${ev.from}"]`).classList.add("is-src");
    $(`[data-line="${ev.from}"]`).classList.add("is-hot");
    $(".hub__core").classList.add("is-hot");
    await wait(600);
    for (const [app, effect] of Object.entries(ev.effects)) {
      $(`[data-line="${app}"]`).classList.add("is-hot");
      await wait(350);
      const el = $(`[data-app="${app}"]`);
      el.classList.add("is-hot");
      el.querySelector("small").textContent = `✓ ${effect}`;
      log.unshift(`${time()} · ${APPS.find((a) => a.id === app).name}: ${effect}`);
      $(".hub__log").innerHTML = log.slice(0, 5).map((l) => `<li>${l}</li>`).join("");
    }
    $(".hub__core").classList.remove("is-hot");
    host.querySelectorAll("[data-event]").forEach((b) => (b.disabled = false));
    busy = false;
  }

  host.addEventListener("click", (e) => {
    const b = e.target.closest("[data-event]");
    if (b) fire(b.dataset.event);
  });
}
