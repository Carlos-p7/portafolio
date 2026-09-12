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

// ---- Catálogo de servicios ----
const grid = document.getElementById("servicesGrid");
const filtersEl = document.getElementById("filters");
const categories = ["Todos", ...new Set(SERVICES.map((s) => s.category))];
let activeCategory = "Todos";

function renderFilters() {
  filtersEl.innerHTML = categories
    .map(
      (cat) =>
        `<button class="filter-btn${cat === activeCategory ? " is-active" : ""}" data-category="${cat}">${cat}</button>`
    )
    .join("");
}

function renderServices() {
  const items =
    activeCategory === "Todos"
      ? SERVICES
      : SERVICES.filter((s) => s.category === activeCategory);

  grid.innerHTML = items
    .map(
      (s) => `
      <article class="service-card">
        <div class="service-card__icon">${s.icon}</div>
        <h3>${s.title}</h3>
        <p>${s.description}</p>
      </article>`
    )
    .join("");
}

filtersEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  activeCategory = btn.dataset.category;
  renderFilters();
  renderServices();
});

renderFilters();
renderServices();

// ---- Formulario de contacto ----
// Entrega real vía Web3Forms (sin backend propio): https://web3forms.com
// 1. Entra con tu email y genera tu Access Key gratis (no requiere contraseña).
// 2. Pega esa key abajo, reemplazando "TU_ACCESS_KEY_AQUI".
const WEB3FORMS_ACCESS_KEY = "19d29d90-b69a-4c5e-9bf6-0d98d89c18b9";

const form = document.getElementById("contactForm");
const successEl = document.getElementById("formSuccess");
const submitBtn = form.querySelector('button[type="submit"]');

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    name: form.elements.name.value,
    email: form.elements.email.value,
    message: form.elements.message.value,
  };

  form.querySelectorAll(".form-error").forEach((el) => (el.textContent = ""));
  successEl.hidden = true;
  successEl.classList.remove("is-error");

  const result = validateContactForm(data);

  if (!result || !result.valid) {
    if (!result) {
      console.warn("validateContactForm todavía no está implementada (js/validation.js).");
      return;
    }
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
        subject: `Nuevo mensaje de ${data.name} — portafolio`,
        ...data,
      }),
    });
    const result2 = await response.json();

    if (result2.success) {
      successEl.textContent = "¡Gracias! Tu mensaje fue enviado.";
      successEl.hidden = false;
      form.reset();
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
    submitBtn.textContent = "Enviar mensaje";
  }
});
