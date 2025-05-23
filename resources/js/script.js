
let paginaActual = 1;
const REGISTROS_POR_PAGINA = 20;
let filtroAño, filtroMunicipio, filtroCups, filtroDireccion, filtroConsumo, filtroFecha;
let todosLosDatos = [];
let datosFiltrados = [];
let graficoConsumo;
// Archivos JSON con datos energéticos por año, que serán cargados y procesados
const archivos = [
  "https://raw.githubusercontent.com/dalilaarmas/proyecto_dual/refs/heads/master/resources/json/consumo-energetico-2022.json",
  "https://raw.githubusercontent.com/dalilaarmas/proyecto_dual/refs/heads/master/resources/json/consumo-energetico-2023.json",
  "https://raw.githubusercontent.com/dalilaarmas/proyecto_dual/refs/heads/master/resources/json/consumo-energetico-2024.json",
  "https://raw.githubusercontent.com/dalilaarmas/proyecto_dual/refs/heads/master/resources/json/consumo-energetico-2025.json"
];

// Función para mostrar un mensaje de error usando Bootstrap, con opción a mostrar detalles adicionales
function mostrarErrorBootstrap(mensaje, detalle = "") {
  const mensajeError = document.getElementById("mensajeError");
  const contenidoError = document.getElementById("contenidoError");
  const detallesError = document.getElementById("detallesError");
  const btnToggleDetalles = document.getElementById("btnToggleDetalles");

  // Validación para asegurar que los elementos existen en el DOM antes de continuar
  if (!mensajeError || !contenidoError || !detallesError || !btnToggleDetalles) {
    console.error("No se encontró el contenedor de errores en el DOM");
    alert(mensaje + "\n" + detalle); // fallback básico
    return;
  }

  // Asigna el mensaje principal y los detalles (inicialmente ocultos)
  contenidoError.textContent = mensaje;
  detallesError.textContent = detalle;
  detallesError.style.display = "none";
  btnToggleDetalles.textContent = "Ver detalles";

  // Cambia clases para mostrar el contenedor del error (usando clases Bootstrap)
  mensajeError.classList.remove("d-none");
  mensajeError.classList.add("show");

  // Asigna la función para el botón que alterna la visibilidad de los detalles
  btnToggleDetalles.onclick = () => {
    if (detallesError.style.display === "none") {
      detallesError.style.display = "block";
      btnToggleDetalles.textContent = "Ocultar detalles";
    } else {
      detallesError.style.display = "none";
      btnToggleDetalles.textContent = "Ver detalles";
    }
  };
}

// Captura errores globales y muestra el error en el contenedor de error Bootstrap personalizado
window.onerror = function (message, source, lineno, colno, error) {
  let detalle = `${message} en ${source}:${lineno}:${colno}`;

  if (error) {
    // Si existe el objeto error, añadimos su stack trace o su mensaje adicional
    if (error.stack) {
      detalle += `\nStack:\n${error.stack}`;
    } else if (error.message && error.message !== message) {
      detalle += `\nError message adicional: ${error.message}`;
    }
  }

  // Mostrar en interfaz
  mostrarErrorBootstrap("Error global detectado", detalle);
  // Mostrar por consola
  console.error("Error global capturado:", detalle);
  return false;
};

window.addEventListener("unhandledrejection", function (event) {
  const error = event.reason;
  let detalle = error && error.stack ? error.stack : error;

  mostrarErrorBootstrap("Error en promesa no gestionada", detalle);
  console.error("Unhandled rejection:", detalle);
});

const MIN_CARACTERES_FILTRO = 3; // Mínimo de caracteres para activar filtro en texto

//Función para que el filtro se active solo cuando el filtro tiene igual o más caracteres que el mínimo.
//Si el filtro está vacío (longitud 0) también se permite mostrar todo
function filtraTexto(datoValor, filtroValor) {
  if (filtroValor.length < MIN_CARACTERES_FILTRO) {
    return true; // No aplicar filtro, mostrar todo
  }

  return datoValor.toLowerCase().includes(filtroValor.toLowerCase());
}




