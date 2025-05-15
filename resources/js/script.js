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
      contenedor.innerHTML = `<p>No hay datos para mostrar en el resumen.</p>`;
      return;
    }
  
    const resumen = {};
  
    datosFiltrados.forEach(dato => {
      const año = dato.fecha.split("-")[0];
      const mes = dato.fecha.slice(0, 7); // YYYY-MM
  
      if (!resumen[año]) resumen[año] = { total: 0, meses: {} };
      resumen[año].total += dato.consumo;
  
      if (!resumen[año].meses[mes]) resumen[año].meses[mes] = 0;
      resumen[año].meses[mes] += dato.consumo;
    });
  
    // Botones para mostrar/ocultar años y meses
    let html = `
      <div class="mb-3">
        <button id="btnToggleAños" class="btn btn-primary btn-sm me-2" onclick="toggleAños()">Mostrar consumo por años</button>
        <button id="btnToggleMeses" class="btn btn-secondary btn-sm" onclick="toggleMeses()">Mostrar consumo por meses</button>
      </div>
      <div id="resumen-años" style="display:none;">
        <h4>Resumen por años</h4>
        <ul>
    `;
  
    // Añadimos los totales por años (ocultos inicialmente)
    for (const año of Object.keys(resumen).sort()) {
      html += `<li>${año}: ${resumen[año].total.toFixed(2)} kWh</li>`;
    }
  
    html += `</ul></div>`;
  
    // Añadimos resumen por meses (oculto inicialmente)
    html += `<div id="resumen-meses" style="display:none;">
      <h4>Resumen por meses</h4>
    `;
  
    for (const año of Object.keys(resumen).sort()) {
      html += `<h5>${año}</h5><ul>`;
      const mesesOrdenados = Object.keys(resumen[año].meses).sort();
      mesesOrdenados.forEach(mes => {
        const fechaFormateada = new Date(mes + "-01").toLocaleString('es-ES', { month: 'long', year: 'numeric' });
        html += `<li>${fechaFormateada}: ${resumen[año].meses[mes].toFixed(2)} kWh</li>`;
      });
      html += `</ul>`;
    }
  
    html += `</div>`;
  
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
                  municipio: municipio.cups_municipio,
                  cups_codigo: cups.cups_codigo,
                  cups_direccion: cups.cups_direccion,
                  fecha: consumo.fecha,
                  consumo: consumo.consumo,
                  año: consumo.fecha.split("-")[0] // Extrae el año de la fecha
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
        (isNaN(consumoSeleccionado) || dato.consumo >= consumoSeleccionado) &&
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
    btn.textContent = "Ocultar años";
  } else {
    divAños.style.display = "none";
    btn.textContent = "Mostrar años";
  }
}

// Mostrar/ocultar resumen por meses
function toggleMeses() {
  const divMeses = document.getElementById("resumen-meses");
  const btn = document.getElementById("btnToggleMeses");
  if (!divMeses || !btn) return;

  if (divMeses.style.display === "none") {
    divMeses.style.display = "block";
    btn.textContent = "Ocultar meses";
  } else {
    divMeses.style.display = "none";
    btn.textContent = "Mostrar meses";
  }
}

