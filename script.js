
document.addEventListener("DOMContentLoaded", function () {

  const REGISTROS_POR_CARGA = 20;
  let paginaActual = 1;
  let cargando = false;
  let todosLosDatos = [];
  let datosFiltrados = [];

  const archivos = [
    "consumo-energetico-2022.json",
    "consumo-energetico-2023.json",
    "consumo-energetico-2024.json",
    "consumo-energetico-2025.json"
  ];

  const filtroAño = document.getElementById("filtro-año");
  const filtroMunicipio = document.getElementById("filtro-municipio");
  const filtroCups = document.getElementById("filtro-cups");
  const filtroDireccion = document.getElementById("filtro-direccion");
  const filtroConsumo = document.getElementById("filtro-consumo");
  const filtroFecha = document.getElementById("filtro-fecha");

  async function cargarYMostrarDatos() {
    const contenedor = document.getElementById("datos-container");
    contenedor.innerHTML = "";

    for (const archivo of archivos) {
      try {
        const data = await cargarJSON(archivo);
        data.municipios.forEach(municipio => {
          municipio.cups.forEach(cups => {
            cups.consumos.forEach(consumo => {
              todosLosDatos.push({
                municipio: municipio.cups_municipio,
                cups_codigo: cups.cups_codigo,
                cups_direccion: cups.cups_direccion,
                fecha: consumo.fecha,
                consumo: consumo.consumo,
                año: consumo.fecha.split("-")[0],
              });
            });
          });
        });
      } catch (err) {
        console.error(`Error cargando el archivo ${archivo}:`, err);
      }
    }

    aplicarFiltros();
    cargarMasDatos();
    actualizarOpcionesFiltro();
  }

  function aplicarFiltros() {
  const añoSeleccionado = filtroAño.value;
  const municipioSeleccionado = filtroMunicipio.value.toLowerCase();
  const cupsSeleccionado = filtroCups.value.toLowerCase();
  const direccionSeleccionada = filtroDireccion.value.toLowerCase();
  const consumoSeleccionado = parseFloat(filtroConsumo.value);  // <-- cambio aquí
  const fechaSeleccionada = filtroFecha.value;

  datosFiltrados = todosLosDatos.filter(dato => {
    const cumpleAño = añoSeleccionado ? dato.año === añoSeleccionado : true;
    const cumpleMunicipio = municipioSeleccionado ? dato.municipio.toLowerCase().includes(municipioSeleccionado) : true;
    const cumpleCups = cupsSeleccionado ? dato.cups_codigo.toLowerCase().includes(cupsSeleccionado) : true;
    const cumpleDireccion = direccionSeleccionada ? dato.cups_direccion.toLowerCase().includes(direccionSeleccionada) : true;
    const cumpleConsumo = !isNaN(consumoSeleccionado) ? dato.consumo >= consumoSeleccionado : true;  // <-- y aquí
    const cumpleFecha = fechaSeleccionada ? dato.fecha === fechaSeleccionada : true;

    return cumpleAño && cumpleMunicipio && cumpleCups && cumpleDireccion && cumpleConsumo && cumpleFecha;
  });
}


  function cargarMasDatos() {
    if (cargando) return;
    cargando = true;

    const contenedor = document.getElementById("datos-container");
    const inicio = (paginaActual - 1) * REGISTROS_POR_CARGA;
    const fin = paginaActual * REGISTROS_POR_CARGA;
    const datosPagina = datosFiltrados.slice(inicio, fin);

    datosPagina.forEach(dato => {
      const div = document.createElement("div");
      div.className = "dato";
      div.innerHTML = ` 
        <strong>Municipio:</strong> ${dato.municipio || "Desconocido"}<br>
        <strong>CUPS:</strong> ${dato.cups_codigo || "Desconocido"}<br>
        <strong>Dirección:</strong> ${dato.cups_direccion || "Desconocida"}<br>
        <strong>Fecha:</strong> ${dato.fecha || "Desconocida"}<br>
        <strong>Consumo:</strong> ${dato.consumo || "Desconocido"} kWh
      `;
      contenedor.appendChild(div);
    });

    paginaActual++;
    cargando = false;

    if (paginaActual > Math.ceil(datosFiltrados.length / REGISTROS_POR_CARGA)) {
      window.removeEventListener("scroll", cargarMasDatos);
    }
  }

  function cargarJSON(url) {
    return fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error("Error al cargar el archivo");
        }
        return response.json();
      });
  }

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

 function actualizarFiltro(filtro, opciones) {
  filtro.innerHTML = '';

  // Si es el filtro de año, añadimos la opción "Todos los años"
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


  // Evitar que la paginación se duplique al filtrar
  function reiniciarPaginacion() {
    paginaActual = 1;
    document.getElementById("datos-container").innerHTML = ""; // Limpiar contenedor
  }

  // Agregar eventos de filtros
  filtroAño.addEventListener("change", function() {
    reiniciarPaginacion();
    aplicarFiltros();
    cargarMasDatos();
  });

  filtroMunicipio.addEventListener("input", function() {
    reiniciarPaginacion();
    aplicarFiltros();
    cargarMasDatos();
  });

  filtroCups.addEventListener("input", function() {
    reiniciarPaginacion();
    aplicarFiltros();
    cargarMasDatos();
  });

  filtroDireccion.addEventListener("input", function() {
    reiniciarPaginacion();
    aplicarFiltros();
    cargarMasDatos();
  });

  filtroConsumo.addEventListener("input", function() {
    reiniciarPaginacion();
    aplicarFiltros();
    cargarMasDatos();
  });

  filtroFecha.addEventListener("input", function() {
    reiniciarPaginacion();
    aplicarFiltros();
    cargarMasDatos();
  });

  window.addEventListener("scroll", function () {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
      cargarMasDatos();
    }
  });

  cargarYMostrarDatos();
});
