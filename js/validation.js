// ============================================================
// HAND-OFF PARA CARLOS — validación del formulario de contacto
// ============================================================
//
// Contrato:
//   Entra:  data = { name: string, email: string, message: string }
//           (los tres campos vienen tal cual del <input>/<textarea>,
//            pueden venir vacíos, con solo espacios, o con formato inválido)
//
//   Sale:   { valid: boolean, errors: Record<string, string> }
//           - valid = true  y errors = {}                si todos los campos pasan
//           - valid = false y errors = { campo: "mensaje" } por cada campo inválido
//             (un campo válido NO debe aparecer en errors)
//
//   Reglas del contrato:
//     - name:    requerido, mínimo 2 caracteres (sin contar espacios extremos)
//     - email:   requerido, debe tener forma de correo válido (algo@algo.algo)
//     - message: requerido, entre 10 y 500 caracteres (sin contar espacios extremos)
//
// Ejemplo análogo ya resuelto en el repo: js/utils.js → isNonEmptyString().
// Esa función ya resuelve "¿es un string usable con cierto largo mínimo?".
// Tu trabajo es reutilizarla para name/message y sumar la regla de email,
// devolviendo el objeto de errores en el formato del contrato.
//
// Casos que debe pasar (pégalos en la consola del navegador para probar):
//
//   validateContactForm({ name: "", email: "a@a.com", message: "Mensaje de prueba largo" })
//     → { valid: false, errors: { name: "..." } }
//
//   validateContactForm({ name: "Ana", email: "correo-invalido", message: "Hola" })
//     → { valid: false, errors: { email: "...", message: "..." } }
//
//   validateContactForm({ name: "   ", email: "ana@correo.com", message: "Mensaje válido de más de diez caracteres" })
//     → { valid: false, errors: { name: "..." } }   (name son solo espacios)
//
//   validateContactForm({ name: "Ana López", email: "ana@correo.com", message: "Quiero información sobre tus servicios" })
//     → { valid: true, errors: {} }
//
// Si te atoras con el regex de email, la pista es: no necesitas RFC 5322
// completo, con algo tipo /^[^\s@]+@[^\s@]+\.[^\s@]+$/ basta para este formulario.

/**
 * Valida los datos del formulario de contacto.
 * @param {{name: string, email: string, message: string}} data
 * @returns {{valid: boolean, errors: Record<string, string>}}
 */
