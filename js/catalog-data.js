// Catálogo de servicios. Editar aquí agrega/quita tarjetas sin tocar el HTML.
// - id:    identificador estable (lo usa la caja de cotización; no lo cambies
//          una vez publicado o se pierden las selecciones guardadas)
// - title: lo único que se ve en la tarjeta — lenguaje de cliente, sin jerga
// - lead / description / includes: solo se ven en "Ver detalle"

const ICONS = {
  globe: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18"/></svg>',
  layers: '<svg viewBox="0 0 24 24"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
  cloud: '<svg viewBox="0 0 24 24"><path d="M7 18a4 4 0 010-8 5.5 5.5 0 0110.5-1.5A3.75 3.75 0 0118 18H7z"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 14a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V20a2 2 0 11-4 0v-.1a1.6 1.6 0 00-1-1.5 1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H4a2 2 0 110-4h.1a1.6 1.6 0 001.5-1 1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H10a1.6 1.6 0 001-1.5V4a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V10a1.6 1.6 0 001.5 1H20a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z"/></svg>',
  cart: '<svg viewBox="0 0 24 24"><path d="M3 4h2l2.4 11.2a2 2 0 002 1.6h7.7a2 2 0 002-1.5L21 8H6"/><circle cx="10" cy="20" r="1.2"/><circle cx="18" cy="20" r="1.2"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20a7.5 7.5 0 0115 0"/></svg>',
  code: '<svg viewBox="0 0 24 24"><path d="M9 7l-5 5 5 5M15 7l5 5-5 5"/></svg>',
  phone: '<svg viewBox="0 0 24 24"><rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.5h2"/></svg>',
  card: '<svg viewBox="0 0 24 24"><rect x="2.5" y="5" width="19" height="14" rx="2.4"/><path d="M2.5 10h19"/></svg>',
  receipt: '<svg viewBox="0 0 24 24"><path d="M6 2.8h12v18.4l-3-1.7-3 1.7-3-1.7-3 1.7z"/><path d="M9 8h6M9 12h6"/></svg>',
  plug: '<svg viewBox="0 0 24 24"><path d="M9 3v5M15 3v5"/><path d="M6.5 8h11v3.5a5.5 5.5 0 01-11 0V8z"/><path d="M12 17v4"/></svg>',
  chat: '<svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 01-11.6 7.1L4 20.5l1.4-5.1A8 8 0 1121 12z"/></svg>',
  flow: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="6" height="5" rx="1.4"/><rect x="15" y="16" width="6" height="5" rx="1.4"/><path d="M6 8v6a4 4 0 004 4h5"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="4.5" y="10" width="15" height="11" rx="2.2"/><path d="M8 10V7.5a4 4 0 018 0V10"/></svg>',
  sync: '<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 01-13.7 5.6M4 12a8 8 0 0113.7-5.6"/><path d="M18 3v4h-4M6 21v-4h4"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M4 20V4"/><path d="M4 20h16"/><rect x="7.5" y="12" width="3" height="5"/><rect x="13" y="8" width="3" height="9"/></svg>',
  dash: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="1.6"/><rect x="13" y="3" width="8" height="5" rx="1.6"/><rect x="13" y="10" width="8" height="11" rx="1.6"/><rect x="3" y="13" width="8" height="8" rx="1.6"/></svg>',
  pipe: '<svg viewBox="0 0 24 24"><path d="M3 7h5a4 4 0 014 4v2a4 4 0 004 4h5"/><circle cx="3" cy="7" r="1.4"/><circle cx="21" cy="17" r="1.4"/></svg>',
  db: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="6" rx="8" ry="3.2"/><path d="M4 6v12c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2V6"/><path d="M4 12c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2"/></svg>',
  target: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".9" fill="currentColor"/></svg>',
  trend: '<svg viewBox="0 0 24 24"><path d="M3 16l5-5 4 3.5L21 6"/><path d="M15 6h6v6"/></svg>',
  brain: '<svg viewBox="0 0 24 24"><path d="M9.5 4a3 3 0 00-3 3 3 3 0 00-1.5 5.5A3 3 0 007 17a3 3 0 005 1.2V5.5A2.5 2.5 0 009.5 4z"/><path d="M14.5 4a3 3 0 013 3 3 3 0 011.5 5.5A3 3 0 0117 17a3 3 0 01-5 1.2"/></svg>',
};

