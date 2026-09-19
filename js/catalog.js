// ---- Catálogo de servicios: filtros, carrusel y detalle con giro ----

(() => {
  const catalogEl = document.getElementById("catalog");
  const filtersEl = document.getElementById("filters");
  const statusEl = document.getElementById("carStatus");
  const total = CATALOG.reduce((n, area) => n + area.items.length, 0);
  // En celular el carrusel es vertical: cambia el eje del swipe y de las flechas
  const vertical = window.matchMedia("(max-width: 640px)");
  let activeArea = "all";
  let active = 0;
  let cards = [];

  // ---- Render ----
  function cardHTML(item, i) {
    return `
      <article class="cat-card" data-id="${item.id}" data-index="${i}" data-area="${item.areaId}">
        <div class="cat-card__ico">${ICONS[item.icon]}</div>
        <p class="cat-card__area">${item.area}</p>
        <h4 class="cat-card__title">${item.title}</h4>
        <div class="cat-card__actions">
          <button type="button" class="cat-card__detail">Ver detalle</button>
          <button type="button" class="add-btn" data-add="${item.id}"></button>
        </div>
      </article>`;
  }

  function visibleItems() {
    return CATALOG.filter((a) => activeArea === "all" || a.id === activeArea).flatMap(
      (a) => a.items.map((item) => ({ ...item, area: a.name, areaId: a.id }))
    );
  }

  function renderCards() {
    catalogEl.innerHTML = visibleItems().map(cardHTML).join("");
    cards = Array.from(catalogEl.children);
    active = 0;
    layout();
    syncAddButtons();
  }

  // Cada tarjeta recibe data-pos: 0 al frente, ±1 de fondo, ±2 oculta.
  // El CSS hace el resto (posición, escala, opacidad y transición).
  function layout() {
    const n = cards.length;
    cards.forEach((card, i) => {
      const o = circularOffset(i, active, n);
      const pos = Math.max(-2, Math.min(2, o));
      card.dataset.pos = pos;
      card.setAttribute("aria-hidden", pos !== 0);
      card.querySelectorAll("button").forEach((b) => (b.tabIndex = pos === 0 ? 0 : -1));
    });
    statusEl.textContent = n ? `${active + 1} / ${n}` : "";
    highlightArea(n ? cards[active].dataset.area : null);
  }

  // El filtro de la categoría de la tarjeta al frente se ilumina con su color.
  // Solo cambia cuando el carrusel cruza a otra categoría.
  function highlightArea(areaId) {
    filtersEl.querySelectorAll(".filter-btn").forEach((b) =>
      b.classList.toggle("is-current", b.dataset.area === areaId)
    );
  }

  function go(delta) {
    if (!cards.length) return;
    active = wrapIndex(active + delta, cards.length);
    layout();
  }

  function renderFilters() {
    const chips = [{ id: "all", name: "Todos", count: total }].concat(
      CATALOG.map((a) => ({ id: a.id, name: a.name, count: a.items.length }))
    );
    filtersEl.innerHTML = chips
      .map(
        (c) =>
          `<button type="button" class="filter-btn${c.id === activeArea ? " is-active" : ""}" data-area="${c.id}" aria-pressed="${c.id === activeArea}">${c.id === "all" ? "" : '<span class="filter-btn__dot"></span>'}${c.name} <span class="filter-btn__n">${c.count}</span></button>`
      )
      .join("");
  }

  filtersEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn || btn.dataset.area === activeArea) return;
    activeArea = btn.dataset.area;
    renderFilters();
    renderCards();
  });

  // ---- Navegación: flechas, teclado y swipe ----
  document.getElementById("carPrev").addEventListener("click", () => go(-1));
  document.getElementById("carNext").addEventListener("click", () => go(1));

  catalogEl.addEventListener("keydown", (e) => {
    const back = vertical.matches ? "ArrowUp" : "ArrowLeft";
    const fwd = vertical.matches ? "ArrowDown" : "ArrowRight";
    if (e.key === back) go(-1);
    else if (e.key === fwd) go(1);
    else return;
    e.preventDefault();
  });

  const SWIPE_MIN = 40;
  let start = null;
  let swiped = false;
  catalogEl.addEventListener("pointerdown", (e) => {
    start = { x: e.clientX, y: e.clientY };
  });
  catalogEl.addEventListener("pointerup", (e) => {
    if (!start) return;
    const d = vertical.matches ? e.clientY - start.y : e.clientX - start.x;
    start = null;
    if (Math.abs(d) < SWIPE_MIN) return;
    swiped = true; // evita que el "click" que sigue al swipe abra el detalle
    setTimeout(() => (swiped = false), 0);
    go(d < 0 ? 1 : -1);
  });
  catalogEl.addEventListener("pointercancel", () => (start = null));

  // ---- Botones "Agregar": reflejan el estado de Quote ----
  function syncAddButtons() {
    document.querySelectorAll("[data-add]").forEach((btn) => {
      const added = Quote.has(btn.dataset.add);
      btn.classList.toggle("is-added", added);
      btn.disabled = added;
      btn.innerHTML = added ? "✓ Agregado" : "+ Agregar";
      btn.setAttribute(
        "aria-label",
        added ? "Ya está en tu cotización" : "Agregar a mi cotización"
      );
    });
  }
  Quote.onChange(syncAddButtons);
  renderFilters();
  renderCards();

  // Reflejo que sigue al cursor sobre la tarjeta
  catalogEl.addEventListener(
    "pointermove",
    (e) => {
      const c = e.target.closest(".cat-card");
      if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      c.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    },
    { passive: true }
  );

  // ---- Detalle: la tarjeta crece al centro y gira ----
  const backdrop = document.getElementById("backdrop");
  const stage = document.getElementById("stage");
  const faceFront = document.getElementById("faceFront");
  const backIco = document.getElementById("backIco");
  const backArea = document.getElementById("backArea");
  const stageTitle = document.getElementById("stageTitle");
  const backBody = document.getElementById("backBody");
  const backHead = stage.querySelector(".back-head");
  const closeBtn = document.getElementById("closeBtn");
  const DURATION = 620;
  const MAX_W = 560;
  const DEMO_W = 760; // la demo necesita más ancho que el texto del detalle

  let origin = null;
  let current = null; // servicio abierto en el detalle
  let maxW = MAX_W;
  let busy = false;

  function rectOf(el) {
    const r = el.getBoundingClientRect();
    return { l: r.left, t: r.top, w: r.width, h: r.height };
  }
  function place(r) {
    stage.style.left = r.l + "px";
    stage.style.top = r.t + "px";
    stage.style.width = r.w + "px";
    stage.style.height = r.h + "px";
  }
  function targetWidth() {
    return Math.min(maxW, window.innerWidth - 32);
  }

  // Mide la altura natural del reverso al ancho destino, sin animar
  function measure(w) {
    const prev = stage.style.transition;
    stage.style.transition = "none";
    stage.style.width = w + "px";
    stage.style.height = "2400px";
    backBody.style.flex = "none";
    backBody.style.height = "auto";
    void stage.offsetHeight;
    const natural = backHead.offsetHeight + backBody.offsetHeight + 2;
    backBody.style.flex = "";
    backBody.style.height = "";
    void stage.offsetHeight;
    stage.style.transition = prev;
    return natural;
  }
  function targetRect(h) {
    const w = targetWidth();
    const th = Math.max(300, Math.min(h, window.innerHeight - 48));
    return { l: (window.innerWidth - w) / 2, t: (window.innerHeight - th) / 2, w, h: th };
  }

  function renderDetail() {
    const s = current;
    const demo = DEMOS[s.id];
    backBody.innerHTML = `
      <p class="detail__lead">${s.lead}</p>
      <p class="detail__desc">${s.description}</p>
      <p class="detail__label">Qué incluye</p>
      <ul class="detail__list">${s.includes.map((x) => `<li>${x}</li>`).join("")}</ul>
      ${demo ? `<button type="button" class="demo-btn" data-demo><span class="demo-btn__play">▶</span><span>Pruébalo<small>Una simulación de cómo funcionaría</small></span></button>` : ""}
      <button type="button" class="add-btn add-btn--wide" data-add="${s.id}"></button>`;
    syncAddButtons();
  }

  // Cambia el contenido del reverso y ajusta el tamaño de la tarjeta con animación
  function swapBody(render, width) {
    const from = rectOf(stage);
    maxW = width;
    render();
    backBody.scrollTop = 0;
    const h = measure(targetWidth()); // measure() deja la tarjeta en su tamaño de prueba…
    stage.style.transition = "none";
    place(from); // …así que se regresa sin animar a donde estaba
    void stage.offsetHeight;
    stage.style.transition = "";
    place(targetRect(h)); // y desde ahí crece/encoge con la transición del CSS
  }

  function showDemo() {
    const demo = DEMOS[current.id];
    swapBody(() => {
      backBody.innerHTML = `
        <button type="button" class="demo-back" data-demo-back>← Volver al detalle</button>
        <p class="demo-title"><span class="demo-badge">Simulación</span>${demo.title}</p>
        <div class="demo-host"></div>
        <button type="button" class="add-btn add-btn--wide" data-add="${current.id}"></button>`;
      demo.render(backBody.querySelector(".demo-host"));
      syncAddButtons();
    }, DEMO_W);
    backBody.querySelector("[data-demo-back]").focus({ preventScroll: true });
  }

  function showDetail() {
    swapBody(renderDetail, MAX_W);
    backBody.querySelector("[data-demo]").focus({ preventScroll: true });
  }

  function open(card) {
    if (busy || origin) return;
    busy = true;
    origin = card;
    const s = findService(card.dataset.id);

    stage.dataset.area = s.areaId;
    faceFront.innerHTML = `
      <div class="cat-card__ico">${ICONS[s.icon]}</div>
      <p class="cat-card__area">${s.area}</p>
      <h4 class="cat-card__title">${s.title}</h4>`;
    backIco.innerHTML = ICONS[s.icon];
    backArea.textContent = s.area;
    stageTitle.textContent = s.title;
    current = s;
    maxW = MAX_W;
    renderDetail();

    const h = measure(targetWidth());
    place(rectOf(card));
    stage.classList.add("on");
    card.classList.add("is-open");
    document.body.classList.add("locked");

    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        backdrop.classList.add("on");
        place(targetRect(h));
        setTimeout(() => {
          busy = false;
          closeBtn.focus();
        }, DURATION);
      })
    );
  }

  function close() {
    if (busy || !origin) return;
    busy = true;
    backdrop.classList.remove("on");
    stage.classList.remove("on");
    place(rectOf(origin));
    const card = origin;
    setTimeout(() => {
      card.classList.remove("is-open");
      document.body.classList.remove("locked");
      stage.style.width = stage.style.height = "0px";
      origin = null;
      busy = false;
      card.querySelector(".cat-card__detail").focus({ preventScroll: true });
    }, DURATION);
  }

  document.addEventListener("click", (e) => {
    const card = e.target.closest(".cat-card");
    const inCarousel = card && catalogEl.contains(card);
    if (inCarousel && swiped) return;
    // Una tarjeta de fondo solo se trae al frente, sin agregar ni abrir
    if (inCarousel && card.dataset.pos !== "0") {
      active = Number(card.dataset.index);
      layout();
      return;
    }
    if (origin && !busy && stage.contains(e.target)) {
      if (e.target.closest("[data-demo]")) return showDemo();
      if (e.target.closest("[data-demo-back]")) return showDetail();
    }
    const addBtn = e.target.closest("[data-add]");
    if (addBtn) {
      Quote.add(addBtn.dataset.add);
      return;
    }
    // Clic en cualquier parte de la tarjeta al frente (o en "Ver detalle") abre el detalle
    if (inCarousel) open(card);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && origin) close();
  });
  backdrop.addEventListener("click", close);
  closeBtn.addEventListener("click", close);

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (origin && !busy) place(targetRect(measure(targetWidth())));
    }, 140);
  });
})();
