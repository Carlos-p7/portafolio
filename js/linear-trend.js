// ============================================================
// HAND-OFF PARA CARLOS — línea de tendencia (regresión lineal)
// ============================================================
//
// Tu primer modelo de machine learning, sin librerías. El demo de
// "Pronóstico de ventas" le pasa 12 meses de ventas y con tu resultado
// dibuja la tendencia y la extiende hacia el futuro.
//
// La idea: buscar la recta  y = intercept + slope · x  que pasa lo más cerca
// posible de todos los puntos (mínimos cuadrados). x es el número de mes
// (0, 1, 2, ...) e y es la venta de ese mes.
//
//   slope     = Σ (x − x̄)(y − ȳ)  /  Σ (x − x̄)²      ← cuánto sube por mes
//   intercept = ȳ − slope · x̄                        ← dónde arranca en x = 0
//
//   (x̄ = promedio de las x, ȳ = promedio de las y)
//
// Contrato:
//   Entra:  values — arreglo de números, values[i] es la venta del mes i
//   Sale:   { slope: number, intercept: number }
//
//   Casos borde:
//     - Arreglo vacío      → { slope: 0, intercept: 0 }
//     - Un solo valor [v]  → { slope: 0, intercept: v }   (con 1 punto no hay pendiente;
//                             ojo: la fórmula dividiría 0/0)
//     - No debe modificar `values`.
//
// Ejemplo análogo ya resuelto: summarizeSales() en js/sales-summary.js usa
// .reduce() para sumar. Aquí necesitas varias sumas: primero los promedios,
// luego las dos Σ de la fórmula. Pista: en .reduce((acc, y, x) => ...) el
// tercer parámetro es el índice — ¡ese índice ES tu x!
//
// Casos que debe pasar (pégalos en la consola del navegador):
//   linearTrend([2, 4, 6, 8])   → { slope: 2,   intercept: 2 }
//   linearTrend([5, 5, 5])      → { slope: 0,   intercept: 5 }
//   linearTrend([1, 2, 1, 2])   → { slope: 0.2, intercept: 1.2 }   (± decimales de punto flotante)
//   linearTrend([10])           → { slope: 0,   intercept: 10 }
//   linearTrend([])             → { slope: 0,   intercept: 0 }
//
/**
 * Ajusta una recta por mínimos cuadrados a una serie de valores.
 * @param {number[]} values
 * @returns {{slope: number, intercept: number}}
 */
function linearTrend(values) {
  const n = values.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  if (n === 1) return { slope: 0, intercept: values[0] };

  // Promedios: las x son 0, 1, ..., n-1, así que su promedio es (n - 1) / 2
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((sum, y) => sum + y, 0) / n;

  // Las dos Σ de la fórmula (el índice x viene como tercer parámetro de reduce)
  const covXY = values.reduce((sum, y, x) => sum + (x - meanX) * (y - meanY), 0);
  const varX = values.reduce((sum, _y, x) => sum + (x - meanX) ** 2, 0);

  const slope = covXY / varX;
  const intercept = meanY - slope * meanX;
  return { slope, intercept };
}
