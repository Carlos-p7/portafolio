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

/**
 * Lleva cualquier entero (incluso negativo) al rango [0, total).
 * Sirve para "dar la vuelta" en listas circulares: el siguiente del último es
 * el primero y el anterior del primero es el último.
 *   wrapIndex(5, 5)  → 0
 *   wrapIndex(-1, 5) → 4
 * Ojo: en JS `-1 % 5` es -1 (no 4), por eso se suma `total` antes del segundo %.
 * @param {number} i
 * @param {number} total  entero > 0
 * @returns {number}
 */
function wrapIndex(i, total) {
  return ((i % total) + total) % total;
}

// ============================================================
// HAND-OFF PARA CARLOS — posición de cada tarjeta en el carrusel
// ============================================================
//
// El carrusel (js/catalog.js) llama a esta función por cada tarjeta y con el
// resultado decide dónde pintarla:
//    0      → al frente (la principal)
//   -1 / +1 → de fondo, izquierda/derecha (arriba/abajo en celular)
//   otro    → oculta detrás, lista para entrar por ese lado
//
// Contrato:
//   Entra:  index  — posición de la tarjeta, entero en [0, total)
//           active — posición de la tarjeta al frente, entero en [0, total)
//           total  — cuántas tarjetas hay, entero ≥ 1
//
//   Sale:   la distancia con signo MÁS CORTA de active a index, dando la
//           vuelta por el final de la lista si así queda más cerca.
//           Siempre en el rango [-floor((total-1)/2), ceil((total-1)/2)].
//           Empate (total par, justo a la mitad) → el valor positivo.
//
// Ejemplo análogo ya resuelto: wrapIndex() justo arriba. Pista: primero
// calcula la distancia "hacia adelante" (siempre ≥ 0) y luego decide si
// es más corto ir hacia atrás.
//
// Casos que debe pasar (pégalos en la consola del navegador):
//   circularOffset(3, 3, 8)   →  0   (es la activa)
//   circularOffset(4, 3, 8)   →  1   (la siguiente)
//   circularOffset(2, 3, 8)   → -1   (la anterior)
//   circularOffset(0, 7, 8)   →  1   (activa la última: la primera va a la derecha)
//   circularOffset(7, 0, 8)   → -1   (activa la primera: la última va a la izquierda)
//   circularOffset(4, 0, 8)   →  4   (empate a la mitad → positivo)
//   circularOffset(0, 0, 1)   →  0   (una sola tarjeta)
//   circularOffset(1, 0, 2)   →  1   (dos tarjetas: empate → positivo)
//
/**
 * @param {number} index
 * @param {number} active
 * @param {number} total
 * @returns {number}
 */
function circularOffset(index, active, total) {
  // Distancia "hacia adelante" (siempre 0..total-1), dando la vuelta si hace falta
  const forward = wrapIndex(index - active, total);
  // Si hacia adelante es más de media vuelta, hacia atrás queda más cerca
  return forward > total / 2 ? forward - total : forward;
}
