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
  "segmentacion-clientes": { title: "Tus clientes, agrupados solos", render: demoSegments },
  "predicciones-ia": { title: "¿Este cliente está por irse?", render: demoChurn },
  "sitio-autoadministrable": { title: "Publica tú mismo, sin programador", render: demoCms },
  "portal-clientes": { title: "Así se ve el portal de tus clientes", render: demoPortal },
  "cobros-en-linea": { title: "Cobra con una liga, de ida y vuelta", render: demoPayments },
  "inicio-sesion-unico": { title: "Una cuenta para entrar a todo", render: demoSso },
  "sistema-gestion": { title: "Tu inventario se cuida solo", render: demoInventory },
  "plataforma-suscripcion": { title: "Una app, muchos clientes, cada quien lo suyo", render: demoSaas },
  "conexion-apps": { title: "Todas tus apps se enteran de todo", render: demoHub },
  "conexion-erp": { title: "Adiós a capturar dos veces", render: demoErpSync },
  "migracion-datos": { title: "Cambio de sistema sin perder nada", render: demoMigration },
  "reporte-ejecutivo": { title: "Pregúntale a tus datos", render: demoAnswers },
  "datos-automaticos": { title: "Tus datos al día, cada mañana", render: demoAutoData },
  "informacion-centralizada": { title: "Todo lo de un cliente, en una sola ficha", render: demoCentral },
};
