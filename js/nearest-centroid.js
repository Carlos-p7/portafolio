// ============================================================
// HAND-OFF PARA CARLOS — ¿a qué grupo pertenece este cliente?
// ============================================================
//
// La demo "Conoce a tus tipos de clientes" agrupa clientes con k-means, el
// algoritmo de agrupación más usado en machine learning. k-means repite
// dos pasos hasta que nada cambia:
//   1. ASIGNAR: cada cliente se va con el centro de grupo más cercano  ← TU PIEZA
//   2. MOVER:   cada centro se mueve al promedio de sus clientes        (ya está)
//
// Tu función es el paso 1 para UN cliente: recibe su punto y la lista de
// centros, y devuelve la POSICIÓN (índice) del centro más cercano.
//
// Contrato:
//   Entra:  point     — { x: number, y: number }
//           centroids — arreglo de { x: number, y: number }
//
//   Sale:   número — el índice del centroide más cercano (distancia en línea
//           recta: √((x₁−x₂)² + (y₁−y₂)²), la del teorema de Pitágoras)
//
//   Casos borde:
//     - Empate (dos centros a la misma distancia) → el índice MENOR.
//     - centroids vacío → -1 (no hay grupo al cual asignar).
//
// Ejemplo análogo ya resuelto: en js/demos/forecast.js, onMove() busca el mes
// más cercano al cursor:
//     points.reduce((best, q) => (Math.abs(q.x - sx) < Math.abs(best.x - sx) ? q : best), points[0]);
// Esa es la misma idea en 1 dimensión y devuelve el ELEMENTO. Tú necesitas
// 2 dimensiones y devolver el ÍNDICE. Math.hypot(dx, dy) calcula √(dx² + dy²).
//
// Casos que debe pasar (pégalos en la consola del navegador):
//   const C = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 10 }];
//   nearestCentroid({ x: 1, y: 1 }, C)    → 0
//   nearestCentroid({ x: 9, y: 2 }, C)    → 1
//   nearestCentroid({ x: 2, y: 7 }, C)    → 2
//   nearestCentroid({ x: 5, y: 0 }, C)    → 0   (empate entre 0 y 1 → el menor)
//   nearestCentroid({ x: 3, y: 3 }, [])   → -1
//
/**
 * Índice del centroide más cercano a un punto (distancia euclidiana).
 * @param {{x: number, y: number}} point
 * @param {{x: number, y: number}[]} centroids
 * @returns {number}
 */
function nearestCentroid(point, centroids) {
  let bestIndex = -1;
  let bestDistance = Infinity;

  centroids.forEach((c, i) => {
    const distance = Math.hypot(point.x - c.x, point.y - c.y);
    // "<" y no "<=": en un empate se queda el primero que encontró (índice menor)
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }
  });

  return bestIndex;
}
