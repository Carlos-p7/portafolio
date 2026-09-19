// ---- Caja de cotización ----
// Estado único de "qué servicios quiere cotizar el visitante". Todo lo demás
// (botones de las tarjetas, la caja flotante, el bloque del formulario) solo
// lee de aquí y se re-pinta cuando cambia — nunca guardan su propia copia.

const Quote = (() => {
  const STORAGE_KEY = "quote-services";
  const listeners = [];
  let ids = load();

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      // Descarta ids que ya no existan en el catálogo y posibles duplicados
      return Array.isArray(raw) ? [...new Set(raw)].filter((id) => findService(id)) : [];
    } catch {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // modo privado / storage bloqueado: la selección vive solo en memoria
    }
  }

  function emit(change) {
    save();
    listeners.forEach((fn) => fn(list(), change));
  }

  function has(id) {
    return ids.includes(id);
  }

  /** Agrega un servicio. Devuelve false si ya estaba o si no existe. */
  function add(id) {
    if (has(id) || !findService(id)) return false;
    ids.push(id);
    emit({ type: "add", id });
    return true;
  }

  function remove(id) {
    if (!has(id)) return;
    ids = ids.filter((x) => x !== id);
    emit({ type: "remove", id });
  }

  function clear() {
    ids = [];
    emit({ type: "clear" });
  }

  function list() {
    return [...ids];
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  return { has, add, remove, clear, list, onChange };
})();

// ---- UI: caja flotante ----
// Cerrada muestra los íconos de lo elegido (cada uno con el color de su
// categoría); abierta muestra la lista con nombres y la opción de quitar.
(() => {
  const box = document.getElementById("quoteBox");
  const toggle = document.getElementById("quoteToggle");
  const panel = document.getElementById("quotePanel");
  const listEl = document.getElementById("quoteList");
  const iconsEl = document.getElementById("quoteIcons");
  const countEl = document.getElementById("quoteCount");
  const goBtn = document.getElementById("quoteGo");
  const form = document.getElementById("contactForm");
  const MAX_ICONS = 6;

  function setOpen(open) {
    box.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
  }

  function render(ids, change) {
    countEl.textContent = ids.length;
    box.hidden = ids.length === 0;
    if (ids.length === 0) setOpen(false);

    const services = ids.map(findService);
    const extra = services.length - MAX_ICONS;
    iconsEl.innerHTML =
      services
        .slice(0, extra > 0 ? MAX_ICONS - 1 : MAX_ICONS)
        .map(
          (s) =>
            `<span class="quote-tile${change && change.type === "add" && change.id === s.id ? " is-new" : ""}" data-area="${s.areaId}" title="${s.title}">${ICONS[s.icon]}</span>`
        )
        .join("") + (extra > 0 ? `<span class="quote-tile quote-tile--more">+${extra + 1}</span>` : "");

    listEl.innerHTML = services
      .map(
        (s) => `
          <li class="quote-item" data-area="${s.areaId}">
            <span class="quote-item__ico">${ICONS[s.icon]}</span>
            <span class="quote-item__title">${s.title}</span>
            <button type="button" class="quote-item__remove" data-remove="${s.id}" aria-label="Quitar ${s.title}">×</button>
          </li>`
      )
      .join("");

    if (change && change.type === "add") {
      box.classList.remove("is-bumped");
      void box.offsetWidth; // reinicia la animación
      box.classList.add("is-bumped");
    }
  }

  toggle.addEventListener("click", () => setOpen(panel.hidden));

  listEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove]");
    if (btn) Quote.remove(btn.dataset.remove);
  });

  // Va directo al formulario (no al inicio de #contacto: en celular arriba
  // del formulario está el bloque de WhatsApp y la selección quedaba fuera de vista)
  goBtn.addEventListener("click", () => {
    setOpen(false);
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Mientras el formulario está en pantalla la caja estorba: el formulario
  // ya muestra los servicios elegidos
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      ([entry]) => {
        box.classList.toggle("is-away", entry.isIntersecting);
        if (entry.isIntersecting) setOpen(false);
      },
      { threshold: 0.15 }
    ).observe(form);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) setOpen(false);
  });

  Quote.onChange(render);
  render(Quote.list());
})();
