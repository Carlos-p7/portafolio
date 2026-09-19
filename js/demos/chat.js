// ============================================================
// Motor de chat simulado (lo usan el asistente web y WhatsApp)
// ============================================================
// Cada demo solo describe su "guion" (config); el motor se encarga de
// burbujas, "escribiendo…", botones de respuesta y texto libre.
//
// config = {
//   skin:     "web" | "wa"                       apariencia
//   name, status, avatar                          encabezado
//   greeting: [línea, ...]                        lo primero que dice el bot
//   menu:     [opción, ...]                       botones iniciales
//   flow:     { opción: paso }                    qué pasa al tocar cada botón
//             paso = { say: [línea | {note}], next: [opciones] }
//                  | { handoff: true } | { restart: true }
//   intents:  [[regex, opción], ...]              texto libre → opción
//   fallback: [línea, ...]                        si no entiende: dice esto y pasa a humano
//   human:    { name, hello }                     la persona que toma la conversación
//   placeholder, hint
// }

function createChat(host, cfg) {
  host.innerHTML = `
    <div class="chat chat--${cfg.skin}">
      <div class="chat__head">
        <span class="chat__avatar">${cfg.avatar}</span>
        <div>
          <strong>${cfg.name}</strong>
          <span class="chat__status">${cfg.status}</span>
        </div>
      </div>
      <div class="chat__log" aria-live="polite"></div>
      <div class="chat__quick"></div>
      <form class="chat__input">
        <input type="text" maxlength="120" placeholder="${cfg.placeholder}" aria-label="${cfg.placeholder}" />
        <button type="submit" aria-label="Enviar">➤</button>
      </form>
    </div>
    <p class="demo-hint">${cfg.hint}</p>`;

  const log = host.querySelector(".chat__log");
  const quick = host.querySelector(".chat__quick");
  const form = host.querySelector(".chat__input");
  const input = form.querySelector("input");
  let busy = false;

  function bubble(text, who) {
    const el = document.createElement("div");
    el.className = `chat__msg chat__msg--${who}`;
    el.textContent = text; // textContent: lo que escribe el usuario nunca se interpreta como HTML
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  function note(text) {
    const el = document.createElement("div");
    el.className = "chat__note";
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  }

  function setQuick(options) {
    quick.innerHTML = options
      .map((o) => `<button type="button" class="chat__chip">${o}</button>`)
      .join("");
  }

  async function typeAs(who, line) {
    const typing = bubble("", who);
    typing.classList.add("is-typing");
    typing.innerHTML = "<span></span><span></span><span></span>";
    await wait(650 + line.length * 8);
    typing.remove();
    bubble(line, who);
  }

  // Una línea puede ser texto o { note } (aviso de sistema, ej. "un día después")
  async function botSays(lines) {
    for (const line of lines) {
      if (typeof line === "string") await typeAs("bot", line);
      else {
        await wait(400);
        note(line.note);
      }
    }
  }

  function intentOf(text) {
    const t = text.toLowerCase();
    const hit = cfg.intents.find(([re]) => re.test(t));
    return hit ? hit[1] : null;
  }

  async function handoff() {
    note("Aquí la conversación pasa a una persona de tu equipo");
    await wait(500);
    await typeAs("human", cfg.human.hello);
    setQuick(["Volver a empezar"]);
  }

  async function handle(option, typedText) {
    if (busy) return;
    busy = true;
    quick.innerHTML = "";
    bubble(typedText || option, "user");

    const step = option === "Volver a empezar" ? { restart: true } : cfg.flow[option];
    if (!step) {
      await botSays(cfg.fallback);
      await handoff();
    } else if (step.restart) {
      log.innerHTML = "";
      await start();
    } else if (step.handoff) {
      await botSays(step.say || []);
      await handoff();
    } else {
      await botSays(step.say);
      setQuick(step.next);
    }
    busy = false;
  }

  async function start() {
    await botSays(cfg.greeting);
    setQuick(cfg.menu);
  }

  quick.addEventListener("click", (e) => {
    const chip = e.target.closest(".chat__chip");
    if (chip) handle(chip.textContent);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || busy) return;
    input.value = "";
    handle(intentOf(text), text);
  });

  busy = true;
  start().then(() => (busy = false));
}

