// ============================================================
// HAND-OFF PARA CARLOS — ¿cuánto le pido al proveedor?
// ============================================================
//
// La demo "Sistema para organizar la operación" lleva un inventario. Cada
// producto tiene un MÍNIMO (cuando bajas de ahí, hay que pedir) y un MÁXIMO
// (hasta dónde conviene llenar el almacén). Tu función es la regla de negocio
// que decide la orden de compra.
//
// Contrato:
//   Entra:  stock — piezas que hay ahora (número entero; puede llegar
//                   negativo si se vendió de más por error)
//           min   — punto de reorden (entero ≥ 0)
//           max   — nivel al que se quiere llegar (entero ≥ min)
//
//   Sale:   número de piezas a pedir:
//             - si stock está EN el mínimo o por debajo → lo que falta para llegar a max
//             - si stock está por encima del mínimo     → 0 (todavía no se pide)
//
//   Casos borde:
//     - stock negativo cuenta como 0 (no puedes "deber" piezas al almacén)
//     - justo en el mínimo SÍ se pide (≤, no <)
//
// Ejemplo análogo ya resuelto: validateQuoteForm() en js/validation.js decide
// con if/else según reglas del negocio. Aquí es lo mismo, más corto. Pista:
// Math.max(0, x) convierte cualquier negativo en 0.
//
// Casos que debe pasar (pégalos en la consola del navegador):
//   reorderQuantity(12, 10, 40)   → 0    (aún hay de sobra)
//   reorderQuantity(10, 10, 40)   → 30   (justo en el mínimo: se pide)
//   reorderQuantity(3, 10, 40)    → 37
//   reorderQuantity(0, 5, 20)     → 20
//   reorderQuantity(-4, 5, 20)    → 20   (negativo cuenta como 0)
//
/**
 * Piezas a pedir para reponer un producto.
 * @param {number} stock
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function reorderQuantity(stock, min, max) {
  const onHand = Math.max(0, stock); // negativo cuenta como 0
  if (onHand > min) return 0; // aún hay de sobra: no se pide
  return max - onHand; // en el mínimo o debajo: llenar hasta el máximo
}
