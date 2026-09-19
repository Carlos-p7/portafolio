// ============================================================
// 14. Portal de autoservicio para tus clientes
// ============================================================
// Entrada con enlace al correo (sin contraseña: en una demo nunca se piden
// credenciales), y luego pedidos, documentos y soporte.

function demoPortal(host) {
  const ORDERS = [
    { id: "P-2031", what: "20 kg de café de grano", step: 2 },
    { id: "P-1987", what: "Máquina de espresso (renta)", step: 3 },
  ];
  const STEPS = ["Recibido", "Preparando", "En camino", "Entregado"];
  const DOCS = ["Contrato de suministro 2026.pdf", "Factura F-8812.pdf", "Manual de la máquina.pdf"];
  const TOPICS = ["🚚 Mi entrega", "🧾 Una factura", "🔧 La máquina"];

  const state = { stage: "login", tab: "orders", ticket: null, topic: TOPICS[0] };

  function viewLogin() {
    return `
      <div class="portal__login">
        <p class="portal__logo">☕ Portal de clientes · Café Aurora</p>
        ${
          state.stage === "login"
            ? `<p>Entra con tu correo. Te mandamos un enlace, sin contraseñas que recordar.</p>
               <div class="portal__email">compras@delvalle.mx</div>
               <button type="button" class="inv__go" data-send>Enviarme el enlace</button>`
            : `<p class="portal__sent">📧 Te enviamos un enlace a <strong>compras@delvalle.mx</strong></p>
               <button type="button" class="inv__go" data-open>Abrir el enlace del correo</button>`
        }
      </div>`;
  }

  function viewOrders() {
    return ORDERS.map(
      (o) => `<div class="portal__order">
        <p><strong>${o.what}</strong><small>${o.id}</small></p>
        <ol class="portal__track">${STEPS.map((s, i) => `<li class="${i <= o.step ? "is-done" : ""}">${s}</li>`).join("")}</ol>
      </div>`
    ).join("");
  }

  function viewDocs() {
    return `<ul class="portal__docs">${DOCS.map(
      (d) => `<li><span>📄 ${d}</span><button type="button" class="shop__back" data-doc="${d}">Descargar</button></li>`
    ).join("")}</ul>`;
  }

  function viewSupport() {
    if (state.ticket) {
      return `<div class="portal__ticket">
        <p>🎫 Ticket <strong>#${state.ticket.id}</strong> · ${state.ticket.topic}</p>
        <ol class="portal__track">${["Recibido", "En revisión", "Resuelto"].map((s, i) => `<li class="${i <= state.ticket.step ? "is-done" : ""}">${s}</li>`).join("")}</ol>
        <p class="portal__muted">${state.ticket.step === 0 ? "Tu equipo ya recibió el aviso." : "Laura de soporte lo está revisando 👀"}</p>
      </div>`;
    }
    return `<p class="inv__label">¿Sobre qué es tu duda?</p>
      <div class="cms__cats">${TOPICS.map((t) => `<button type="button" class="site__kind${t === state.topic ? " is-on" : ""}" data-topic="${t}">${t}</button>`).join("")}</div>
      <button type="button" class="inv__go" data-ticket>Abrir ticket</button>`;
  }

  function render() {
    const inside = state.stage === "in";
    host.innerHTML = `
      <div class="portal">
        ${
          inside
            ? `<div class="portal__head"><span>Hola, <strong>Comercializadora del Valle</strong></span><button type="button" class="demo-back" data-out>Salir</button></div>
               <div class="auto__toggle portal__tabs" role="tablist">
                 ${[["orders", "📦 Pedidos"], ["docs", "📄 Documentos"], ["support", "💬 Soporte"]]
                   .map(([id, l]) => `<button type="button" role="tab" data-tab="${id}" class="${state.tab === id ? "is-on" : ""}">${l}</button>`)
                   .join("")}
               </div>
               <div class="portal__body">${{ orders: viewOrders, docs: viewDocs, support: viewSupport }[state.tab]()}</div>
               <div class="portal__toast" hidden></div>`
            : viewLogin()
        }
      </div>
      <p class="demo-hint">${inside ? "Revisa pedidos, descarga documentos o abre un ticket, como lo haría tu cliente." : "Así entra tu cliente a su portal."}</p>`;
  }

  async function toast(text) {
    const t = host.querySelector(".portal__toast");
    if (!t) return;
    t.textContent = text;
    t.hidden = false;
    await wait(1800);
    t.hidden = true;
  }

  host.addEventListener("click", async (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const d = b.dataset;
    if ("send" in d) state.stage = "sent";
    else if ("open" in d) state.stage = "in";
    else if ("out" in d) {
      state.stage = "login";
      state.ticket = null;
    } else if (d.tab) state.tab = d.tab;
    else if (d.topic) state.topic = d.topic;
    else if (d.doc) return toast(`✅ ${d.doc} descargado (simulación)`);
    else if ("ticket" in d) {
      state.ticket = { id: 4400 + Math.floor(Math.random() * 99), topic: state.topic, step: 0 };
      render();
      await wait(2200);
      if (state.ticket && state.tab === "support") {
        state.ticket.step = 1;
        render();
      }
      return;
    } else return;
    render();
  });

  render();
}
