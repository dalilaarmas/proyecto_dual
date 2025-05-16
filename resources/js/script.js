
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

  mostrarErrorBootstrap("Error global detectado", detalle);

  return true; // Evita que el error se propague al navegador
};

let datosFiltrados = [];
let graficoConsumo;
const MIN_CARACTERES_FILTRO = 3; // Mínimo de caracteres para activar filtro en texto

//Función para que el filtro se active solo cuando el filtro tiene igual o más caracteres que el mínimo.
//Si el filtro está vacío (longitud 0) también se permite mostrar todo
function filtraTexto(datoValor, filtroValor) {
  if(filtroValor.length === 0 || (filtroValor.length >= MIN_CARACTERES_FILTRO && datoValor.toLowerCase().includes(filtroValor.toLowerCase())))
    {
      return true;
    } 
  else{
    const mensajeNoResultados = document.getElementById("mensajeNoResultados");
    if (filtroValor.length < MIN_CARACTERES_FILTRO) {
      mensajeNoResultados.innerHTML = `Necesita mínimo <strong>${MIN_CARACTERES_FILTRO}</strong> caracteres para filtrar.`;
      mensajeNoResultados.classList.remove("d-none"); // mostrar mensaje
    } else if (datosFiltrados.length === 0) {
      mensajeNoResultados.textContent = "No se encontraron registros con los filtros aplicados.";
      mensajeNoResultados.classList.remove("d-none"); // mostrar mensaje
    } else {
      mensajeNoResultados.classList.add("d-none"); // ocultar mensaje
    }
    return false;
  }
}

