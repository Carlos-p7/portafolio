// ---- Demos interactivas ("Pruébalo") ----
// Simulaciones que se abren dentro del detalle de un servicio para que el
// cliente VEA y TOQUE el resultado antes de cotizar. Todo es de mentira:
// no se guarda ni se envía nada.
// Cada demo es una función que recibe el contenedor donde se pinta.


const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
