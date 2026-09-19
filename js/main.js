document.getElementById("year").textContent = new Date().getFullYear();

// ---- Menú móvil ----
const navbar = document.getElementById("navbar");
const navToggle = document.getElementById("navToggle");
navToggle.addEventListener("click", () => {
  const isOpen = navbar.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});
document.getElementById("navLinks").addEventListener("click", (e) => {
  if (e.target.tagName === "A") navbar.classList.remove("is-open");
});

// ---- Modo día / noche ----
// El tema inicial lo pone el <script> del <head> (preferencia guardada o la
// del sistema); aquí solo se alterna y se recuerda.
const themeToggle = document.getElementById("themeToggle");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const next = theme === "dark" ? "claro" : "oscuro";
  themeToggle.setAttribute("aria-label", `Cambiar a modo ${next}`);
  themeColorMeta.setAttribute("content", theme === "dark" ? "#0a0a0a" : "#faf8f5");
}

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  try {
    localStorage.setItem("theme", next);
  } catch {
    // storage bloqueado: el tema dura solo esta visita
  }
});
applyTheme(document.documentElement.getAttribute("data-theme"));

// ---- Formulario de contacto ----
// Entrega real vía Web3Forms (sin backend propio): https://web3forms.com
// 1. Entra con tu email y genera tu Access Key gratis (no requiere contraseña).
// 2. Pega esa key abajo, reemplazando "TU_ACCESS_KEY_AQUI".
const WEB3FORMS_ACCESS_KEY = "19d29d90-b69a-4c5e-9bf6-0d98d89c18b9";

const form = document.getElementById("contactForm");
const successEl = document.getElementById("formSuccess");
const submitBtn = form.querySelector('button[type="submit"]');
const SUBMIT_LABEL = submitBtn.textContent;
const formServicesEl = document.getElementById("formServices");
const formServicesEmptyEl = document.getElementById("formServicesEmpty");

// Refleja la caja de cotización dentro del formulario (con opción de quitar)
function renderFormServices(ids) {
  formServicesEmptyEl.hidden = ids.length > 0;
  formServicesEl.innerHTML = ids
    .map((id) => {
      const s = findService(id);
      return `<li class="form-services__item" data-area="${s.areaId}"><span class="form-services__ico">${ICONS[s.icon]}</span>${s.title}<button type="button" data-remove="${id}" aria-label="Quitar ${s.title}">×</button></li>`;
    })
    .join("");
}
formServicesEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-remove]");
  if (btn) Quote.remove(btn.dataset.remove);
});
Quote.onChange(renderFormServices);
renderFormServices(Quote.list());

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    name: form.elements.name.value,
    email: form.elements.email.value,
    phone: form.elements.phone.value,
    message: form.elements.message.value,
    services: Quote.list(),
  };

  form.querySelectorAll(".form-error").forEach((el) => (el.textContent = ""));
  successEl.hidden = true;
  successEl.classList.remove("is-error");

  const result = validateQuoteForm(data);

  if (!result.valid) {
    Object.entries(result.errors).forEach(([field, message]) => {
      const errorEl = form.querySelector(`[data-error-for="${field}"]`);
      if (errorEl) errorEl.textContent = message;
    });
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `Solicitud de cotización de ${data.name} — portafolio`,
        name: data.name,
        email: data.email,
        Celular: validatePhone(data.phone).value,
        "Servicios solicitados": data.services.length
          ? data.services.map((id) => "• " + findService(id).title).join("\n")
          : "Ninguno del catálogo (ver mensaje)",
        message: data.message.trim() || "(sin mensaje adicional)",
      }),
    });
    const result2 = await response.json();

    if (result2.success) {
      successEl.textContent = "¡Gracias! Tu mensaje fue enviado.";
      successEl.hidden = false;
      form.reset();
      Quote.clear();
    } else {
      throw new Error(result2.message || "Error desconocido");
    }
  } catch (err) {
    console.error("Error al enviar el formulario:", err);
    successEl.textContent = "No se pudo enviar el mensaje. Intenta de nuevo o escríbeme directo por correo.";
    successEl.classList.add("is-error");
    successEl.hidden = false;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = SUBMIT_LABEL;
  }
});
