// Registro de demos: id del servicio → demo. Para agregar una, escribe su
// función en js/demos/<nombre>.js, cárgala en index.html ANTES de este
// archivo y regístrala aquí.

const DEMOS = {
  chatbot: { title: "Así lo verían tus clientes en tu página", render: demoChatbot },
  "tablero-indicadores": { title: "Así se vería el tablero de tu negocio", render: demoDashboard },
  "tienda-en-linea": { title: "Así compraría un cliente en tu tienda", render: demoShop },
  "automatizar-tareas": { title: "Tu proceso, a mano vs. automático", render: demoAutomation },
  whatsapp: { title: "Así te atendería tu negocio por WhatsApp", render: demoWhatsApp },
  "pagina-web": { title: "Arma tu página en 10 segundos", render: demoWebsite },
  "app-celular": { title: "Así se usaría tu app", render: demoPhoneApp },
  facturacion: { title: "De venta a factura en un clic", render: demoInvoice },
  "revision-calidad-datos": { title: "Así se limpia una base de clientes", render: demoDataQuality },
  "pronostico-ventas": { title: "¿Cuánto vas a vender los próximos meses?", render: demoForecast },
};
