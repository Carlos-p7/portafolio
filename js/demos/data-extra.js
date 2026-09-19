// ============================================================
// 22. Respuestas a tus preguntas de negocio con datos
// ============================================================
// Reutiliza los datos de la cafetería (SALES_ROWS) y summarizeSales().

function demoAnswers(host) {
  const pctFmt = (x) => `${x > 0 ? "+" : ""}${Math.round(x)}%`;

  const QUESTIONS = {
    branch: {
      q: "🏪 ¿Qué sucursal vende más?",
      answer() {
        const rows = SALES_BRANCHES.map((b) => ({ label: b, value: summarizeSales(SALES_ROWS, { month: "all", branch: b }).total }))
          .sort((a, b) => b.value - a.value);
        const [top, , last] = rows;
        return {
          rows: rows.map((r) => ({ ...r, text: money.format(r.value) })),
          conclusion: `${top.label} vende ${Math.round((top.value / last.value - 1) * 100)}% más que ${last.label}.`,
          todo: `Antes de abrir otra sucursal, revisa qué hace distinto ${top.label} (horario, ubicación, personal) y cópialo en ${last.label}.`,
        };
      },
    },
    growth: {
      q: "📈 ¿Qué producto está creciendo?",
      answer() {
        const jan = summarizeSales(SALES_ROWS, { month: "Ene", branch: "all" }).byProduct;
        const jun = summarizeSales(SALES_ROWS, { month: "Jun", branch: "all" }).byProduct;
        const rows = jun
          .map((p) => {
            const before = jan.find((x) => x.product === p.product);
            const g = before ? (p.total / before.total - 1) * 100 : 0;
            return { label: p.product, value: g };
          })
          .sort((a, b) => b.value - a.value);
        return {
          rows: rows.map((r) => ({ ...r, text: pctFmt(r.value), neg: r.value < 0 })),
          conclusion: `De enero a junio, ${rows[0].label} creció ${pctFmt(rows[0].value)} y ${rows[rows.length - 1].label} cambió ${pctFmt(rows[rows.length - 1].value)}.`,
          todo: `Dale más espacio en el menú y en redes a ${rows[0].label} durante el calor; planea promociones de ${rows[rows.length - 1].label} para el invierno.`,
        };
      },
    },
    hours: {
      q: "⏰ ¿Qué día conviene abrir más tarde?",
      answer() {
        const early = [
          ["Lun", 42], ["Mar", 38], ["Mié", 35], ["Jue", 37], ["Vie", 40], ["Sáb", 9], ["Dom", 6],
        ];
        return {
          rows: early.map(([d, v]) => ({ label: d, value: v, text: `${v} clientes` })),
          conclusion: "Sábado y domingo, entre 7 y 8 am, casi no llega nadie (menos de 10 clientes).",
          todo: "Abre a las 8 el fin de semana: ahorras 8 horas de turno al mes sin perder ventas.",
        };
      },
      note: "Clientes que llegan entre 7 y 8 am, promedio del semestre",
    },
  };

  let current = null;

  function render() {
    const ans = current && QUESTIONS[current].answer();
    const max = ans ? Math.max(...ans.rows.map((r) => Math.abs(r.value))) || 1 : 1;
    host.innerHTML = `
      <div class="ask">
        <p class="inv__label">¿Qué quieres saber de tu negocio?</p>
        <div class="ask__qs">
          ${Object.entries(QUESTIONS)
            .map(([id, x]) => `<button type="button" class="site__kind${id === current ? " is-on" : ""}" data-q="${id}">${x.q}</button>`)
            .join("")}
        </div>
        ${
          ans
            ? `<div class="ask__answer">
                ${QUESTIONS[current].note ? `<p class="portal__muted">${QUESTIONS[current].note}</p>` : ""}
                <div class="hbars">${ans.rows
                  .map(
                    (r) => `<div class="hbars__row">
                      <span class="hbars__name">${r.label}</span>
                      <span class="hbars__track"><span class="hbars__bar${r.neg ? " is-neg" : ""}" style="width:${(Math.abs(r.value) / max) * 100}%"></span></span>
                      <span class="hbars__value">${r.text}</span></div>`
                  )
                  .join("")}</div>
                <p class="ask__line"><strong>Respuesta:</strong> ${ans.conclusion}</p>
                <p class="dash__insight">💡 <strong>Qué hacer:</strong> ${ans.todo}</p>
              </div>`
            : `<p class="portal__muted ask__empty">Elige una pregunta: la respuesta llega con gráfica, conclusión y recomendación.</p>`
        }
      </div>
      <p class="demo-hint">Así se entregan los análisis: una pregunta, una respuesta clara y qué hacer con ella.</p>`;
  }

  host.addEventListener("click", (e) => {
    const b = e.target.closest("[data-q]");
    if (!b) return;
    current = b.dataset.q;
    render();
  });

  render();
}

// ============================================================
// 23. Actualización automática de tus datos
// ============================================================