// Espera a que todo el DOM esté cargado antes de ejecutar el script
document.addEventListener("DOMContentLoaded", function () {
   
   
    // Aplicar filtros al escribir
    const filtros = [
      "filtro-municipio",
      "filtro-cups",
      "filtro-direccion",
      "filtro-fecha-desde",
      "filtro-fecha-hasta",
      "filtro-consumo-min",
      "filtro-consumo-max"
    ];

    filtros.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", () => {
          try {
            aplicarFiltros();
          } catch (e) {
            // Evitamos errores mientras se escribe
          }
        });
      }
    });

     cargarYMostrarDatos().then(() => {
      datosFiltrados = [...todosLosDatos]; // Inicializa con todos los datos
      mostrarPagina();
      renderPaginacion(datosFiltrados.length);
      actualizarResumenRegistros();
      generarResumenConsumo();
      const canvas = document.getElementById("miGrafico");
      if (canvas) actualizarGrafico(datosFiltrados);

      ["filtro-municipio", "filtro-cups", "filtro-direccion", "filtro-fecha-desde", "filtro-fecha-hasta", "filtro-consumo-min", "filtro-consumo-max"]
        .forEach(id => {
          const el = document.getElementById(id);
          if (el) el.addEventListener("input", aplicarFiltros);
        });

    }).catch(err => {
      mostrarErrorBootstrap("Error al cargar los datos iniciales", err.message || err);
    });


});
// Función que genera un resumen estadístico y visual de los datos filtrados. 
// Si no hay datos filtrados, muestra mensaje informativo
function generarResumenConsumo() {
  const contenedor = document.getElementById("resumen-consumo");
  if (!contenedor) return;

  const fechaDesde = document.getElementById("filtro-fecha-desde")?.value || "";
  const fechaHasta = document.getElementById("filtro-fecha-hasta")?.value || "";

  function esFechaParcialValida(fecha) {
    return /^\d{4}(-\d{2}){0,2}$/.test(fecha);
  }

  const datosFiltradosCompatibles = datosFiltrados.filter(dato => {
    const f = dato.fecha;

    const cumpleDesde = fechaDesde && esFechaParcialValida(fechaDesde)
      ? f >= fechaDesde
      : true;

    const cumpleHasta = fechaHasta && esFechaParcialValida(fechaHasta)
      ? f <= fechaHasta
      : true;

    return cumpleDesde && cumpleHasta;
  });

  if (!datosFiltradosCompatibles || datosFiltradosCompatibles.length === 0) {
    contenedor.innerHTML = `<div class="alert alert-warning">No hay datos para mostrar en el resumen.</div>`;
    return;
  }

  const resumen = {};
  const diasTotales = [];
  let diaMayorConsumo = { fecha: "", consumo: -Infinity };
  let diaMenorConsumo = { fecha: "", consumo: Infinity };

  datosFiltradosCompatibles.forEach(dato => {
    if (!dato.fecha || typeof dato.fecha !== "string" || dato.fecha.length < 10) return;

    const año = dato.fecha.slice(0, 4);
    const mes = dato.fecha.slice(0, 7);

    if (dato.consumo != null) {
      diasTotales.push({ fecha: dato.fecha, consumo: dato.consumo });

      if (dato.consumo < diaMenorConsumo.consumo && dato.consumo > 0) {
        diaMenorConsumo = { fecha: dato.fecha, consumo: dato.consumo };
      }
      if (dato.consumo > diaMayorConsumo.consumo) {
        diaMayorConsumo = { fecha: dato.fecha, consumo: dato.consumo };
      }
    }

    if (!resumen[año]) resumen[año] = { total: 0, meses: {}, dias: {} };

    resumen[año].total += dato.consumo;
    resumen[año].meses[mes] = (resumen[año].meses[mes] || 0) + dato.consumo;
    resumen[año].dias[dato.fecha] = (resumen[año].dias[dato.fecha] || 0) + dato.consumo;
  });

  const años = Object.keys(resumen).sort();
  let añoMayor = "", consumoMayor = -Infinity;
  let añoMenor = "", consumoMenor = Infinity;

  años.forEach(año => {
    if (resumen[año].total > consumoMayor) {
      añoMayor = año;
      consumoMayor = resumen[año].total;
    }
    if (resumen[año].total < consumoMenor) {
      añoMenor = año;
      consumoMenor = resumen[año].total;
    }
  });

  let mesMenor = null;
  let consumoMesMenor = Infinity;
  años.forEach(año => {
    Object.entries(resumen[año].meses).forEach(([mes, consumo]) => {
      if (consumo < consumoMesMenor) {
        consumoMesMenor = consumo;
        mesMenor = mes;
      }
    });
  });

  const top3DiasGlobalMayor = diasTotales.sort((a, b) => b.consumo - a.consumo).slice(0, 3);
  const top3DiasGlobalMenor = diasTotales.filter(d => d.consumo > 0).sort((a, b) => a.consumo - b.consumo).slice(0, 3);

  const top3MensualPorAñoMayor = {};
  const top3MensualPorAñoMenor = {};
  años.forEach(año => {
    top3MensualPorAñoMayor[año] = {};
    top3MensualPorAñoMenor[año] = {};
    const diasPorMes = {};

    Object.entries(resumen[año].dias).forEach(([fecha, consumo]) => {
      if (consumo <= 0) return;
      const mes = fecha.slice(0, 7);
      if (!diasPorMes[mes]) diasPorMes[mes] = [];
      diasPorMes[mes].push({ fecha, consumo });
    });

    Object.entries(diasPorMes).forEach(([mes, dias]) => {
      dias.sort((a, b) => b.consumo - a.consumo);
      top3MensualPorAñoMayor[año][mes] = dias.slice(0, 3);
      top3MensualPorAñoMenor[año][mes] = dias.slice().sort((a, b) => a.consumo - b.consumo).slice(0, 3);
    });
  });
  // Genera HTML con resumen estadístico y visualización
  let html = `
      <div class="container py-3">
  
        <div class="card mb-4 shadow-sm">
          <div class="card-header bg-primary text-white">
            <h3 class="mb-0">Resumen General de Consumo</h3>
          </div>
          <div class="card-body">
            <ul class="list-group list-group-flush">
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <span><i class="bi bi-arrow-up-circle-fill text-danger me-2"></i>Día de mayor consumo global</span>
                <span class="badge bg-danger rounded-pill">${diaMayorConsumo.fecha} (${diaMayorConsumo.consumo.toFixed(2)} kWh)</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <span><i class="bi bi-arrow-down-circle-fill text-success me-2"></i>Día de menor consumo global</span>
                <span class="badge bg-success rounded-pill">${diaMenorConsumo.fecha} (${diaMenorConsumo.consumo.toFixed(2)} kWh)</span>
              </li>
              <li class="list-group-item">
                <strong>Top 3 días de mayor consumo global</strong>
                <ol class="mt-2">
                  ${top3DiasGlobalMayor.map(d => `<li>${d.fecha} - <span class="fw-bold text-danger">${d.consumo.toFixed(2)} kWh</span></li>`).join('')}
                </ol>
              </li>
              <li class="list-group-item">
                <strong>Top 3 días de menor consumo global (mayor que 0)</strong>
                <ol class="mt-2">
                  ${top3DiasGlobalMenor.map(d => `<li>${d.fecha} - <span class="fw-bold text-success">${d.consumo.toFixed(2)} kWh</span></li>`).join('')}
                </ol>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <span><i class="bi bi-calendar-event text-warning me-2"></i>Año de mayor consumo</span>
                <span class="badge bg-warning text-dark rounded-pill">${añoMayor} (${consumoMayor.toFixed(2)} kWh)</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <span><i class="bi bi-calendar-event-fill text-info me-2"></i>Año de menor consumo</span>
                <span class="badge bg-info text-white rounded-pill">${añoMenor} (${consumoMenor.toFixed(2)} kWh)</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <span><i class="bi bi-calendar3 text-secondary me-2"></i>Mes de menor consumo global</span>
                <span class="badge bg-secondary rounded-pill">${mesMenor ? new Date(mesMenor + "-01").toLocaleString("es-ES", { month: "long", year: "numeric" }) : "Desconocido"} (${consumoMesMenor.toFixed(2)} kWh)</span>
              </li>
            </ul>
          </div>
        </div>
  
        <div class="accordion" id="accordionAños">
    `;

  // Agrega detalles por año con tablas para top 3 días mayor y menor consumo mensual
  años.forEach((año, i) => {

    // Obtiene los meses disponibles para el año actual, ordenados alfabéticamente (por ejemplo, "2024-01", "2024-02", ...)
    const meses = Object.keys(top3MensualPorAñoMayor[año] || {}).sort();

    // Si no hay meses para este año, muestra un mensaje; si hay, genera el HTML para cada mes
    const mesesHtml = meses.length === 0
      ? `<p class="text-muted fst-italic">No hay datos mensuales para este año.</p>`
      : meses.map(mes => {

        const mesId = `collapseMes${i}${mes.replace(/-/g, '')}`;
        const fechaFormateada = new Date(mes + "-01").toLocaleString('es-ES', { month: 'long', year: 'numeric' });


        const topMayor = top3MensualPorAñoMayor[año][mes].map(d =>
          `<li><i class="bi bi-arrow-up-circle-fill text-danger me-2"></i>${d.fecha}: <span class="fw-bold text-danger">${d.consumo.toFixed(2)} kWh</span></li>`
        ).join('');

        const topMenor = (top3MensualPorAñoMenor[año][mes] || []).map(d =>
          `<li><i class="bi bi-arrow-down-circle-fill text-success me-2"></i>${d.fecha}: <span class="fw-bold text-success">${d.consumo.toFixed(2)} kWh</span></li>`
        ).join('');

        // Devuelve el bloque HTML con la tarjeta colapsable para el mes, mostrando top mayor y menor consumo

        return `
              <div class="card mb-2 shadow-sm">
                <div class="card-header p-2" id="heading${mesId}">
                  <h6 class="mb-0">
                    <button class="btn btn-link text-decoration-none" type="button" data-bs-toggle="collapse" data-bs-target="#${mesId}" aria-expanded="false" aria-controls="${mesId}">
                      ${fechaFormateada}
                    </button>
                  </h6>
                </div>
                <div id="${mesId}" class="collapse" aria-labelledby="heading${mesId}" data-bs-parent="#collapse${i}">
                  <div class="card-body p-3">
                    <div class="row">
                      <div class="col-md-6">
                        <strong class="text-danger">Top 3 días mayor consumo</strong>
                        <ol>${topMayor}</ol>
                      </div>
                      <div class="col-md-6">
                        <strong class="text-success">Top 3 días menor consumo (mayor que 0)</strong>
                        <ol>${topMenor}</ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            `;
      }).join('');

    // Identificador para el acordeón de meses dentro del año
    const mesesAccordionId = `collapse${i}`;

    // Obtiene el resumen mensual y diario para el año actual
    const mesesTotales = resumen[año].meses;
    const diasTotalesAño = resumen[año].dias;

    // Busca el mes con mayor consumo en el año
    let mesMayorConsumo = "", consumoMesMayor = -Infinity;
    for (const [mes, consumo] of Object.entries(mesesTotales)) {
      if (consumo > consumoMesMayor) {
        mesMayorConsumo = mes;
        consumoMesMayor = consumo;
      }
    }


    let diaMayorConsumoAño = "", consumoDiaMayor = -Infinity;
    for (const [fecha, consumo] of Object.entries(diasTotalesAño)) {
      if (consumo > consumoDiaMayor) {
        diaMayorConsumoAño = fecha;
        consumoDiaMayor = consumo;
      }
    }

    const promedioMensual = resumen[año].total / Object.keys(mesesTotales).length;

    // Añade al HTML principal un acordeón con el año, mostrando el detalle de meses y resumen
    html += `
        <div class="accordion-item shadow-sm mb-3">
          <h2 class="accordion-header" id="heading${i}">
            <button class="accordion-button collapsed bg-light" type="button" data-bs-toggle="collapse" data-bs-target="#${mesesAccordionId}" aria-expanded="false" aria-controls="${mesesAccordionId}">
              <strong>${año}</strong> - Análisis mensual con top 3 días mayor y menor consumo
            </button>
          </h2>
          <div id="${mesesAccordionId}" class="accordion-collapse collapse" aria-labelledby="heading${i}" data-bs-parent="#accordionAños">
            <div class="accordion-body bg-white">
              ${mesesHtml}
              <div class="mt-3 border-top pt-3">
                <p><strong>Mes de mayor consumo:</strong> ${new Date(mesMayorConsumo + "-01").toLocaleString("es-ES", { month: "long", year: "numeric" })} (${consumoMesMayor.toFixed(2)} kWh)</p>
                <p><strong>Día de mayor consumo:</strong> ${diaMayorConsumoAño} (${consumoDiaMayor.toFixed(2)} kWh)</p>
                <p><strong>Promedio mensual:</strong> ${promedioMensual.toFixed(2)} kWh</p>
              </div>
            </div>
          </div>
        </div>
      `;
  });

  html += `</div></div>`;

  contenedor.innerHTML = html;
}

