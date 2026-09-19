// ============================================================
// 16. Un solo inicio de sesión para todas tus herramientas
// ============================================================

function demoSso(host) {
  const APPS = [
    ["📧", "Correo"],
    ["📊", "Ventas"],
    ["🧾", "Facturas"],
    ["📁", "Archivos"],
    ["💬", "Chat del equipo"],
    ["📅", "Agenda"],
  ];
  const state = { mode: "before", open: [], busy: false, offboarded: false };

  function render() {
    const before = state.mode === "before";
    host.innerHTML = `
      <div class="sso" data-mode="${state.mode}">
        <div class="auto__toggle" role="radiogroup" aria-label="Modo">
          <button type="button" role="radio" data-mode="before" class="${before ? "is-on" : ""}">😩 Hoy</button>
          <button type="button" role="radio" data-mode="after" class="${before ? "" : "is-on"}">😌 Con inicio único</button>
        </div>
        <p class="auto__story">${
          before
            ? `Tu equipo tiene <strong>${APPS.length} contraseñas distintas</strong>. Toca cada herramienta para entrar:`
            : state.offboarded
            ? "Ana dejó la empresa: con <strong>un clic</strong> pierde acceso a todo."
            : "Una sola cuenta de la empresa abre todo:"
        }</p>
        <div class="sso__apps">
          ${APPS.map(
            ([ico, name], i) => `<button type="button" class="sso__app${state.open.includes(i) ? " is-open" : ""}" data-app="${i}" ${before ? "" : "disabled"}>
              <span class="sso__ico">${ico}</span>${name}
              <small>${state.open.includes(i) ? "✓ Dentro" : state.offboarded ? "⛔ Sin acceso" : "🔒"}</small>
            </button>`
          ).join("")}
        </div>
        <div class="sso__foot">
          ${
            before
              ? `<span class="sso__count">🔑 Contraseñas escritas: <strong>${state.open.length}</strong> de ${APPS.length}</span>`
              : state.offboarded
              ? `<button type="button" class="shop__back" data-reset>↺ Volver a empezar</button>`
              : state.open.length === APPS.length
              ? `<button type="button" class="shop__back" data-offboard>👋 Dar de baja a Ana</button>`
              : `<button type="button" class="inv__go" data-login ${state.busy ? "disabled" : ""}>🔐 Entrar con mi cuenta de la empresa</button>`
          }
        </div>
      </div>
      <p class="demo-hint">${before ? "Luego cambia a \"Con inicio único\" y compara." : "Un clic para entrar a todo, y un clic para quitar el acceso."}</p>`;
  }

  host.addEventListener("click", async (e) => {
    const b = e.target.closest("button");
    if (!b || state.busy) return;
    const d = b.dataset;
    if (d.mode) Object.assign(state, { mode: d.mode, open: [], offboarded: false });
    else if (d.app !== undefined) {
      const i = Number(d.app);
      if (state.open.includes(i)) return;
      b.querySelector("small").textContent = "Escribiendo contraseña…";
      state.busy = true;
      await wait(900);
      state.busy = false;
      state.open.push(i);
    } else if ("login" in d) {
      state.busy = true;
      for (let i = 0; i < APPS.length; i++) {
        state.open.push(i);
        render();
        await wait(160);
      }
      state.busy = false;
    } else if ("offboard" in d) Object.assign(state, { open: [], offboarded: true });
    else if ("reset" in d) Object.assign(state, { open: [], offboarded: false });
    else return;
    render();
  });

  render();
}