function demoAutoData(host) {
  const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const SOURCES = ["🧾 Caja", "🛒 Tienda en línea", "📗 Excel de gastos"];
  const STEPS = ["Traer datos de las 3 fuentes", "Limpiar y unir", "Actualizar tu tablero"];
  const state = { day: 0, runs: [], busy: false, sales: 38200 };

  function render(stepIdx = -1) {
    const fresh = state.runs.includes(state.day);
    host.innerHTML = `
      <div class="auto-data">
        <div class="auto-data__top">
          <div class="auto-data__clock"><small>Hoy es</small><strong>${DAYS[state.day]} · ${fresh ? "6:02" : "5:58"} am</strong></div>
          <span class="auto-data__fresh ${fresh ? "is-ok" : "is-old"}">${fresh ? "🟢 Datos de hoy" : state.runs.length ? "🟡 Datos de ayer" : "🔴 Datos de hace 7 días"}</span>
        </div>
        <div class="auto-data__flow">
          <div class="auto-data__sources">${SOURCES.map((s) => `<span class="${stepIdx === 0 ? "is-hot" : ""}">${s}</span>`).join("")}</div>
          <ol class="auto__tasks">
            ${STEPS.map((s, i) => `<li class="${stepIdx > i || (fresh && stepIdx < 0) ? "is-done" : stepIdx === i ? "is-doing" : ""}"><span class="auto__ico">${["📥", "🧹", "📊"][i]}</span><span class="auto__text">${s}</span><span class="auto__time"></span></li>`).join("")}
          </ol>
        </div>
        <div class="auto-data__card">
          <span>Ventas de ayer</span><strong>${fresh ? money.format(state.sales) : "—"}</strong>
          <small>${fresh ? "Actualizado solo a las 6:02, antes de que llegues" : "Esperando la actualización de las 6:00"}</small>
        </div>
        <div class="auto-data__week">${DAYS.map((d, i) => `<span class="${state.runs.includes(i) ? "is-ok" : i === state.day ? "is-today" : ""}">${d}<b>${state.runs.includes(i) ? "✓" : "·"}</b></span>`).join("")}</div>
        <div class="dq__actions">
          <button type="button" class="inv__go" data-tick ${state.busy ? "disabled" : ""}>${fresh ? "⏩ Pasar al día siguiente" : "⏩ Adelantar el reloj a las 6:00"}</button>
        </div>
      </div>
      <p class="demo-hint">Adelanta el reloj: cada mañana los datos se actualizan solos, sin que nadie abra un Excel.</p>`;
  }

  host.addEventListener("click", async (e) => {
    if (!e.target.closest("[data-tick]") || state.busy) return;
    if (state.runs.includes(state.day)) {
      state.day = (state.day + 1) % DAYS.length;
      if (state.day === 0) state.runs = [];
      render();
      return;
    }
    state.busy = true;
    for (let i = 0; i < STEPS.length; i++) {
      render(i);
      await wait(700);
    }
    state.sales = 32000 + Math.round(Math.random() * 12000);
    state.runs.push(state.day);
    state.busy = false;
    render();
  });

  render();
}

// ============================================================
// 24. Centralizar toda tu información en un solo lugar
// ============================================================

function demoCentral(host) {
  const SOURCES = [
    { ico: "🧾", name: "Sistema de caja", lines: ["María F. Ruiz", "23 visitas", "$4,120 en sucursal"] },
    { ico: "🛒", name: "Tienda en línea", lines: ["mafer.ruiz@correo.mx", "5 pedidos", "$2,380 en línea"] },
    { ico: "💬", name: "WhatsApp", lines: ["722 555 0187", "1 queja (resuelta)", "Prefiere entregas en la tarde"] },
    { ico: "📗", name: "Excel de eventos", lines: ["Maria Fernanda R.", "Evento de oficina", "$8,500"] },
  ];
  let merged = false;

  function render() {
    host.innerHTML = `
      <div class="central">
        ${
          merged
            ? `<div class="central__profile">
                <div class="central__head"><span class="central__avatar">MF</span><div><strong>María Fernanda Ruiz</strong><small>mafer.ruiz@correo.mx · 722 555 0187</small></div></div>
                <div class="central__kpis">
                  <div><small>Total que te ha comprado</small><strong>${money.format(15000)}</strong></div>
                  <div><small>Canales</small><strong>4</strong></div>
                  <div><small>Cliente</small><strong>⭐ Top 5%</strong></div>
                </div>
                <ul class="central__timeline">
                  <li>🎉 Contrató servicio para evento de oficina · $8,500</li>
                  <li>🧾 Viene ~4 veces al mes a sucursal · $4,120</li>
                  <li>🛒 5 pedidos en línea · $2,380</li>
                  <li>💬 Tuvo 1 queja, resuelta · prefiere entregas en la tarde</li>
                </ul>
                <p class="dash__insight">💡 Por separado parecía una clienta más. Junta, es de tus mejores: ofrécele el servicio de eventos otra vez.</p>
              </div>`
            : `<p class="auto__story">Hoy, los datos de <strong>la misma clienta</strong> están regados en 4 lugares y ni siquiera se llaman igual:</p>
               <div class="central__sources">${SOURCES.map(
                 (s) => `<div class="central__src"><strong>${s.ico} ${s.name}</strong>${s.lines.map((l) => `<span>${l}</span>`).join("")}</div>`
               ).join("")}</div>
               <p class="portal__muted">❓ ¿Cuánto te ha comprado en total? Nadie lo sabe sin juntar 4 archivos a mano.</p>`
        }
        <div class="dq__actions">
          <button type="button" class="${merged ? "shop__back" : "inv__go"}" data-merge>${merged ? "↺ Ver los datos regados" : "🧲 Centralizar"}</button>
        </div>
      </div>
      <p class="demo-hint">${merged ? "Una sola ficha por cliente, con todo lo que sabes de él." : "Toca centralizar y mira qué pasa con la información."}</p>`;
  }

  host.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-merge]");
    if (!b) return;
    if (!merged) {
      host.querySelectorAll(".central__src").forEach((el) => el.classList.add("is-merging"));
      b.disabled = true;
      await wait(650);
    }
    merged = !merged;
    render();
  });

  render();
}