function actualizarResumenRegistros() {
  const resumen = document.getElementById("resumen-registros");
  resumen.textContent = `Mostrando ${datosFiltrados.length} de ${todosLosDatos.length} registros.`;
}
// Limpiar mensajes de error anteriores
limpiarErroresBootstrap();

// Carga los datos de todos los archivos JSON y construye la tabla
async function cargarYMostrarDatos() {
  todosLosDatos = []; // Vacía el array en caso de recarga
  const contenedor = document.getElementById("datos-container");

  // Estructura HTML de la tabla
  contenedor.innerHTML = `
  <table class="table table-bordered border-success" id="tabla-consumo">
    <thead class="table-success">
      <tr>
        <th>
        <i class="bi bi-info-circle text-primary"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-html="true"
            data-bs-title='Haz click en el icono derecho para filtrar por municipio. Debes introducir al menos 3 caracteres. Toca de nuevo el icono para ocultar la caja de texto.<br><button class="btn btn-sm btn-link cerrar-tooltip">Cerrar</button>'>
          </i>
          Municipio
         <i id="iconoFiltroMunicipio" class="bi bi-geo-alt-fill"
          data-bs-toggle="collapse" data-bs-target="#filtroMunicipioCollapse"
          role="button" aria-expanded="false" aria-controls="filtroMunicipioCollapse"></i>

          <div class="collapse mt-1" id="filtroMunicipioCollapse">
            <input type="text" class="form-control form-control-sm mt-1" id="filtro-municipio" placeholder="Filtrar municipio">
          </div>
        </th>
        <th>
         <i class="bi bi-info-circle text-primary"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-html="true"
            data-bs-title='Haz click en el icono derecho para filtrar por CUPS. Debes introducir al menos 3 caracteres. Toca de nuevo el icono para ocultar la caja de texto.<br><button class="btn btn-sm btn-link cerrar-tooltip">Cerrar</button>'>
          </i>
          CUPS
          <i id="iconoFiltroCups" class="bi bi-plug-fill"></i>
          <div class="collapse mt-1" id="filtroCupsCollapse"> 
            <input type="text" class="form-control form-control-sm mt-1" id="filtro-cups" placeholder="Filtrar CUPS">
          </div>
        </th>
        <th>
         <i class="bi bi-info-circle text-primary"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-html="true"
            data-bs-title='Haz click en el icono derecho para filtrar por dirección. Debes introducir al menos 3 caracteres. Toca de nuevo el icono para ocultar la caja de texto. <br><button class="btn btn-sm btn-link cerrar-tooltip">Cerrar</button>'>
          </i>
          Dirección
          <i id="iconoFiltroDireccion" class="bi bi-map-fill" data-bs-toggle="collapse" ></i>
         
          <div class="collapse mt-1" id="filtroDireccionCollapse">
            <input type="text" class="form-control form-control-sm mt-1" id="filtro-direccion" placeholder="Filtrar dirección">
          </div>
        </th>
        <th>
        <i class="bi bi-info-circle ms-2 text-primary" data-bs-toggle="tooltip" data-bs-placement="top"
            title="Haz click en el icono derecho para filtrar por fecha. Para filtrar con una sola fecha, introdúcela en el campo 'Desde'. Puedes usar formatos como 2023, 2023-05 o 2023-05-15. Toca de nuevo el icono para ocultar la caja de texto."></i>
          Fecha
          <i id="iconoFiltroFecha" class="bi bi-calendar-date-fill" data-bs-toggle="collapse" data-bs-target="#filtroFechaCollapse" role="button"></i>
          
          <div class="collapse mt-1" id="filtroFechaCollapse">
            <input type="search" class="form-control form-control-sm mt-1" id="filtro-fecha-desde" placeholder="Desde (YYYY-MM-DD)">
            <input type="search" class="form-control form-control-sm mt-1" id="filtro-fecha-hasta" placeholder="Hasta (YYYY-MM-DD)">
          </div>
        </th>

        <th>
          <i class="bi bi-info-circle text-primary"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-html="true"
            data-bs-title='Haz click en el icono derecho para filtrar por consumo. Puedes introducir solo mínimo, máximo o ambos. Toca de nuevo el icono para ocultar la caja de texto.<br><button class="btn btn-sm btn-link cerrar-tooltip">Cerrar</button>'>
          </i>
          Consumo (kWh)
          <i id="iconoFiltroConsumo" class="bi bi-lightning-charge-fill" data-bs-toggle="collapse" data-bs-target="#filtroConsumoCollapse"></i>
          


          <div class="collapse mt-1" id="filtroConsumoCollapse">
            <input type="number" class="form-control form-control-sm mt-1" id="filtro-consumo-min" placeholder="Mínimo">
            <input type="number" class="form-control form-control-sm mt-1" id="filtro-consumo-max" placeholder="Máximo">
            </div>
        </th>
      </tr>
    </thead>
    <tbody></tbody>
    </table>
`;
//poner negrita al tocar una fila
const esMovil = /Mobi|Android|iPhone|iPad|iPod/.test(navigator.userAgent);

if (esMovil) {
document.addEventListener('click', function (e) {
  if (e.target.tagName === 'TD') {
    const fila = e.target.closest('tr');

    // quitar la clase a todas las filas
    document.querySelectorAll('#tabla-consumo tbody tr').forEach(tr => {
      tr.classList.remove('tr-activa');
    });

    // aplicar a la fila tocada
    fila.classList.add('tr-activa');
  }
});
}
document.getElementById("filtro-consumo-min")?.addEventListener("input", aplicarFiltros);

  // Activar tooltips con botón de cerrar funcional y soporte móvil
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach(el => {
    new bootstrap.Tooltip(el, {
      trigger: 'click',
      placement: 'auto',
      html: true
    });
  });

  // Cierre del tooltip con el botón "Cerrar"
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("cerrar-tooltip")) {
      document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
        const tip = bootstrap.Tooltip.getInstance(el);
        if (tip) tip.hide();
      });
    }
  });

  // Activar collapse en los iconos de filtro
  [
    { icono: "iconoFiltroMunicipio", collapse: "filtroMunicipioCollapse" },
    { icono: "iconoFiltroCups", collapse: "filtroCupsCollapse" },
    { icono: "iconoFiltroDireccion", collapse: "filtroDireccionCollapse" },
    { icono: "iconoFiltroConsumo", collapse: "filtroConsumoCollapse" }
  ].forEach(({ icono, collapse }) => {
    const iconoEl = document.getElementById(icono);
    if (iconoEl) {
      iconoEl.setAttribute("data-bs-toggle", "collapse");
      iconoEl.setAttribute("data-bs-target", `#${collapse}`);
      iconoEl.setAttribute("role", "button");
      iconoEl.setAttribute("aria-expanded", "false");
      iconoEl.setAttribute("aria-controls", collapse);
    }
  });



  const mensajeError = document.getElementById("mensajeError");

  // Recorre cada archivo y agrega los datos al array principal
  for (const archivo of archivos) {
    try {
      const data = await cargarJSON(archivo);
      data.municipios.forEach(municipio => {
        municipio.cups.forEach(cups => {
          if (Array.isArray(cups.consumos)) {
            cups.consumos.forEach(consumo => {
              todosLosDatos.push({
                municipio: municipio.cups_municipio || "Desconocido",
                cups_codigo: cups.cups_codigo || "Desconocido",
                cups_direccion: cups.cups_direccion || "Desconocida",
                fecha: consumo.fecha || "Desconocida",
                consumo: !isNaN(parseFloat(consumo.consumo)) ? parseFloat(consumo.consumo) : null,
                año: consumo.fecha ? consumo.fecha.split("-")[0] : "Desconocida" // Extrae el año de la fecha
              });
            });
          }
        });
      });
    } catch (err) {
      console.error("Error en carga o parseo:", err);
      mostrarErrorBootstrap(
        `Error cargando el archivo ${archivo}. ${err.message}`,
        err.stack || JSON.stringify(err, null, 2)
      );
    }
  }
  datosFiltrados = [...todosLosDatos];// copia del array plano


  actualizarResumenRegistros();
  generarResumenConsumo();
  const canvas = document.getElementById("miGrafico");
  if (canvas) {
    actualizarGrafico(todosLosDatos);
  }
  aplicarFiltros();
}