// Espera a que todo el DOM esté cargado antes de ejecutar el script
document.addEventListener("DOMContentLoaded", function () {
  // Referencias a los campos de filtro del formulario
  const filtroAño = document.getElementById("filtro-año");
  const filtroMunicipio = document.getElementById("filtro-municipio");
  const filtroCups = document.getElementById("filtro-cups");
  const filtroDireccion = document.getElementById("filtro-direccion");
  const filtroConsumo = document.getElementById("filtro-consumo");
  const filtroFecha = document.getElementById("filtro-fecha");

  // Archivos JSON con datos energéticos por año, que serán cargados y procesados
  const archivos = [
    "resources/json/consumo-energetico-2022.json",
    "resources/json/consumo-energetico-2023.json",
    "resources/json/consumo-energetico-2024.json",
    "resources/json/consumo-energetico-2025.json"
  ];

  // Parámetros para paginación manual
  const REGISTROS_POR_CARGA = 20; // Cantidad de registros que se cargan por vez
  let paginaActual = 1;            
  let cargando = false;            // Flag para evitar múltiples cargas simultáneas
  

  // Arrays para almacenar todos los datos y los datos filtrados
  let todosLosDatos = [];
  let tabla;

  // Función que genera un resumen estadístico y visual de los datos filtrados. 
  // Si no hay datos filtrados, muestra mensaje informativo
  function generarResumenConsumo() {
    const contenedor = document.getElementById("resumen-consumo");
    if (!contenedor) return;
   
    // Si no hay datos filtrados, muestra una alerta Bootstrap informativa
    if (!datosFiltrados || datosFiltrados.length === 0) {
      contenedor.innerHTML = `<div class="alert alert-warning">No hay datos para mostrar en el resumen.</div>`;
      return;
    }
  
    // Objeto para almacenar resumen estructurado: totales por año, meses y días
    const resumen = {};
    const diasTotales = []; // Array con cada día y su consumo para análisis global
   
   // Variables para tracking de día mayor y menor consumo global
    let diaMayorConsumo = { fecha: "", consumo: -Infinity };
    let diaMenorConsumo = { fecha: "", consumo: Infinity };
  
    datosFiltrados.forEach(dato => {
      // Validación básica para fecha válida
      if (!dato.fecha || typeof dato.fecha !== "string" || dato.fecha.length < 10) return;
  
      // Extrae año y mes en formato "YYYY" y "YYYY-MM"
      const año = dato.fecha.slice(0, 4);
      const mes = dato.fecha.slice(0, 7); // "YYYY-MM"
  
      if (dato.consumo != null) {
        // Guarda cada día con consumo para uso posterior en top3
        diasTotales.push({ fecha: dato.fecha, consumo: dato.consumo });
  
        // Actualiza día de menor consumo siempre que sea mayor a cero y menor que el actual mínimo
        if (dato.consumo < diaMenorConsumo.consumo && dato.consumo > 0) {
          diaMenorConsumo = { fecha: dato.fecha, consumo: dato.consumo };
        }
        // Actualiza día de mayor consumo
        if (dato.consumo > diaMayorConsumo.consumo) {
          diaMayorConsumo = { fecha: dato.fecha, consumo: dato.consumo };
        }
      }
  
      // Inicializa estructura del resumen para cada año, si no existe
      if (!resumen[año]) resumen[año] = { total: 0, meses: {}, dias: {} };
  
      // Acumula consumo total por año
      resumen[año].total += dato.consumo;
  
      // Acumula consumo por mes y día
      resumen[año].meses[mes] = (resumen[año].meses[mes] || 0) + dato.consumo;
      resumen[año].dias[dato.fecha] = (resumen[año].dias[dato.fecha] || 0) + dato.consumo;
    });
  
    // Lista ordenada de años para análisis
    const años = Object.keys(resumen).sort();
  
     // Variables para año mayor y menor consumo
    let añoMayor = "", consumoMayor = -Infinity;
    let añoMenor = "", consumoMenor = Infinity;
  
    // Determina el año con mayor y menor consumo total
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
  
   // Encuentra el mes global con menor consumo en todos los años
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
  
    // Top 3 días globales de mayor y menor consumo (mayor que 0)
    const top3DiasGlobalMayor = diasTotales
      .sort((a, b) => b.consumo - a.consumo)
      .slice(0, 3);
  
    const top3DiasGlobalMenor = diasTotales
      .filter(d => d.consumo > 0)
      .sort((a, b) => a.consumo - b.consumo)
      .slice(0, 3);
  
    // Top 3 mensual por año: mayor y menor consumo (mayor que 0)
    const top3MensualPorAñoMayor = {};
    const top3MensualPorAñoMenor = {};
    años.forEach(año => {
      top3MensualPorAñoMayor[año] = {};
      top3MensualPorAñoMenor[año] = {};
      
      // Agrupa días por mes para cada año
      const diasPorMes = {};
      Object.entries(resumen[año].dias).forEach(([fecha, consumo]) => {
        if (consumo <= 0) return;
        const mes = fecha.slice(0, 7);
        if (!diasPorMes[mes]) diasPorMes[mes] = [];
        diasPorMes[mes].push({ fecha, consumo });
      });
  
      // Para cada mes en el año, calcula top 3 días mayor y menor consumo
      Object.entries(diasPorMes).forEach(([mes, dias]) => {
        dias.sort((a, b) => b.consumo - a.consumo);
        top3MensualPorAñoMayor[año][mes] = dias.slice(0, 3);
        // Para menor consumo (mayor que 0)
        const diasMenor = dias.slice().sort((a,b) => a.consumo - b.consumo).slice(0, 3);
        top3MensualPorAñoMenor[año][mes] = diasMenor;
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
  

  // Botón para mostrar/ocultar el panel de filtros en móviles
  const toggleBtn = document.getElementById("toggle-filtros");
  const sidebar = document.getElementById("sidebar-filtros");
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("show");
  });
  document.getElementById("btn-cargar-mas").addEventListener("click", () => {
    cargarMasDatos();
  });
  
  function actualizarResumenRegistros() {
    const resumen = document.getElementById("resumen-registros");
    resumen.textContent = `Mostrando ${datosFiltrados.length} de ${todosLosDatos.length} registros.`;
  }
  // Carga los datos de todos los archivos JSON y construye la tabla
  async function cargarYMostrarDatos() {
    todosLosDatos = []; // Vacía el array en caso de recarga
    const contenedor = document.getElementById("datos-container");

    // Estructura HTML de la tabla
    contenedor.innerHTML = `
      <table id="tabla-consumo" class="table table-hover table-striped table-bordered">
        <thead class="table-dark">
          <tr>
            <th>Municipio</th>
            <th>CUPS</th>
            <th>Dirección</th>
            <th>Fecha</th>
            <th>Consumo (kWh)</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `;

    // Inicializa DataTable sin paginación ni búsqueda
    tabla = $("#tabla-consumo").DataTable({
      paging: false,
      searching: false,
      info: false
    });
    const mensajeError = document.getElementById("mensajeError");

    // Limpiar mensajes de error anteriores
    limpiarErroresBootstrap();
   
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
                  consumo: typeof consumo.consumo === "number" ? consumo.consumo : null,
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

    aplicarFiltros();     // Aplica filtros por defecto (ninguno activo)
    cargarMasDatos();
    actualizarResumenRegistros();   // Muestra la primera página de resultados
  }

  // Filtra los datos según los valores introducidos en los campos
  function aplicarFiltros() {
    const añoSeleccionado = filtroAño.value;
    const municipioSeleccionado = filtroMunicipio.value.toLowerCase();
    const cupsSeleccionado = filtroCups.value.toLowerCase();
    const direccionSeleccionada = filtroDireccion.value.toLowerCase();
    const consumoSeleccionado = parseFloat(filtroConsumo.value);
    const fechaSeleccionada = filtroFecha.value;

    datosFiltrados = todosLosDatos.filter(dato => {
      return (
        (!añoSeleccionado || dato.año === añoSeleccionado) &&
        filtraTexto(dato.municipio, municipioSeleccionado) &&
        filtraTexto(dato.cups_codigo, cupsSeleccionado) &&
        filtraTexto(dato.cups_direccion, direccionSeleccionada) &&
        (isNaN(consumoSeleccionado) || (typeof dato.consumo === "number" && dato.consumo >= consumoSeleccionado)) &&
        (!fechaSeleccionada || dato.fecha === fechaSeleccionada)
      );
    });

    
    
    


    if (datosFiltrados.length === 0) {
      mensajeNoResultados.classList.remove("d-none");
    } else {
      mensajeNoResultados.classList.add("d-none");
    }

    actualizarResumenRegistros();
    generarResumenConsumo();
    const canvas = document.getElementById("miGrafico");
  if (canvas) {
    actualizarGrafico(datosFiltrados);
  }
  paginaActual = 1;
  tabla.clear().draw(); // Limpia la tabla para nueva paginación
  cargarMasDatos();     // Vuelve a cargar la primera "página" de resultados
  
  // Mostrar u ocultar el botón según los datos filtrados
  const btnCargarMas = document.getElementById("btn-cargar-mas");
  if (btnCargarMas) {
    if (REGISTROS_POR_CARGA < datosFiltrados.length) {
      btnCargarMas.style.display = "inline-block";
    } else {
      btnCargarMas.style.display = "none";
    }
  }
    // Sube al inicio de la página tras aplicar los filtros
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Añade más registros filtrados a la tabla (modo paginado manual)
  function cargarMasDatos() {
    if (cargando) return;
    cargando = true;

    const inicio = (paginaActual - 1) * REGISTROS_POR_CARGA;
    const fin = paginaActual * REGISTROS_POR_CARGA;
    const datosPagina = datosFiltrados.slice(inicio, fin);

    datosPagina.forEach(dato => {
      tabla.row.add([
        dato.municipio || "Desconocido",
        dato.cups_codigo || "Desconocido",
        dato.cups_direccion || "Desconocida",
        dato.fecha || "Desconocida",
        dato.consumo || "Desconocido"
      ]).draw(false);
    });

    paginaActual++;
    cargando = false;

    // Ocultar el botón si ya se cargó todo
  const btn = document.getElementById("btn-cargar-mas");
  if (btn && paginaActual * REGISTROS_POR_CARGA >= datosFiltrados.length) {
    btn.style.display = "none";
  }
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
    tabla.clear().draw();
  }
  
  
  // Añade eventos a los campos de filtro para actualizar los resultados al escribir o cambiar valores
  [filtroAño, filtroMunicipio, filtroCups, filtroDireccion, filtroConsumo, filtroFecha].forEach(el => {
    el.addEventListener("input", () => {
      reiniciarPaginacion();
      aplicarFiltros();
      cargarMasDatos();
    });
    
    
  });
  // Evento para botón cerrar error
  const btnCerrarError = document.getElementById("cerrarError");
  if (btnCerrarError) {
    btnCerrarError.addEventListener("click", () => {
      limpiarErroresBootstrap();
    });
  }
  // Comienza la carga de datos al cargar la página
  cargarYMostrarDatos();



});

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
  const ctx = document.getElementById("miGrafico").getContext("2d");

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
