// ---- Catálogo de servicios: filtros, tarjetas y detalle con giro ----

(() => {
  const catalogEl = document.getElementById("catalog");
  const filtersEl = document.getElementById("filters");
  const total = CATALOG.reduce((n, area) => n + area.items.length, 0);
  let activeArea = "all";

  // ---- Render ----
  function cardHTML(item) {
    return `
      <article class="cat-card" data-id="${item.id}">
        <div class="cat-card__ico">${ICONS[item.icon]}</div>
        <h4 class="cat-card__title">${item.title}</h4>
        <div class="cat-card__actions">
          <button type="button" class="cat-card__detail">Ver detalle</button>
          <button type="button" class="add-btn" data-add="${item.id}"></button>
        </div>
      </article>`;
  }

  catalogEl.innerHTML = CATALOG.map(
    (area) => `
      <section class="cat-area" data-area="${area.id}">
        <div class="cat-area__head">
          <h3>${area.name}</h3>
          <span class="cat-area__rule"></span>
        </div>
        <div class="cat-grid">${area.items.map(cardHTML).join("")}</div>
      </section>`
  ).join("");

  function renderFilters() {
    const chips = [{ id: "all", name: "Todos", count: total }].concat(
      CATALOG.map((a) => ({ id: a.id, name: a.name, count: a.items.length }))
    );
    filtersEl.innerHTML = chips
      .map(
        (c) =>
          `<button type="button" class="filter-btn${c.id === activeArea ? " is-active" : ""}" data-area="${c.id}" aria-pressed="${c.id === activeArea}">${c.name} <span class="filter-btn__n">${c.count}</span></button>`
      )
      .join("");
  }

  filtersEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    activeArea = btn.dataset.area;
    renderFilters();
    catalogEl.querySelectorAll(".cat-area").forEach((sec) => {
      sec.hidden = activeArea !== "all" && sec.dataset.area !== activeArea;
    });
  });

  renderFilters();

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
  syncAddButtons();

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

  let origin = null;
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
    return Math.min(MAX_W, window.innerWidth - 32);
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

  function open(card) {
    if (busy || origin) return;
    busy = true;
    origin = card;
    const s = findService(card.dataset.id);

    faceFront.innerHTML = `
      <div class="cat-card__ico">${ICONS[s.icon]}</div>
      <h4 class="cat-card__title">${s.title}</h4>`;
    backIco.innerHTML = ICONS[s.icon];
    backArea.textContent = s.area;
    stageTitle.textContent = s.title;
    backBody.innerHTML = `
      <p class="detail__lead">${s.lead}</p>
      <p class="detail__desc">${s.description}</p>
      <p class="detail__label">Qué incluye</p>
      <ul class="detail__list">${s.includes.map((x) => `<li>${x}</li>`).join("")}</ul>
      <button type="button" class="add-btn add-btn--wide" data-add="${s.id}"></button>`;
    syncAddButtons();

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
    const addBtn = e.target.closest("[data-add]");
    if (addBtn) {
      Quote.add(addBtn.dataset.add);
      return;
    }
    // Clic en cualquier parte de la tarjeta (o en "Ver detalle") abre el detalle
    const card = e.target.closest(".cat-card");
    if (card && catalogEl.contains(card)) open(card);
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