function validateContactForm(data) {
  const errors = {};

  if (!isNonEmptyString(data.name, 2)) {
    errors.name = "El nombre debe tener al menos 2 caracteres.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Ingresa un correo válido.";
  }

  if (!isNonEmptyString(data.message, 10) || data.message.trim().length > 500) {
    errors.message = "El mensaje debe tener entre 10 y 500 caracteres.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}


// ============================================================
// Validación de la solicitud de cotización
// ============================================================
//
// El formulario ya no es solo "mensaje": ahora trae la lista de servicios
// que el visitante agregó a su caja de cotización. La decisión de negocio es
// QUÉ cuenta como una solicitud que vale la pena recibir.
//
// Contrato:
//   Entra:  data = {
//             name:     string,
//             email:    string,
//             message:  string,    // texto libre, puede venir vacío
//             services: string[],  // ids del catálogo, ya sin duplicados
//           }                      // (puede venir vacío: [])
//
//   Sale:   { valid: boolean, errors: Record<string, string> }
//           (mismo formato que validateContactForm)
//
//   Reglas del contrato:
//     - name y email: exactamente las mismas reglas que validateContactForm.
//     - Debe quedar claro QUÉ quiere cotizar. Hay dos caminos válidos:
//         a) eligió al menos un servicio  → message pasa a ser OPCIONAL
//         b) no eligió ninguno            → message es OBLIGATORIO, mínimo 10
//            caracteres útiles (es un proyecto fuera del catálogo)
//     - message nunca puede pasar de 500 caracteres (sin espacios extremos),
//       venga o no con servicios.
//     - Si falla la regla de "qué quiere cotizar" o el largo, el error va en
//       errors.message (es el campo donde el usuario puede corregirlo).
//
// Ejemplo análogo ya resuelto: validateContactForm() aquí arriba. Fíjate que
// ya resuelve name y email — ¿tienes que copiar esas reglas, o puedes
// aprovechar su resultado?
//
// Casos que debe pasar (pégalos en la consola del navegador):
//
//   validateQuoteForm({ name: "Ana", email: "ana@correo.com", message: "", services: ["tienda-en-linea"] })
//     → { valid: true, errors: {} }                       (servicio sin mensaje: OK)
//
//   validateQuoteForm({ name: "Ana", email: "ana@correo.com", message: "", services: [] })
//     → { valid: false, errors: { message: "..." } }      (no pidió nada)
//
//   validateQuoteForm({ name: "Ana", email: "ana@correo.com", message: "App de reservas para mi gimnasio", services: [] })
//     → { valid: true, errors: {} }                       (proyecto fuera del catálogo)
//
//   validateQuoteForm({ name: "Ana", email: "ana@correo.com", message: "   hola   ", services: [] })
//     → { valid: false, errors: { message: "..." } }      (4 caracteres útiles)
//
//   validateQuoteForm({ name: "Ana", email: "ana@correo.com", message: "x".repeat(501), services: ["whatsapp"] })
//     → { valid: false, errors: { message: "..." } }      (demasiado largo aunque traiga servicio)
//
//   validateQuoteForm({ name: "", email: "nop", message: "", services: [] })
//     → { valid: false, errors: { name: "...", email: "...", message: "..." } }
//

/**
 * Valida una solicitud de cotización (servicios del catálogo y/o texto libre).
 * @param {{name: string, email: string, phone: string, message: string, services: string[]}} data
 * @returns {{valid: boolean, errors: Record<string, string>}}
 */
function validateQuoteForm(data) {
  const errors = {};

  // name y email: se reutiliza la validación del formulario de contacto
  const base = validateContactForm(data);
  if (base.errors.name) errors.name = base.errors.name;
  if (base.errors.email) errors.email = base.errors.email;

  const phone = validatePhone(data.phone);
  if (!phone.valid) errors.phone = phone.error;

  const message = (data.message || "").trim();
  const hasServices = Array.isArray(data.services) && data.services.length > 0;

  if (message.length > 500) {
    errors.message = "El mensaje no puede pasar de 500 caracteres.";
  } else if (!hasServices && message.length < 10) {
    errors.message =
      "Agrega al menos un servicio del catálogo o describe tu proyecto (mínimo 10 caracteres).";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}


// ============================================================
// HAND-OFF PARA CARLOS — celular del formulario
// ============================================================
//
// La gente escribe su número como se le ocurre: "722 123 4567",
// "(722) 123-45-67", "+52 722 123 4567", "527221234567"... Tu trabajo es
// decidir cuáles aceptar y guardarlos TODOS en un mismo formato, para que al
// recibir la cotización puedas marcar o abrir WhatsApp sin pensarlo.
// (Es tu primera "limpieza de datos": normalizar una entrada sucia.)
//
// Contrato:
//   Entra:  value — string tal cual viene del <input> (puede venir vacío,
//           con espacios, guiones, puntos, paréntesis o prefijo +52 / 52)
//
//   Sale:   válido   → { valid: true,  value: "7221234567" }  (10 dígitos, sin nada más)
//           inválido → { valid: false, error: "mensaje para el usuario" }
//
//   Reglas:
//     - Es obligatorio: vacío o solo espacios → inválido.
//     - Separadores permitidos (se ignoran): espacio - . ( )
//     - Prefijo de país opcional: "+52" o "52" al inicio, solo si después
//       quedan exactamente 10 dígitos.
//     - Cualquier otro carácter (letras, otro "+" en medio...) → inválido.
//     - Al final debe quedar exactamente 10 dígitos (número de México).
//
// Ejemplo análogo ya resuelto: validateContactForm() arriba — usa un regex
// con .test() para decidir si el email tiene forma válida. Aquí además
// necesitas TRANSFORMAR el texto antes de revisarlo. Pista: String.replace()
// con un regex y la bandera /g quita todas las coincidencias, no solo la primera.
//
// Casos que debe pasar (pégalos en la consola del navegador):
//   validatePhone("722 406 6705")          → { valid: true, value: "7224066705" }
//   validatePhone("(722) 406-67-05")       → { valid: true, value: "7224066705" }
//   validatePhone("+52 722 406 6705")      → { valid: true, value: "7224066705" }
//   validatePhone("527224066705")          → { valid: true, value: "7224066705" }
//   validatePhone("  722.406.6705  ")      → { valid: true, value: "7224066705" }
//   validatePhone("")                      → { valid: false, error: "..." }
//   validatePhone("722 406 67")            → { valid: false, error: "..." }  (8 dígitos)
//   validatePhone("722-ABC-6705")          → { valid: false, error: "..." }
//   validatePhone("+1 722 406 6705")       → { valid: false, error: "..." }  (no es +52)
//   validatePhone("5272240667051")         → { valid: false, error: "..." }  (sobran dígitos)
//
/**
 * Valida y normaliza un celular de México a 10 dígitos.
 * @param {string} value
 * @returns {{valid: true, value: string} | {valid: false, error: string}}
 */
function validatePhone(value) {
  const raw = String(value || "").trim();

  if (raw === "") {
    return { valid: false, error: "Ingresa tu número de celular." };
  }

  // Solo se permiten dígitos, espacios, paréntesis, punto, guion y "+"
  if (/[^\d\s().+-]/.test(raw)) {
    return { valid: false, error: "Usa solo números (puedes separarlos con espacios o guiones)." };
  }

  // Quita los separadores: "(722) 406-67-05" → "7224066705"
  let digits = raw.replace(/[\s().-]/g, "");

  // Quita el prefijo de país si viene
  if (digits.startsWith("+52")) {
    digits = digits.slice(3);
  } else if (digits.startsWith("52") && digits.length === 12) {
    digits = digits.slice(2);
  }

  // Lo que queda deben ser exactamente 10 dígitos
  if (!/^\d{10}$/.test(digits)) {
    return { valid: false, error: "Ingresa un celular de México de 10 dígitos." };
  }

  return { valid: true, value: digits };
}
