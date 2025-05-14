
document.addEventListener("DOMContentLoaded", function () {

  const REGISTROS_POR_CARGA = 20;
  let paginaActual = 1;
  let cargando = false;
  let todosLosDatos = [];      // Contiene todos los registros extraídos de los archivos JSON
  let datosFiltrados = [];     // Contiene los registros tras aplicar los filtros
  let tabla;

  // Rutas de los archivos JSON a cargar, correspondientes a distintos años
  const archivos = [
    "../json/consumo-energetico-2022.json",
    "../json/consumo-energetico-2023.json",
    "../json/consumo-energetico-2024.json",
    "../json/consumo-energetico-2025.json"
  ];

  // Referencias a los elementos del DOM que actúan como filtros
  const filtroAño = document.getElementById("filtro-año");
  const filtroMunicipio = document.getElementById("filtro-municipio");
  const filtroCups = document.getElementById("filtro-cups");
  const filtroDireccion = document.getElementById("filtro-direccion");
  const filtroConsumo = document.getElementById("filtro-consumo");
  const filtroFecha = document.getElementById("filtro-fecha");

  // Carga los datos desde los archivos JSON y los muestra en la tabla
  async function cargarYMostrarDatos() {
    todosLosDatos = [];
    const contenedor = document.getElementById("datos-container");
    contenedor.innerHTML = "";

    // Se genera la estructura HTML de la tabla donde se insertarán los datos
    let tablaHTML = `
      <table id="tabla-consumo" class="display">
        <thead>
          <tr>
            <th>Municipio</th>
            <th>CUPS</th>
            <th>Dirección</th>
            <th>Fecha</th>
            <th>Consumo (kWh)</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </table>
    `;
    contenedor.innerHTML = tablaHTML;

    // Inicializa DataTable desactivando la paginación automática
    tabla = $('#tabla-consumo').DataTable({
      paging: false,
      searching: false,
      info: false
    });

    // Carga los archivos de forma secuencial y extrae los datos relevantes de cada uno
    for (const archivo of archivos) {
      try {
        const data = await cargarJSON(archivo);
        data.municipios.forEach(municipio => {
          municipio.cups.forEach(cups => {
            if (Array.isArray(cups.consumos)) {
              cups.consumos.forEach(consumo => {
                // Se crea un objeto por cada entrada de consumo para un CUPS concreto
                todosLosDatos.push({
                  municipio: municipio.cups_municipio,
                  cups_codigo: cups.cups_codigo,
                  cups_direccion: cups.cups_direccion,
                  fecha: consumo.fecha,
                  consumo: consumo.consumo,
                  año: consumo.fecha.split("-")[0], // Se extrae el año de la fecha
                });
              });
            }
          });
        });
      } catch (err) {
        console.error(`Error cargando el archivo ${archivo}:`, err);
      }
    }

    aplicarFiltros();      // Se aplican filtros por defecto (sin criterios aún)
    cargarMasDatos();      // Carga inicial de datos
    actualizarOpcionesFiltro();  // Llena las listas desplegables con las opciones únicas
  }

  // Filtra los datos según los criterios indicados en los campos del formulario
  function aplicarFiltros() {
    const añoSeleccionado = filtroAño.value;
    const municipioSeleccionado = filtroMunicipio.value.toLowerCase();
    const cupsSeleccionado = filtroCups.value.toLowerCase();
    const direccionSeleccionada = filtroDireccion.value.toLowerCase();
    const consumoSeleccionado = parseFloat(filtroConsumo.value);
    const fechaSeleccionada = filtroFecha.value;

    datosFiltrados = todosLosDatos.filter(dato => {
      const cumpleAño = añoSeleccionado ? dato.año === añoSeleccionado : true;
      const cumpleMunicipio = municipioSeleccionado ? dato.municipio.toLowerCase().includes(municipioSeleccionado) : true;
      const cumpleCups = cupsSeleccionado ? dato.cups_codigo.toLowerCase().includes(cupsSeleccionado) : true;
      const cumpleDireccion = direccionSeleccionada ? dato.cups_direccion.toLowerCase().includes(direccionSeleccionada) : true;
      const cumpleConsumo = !isNaN(consumoSeleccionado) ? dato.consumo >= consumoSeleccionado : true;
      const cumpleFecha = fechaSeleccionada ? dato.fecha === fechaSeleccionada : true;
      return cumpleAño && cumpleMunicipio && cumpleCups && cumpleDireccion && cumpleConsumo && cumpleFecha;
    });

    // Se desplaza la vista hacia arriba tras aplicar los filtros
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Carga la siguiente página de datos filtrados en la tabla
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
      ]).draw();
    });

    paginaActual++;
    cargando = false;

    // Se desactiva el scroll infinito si no quedan más páginas que cargar
    if (paginaActual > Math.ceil(datosFiltrados.length / REGISTROS_POR_CARGA)) {
      window.removeEventListener("scroll", cargarMasDatos);
    }
  }

  // Función auxiliar para cargar un archivo JSON mediante fetch
  function cargarJSON(url) {
    return fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error("Error al cargar el archivo");
        }
        return response.json();
      });
  }

  // Extrae los valores únicos de los datos filtrados y los usa para actualizar los filtros select
  function actualizarOpcionesFiltro() {
    const municipios = [...new Set(datosFiltrados.map(dato => dato.municipio))];
    const cups = [...new Set(datosFiltrados.map(dato => dato.cups_codigo))];
    const direcciones = [...new Set(datosFiltrados.map(dato => dato.cups_direccion))];
    const años = [...new Set(datosFiltrados.map(dato => dato.año))];
    const fechas = [...new Set(datosFiltrados.map(dato => dato.fecha))];

    actualizarFiltro(filtroMunicipio, municipios);
    actualizarFiltro(filtroCups, cups);
    actualizarFiltro(filtroDireccion, direcciones);
    actualizarFiltro(filtroAño, años);
    actualizarFiltro(filtroFecha, fechas);
  }

  // Rellena un filtro <select> con las opciones proporcionadas
  function actualizarFiltro(filtro, opciones) {
    filtro.innerHTML = '';

    // En el caso del filtro de año, se añade la opción para ver todos los años
    if (filtro === filtroAño) {
      const optionTodos = document.createElement("option");
      optionTodos.value = "";
      optionTodos.textContent = "Todos los años";
      filtro.appendChild(optionTodos);
    }

    opciones.forEach(opcion => {
      const option = document.createElement("option");
      option.value = opcion;
      option.textContent = opcion;
      filtro.appendChild(option);
    });
  }

  // Reinicia la paginación y limpia la tabla para mostrar nuevos resultados
  function reiniciarPaginacion() {
    paginaActual = 1;
    const tabla = $('#tabla-consumo').DataTable();
    tabla.clear().draw();
  }

  // Asociar eventos a los filtros para que apliquen cambios en tiempo real
  filtroAño.addEventListener("change", function () {
    reiniciarPaginacion();
    aplicarFiltros();
    cargarMasDatos();
  });

  filtroMunicipio.addEventListener("input", function () {
    reiniciarPaginacion();
    aplicarFiltros();
    cargarMasDatos();
  });

  filtroCups.addEventListener("input", function () {
    reiniciarPaginacion();
    aplicarFiltros();
    cargarMasDatos();
  });

  filtroDireccion.addEventListener("input", function () {
    reiniciarPaginacion();
    aplicarFiltros();
    cargarMasDatos();
  });

  filtroConsumo.addEventListener("input", function () {
    reiniciarPaginacion();
    aplicarFiltros();
    cargarMasDatos();
  });

  filtroFecha.addEventListener("input", function () {
    reiniciarPaginacion();
    aplicarFiltros();
    cargarMasDatos();
  });

  // Implementación de scroll infinito: carga más datos al llegar al final de la página
  window.addEventListener("scroll", function () {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
      cargarMasDatos();
    }
  });

  // Punto de entrada: inicia la carga y visualización de datos
  cargarYMostrarDatos();
});
