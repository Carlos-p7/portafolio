// ============================================================
// 7. App para celular — teléfono navegable con pedidos y puntos
// ============================================================

function demoPhoneApp(host) {
  const MENU = [
    { id: "latte", name: "Latte", price: 55, emoji: "☕" },
    { id: "frappe", name: "Frappé de moka", price: 70, emoji: "🧋" },
    { id: "concha", name: "Concha", price: 25, emoji: "🥯" },
  ];
  const STAMPS_FOR_GIFT = 8;
  const state = { tab: "home", cart: {}, stamps: 5, orders: 0, notice: null };

  const count = () => Object.values(state.cart).reduce((a, b) => a + b, 0);
  const total = () => MENU.reduce((s, p) => s + (state.cart[p.id] || 0) * p.price, 0);

  host.innerHTML = `
    <div class="phone-wrap">
      <div class="phone">
        <div class="phone__notch"></div>
        <div class="phone__toast" hidden></div>
        <div class="phone__screen"></div>
        <nav class="phone__tabs">
          <button type="button" data-tab="home"><span>🏠</span>Inicio</button>
          <button type="button" data-tab="order"><span>🛍️</span>Pedir</button>
          <button type="button" data-tab="points"><span>⭐</span>Puntos</button>
        </nav>
      </div>
    </div>
    <p class="demo-hint">Usa la app como un cliente: pide algo y mira qué pasa en "Puntos".</p>`;

  const screen = host.querySelector(".phone__screen");
  const toast = host.querySelector(".phone__toast");

  const views = {
    home: () => `
      <p class="app__hello">Hola, Mariana 👋</p>
      <div class="app__promo"><strong>2x1 en frappés</strong><span>Solo hoy de 4 a 6 pm</span></div>
      <button type="button" class="app__big" data-tab="order">🛍️ Hacer un pedido</button>
      <div class="app__mini">
        <span>⭐ ${state.stamps}/${STAMPS_FOR_GIFT} sellos</span>
        <span>🧾 ${state.orders} ${state.orders === 1 ? "pedido" : "pedidos"}</span>
      </div>`,
    order: () => `
      <p class="app__title">Menú</p>
      <ul class="app__menu">
        ${MENU.map(
          (p) => `<li><span class="app__emoji">${p.emoji}</span>
            <span class="app__item">${p.name}<small>${money.format(p.price)}</small></span>
            ${state.cart[p.id] ? `<span class="app__q">${state.cart[p.id]}</span>` : ""}
            <button type="button" class="app__plus" data-add="${p.id}" aria-label="Agregar ${p.name}">+</button></li>`
        ).join("")}
      </ul>
      <button type="button" class="app__big" data-checkout ${count() ? "" : "disabled"}>
        ${count() ? `Pedir ${count()} · ${money.format(total())}` : "Agrega algo del menú"}
      </button>`,
    points: () => `
      <p class="app__title">Tarjeta de sellos</p>
      <div class="app__stamps">
        ${Array.from({ length: STAMPS_FOR_GIFT }, (_, i) => `<span class="${i < state.stamps ? "is-on" : ""}">${i < state.stamps ? "☕" : ""}</span>`).join("")}
      </div>
      <p class="app__note">${
        state.stamps >= STAMPS_FOR_GIFT
          ? "🎉 ¡Tienes un café de regalo! Muéstralo en caja."
          : `Te faltan ${STAMPS_FOR_GIFT - state.stamps} para tu café gratis.`
      }</p>`,
  };

  function render() {
    screen.innerHTML = `<div class="app__view">${views[state.tab]()}</div>`;
    host.querySelectorAll(".phone__tabs [data-tab]").forEach((b) => b.classList.toggle("is-on", b.dataset.tab === state.tab));
  }

  async function notify(text) {
    toast.textContent = text;
    toast.hidden = false;
    toast.classList.remove("is-in");
    void toast.offsetWidth;
    toast.classList.add("is-in");
    await wait(2600);
    toast.hidden = true;
  }

  host.addEventListener("click", async (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.tab) state.tab = b.dataset.tab;
    else if (b.dataset.add) state.cart[b.dataset.add] = (state.cart[b.dataset.add] || 0) + 1;
    else if ("checkout" in b.dataset) {
      state.cart = {};
      state.orders += 1;
      state.stamps = Math.min(STAMPS_FOR_GIFT, state.stamps + 1);
      state.tab = "home";
      render();
      notify("✅ Recibimos tu pedido. Te avisamos cuando esté listo.");
      await wait(3200);
      notify("☕ ¡Tu pedido está listo! Pasa a recogerlo. +1 sello");
      return;
    } else return;
    render();
  });

  render();
}
