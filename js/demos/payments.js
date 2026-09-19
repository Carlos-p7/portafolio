// ============================================================
// 15. Cobros en línea — liga de pago de ida y vuelta
// ============================================================
// Dos pantallas lado a lado: tú (el negocio) creas la liga, tu cliente la
// recibe en su celular y paga; tu panel se entera solo.

function demoPayments(host) {
  const CONCEPTS = [
    ["Anticipo de evento", 1500],
    ["Pedido a domicilio", 420],
    ["Mensualidad de café", 890],
  ];
  const state = { concept: 0, amount: CONCEPTS[0][1], link: null, paid: [], phone: "idle" };
  const code = () => Math.random().toString(36).slice(2, 8);

  function render() {
    const [name] = CONCEPTS[state.concept];
    const total = state.paid.reduce((s, p) => s + p.amount, 0);
    host.innerHTML = `
      <div class="pay">
        <section class="pay__me">
          <p class="cms__tag">🏪 Tú</p>
          <div class="cms__cats">${CONCEPTS.map(
            ([c], i) => `<button type="button" class="site__kind${i === state.concept ? " is-on" : ""}" data-concept="${i}">${c}</button>`
          ).join("")}</div>
          <label class="site__field"><span>Monto</span>
            <input type="number" min="10" max="50000" step="10" value="${state.amount}" data-amount /></label>
          ${
            state.link
              ? `<div class="pay__link"><small>Liga creada</small><strong>pagar.cafeaurora.mx/${state.link}</strong></div>
                 <button type="button" class="inv__go pay__wa" data-send ${state.phone !== "idle" ? "disabled" : ""}>💬 Enviar por WhatsApp</button>`
              : `<button type="button" class="inv__go" data-create>🔗 Crear liga de cobro</button>`
          }
          <div class="pay__ledger">
            <p><span>Cobrado hoy</span><strong>${money.format(total)}</strong></p>
            <ul>${state.paid.map((p) => `<li><span>✅ ${p.name}</span><span>${money.format(p.amount)}</span></li>`).join("") || "<li class='portal__muted'>Aún no hay cobros</li>"}</ul>
          </div>
        </section>
        <section class="pay__client">
          <p class="cms__tag">📱 Tu cliente</p>
          <div class="pay__phone">${phoneView(name)}</div>
        </section>
      </div>
      <p class="demo-hint">Crea una liga, envíala y paga desde el celular del cliente. Mira cómo se actualiza tu panel.</p>`;
  }

  function phoneView(name) {
    if (state.phone === "idle") return `<p class="portal__muted pay__empty">Aquí llegará tu liga de pago</p>`;
    if (state.phone === "msg")
      return `<div class="chat__msg chat__msg--bot pay__msg">Hola 👋 Aquí está tu liga para <strong>${name}</strong> por <strong>${money.format(state.amount)}</strong>:<br><u>pagar.cafeaurora.mx/${state.link}</u></div>
        <button type="button" class="inv__go" data-openlink>Abrir liga</button>`;
    if (state.phone === "checkout")
      return `<div class="pay__checkout">
          <small>Café Aurora te cobra</small>
          <strong class="pay__amount">${money.format(state.amount)}</strong>
          <span>${name}</span>
          <div class="shop__card"><span>Tarjeta de prueba</span><strong>•••• 4242</strong><small>Simulación: no se cobra nada</small></div>
          <button type="button" class="inv__go" data-pay>Pagar</button>
        </div>`;
    if (state.phone === "paying") return `<p class="pay__empty">🔒 Procesando pago seguro…</p>`;
    return `<div class="shop__done"><div class="shop__check">✓</div><h5>¡Pago recibido!</h5><p>Te llegó el recibo por correo.</p></div>`;
  }

  host.addEventListener("input", (e) => {
    if (e.target.dataset.amount === undefined) return;
    state.amount = Math.max(0, Number(e.target.value) || 0);
  });

  host.addEventListener("click", async (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const d = b.dataset;
    if (d.concept !== undefined) {
      state.concept = Number(d.concept);
      state.amount = CONCEPTS[state.concept][1];
      state.link = null;
      state.phone = "idle";
    } else if ("create" in d) {
      if (state.amount < 10) return;
      state.link = code();
    } else if ("send" in d) state.phone = "msg";
    else if ("openlink" in d) state.phone = "checkout";
    else if ("pay" in d) {
      state.phone = "paying";
      render();
      await wait(1300);
      state.phone = "done";
      state.paid.unshift({ name: CONCEPTS[state.concept][0], amount: state.amount });
      render();
      await wait(2500);
      state.link = null;
      state.phone = "idle";
    } else return;
    render();
  });

  render();
}
