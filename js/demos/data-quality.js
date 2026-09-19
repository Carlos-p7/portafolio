// ============================================================
// 9. Revisión de calidad de tu información — de tabla sucia a limpia
// ============================================================
// Reutiliza validatePhone() de js/validation.js: la misma regla que protege
// el formulario de contacto sirve para limpiar una base de clientes.

function demoDataQuality(host) {
  const RAW = [
    { name: "juan PÉREZ", phone: "722 406 6705", email: "juan@correo.com", city: "Toluca" },
    { name: "Ana López", phone: "(55) 1234-5678", email: "ana.lopez@gmail", city: "cdmx" },
    { name: "Juan Pérez", phone: "7224066705", email: "juan@correo.com", city: "Toluca" },
    { name: "  luis   martínez ", phone: "+52 81 2233 4455", email: "luis@empresa.mx", city: "" },
    { name: "Sofía Reyes", phone: "33-1234", email: "sofia@correo.com", city: "Guadalajara" },
    { name: "Carlos Gómez", phone: "442 111 2233", email: "carlos.gomez@correo.com", city: "Querétaro" },
  ];
  const FIELDS = [
    ["name", "Nombre"],
    ["phone", "Celular"],
    ["email", "Correo"],
    ["city", "Ciudad"],
  ];
  const CITY_ALIASES = { cdmx: "Ciudad de México", df: "Ciudad de México", gdl: "Guadalajara" };
  const MAIL_DOMAINS = ["gmail", "hotmail", "outlook", "yahoo"];

  const titleCase = (s) =>
    s
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase()
      .replace(/(^|\s)(\p{L})/gu, (_, sp, ch) => sp + ch.toUpperCase());
  const prettyPhone = (d) => d.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
  const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

  // Revisa una celda: { status: "ok" | "fix" | "ask", value, why }
  //   fix = el sistema lo corrige solo · ask = hay que pedírselo al cliente
  function check(field, raw) {
    if (field === "name") {
      const v = titleCase(raw);
      return v === raw ? { status: "ok", value: raw } : { status: "fix", value: v, why: "Mayúsculas/espacios" };
    }
    if (field === "phone") {
      const r = validatePhone(raw);
      if (!r.valid) return { status: "ask", value: raw, why: "Número incompleto" };
      const v = prettyPhone(r.value);
      return v === raw ? { status: "ok", value: raw } : { status: "fix", value: v, why: "Formato distinto" };
    }
    if (field === "email") {
      if (isEmail(raw)) return { status: "ok", value: raw };
      const domain = raw.split("@")[1];
      if (MAIL_DOMAINS.includes(domain)) return { status: "fix", value: raw + ".com", why: "Le faltaba .com" };
      return { status: "ask", value: raw, why: "Correo inválido" };
    }
    // city
    if (!raw.trim()) return { status: "ask", value: "", why: "Falta el dato" };
    const alias = CITY_ALIASES[raw.trim().toLowerCase()];
    const v = alias || titleCase(raw);
    return v === raw ? { status: "ok", value: raw } : { status: "fix", value: v, why: "Nombre no estándar" };
  }

  // Resultado de revisar todo: celdas + qué filas son duplicadas (mismo celular)
  function audit() {
    const seen = new Set();
    return RAW.map((row) => {
      const cells = Object.fromEntries(FIELDS.map(([f]) => [f, check(f, row[f])]));
      const key = validatePhone(row.phone).valid ? validatePhone(row.phone).value : null;
      const dup = key !== null && seen.has(key);
      if (key) seen.add(key);
      return { row, cells, dup };
    });
  }

  let stage = "raw"; // raw → checked → fixed

  function score(result) {
    const total = result.length * FIELDS.length;
    let good = 0;
    result.forEach(({ cells, dup }) =>
      FIELDS.forEach(([f]) => {
        const s = cells[f].status;
        if (stage === "fixed") good += dup || s !== "ask" ? 1 : 0;
        else good += !dup && s === "ok" ? 1 : 0;
      })
    );
    return Math.round((good / total) * 100);
  }

  function cellHTML(f, row, c, dup) {
    if (stage === "raw") return `<td>${row[f] || "&nbsp;"}</td>`;
    if (stage === "checked") {
      if (dup) return `<td class="dq-dup">${row[f]}</td>`;
      if (c.status === "ok") return `<td>${row[f]}</td>`;
      return `<td class="dq-bad">${row[f] || "—"}<small>${c.why}</small></td>`;
    }
    if (dup) return `<td class="dq-dup">${row[f]}</td>`;
    if (c.status === "fix") return `<td class="dq-fixed">${c.value}<small>✓ ${c.why}</small></td>`;
    if (c.status === "ask") return `<td class="dq-ask">${c.value || "—"}<small>Pedir al cliente</small></td>`;
    return `<td>${c.value}</td>`;
  }

  function render() {
    const result = audit();
    const counts = { fix: 0, ask: 0, dup: result.filter((r) => r.dup).length };
    result.forEach(({ cells, dup }) => !dup && FIELDS.forEach(([f]) => cells[f].status !== "ok" && counts[cells[f].status]++));
    const pct = score(result);

    host.innerHTML = `
      <div class="dq">
        <div class="dq__score">
          <span>Calidad de tu información</span>
          <strong>${pct}%</strong>
          <span class="dq__meter"><span style="width:${pct}%"></span></span>
        </div>
        ${
          stage === "raw"
            ? ""
            : `<div class="dq__summary">
                <span class="dq-tag dq-tag--dup">👯 ${counts.dup} duplicado${counts.dup === 1 ? "" : "s"}</span>
                <span class="dq-tag dq-tag--fix">${stage === "fixed" ? "✓" : "🔧"} ${counts.fix} ${stage === "fixed" ? "corregidos" : "por corregir"}</span>
                <span class="dq-tag dq-tag--ask">✋ ${counts.ask} a pedir al cliente</span>
              </div>`
        }
        <div class="dq__table-wrap">
          <table class="dq__table">
            <thead><tr>${FIELDS.map(([, label]) => `<th>${label}</th>`).join("")}</tr></thead>
            <tbody>
              ${result
                .map(
                  ({ row, cells, dup }) =>
                    `<tr class="${dup && stage !== "raw" ? (stage === "fixed" ? "is-merged" : "is-dup") : ""}">${FIELDS.map(([f]) =>
                      cellHTML(f, row, cells[f], dup)
                    ).join("")}</tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>
        <div class="dq__actions">
          ${
            stage === "raw"
              ? `<button type="button" class="inv__go" data-step="checked">🔍 Revisar mi información</button>`
              : stage === "checked"
              ? `<button type="button" class="inv__go" data-step="fixed">✨ Corregir automáticamente</button>`
              : `<button type="button" class="shop__back" data-step="raw">↺ Volver a la tabla original</button>`
          }
        </div>
      </div>
      <p class="demo-hint">${
        ["Así llega una base de clientes real. Toca revisar.", "Cada problema está marcado. Ahora corrígelos.", "Lo que se puede corregir, se corrigió; lo demás queda señalado."][
          ["raw", "checked", "fixed"].indexOf(stage)
        ]
      }</p>`;
  }

  host.addEventListener("click", (e) => {
    const b = e.target.closest("[data-step]");
    if (!b) return;
    stage = b.dataset.step;
    render();
  });

  render();
}