// Filtra los datos según los valores introducidos en los campos
function aplicarFiltros() {
  if (!todosLosDatos || todosLosDatos.length === 0) return;

  const municipioSeleccionado = document.getElementById("filtro-municipio").value.toLowerCase();
  const cupsSeleccionado = document.getElementById("filtro-cups").value.toLowerCase();
  const direccionSeleccionada = document.getElementById("filtro-direccion").value.toLowerCase();
  const fechaDesde = document.getElementById("filtro-fecha-desde").value.trim();
  const fechaHasta = document.getElementById("filtro-fecha-hasta").value.trim();

  const consumoMinInput = document.getElementById("filtro-consumo-min").value.trim().replace(",", ".");
  const consumoMaxInput = document.getElementById("filtro-consumo-max").value.trim().replace(",", ".");

  const parsedMin = parseFloat(consumoMinInput);
  const parsedMax = parseFloat(consumoMaxInput);

  const consumoMin = !isNaN(parsedMin) ? parsedMin : null;
  const consumoMax = !isNaN(parsedMax) ? parsedMax : null;

  datosFiltrados = todosLosDatos.filter(dato => {
    const matchMunicipio = municipioSeleccionado === "" || filtraTexto(dato.municipio, municipioSeleccionado);
    const matchCups = cupsSeleccionado === "" || filtraTexto(dato.cups_codigo, cupsSeleccionado);
    const matchDireccion = direccionSeleccionada === "" || filtraTexto(dato.cups_direccion, direccionSeleccionada);

    const matchFechaDesde = !fechaDesde || !esFechaParcialValida(fechaDesde) || dato.fecha >= fechaDesde;
    const matchFechaHasta = !fechaHasta || !esFechaParcialValida(fechaHasta) || dato.fecha <= fechaHasta;

    const matchConsumoMin = consumoMin !== null ? dato.consumo != null && dato.consumo >= consumoMin : true;
    const matchConsumoMax = consumoMax !== null ? dato.consumo != null && dato.consumo <= consumoMax : true;

    return (
      matchMunicipio &&
      matchCups &&
      matchDireccion &&
      matchFechaDesde &&
      matchFechaHasta &&
      matchConsumoMin &&
      matchConsumoMax
    );
  });

  const mensajeNoResultados = document.getElementById("mensajeNoResultados");
  if (datosFiltrados.length === 0) {
    mensajeNoResultados.innerHTML = "No existen registros con los filtros indicados";
    mensajeNoResultados.classList.remove("d-none");
  } else {
    mensajeNoResultados.classList.add("d-none");
  }

  actualizarResumenRegistros();
  generarResumenConsumo();
  const canvas = document.getElementById("miGrafico");
  if (canvas && typeof Chart !== "undefined") {
    actualizarGrafico(datosFiltrados);
  }

  paginaActual = 1;
  mostrarPagina();
  renderPaginacion(datosFiltrados.length);
  actualizarEstadoIconosFiltro();
}






