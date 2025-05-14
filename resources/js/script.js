document.addEventListener("DOMContentLoaded", function () {
    const REGISTROS_POR_CARGA = 20;
    let paginaActual = 1;
    let cargando = false;
    let todosLosDatos = [];
    let datosFiltrados = [];
    let tabla;
  
    const archivos = [
      "resources/json/consumo-energetico-2022.json",
      "resources/json/consumo-energetico-2023.json",
      "resources/json/consumo-energetico-2024.json",
      "resources/json/consumo-energetico-2025.json"
    ];
  
    // Referencias a los filtros
    const filtroAño = document.getElementById("filtro-año");
    const filtroMunicipio = document.getElementById("filtro-municipio");
    const filtroCups = document.getElementById("filtro-cups");
    const filtroDireccion = document.getElementById("filtro-direccion");
    const filtroConsumo = document.getElementById("filtro-consumo");
    const filtroFecha = document.getElementById("filtro-fecha");
  
    async function cargarYMostrarDatos() {
      todosLosDatos = [];
      const contenedor = document.getElementById("datos-container");
      contenedor.innerHTML = "";
  
      let tablaHTML = `
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
      contenedor.innerHTML = tablaHTML;
  
      tabla = $('#tabla-consumo').DataTable({
        paging: false,
        searching: false,
        info: false
      });
  
      // Carga los datos de los archivos JSON
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
                    año: consumo.fecha.split("-")[0],
                  });
                });
              }
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
  
    // Función para aplicar los filtros
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
  
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  
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
  
      if (paginaActual > Math.ceil(datosFiltrados.length / REGISTROS_POR_CARGA)) {
        window.removeEventListener("scroll", cargarMasDatos);
      }
    }
  
    function cargarJSON(url) {
      return fetch(url)
        .then(response => response.json())
        .catch(err => console.error(`Error al cargar el archivo: ${err}`));
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
  
    // Asociar eventos a los filtros para aplicar los cambios en tiempo real
    filtroAño.addEventListener("change", () => { reiniciarPaginacion(); aplicarFiltros(); cargarMasDatos(); });
    filtroMunicipio.addEventListener("input", () => { reiniciarPaginacion(); aplicarFiltros(); cargarMasDatos(); });
    filtroCups.addEventListener("input", () => { reiniciarPaginacion(); aplicarFiltros(); cargarMasDatos(); });
    filtroDireccion.addEventListener("input", () => { reiniciarPaginacion(); aplicarFiltros(); cargarMasDatos(); });
    filtroConsumo.addEventListener("input", () => { reiniciarPaginacion(); aplicarFiltros(); cargarMasDatos(); });
    filtroFecha.addEventListener("input", () => { reiniciarPaginacion(); aplicarFiltros(); cargarMasDatos(); });
  
    // Reinicia la paginación cuando se aplican los filtros
    function reiniciarPaginacion() {
      paginaActual = 1;
      tabla.clear().draw();
    }
  
    // Iniciar carga de datos al cargar la página
    cargarYMostrarDatos();
});
