// ============================================================
// 6. Página web para tu negocio — personalizador en vivo
// ============================================================
// El visitante escribe el nombre de SU negocio, elige giro y color, y ve su
// página armarse al instante (en computadora o en celular).

function demoWebsite(host) {
  const KINDS = {
    cafe: {
      label: "☕ Cafetería",
      tagline: "El café de especialidad de tu colonia",
      cta: "Ver menú",
      services: [["☕", "Café de origen"], ["🥐", "Pan del día"], ["🛵", "Envío a domicilio"]],
    },
    taller: {
      label: "🔧 Taller",
      tagline: "Tu auto en buenas manos, sin sorpresas",
      cta: "Agendar servicio",
      services: [["🛢️", "Cambio de aceite"], ["🛞", "Frenos y llantas"], ["🔍", "Diagnóstico"]],
    },
    consultorio: {
      label: "🩺 Consultorio",
      tagline: "Atención cercana para toda tu familia",
      cta: "Agendar cita",
      services: [["🩺", "Consulta general"], ["💉", "Vacunas"], ["📋", "Certificados"]],
    },
    ropa: {
      label: "👕 Tienda de ropa",
      tagline: "Nueva colección cada temporada",
      cta: "Ver catálogo",
      services: [["👗", "Dama"], ["👔", "Caballero"], ["🎁", "Tarjetas de regalo"]],
    },
  };
  const COLORS = ["#ff6a00", "#14b8a6", "#8b5cf6", "#e11d48", "#2563eb", "#16a34a"];

  const state = { name: "", kind: "cafe", color: COLORS[0], device: "desktop" };

  host.innerHTML = `
    <div class="site">
      <div class="site__controls">
        <label class="site__field">
          <span>Nombre de tu negocio</span>
          <input type="text" maxlength="28" placeholder="Ej. Café Aurora" data-name />
        </label>
        <div class="site__field">
          <span>Giro</span>
          <div class="site__kinds">
            ${Object.entries(KINDS)
              .map(([id, k]) => `<button type="button" class="site__kind" data-kind="${id}">${k.label}</button>`)
              .join("")}
          </div>
        </div>
        <div class="site__field">
          <span>Color de tu marca</span>
          <div class="site__colors">
            ${COLORS.map(
              (c) => `<button type="button" class="site__color" data-color="${c}" style="--c:${c}" aria-label="Color ${c}"></button>`
            ).join("")}
          </div>
        </div>
        <div class="site__devices" role="radiogroup" aria-label="Vista">
          <button type="button" data-device="desktop">🖥️ Computadora</button>
          <button type="button" data-device="mobile">📱 Celular</button>
        </div>
      </div>
      <div class="site__stage">
        <div class="site__frame">
          <div class="site__bar"><span></span><span></span><span></span><em data-url></em></div>
          <div class="site__page"></div>
        </div>
      </div>
    </div>
    <p class="demo-hint">Escribe el nombre de tu negocio y cambia giro y color: tu página se arma sola.</p>`;

  const page = host.querySelector(".site__page");
  const frame = host.querySelector(".site__frame");
  const urlEl = host.querySelector("[data-url]");

  const slug = (s) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 20) || "tunegocio";

  function render() {
    const k = KINDS[state.kind];
    const name = state.name.trim() || "Tu negocio";
    frame.dataset.device = state.device;
    frame.style.setProperty("--brand", state.color);
    urlEl.textContent = `www.${slug(state.name)}.com`;

    page.innerHTML = `
      <header class="mini__nav"><strong data-brand></strong><span>Inicio · Servicios · Contacto</span></header>
      <section class="mini__hero">
        <h6 data-brand></h6>
        <p>${k.tagline}</p>
        <span class="mini__btn">${k.cta}</span>
      </section>
      <section class="mini__cards">
        ${k.services.map(([ico, t]) => `<div class="mini__card"><span>${ico}</span>${t}</div>`).join("")}
      </section>
      <footer class="mini__foot"><span class="mini__wa">💬 Escríbenos por WhatsApp</span></footer>`;
    // El nombre lo escribe el visitante: va con textContent, nunca como HTML
    page.querySelectorAll("[data-brand]").forEach((el) => (el.textContent = name));

    host.querySelectorAll("[data-kind]").forEach((b) => b.classList.toggle("is-on", b.dataset.kind === state.kind));
    host.querySelectorAll("[data-color]").forEach((b) => b.classList.toggle("is-on", b.dataset.color === state.color));
    host.querySelectorAll("[data-device]").forEach((b) => {
      b.classList.toggle("is-on", b.dataset.device === state.device);
      b.setAttribute("aria-checked", b.dataset.device === state.device);
    });
  }

  host.querySelector("[data-name]").addEventListener("input", (e) => {
    state.name = e.target.value;
    render();
  });
  host.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.kind) state.kind = b.dataset.kind;
    else if (b.dataset.color) state.color = b.dataset.color;
    else if (b.dataset.device) state.device = b.dataset.device;
    else return;
    render();
  });

  render();
}