function actualizarEstadoIconosFiltro() {
  const filtros = [
    { inputId: "filtro-municipio", iconoId: "iconoFiltroMunicipio" },
    { inputId: "filtro-cups", iconoId: "iconoFiltroCups" },
    { inputId: "filtro-direccion", iconoId: "iconoFiltroDireccion" },
    { inputId: "filtro-fecha-desde", iconoId: "iconoFiltroFecha" },
    { inputId: "filtro-fecha-hasta", iconoId: "iconoFiltroFecha" },
    { inputId: "filtro-consumo-min", iconoId: "iconoFiltroConsumo" },
    { inputId: "filtro-consumo-max", iconoId: "iconoFiltroConsumo" }
  ];

  const iconosActivos = {};

  filtros.forEach(({ inputId, iconoId }) => {
    const input = document.getElementById(inputId);
    const icono = document.getElementById(iconoId);
    if (!input || !icono) return;

    if (input.value.trim() !== "") {
      iconosActivos[iconoId] = true;
    }
  });

  // Aplicar o quitar clase según estado
  filtros.forEach(({ iconoId }) => {
    const icono = document.getElementById(iconoId);
    if (!icono) return;
    if (iconosActivos[iconoId]) {
    // Elimina cualquier clase de color Bootstrap
    icono.classList.remove("text-danger");
    // Añade la clase que indica estado activo
    icono.classList.add("filtro-activo");
  } else {
    icono.classList.remove("filtro-activo");
    icono.classList.add("text-danger");
  }
  });
}
// Carga un archivo JSON usando fetch y lo convierte a objeto
async function cargarJSON(url) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Error al cargar el archivo: ${res.status} ${res.statusText}`);
  }

  try {
    return await res.json();
  } catch (e) {
    throw new Error(`Error parseando JSON en ${url}: ${e.message}`);
  }
}

// Resetea la paginación al aplicar un nuevo filtro
function reiniciarPaginacion() {
  paginaActual = 1;
  mostrarPagina();
}





// Evento para botón cerrar error
const btnCerrarError = document.getElementById("cerrarError");
if (btnCerrarError) {
  btnCerrarError.addEventListener("click", () => {
    limpiarErroresBootstrap();
  });
}



//Borra cualquier texto o contenido que esté mostrando un error, 
// oculta los detalles del error si están visibles y actualiza el botón 
// para que diga "Ver detalles".
function limpiarErroresBootstrap() {
  const mensajeError = document.getElementById("mensajeError");
  const contenidoError = document.getElementById("contenidoError");
  const detallesError = document.getElementById("detallesError");
  const btnToggleDetalles = document.getElementById("btnToggleDetalles");
  contenidoError.innerHTML = "";
  detallesError.textContent = "";
  detallesError.style.display = "none";
  mensajeError.classList.remove("show");
  mensajeError.classList.add("d-none");

  if (btnToggleDetalles) {
    btnToggleDetalles.textContent = "Ver detalles";  // Reiniciar texto del botón
  }
}
// Mostrar/ocultar resumen por años
function toggleAños() {
  const divAños = document.getElementById("resumen-años");
  const btn = document.getElementById("btnToggleAños");
  if (!divAños || !btn) return;

  if (divAños.style.display === "none") {
    divAños.style.display = "block";
    btn.textContent = "Ocultar consumo por años";
  } else {
    divAños.style.display = "none";
    btn.textContent = "Mostrar consumo por años";
  }
}

// Mostrar/ocultar resumen por meses
function toggleMeses() {
  const divMeses = document.getElementById("resumen-meses");
  const btn = document.getElementById("btnToggleMeses");
  if (!divMeses || !btn) return;

  if (divMeses.style.display === "none") {
    divMeses.style.display = "block";
    btn.textContent = "Ocultar consumo por meses";
  } else {
    divMeses.style.display = "none";
    btn.textContent = "Mostrar consumo por meses";
  }
}

//La función alterna (muestra u oculta) la sección de análisis en la página y 
// cambia el texto del botón para que el usuario sepa si al pulsarlo va a mostrar 
// o a ocultar esa sección.
function toggleAnalisis() {
  const divAnalisis = document.getElementById("resumen-analisis");
  const btn = document.getElementById("btnToggleAnalisis");
  if (!divAnalisis || !btn) return;

  if (divAnalisis.style.display === "none") {
    divAnalisis.style.display = "block";
    btn.textContent = "Ocultar análisis";
  } else {
    divAnalisis.style.display = "none";
    btn.textContent = "Mostrar análisis";
  }
}

function actualizarGrafico(consumosFiltrados) {
  const canvas = document.getElementById("miGrafico");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  // Agrupar consumos por mes o año
  const agrupadoPorFecha = {};

  consumosFiltrados.forEach(item => {
    const fecha = new Date(item.fecha);
    const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
    if (!agrupadoPorFecha[clave]) agrupadoPorFecha[clave] = 0;
    agrupadoPorFecha[clave] += item.consumo;
  });

  const etiquetas = Object.keys(agrupadoPorFecha).sort();
  const datos = etiquetas.map(clave => agrupadoPorFecha[clave]);

  if (graficoConsumo) {
    graficoConsumo.destroy();
  }

  graficoConsumo = new Chart(ctx, {
    type: 'line',
    data: {
      labels: etiquetas,
      datasets: [{
        label: 'Consumo energético (kWh)',
        data: datos,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        title: {
          display: true,
          text: 'Evolución del consumo energético'
        }
      }
    }
  });
}
function renderPaginacion(totalRegistros) {
  const totalPaginas = Math.ceil(totalRegistros / REGISTROS_POR_PAGINA);
  const paginacion = document.getElementById("paginacion");
  paginacion.innerHTML = "";

  const maxBotonesVisibles = 5; // Páginas alrededor de la actual
  const añadirBoton = (texto, pagina, activa = false, deshabilitada = false) => {
    const li = document.createElement("li");
    li.classList.add("page-item");
    if (activa) li.classList.add("active");
    if (deshabilitada) li.classList.add("disabled");

    const a = document.createElement("a");
    a.classList.add("page-link");
    a.href = "#";
    a.textContent = texto;

    if (!deshabilitada) {
      a.onclick = (e) => {
        e.preventDefault();
        paginaActual = pagina;
        mostrarPagina();
        renderPaginacion(totalRegistros);
      };
    }

    li.appendChild(a);
    paginacion.appendChild(li);
  };

  // Botón « anterior
  añadirBoton("«", paginaActual - 1, false, paginaActual === 1);

  // Primera página
  if (paginaActual > 3) {
    añadirBoton("1", 1);
    if (paginaActual > 4) {
      const li = document.createElement("li");
      li.classList.add("page-item", "disabled");
      li.innerHTML = `<span class="page-link">...</span>`;
      paginacion.appendChild(li);
    }
  }

  // Páginas centrales
  const inicio = Math.max(1, paginaActual - 2);
  const fin = Math.min(totalPaginas, paginaActual + 2);
  for (let i = inicio; i <= fin; i++) {
    añadirBoton(i, i, i === paginaActual);
  }

  // Última página
  if (paginaActual < totalPaginas - 2) {
    if (paginaActual < totalPaginas - 3) {
      const li = document.createElement("li");
      li.classList.add("page-item", "disabled");
      li.innerHTML = `<span class="page-link">...</span>`;
      paginacion.appendChild(li);
    }
    añadirBoton(totalPaginas, totalPaginas);
  }

  // Botón » siguiente
  añadirBoton("»", paginaActual + 1, false, paginaActual === totalPaginas);
  const inputIrPagina = document.getElementById("ir-a-pagina");
  const btnIrPagina = document.getElementById("btn-ir-a-pagina");

  if (inputIrPagina && btnIrPagina) {

    btnIrPagina.onclick = () => {
      try {
        const pagina = parseInt(inputIrPagina.value);
        const totalPaginas = Math.ceil(datosFiltrados.length / REGISTROS_POR_PAGINA);
        const errorDiv = document.getElementById("error-paginacion");

        if (!errorDiv) return; // Evita errores si no está en el DOM

        if (totalPaginas === 0) {
          errorDiv.textContent = "No hay registros disponibles para paginar.";
          errorDiv.classList.remove("d-none");
          errorDiv.classList.add("show");
          return;
        }

        if (!isNaN(pagina) && pagina >= 1 && pagina <= totalPaginas) {
          // Página válida. Actualiza y oculta error
          paginaActual = pagina;
          mostrarPagina();
          renderPaginacion(datosFiltrados.length);

          errorDiv.classList.add("d-none");
          errorDiv.textContent = "";
        } else {
          // Página no válida. Muestra alerta
          errorDiv.textContent = `Introduce un número entre 1 y ${totalPaginas}`;
          errorDiv.classList.remove("d-none");
          errorDiv.classList.add("show");
        }
      } catch (error) {
        mostrarErrorBootstrap("Error al cambiar de página", error.message || error);
      }
    };


  }
}

// Genera la tabla de una página específica de datos

function mostrarPagina() {
  const mensaje = document.getElementById("mensajeNoResultados");
  const errorDiv = document.getElementById("error-paginacion");
  const tbody = document.querySelector("#tabla-consumo tbody");
  if (!tbody) return;

  // Mostrar u ocultar mensaje de resultados
  if (datosFiltrados.length === 0) {
    mensaje.classList.remove("d-none");
    if (errorDiv) {
      errorDiv.classList.add("d-none");
      errorDiv.textContent = "";
    }
    tbody.innerHTML = ""; // Borra filas
    return;
  } else {
    mensaje.classList.add("d-none");
  }

  if (errorDiv) {
    errorDiv.classList.add("d-none");
    errorDiv.textContent = "";
  }

  const inicio = (paginaActual - 1) * REGISTROS_POR_PAGINA;
  const fin = inicio + REGISTROS_POR_PAGINA;
  const datosPagina = datosFiltrados.slice(inicio, fin);

  let html = "";
  datosPagina.forEach(d => {
    html += `
      <tr>
        <td>${d.municipio}</td>
        <td>${d.cups_codigo}</td>
        <td>${d.cups_direccion}</td>
        <td>${d.fecha}</td>
        <td>${d.consumo != null ? d.consumo.toFixed(2) : "Desconocido"}</td>
      </tr>`;
  });

  tbody.innerHTML = html;
  renderPaginacion(datosFiltrados.length);
}
function esFechaParcialValida(fecha) {
  return /^\d{4}(-\d{2}){0,2}$/.test(fecha);
}

function coincideFechaParcial(fechaDato, fechaFiltro) {
  return fechaDato.startsWith(fechaFiltro);
}
