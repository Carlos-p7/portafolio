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
