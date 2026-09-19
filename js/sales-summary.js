// ---- Datos de ejemplo del tablero de ventas (demo "Pruébalo") ----
// Una cafetería ficticia con 3 sucursales. Cada fila = lo vendido de UN
// producto, en UNA sucursal, en UN mes. Es la forma "larga" en que
// normalmente llegan los datos de un sistema de ventas.

const SALES_MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
const SALES_BRANCHES = ["Centro", "Norte", "Sur"];

const SALES_ROWS = (() => {
  const products = [
    // precio, pedidos base al mes, y cómo cambia con la temporada (ene→jun)
    { name: "Café", price: 45, base: 620, season: [1.15, 1.1, 1.0, 0.95, 0.88, 0.82] },
    { name: "Pan dulce", price: 25, base: 540, season: [1.05, 1.0, 1.0, 1.02, 0.98, 0.96] },
    { name: "Postres", price: 60, base: 210, season: [0.9, 1.25, 0.95, 1.0, 1.2, 1.0] },
    { name: "Bebidas frías", price: 55, base: 260, season: [0.6, 0.7, 0.95, 1.2, 1.45, 1.6] },
  ];
  const branchFactor = { Centro: 1.3, Norte: 1.0, Sur: 0.75 };

  const rows = [];
  SALES_MONTHS.forEach((month, m) =>
    SALES_BRANCHES.forEach((branch) =>
      products.forEach((p) => {
        const orders = Math.round(p.base * p.season[m] * branchFactor[branch]);
        rows.push({ month, branch, product: p.name, orders, amount: orders * p.price });
      })
    )
  );
  return rows;
})();

// ============================================================
// HAND-OFF PARA CARLOS — resumen de ventas del tablero
// ============================================================
//
// Es un GROUP BY de SQL, pero en JavaScript: filtrar filas, sumar y agrupar.
// El tablero llama a esta función cada vez que el visitante cambia un filtro,
// y con lo que devuelve pinta las cifras grandes y la gráfica de productos.
// (La gráfica por mes también la usa: la llama una vez por mes.)
//
// Contrato:
//   Entra:  rows    — arreglo de { month, branch, product, orders, amount }
//           filters — { month: "Ene".."Jun" | "all", branch: "Centro"|... | "all" }
//                     "all" significa "no filtrar por ese campo"
//
//   Sale:   {
//             total:     number,  // suma de amount de las filas que pasan el filtro
//             orders:    number,  // suma de orders de esas mismas filas
//             avgTicket: number,  // total / orders, redondeado a entero; 0 si orders es 0
//             byProduct: [{ product: string, total: number }]
//                        // una entrada por producto, ordenada de MAYOR a menor total
//           }
//
//   Casos borde:
//     - Ninguna fila pasa el filtro → { total: 0, orders: 0, avgTicket: 0, byProduct: [] }
//     - No debe modificar `rows` (el tablero lo reutiliza en cada llamada).
//
// Ejemplo análogo ya resuelto: en js/catalog.js,
//     const total = CATALOG.reduce((n, area) => n + area.items.length, 0);
// suma algo de cada elemento de un arreglo. Aquí haces lo mismo, pero antes
// filtras (.filter) y además agrupas por producto (pista: un objeto usado como
// "diccionario" { "Café": 1200, ... } y al final Object.entries() + .sort()).
//
// Casos que debe pasar (pégalos en la consola del navegador):
//
//   const R = [
//     { month: "Ene", branch: "Centro", product: "Café",    orders: 10, amount: 450 },
//     { month: "Ene", branch: "Norte",  product: "Café",    orders: 4,  amount: 180 },
//     { month: "Ene", branch: "Centro", product: "Postres", orders: 2,  amount: 120 },
//     { month: "Feb", branch: "Centro", product: "Postres", orders: 5,  amount: 300 },
//   ];
//
//   summarizeSales(R, { month: "all", branch: "all" })
//     → { total: 1050, orders: 21, avgTicket: 50,
//         byProduct: [{ product: "Café", total: 630 }, { product: "Postres", total: 420 }] }
//
//   summarizeSales(R, { month: "Ene", branch: "all" })
//     → { total: 750, orders: 16, avgTicket: 47,
//         byProduct: [{ product: "Café", total: 630 }, { product: "Postres", total: 120 }] }
//
//   summarizeSales(R, { month: "all", branch: "Centro" })
//     → { total: 870, orders: 17, avgTicket: 51,
//         byProduct: [{ product: "Café", total: 450 }, { product: "Postres", total: 420 }] }
//
//   summarizeSales(R, { month: "Mar", branch: "all" })
//     → { total: 0, orders: 0, avgTicket: 0, byProduct: [] }
//
/**
 * Filtra las ventas por mes/sucursal y las resume.
 * @param {{month: string, branch: string, product: string, orders: number, amount: number}[]} rows
 * @param {{month: string, branch: string}} filters
 * @returns {{total: number, orders: number, avgTicket: number, byProduct: {product: string, total: number}[]}}
 */
function summarizeSales(rows, filters) {
  // 1. WHERE: solo las filas que pasan los dos filtros ("all" deja pasar todo)
  const selected = rows.filter(
    (row) =>
      (filters.month === "all" || row.month === filters.month) &&
      (filters.branch === "all" || row.branch === filters.branch)
  );

  // 2. SUM: totales de ventas y pedidos
  const total = selected.reduce((sum, row) => sum + row.amount, 0);
  const orders = selected.reduce((sum, row) => sum + row.orders, 0);

  // 3. GROUP BY product: un "diccionario" { "Café": 1200, "Postres": 420, ... }
  const totalsByProduct = {};
  for (const row of selected) {
    totalsByProduct[row.product] = (totalsByProduct[row.product] || 0) + row.amount;
  }

  // 4. ORDER BY total DESC: diccionario → arreglo de objetos, de mayor a menor
  const byProduct = Object.entries(totalsByProduct)
    .map(([product, productTotal]) => ({ product, total: productTotal }))
    .sort((a, b) => b.total - a.total);

  return {
    total,
    orders,
    avgTicket: orders === 0 ? 0 : Math.round(total / orders),
    byProduct,
  };
}
