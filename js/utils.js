// Utilidades genéricas, ya resueltas — sirven de referencia para validation.js

/**
 * Verifica que un valor sea un string no vacío (ignorando espacios) con al
 * menos `minLength` caracteres útiles.
 * @param {unknown} value
 * @param {number} [minLength=1]
 * @returns {boolean}
 */
function isNonEmptyString(value, minLength = 1) {
  return typeof value === "string" && value.trim().length >= minLength;
}
