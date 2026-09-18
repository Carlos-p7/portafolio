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
(() => {
  const box = document.getElementById("quoteBox");
  const toggle = document.getElementById("quoteToggle");
  const panel = document.getElementById("quotePanel");
  const listEl = document.getElementById("quoteList");
  const countEl = document.getElementById("quoteCount");
  const goBtn = document.getElementById("quoteGo");

  function setOpen(open) {
    box.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
  }

  function render(ids, change) {
    countEl.textContent = ids.length;
    box.hidden = ids.length === 0;
    if (ids.length === 0) setOpen(false);

    listEl.innerHTML = ids
      .map((id) => {
        const s = findService(id);
        return `
          <li class="quote-item">
            <span class="quote-item__ico">${ICONS[s.icon]}</span>
            <span class="quote-item__title">${s.title}</span>
            <button type="button" class="quote-item__remove" data-remove="${id}" aria-label="Quitar ${s.title}">×</button>
          </li>`;
      })
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

  goBtn.addEventListener("click", () => {
    setOpen(false);
    document.getElementById("contacto").scrollIntoView({ behavior: "smooth" });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) setOpen(false);
  });

  Quote.onChange(render);
  render(Quote.list());
})();