// ============================================================
// 1. Asistente virtual en la página web
// ============================================================
function demoChatbot(host) {
  const MENU = ["Horarios", "Precios", "Apartar un pedido", "Hablar con una persona"];
  const booked = (day) => ({
    say: [`Listo ✅ Tu pedido quedó apartado para ${day}.`, "Te mandé la confirmación por WhatsApp. ¿Algo más?"],
    next: MENU,
  });

  createChat(host, {
    skin: "web",
    name: "Asistente de Café Aurora",
    status: "En línea",
    avatar: ICONS.bot,
    greeting: ["¡Hola! 👋 Soy el asistente de Café Aurora. ¿En qué te ayudo?"],
    menu: MENU,
    flow: {
      Horarios: { say: ["Abrimos de lunes a sábado de 8:00 a 20:00, y domingos de 9:00 a 14:00 ☕"], next: MENU },
      Precios: {
        say: ["Café americano $45, capuchino $55 y pan dulce desde $25.", "¿Quieres que te aparte algo?"],
        next: ["Apartar un pedido", "Otra pregunta"],
      },
      "Apartar un pedido": { say: ["¡Claro! ¿Para qué día lo quieres?"], next: ["Hoy", "Mañana", "Sábado"] },
      Hoy: booked("hoy"),
      Mañana: booked("mañana"),
      Sábado: booked("el sábado"),
      "Otra pregunta": { say: ["Va, ¿qué más quieres saber?"], next: MENU },
      "Hablar con una persona": { handoff: true, say: ["¡Claro! Te comunico con alguien del equipo."] },
    },
    intents: [
      [/hora|abre|abren|cierra|horario/, "Horarios"],
      [/precio|cuesta|cu[aá]nto|costo/, "Precios"],
      [/apart|pedido|reserv|encarg/, "Apartar un pedido"],
      [/persona|humano|alguien|asesor|ayuda/, "Hablar con una persona"],
    ],
    fallback: ["Mmm, esa todavía no me la sé 🤔 Te paso con alguien del equipo."],
    human: { hello: "Hola, soy Ana 👋 ¿En qué te puedo ayudar?" },
    placeholder: "Escribe una pregunta...",
    hint: 'Toca una opción o escribe algo como "¿cuánto cuesta un café?"',
  });
}

// ============================================================
// 5. Atención automática por WhatsApp
// ============================================================
function demoWhatsApp(host) {
  const MENU = ["📅 Agendar cita", "🔎 Mi próxima cita", "📍 Ubicación", "👩 Hablar con recepción"];
  const booked = (slot) => ({
    say: [
      `✅ Listo, tu cita quedó el ${slot}.`,
      "Te voy a mandar un recordatorio por aquí un día antes.",
      { note: "— Un día antes de la cita —" },
      `⏰ Recordatorio: mañana ${slot.split(" ").slice(1).join(" ")} tienes cita en Clínica Sonrisa. ¿Confirmas?`,
    ],
    next: ["✅ Confirmo", "🔁 Cambiar horario"],
  });

  createChat(host, {
    skin: "wa",
    name: "Clínica Dental Sonrisa",
    status: "Cuenta de empresa",
    avatar: "🦷",
    greeting: ["¡Hola! 👋 Gracias por escribir a Clínica Sonrisa.", "Elige una opción:"],
    menu: MENU,
    flow: {
      "📅 Agendar cita": {
        say: ["Estos son los próximos horarios libres:"],
        next: ["lunes a las 10:00", "martes a las 16:30", "jueves a las 12:00"],
      },
      "lunes a las 10:00": booked("lunes a las 10:00"),
      "martes a las 16:30": booked("martes a las 16:30"),
      "jueves a las 12:00": booked("jueves a las 12:00"),
      "✅ Confirmo": { say: ["¡Perfecto! Te esperamos 😊", "Recuerda llegar 10 minutos antes."], next: MENU },
      "🔁 Cambiar horario": {
        say: ["Sin problema. Elige otro horario:"],
        next: ["lunes a las 10:00", "martes a las 16:30", "jueves a las 12:00"],
      },
      "🔎 Mi próxima cita": {
        say: ["Tu próxima cita es el viernes 26 a las 11:00 con la Dra. López 🦷"],
        next: ["✅ Confirmo", "🔁 Cambiar horario"],
      },
      "📍 Ubicación": {
        say: ["Estamos en Av. Juárez 120, Col. Centro.", "Hay estacionamiento gratis enfrente 🚗"],
        next: MENU,
      },
      "👩 Hablar con recepción": { handoff: true, say: ["Te comunico con recepción."] },
    },
    intents: [
      [/cita|agendar|agenda|turno/, "📅 Agendar cita"],
      [/d[oó]nde|ubicaci|direcci|llegar/, "📍 Ubicación"],
      [/cu[aá]ndo|pr[oó]xima|mi cita/, "🔎 Mi próxima cita"],
      [/persona|recepci|humano|alguien/, "👩 Hablar con recepción"],
    ],
    fallback: ["No entendí bien 🙈 Te paso con recepción para ayudarte."],
    human: { hello: "Hola, soy Laura de recepción. ¿En qué te ayudo?" },
    placeholder: "Mensaje",
    hint: 'Agenda una cita y mira el recordatorio automático. También puedes escribir "¿dónde están?"',
  });
}
