function mostrarErrorBootstrap(mensaje, detalle = "") {
  const mensajeError = document.getElementById("mensajeError");
  const contenidoError = document.getElementById("contenidoError");
  const detallesError = document.getElementById("detallesError");
  const btnToggleDetalles = document.getElementById("btnToggleDetalles");

  if (!mensajeError || !contenidoError || !detallesError || !btnToggleDetalles) {
    console.error("No se encontró el contenedor de errores en el DOM");
    alert(mensaje + "\n" + detalle); // fallback básico
    return;
  }

  contenidoError.textContent = mensaje;
  detallesError.textContent = detalle;
  detallesError.style.display = "none";
  btnToggleDetalles.textContent = "Ver detalles";

  mensajeError.classList.remove("d-none");
  mensajeError.classList.add("show");

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

// Captura errores globales, incluidos errores de sintaxis
window.onerror = function (message, source, lineno, colno, error) {
  mostrarErrorBootstrap(
    "Error global detectado",
    `${message} en ${source}:${lineno}:${colno}`
  );
  return true; // Evita que el error se propague al navegador
};

const MIN_CARACTERES_FILTRO = 3; // Cambia este valor según tus necesidades
//filtrar a partir de un número de caracteres determinado MIN_CARACTERES_FILTRO
function filtraTexto(datoValor, filtroValor) {
  return filtroValor.length < MIN_CARACTERES_FILTRO || datoValor.toLowerCase().includes(filtroValor);
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

  // Rutas de los archivos JSON que contienen los datos por año
  const archivos = [
    "resources/json/consumo-energetico-2022.json",
    "resources/json/consumo-energetico-2023.json",
    "resources/json/consumo-energetico-2024.json",
    "resources/json/consumo-energetico-2025.json"
  ];

  // Configuración para carga paginada de registros
  const REGISTROS_POR_CARGA = 20;
  let paginaActual = 1;
  let cargando = false;

  // Arrays para almacenar todos los datos y los datos filtrados
  let todosLosDatos = [];
  let datosFiltrados = [];
  let tabla;

  function generarResumenConsumo() {
    const contenedor = document.getElementById("resumen-consumo");
    if (!contenedor) return;
  
    if (!datosFiltrados || datosFiltrados.length === 0) {
      contenedor.innerHTML = `<div class="alert alert-warning">No hay datos para mostrar en el resumen.</div>`;
      return;
    }
  
    const resumen = {};
    const diasTotales = [];
    let diaMayorConsumo = { fecha: "", consumo: -Infinity };
    let diaMenorConsumo = { fecha: "", consumo: Infinity };
  
    datosFiltrados.forEach(dato => {
      if (!dato.fecha || typeof dato.fecha !== "string" || dato.fecha.length < 10) return;
  
      const año = dato.fecha.slice(0, 4);
      const mes = dato.fecha.slice(0, 7); // "YYYY-MM"
  
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
  
    // Determinar año y mes de mayor y menor consumo anual
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
  
    // Mes menor consumo global
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
  
    // Top 3 global mayor y menor (mayor que 0)
    const top3DiasGlobalMayor = diasTotales
      .sort((a, b) => b.consumo - a.consumo)
      .slice(0, 3);
  
    const top3DiasGlobalMenor = diasTotales
      .filter(d => d.consumo > 0)
      .sort((a, b) => a.consumo - b.consumo)
      .slice(0, 3);
  
    // Top 3 mensual por año y mes
    const top3MensualPorAño = {};
    años.forEach(año => {
      top3MensualPorAño[año] = {};
      const diasPorMes = {};
      Object.entries(resumen[año].dias).forEach(([fecha, consumo]) => {
        if (consumo <= 0) return;
        const mes = fecha.slice(0, 7);
        if (!diasPorMes[mes]) diasPorMes[mes] = [];
        diasPorMes[mes].push({ fecha, consumo });
      });
  
      Object.entries(diasPorMes).forEach(([mes, dias]) => {
        dias.sort((a, b) => b.consumo - a.consumo);
        top3MensualPorAño[año][mes] = dias.slice(0, 3);
      });
    });
  
    // Construcción HTML con Bootstrap
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
  
    años.forEach((año, i) => {
      const meses = Object.keys(top3MensualPorAño[año] || {}).sort();
      const mesesHtml = meses.length === 0 
        ? `<p class="text-muted fst-italic">No hay datos mensuales para este año.</p>` 
        : meses.map(mes => {
            const mesId = `collapseMes${i}${mes.replace(/-/g, '')}`;
            const fechaFormateada = new Date(mes + "-01").toLocaleString('es-ES', { month: 'long', year: 'numeric' });
            return `
              <div class="card mb-2">
                <div class="card-header p-2" id="heading${mesId}">
                  <h6 class="mb-0">
                    <button class="btn btn-link text-decoration-none" type="button" data-bs-toggle="collapse" data-bs-target="#${mesId}" aria-expanded="false" aria-controls="${mesId}">
                      ${fechaFormateada}
                    </button>
                  </h6>
                </div>
                <div id="${mesId}" class="collapse" aria-labelledby="heading${mesId}" data-bs-parent="#collapse${i}">
                  <div class="card-body p-3">
                    <ol>
                      ${top3MensualPorAño[año][mes].map(d => `<li>${d.fecha}: <span class="fw-bold">${d.consumo.toFixed(2)} kWh</span></li>`).join('')}
                    </ol>
                  </div>
                </div>
              </div>
            `;
          }).join('');
  
      const mesesAccordionId = `collapse${i}`;
  
      // Datos del año para mostrar debajo
      const mesesTotales = resumen[año].meses;
      const diasTotalesAño = resumen[año].dias;
  
      // Mes de mayor consumo año
      let mesMayorConsumo = "", consumoMesMayor = -Infinity;
      for (const [mes, consumo] of Object.entries(mesesTotales)) {
        if (consumo > consumoMesMayor) {
          mesMayorConsumo = mes;
          consumoMesMayor = consumo;
        }
      }
  
      // Día mayor consumo año
      let diaMayorConsumoAño = "", consumoDiaMayor = -Infinity;
      for (const [fecha, consumo] of Object.entries(diasTotalesAño)) {
        if (consumo > consumoDiaMayor) {
          diaMayorConsumoAño = fecha;
          consumoDiaMayor = consumo;
        }
      }
  
      const promedioMensual = resumen[año].total / Object.keys(mesesTotales).length;
  
      html += `
        <div class="accordion-item shadow-sm mb-3">
          <h2 class="accordion-header" id="heading${i}">
            <button class="accordion-button collapsed bg-light" type="button" data-bs-toggle="collapse" data-bs-target="#${mesesAccordionId}" aria-expanded="false" aria-controls="${mesesAccordionId}">
              <strong>${año}</strong> - Top 3 mensual días con mayor consumo
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
      <table id="tabla-consumo" class="table table-striped table-bordered">
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

    const mensajeNoResultados = document.getElementById("mensajeNoResultados");

    if (datosFiltrados.length === 0) {
      mensajeNoResultados.classList.remove("d-none");
    } else {
      mensajeNoResultados.classList.add("d-none");
    }

    actualizarResumenRegistros();
    generarResumenConsumo();

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