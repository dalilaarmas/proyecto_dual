# 💡 Consumo Energético del Cabildo de Tenerife

Aplicación web informativa que permite visualizar el consumo energético de los edificios del Cabildo de Tenerife. Los usuarios pueden consultar datos históricos, aplicar filtros y obtener estadísticas relevantes para la gestión energética.

📊 **Fuente de datos oficial**:  
https://datos.tenerife.es/es/datos/conjuntos-de-datos/consumo-energetico-del-cabildo-de-tenerife

---

## ⚙️ Funcionalidades implementadas

- Visualización de consumo energético por año, mes y día.
- Tabla interactiva con filtros por municipio, CUPS, dirección, fecha exacta y consumo mínimo.
- Gráficos dinámicos generados con Chart.js.
- Paginación personalizada con buscador de página.
- Resúmenes automáticos: día/año/mes con mayor y menor consumo.
- Carga de datos dinámica desde archivos JSON públicos en GitHub.
- Interfaz responsive con Bootstrap 5.
- Aplicación 100% cliente: no requiere instalación ni backend.

---

## 🚧 Funcionalidades en desarrollo

- 🖨️ **Impresión personalizada** del contenido mostrado (tabla, gráficos y resumen).
- 📱 **Mejor adaptación a dispositivos móviles** (optimizaciones de diseño y comportamiento).
- 🔢 **Filtros por rangos**:
  - **Consumo (kWh)**: selección de mínimo y máximo.
  - **Fecha**: filtro por rango de fechas (inicio/fin), no solo fecha exacta.

---

### ▶️ Uso de la aplicación

Este proyecto **no requiere instalación ni servidor local**. Puedes usarlo de dos formas:

1. **Desde GitHub Pages (recomendado)**  
   Puedes acceder directamente a la versión publicada online desde la rama de desarrollo:  
   🔗 [https://dalilaarmas.github.io/proyecto_dual/](https://dalilaarmas.github.io/proyecto_dual/)

2. **Desde tu ordenador (modo local)**  
   También puedes ejecutar la aplicación en local **sin necesidad de instalar nada** ni configurar un servidor web.  
   Para ello, debes seguir estos pasos:

   - Descarga el repositorio completo (no solo el archivo `index.html`), ya que el proyecto utiliza rutas relativas para acceder a scripts, hojas de estilo e imágenes dentro de la carpeta `resources/`.
   - Abre el archivo `index.html` haciendo doble clic desde el explorador de archivos de tu sistema operativo.
   - La aplicación funcionará correctamente si mantienes la estructura de carpetas original del proyecto.

   **No necesitas tener los archivos `.json` descargados localmente.**  
   Los datos se cargan automáticamente desde enlaces públicos de GitHub mediante `fetch()`, por lo que **es imprescindible tener conexión a internet** para que la aplicación funcione correctamente.

> ⚠️ Si solo descargas el archivo `index.html` sin las carpetas `resources/js` y `resources/css`, la aplicación no se mostrará correctamente porque no encontrará los archivos necesarios.  
>
> ⚠️ Si haces clic sobre `index.html` desde el navegador en GitHub, solo verás el código fuente, no la página web en funcionamiento.


---

## 🛠️ Tecnologías utilizadas

- **HTML5, CSS3 y JavaScript** – Estructura, estilos y lógica.
- **Bootstrap 5** – Diseño responsive y componentes visuales.
- **Bootstrap Icons** – Iconos vectoriales en la interfaz.
- **Chart.js** – Visualización gráfica de datos.
- **jQuery** – Gestión de eventos y manipulación del DOM.
- **Fetch API** – Carga dinámica de archivos JSON desde GitHub.

---

## 📁 Estructura del proyecto

/resources

├── /js → Scripts de filtrado, renderizado, gráficos y paginación

├── /css → Estilos personalizados sobre Bootstrap

├── /json → Archivos JSON con datos de consumo energético

└── /imagenes/diagramas → Diagramas UML explicativos

index.html → Página principal de la aplicación
README.md → Documentación del proyecto


---

## 🧩 Diagramas UML

Para entender el diseño y funcionamiento del sistema, se incluyen los siguientes diagramas:

### 🧱 Diagrama de Clases
Representa las estructuras de datos utilizadas (consumo, registros, atributos clave).

![Clases](resources/imagenes/diagramas/diagrama_de_clases_v2.png)

### 🔁 Diagramas de Secuencia
Explican el flujo de interacción entre los componentes:

- **Con filtros:**  
  ![Con filtros](resources/imagenes/diagramas/diagrama_comportamiento_secuencial_filtros.png)

- **Sin filtros:**  
  ![Sin filtros](resources/imagenes/diagramas/diagrama_comportamiento_secuencial_sin_filtrar.png)

### 🔄 Diagrama de Actividad
Muestra el flujo lógico general de funcionamiento de la aplicación:

![Actividad](resources/imagenes/diagramas/diagrama_comportamiento_actividad.drawio.png)