const CATALOG = [
  {
    id: "plataformas",
    name: "Sitios y plataformas",
    items: [
      {
        id: "pagina-web", icon: "globe",
        title: "Página web para tu negocio",
        lead: "Presencia digital de una sola pieza, pensada para que te encuentren y te contacten.",
        description: "Sitio rápido y adaptable a celular, con formulario de contacto conectado y medición de visitas desde el primer día.",
        includes: ["Diseño adaptable a celular (3–6 secciones)", "Formulario de contacto con aviso por correo", "Configuración para aparecer en buscadores", "Medición de visitas", "Publicación en tu propio dominio con HTTPS"],
      },
      {
        id: "sitio-autoadministrable", icon: "layers",
        title: "Sitio web que tú mismo actualizas",
        lead: "Sitio de varias secciones con un panel para que tu equipo publique contenido.",
        description: "Portal de varias páginas con administrador de contenido para publicar noticias, servicios o documentos sin depender de un programador.",
        includes: ["Hasta 12 tipos de página", "Panel de administración con permisos por usuario", "Sección de noticias, blog o documentos", "Buscador interno y menú de varios niveles", "Manual de uso y capacitación al equipo"],
      },
      {
        id: "plataforma-suscripcion", icon: "cloud",
        title: "Plataforma en línea por suscripción",
        lead: "Tu producto digital en la nube, listo para que varios clientes lo usen al mismo tiempo.",
        description: "Primera versión funcional de un producto por suscripción: cada cliente ve solo su información, con registro, planes y los primeros módulos de negocio listos para usuarios reales.",
        includes: ["Información separada por cliente", "Registro, bienvenida y manejo de planes", "2–3 módulos funcionales de negocio", "Panel de administración del producto", "Ambiente de pruebas y publicación automatizada", "Documentación y manual de usuario"],
      },
      {
        id: "sistema-gestion", icon: "gear",
        title: "Sistema para organizar la operación de tu empresa",
        lead: "Adiós a las hojas de cálculo sueltas: catálogos, aprobaciones, permisos y reportes en un solo lugar.",
        description: "Sistema a la medida que sustituye hojas de cálculo y procesos manuales, con flujos de aprobación, historial de cambios y reportes operativos.",
        includes: ["Catálogos principales (clientes, productos, etc.)", "Flujos de trabajo con aprobaciones", "Permisos por usuario e historial de cambios", "Reportes y exportación a Excel", "Traslado de tu información actual", "Capacitación por tipo de usuario"],
      },
      {
        id: "tienda-en-linea", icon: "cart",
        title: "Tienda en línea",
        lead: "Vende por internet con catálogo, carrito, pagos y seguimiento de pedidos.",
        description: "Tienda con administración de productos, control de inventario, cobro en línea y panel de pedidos. Incluye la carga ordenada de tu catálogo inicial.",
        includes: ["Catálogo con variantes, categorías e inventario", "Carrito, pago y cupones de descuento", "Cobro con tarjeta integrado", "Panel de pedidos y estado de envío", "Correos automáticos al cliente", "Carga del catálogo inicial"],
      },
      {
        id: "portal-clientes", icon: "user",
        title: "Portal de autoservicio para tus clientes",
        lead: "Un espacio privado donde cada cliente consulta su información y hace trámites.",
        description: "Portal con acceso por usuario para que tus clientes consulten su estado de cuenta, documentos o solicitudes sin tener que llamar ni escribir.",
        includes: ["Inicio de sesión seguro y recuperación de contraseña", "Página personalizada por cliente", "Consulta y descarga de documentos", "Registro y seguimiento de solicitudes", "Avisos por correo o WhatsApp", "Panel interno para tu equipo de atención"],
      },
      {
        id: "conexion-apps", icon: "code",
        title: "Servicio central que conecta tus aplicaciones",
        lead: "Una sola base para que tu web, tu app y otros sistemas usen la misma información.",
        description: "Servicio independiente y documentado para que cualquier aplicación o sistema externo consulte y guarde información con las mismas reglas de negocio.",
        includes: ["Modelo de datos con control de versiones", "Consultas y registros con validación", "Acceso protegido por usuario", "Documentación interactiva para otros desarrolladores", "Pruebas automáticas de las funciones críticas", "Ambiente de pruebas para quien se conecte"],
      },
      {
        id: "app-celular", icon: "phone",
        title: "App para celular",
        lead: "Una app que se instala desde el navegador, sin pasar por tiendas de aplicaciones.",
        description: "Aplicación instalable en Android e iOS directamente desde el navegador, con funcionamiento parcial sin internet y notificaciones.",
        includes: ["Pantallas pensadas para uso táctil", "Instalación desde el navegador", "Uso sin conexión en las pantallas clave", "Notificaciones (donde el celular lo permite)", "Sincronización con tu sistema actual"],
      },
    ],
  },
  {
    id: "conexiones",
    name: "Conexiones y automatización",
    items: [
      {
        id: "cobros-en-linea", icon: "card",
        title: "Cobros en línea con tarjeta",
        lead: "Recibe pagos en línea y que cada cobro se registre solo.",
        description: "Conexión con proveedores como Stripe, Mercado Pago o Conekta: cobros con tarjeta y referencias, con actualización automática del estado de cada pedido.",
        includes: ["Pago con tarjeta y métodos locales", "Confirmación y cancelación automáticas", "Reembolsos y reintentos", "Reporte de transacciones", "Ambiente de pruebas documentado"],
      },
      {
        id: "facturacion", icon: "receipt",
        title: "Facturación electrónica automática",
        lead: "Tus facturas (CFDI 4.0) se generan y envían solas desde tu sistema.",
        description: "Emisión de facturas desde tu plataforma: timbrado con un proveedor autorizado, envío al cliente, cancelaciones y resguardo de XML y PDF.",
        includes: ["Facturas y complementos de pago", "Envío automático de XML y PDF", "Cancelación con acuse", "Catálogos del SAT actualizables", "Consulta histórica de facturas"],
      },
      {
        id: "conexion-erp", icon: "plug",
        title: "Conectar tu sistema administrativo",
        lead: "Tu plataforma y tu ERP (Odoo, SAP B1…) comparten la información sin capturar dos veces.",
        description: "Puente entre tu plataforma y tu sistema administrativo: clientes, productos y pedidos viajan en ambos sentidos, con control de errores.",
        includes: ["Mapeo de información y reglas de negocio", "Sincronización programada y bajo demanda", "Manejo de conflictos y reintentos", "Historial de sincronización y alertas", "Documentación de la conexión"],
      },
      {
        id: "whatsapp", icon: "chat",
        title: "Atención automática por WhatsApp",
        lead: "Atiende y avisa a tus clientes por el canal que ya usan.",
        description: "WhatsApp oficial conectado a tu plataforma: avisos automáticos, respuestas guiadas y paso a un asesor humano cuando hace falta.",
        includes: ["Alta del número y mensajes aprobados", "Conversación guiada por menús", "Avisos automáticos por evento", "Paso a un asesor con historial", "Panel de conversaciones y métricas"],
      },
      {
        id: "automatizar-tareas", icon: "flow",
        title: "Automatizar tareas repetitivas",
        lead: "Lo que hoy se copia y pega a mano, que se haga solo.",
        description: "Flujos automáticos que conectan formularios, correo, hojas de cálculo y tus sistemas, dejando registro de cada ejecución.",
        includes: ["De 3 a 8 flujos automatizados documentados", "Alertas cuando algo falla", "Registro de cada ejecución", "Ambiente de pruebas separado", "Capacitación para ajustar los flujos"],
      },
      {
        id: "inicio-sesion-unico", icon: "lock",
        title: "Un solo inicio de sesión para todas tus herramientas",
        lead: "Tu equipo entra con su cuenta de Google o Microsoft a todo.",
        description: "Inicio de sesión unificado con Google Workspace o Microsoft, con permisos que se sincronizan desde tu directorio de empleados.",
        includes: ["Conexión con tu proveedor de cuentas", "Permisos según el área de cada persona", "Altas y bajas automáticas", "Cierre de sesión centralizado", "Historial de accesos"],
      },
      {
        id: "migracion-datos", icon: "sync",
        title: "Mover tu información a un sistema nuevo",
        lead: "Cambia de sistema sin perder tu historial.",
        description: "Traslado de tu información histórica al nuevo sistema: limpieza, eliminación de duplicados y un reporte que demuestra que no se perdió nada.",
        includes: ["Revisión de la información de origen", "Reglas de limpieza y eliminación de duplicados", "Cargas de prueba con reporte de diferencias", "Carga definitiva en fecha acordada", "Reporte de cuadre origen–destino"],
      },
    ],
  },
  {
    id: "datos",
    name: "Datos e inteligencia de negocio",
    items: [
      {
        id: "revision-calidad-datos", icon: "search",
        title: "Revisión de la calidad de tu información",
        lead: "Saber qué tan confiables son tus datos antes de invertir en reportes.",
        description: "Evaluación de datos incompletos, duplicados o inconsistentes. Es el punto de partida recomendado para no construir reportes sobre información que no lo sostiene.",
        includes: ["Inventario de fuentes y campos importantes", "Medición de datos faltantes y duplicados", "Hallazgos ordenados por impacto", "Recomendaciones de corrección", "Reporte ejecutivo"],
      },
      {
        id: "reporte-ejecutivo", icon: "chart",
        title: "Respuestas a tus preguntas de negocio con datos",
        lead: "Decisiones con evidencia, no con intuición.",
        description: "Análisis a fondo de tu información para responder preguntas concretas, con gráficas claras y un reporte ejecutivo con conclusiones accionables.",
        includes: ["Limpieza y preparación de los datos", "Análisis de tendencias y relaciones", "Gráficas fáciles de interpretar", "Reporte con hallazgos y recomendaciones", "Archivo de análisis reproducible"],
      },
      {
        id: "tablero-indicadores", icon: "dash",
        title: "Tablero de indicadores de tu negocio",
        lead: "Tus números clave, actualizados solos y en un solo lugar (Power BI).",
        description: "Tablero interactivo con los indicadores de tu área, conectado a tus fuentes reales y con actualización programada, más capacitación para leerlo sin ayuda.",
        includes: ["Definición de indicadores con los responsables", "Modelo de datos y cálculos", "2–4 páginas de tablero interactivo", "Actualización programada y control de acceso", "Capacitación de lectura"],
      },
      {
        id: "datos-automaticos", icon: "pipe",
        title: "Actualización automática de tus datos",
        lead: "Tu información llega limpia y a tiempo todos los días, sin que nadie la prepare.",
        description: "Proceso automático que toma los datos de tus sistemas, los ordena con reglas documentadas y los deja listos para reportes, con alertas si algo falla.",
        includes: ["Conexión a tus fuentes de información", "Reglas de limpieza documentadas", "Calendario de ejecución automática", "Revisiones de calidad en cada corrida", "Alertas e historial de ejecuciones"],
      },
      {
        id: "informacion-centralizada", icon: "db",
        title: "Centralizar toda tu información en un solo lugar",
        lead: "Una sola fuente de verdad: todas las áreas obtienen la misma cifra.",
        description: "Repositorio central de información con historial preservado y un diccionario de datos, para que los reportes de todas las áreas cuadren entre sí.",
        includes: ["Modelo de información documentado", "Historial de cambios preservado", "Cargas automáticas incrementales", "Diccionario de datos", "Base lista para tableros y reportes"],
      },
      {
        id: "segmentacion-clientes", icon: "target",
        title: "Conoce a tus tipos de clientes",
        lead: "Grupos de clientes que se comportan distinto, y qué hacer con cada uno.",
        description: "Agrupación de tus clientes según su comportamiento real de compra o uso, con perfiles fáciles de entender y recomendaciones comerciales para cada grupo.",
        includes: ["Indicadores de comportamiento por cliente", "Agrupación de clientes similares", "Perfil de cada grupo", "Acción comercial recomendada por grupo", "Proceso para recalcular periódicamente"],
      },
      {
        id: "pronostico-ventas", icon: "trend",
        title: "Pronóstico de ventas y demanda",
        lead: "Planea inventario y capacidad con una proyección confiable.",
        description: "Proyección de ventas o consumo por producto, sucursal o categoría, con márgenes de error medidos honestamente.",
        includes: ["Tratamiento de temporadas y valores atípicos", "Comparación de varios métodos de pronóstico", "Pronóstico con rango de confianza", "Medición del error por segmento", "Rutina de actualización periódica"],
      },
      {
        id: "predicciones-ia", icon: "brain",
        title: "Predicciones con inteligencia artificial",
        lead: "Anticipa abandono, riesgo o precio, y úsalo directo en tu sistema.",
        description: "Modelo que aprende de tu historial para predecir un resultado de negocio, y que tu sistema consulta en tiempo real, con monitoreo y plan de actualización.",
        includes: ["Preparación de la información", "Entrenamiento y comparación de modelos", "Evaluación con métricas del negocio", "Conexión para que tu sistema lo consulte", "Monitoreo del desempeño", "Plan de actualización y entrega al equipo"],
      },
    ],
  },
];

/** Busca un servicio por id en todas las áreas. Devuelve undefined si no existe. */
function findService(id) {
  for (const area of CATALOG) {
    const item = area.items.find((it) => it.id === id);
    if (item) return { ...item, area: area.name };
  }
  return undefined;
}
