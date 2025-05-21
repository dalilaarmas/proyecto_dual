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

## ▶️ Cómo ejecutar el proyecto

Este proyecto no requiere instalación ni servidor local. Para utilizar la aplicación:

1. Abre directamente el archivo `index.html` en cualquier navegador moderno (Chrome, Firefox, Edge, etc.).
2. La aplicación cargará automáticamente los datos energéticos desde archivos JSON públicos alojados en GitHub mediante `fetch()`.

> ⚠️ Es necesario tener conexión a internet para que los datos se carguen correctamente.

Si deseas **consultar el código fuente, modificar archivos o acceder a los diagramas y documentación**, puedes clonar o descargar este repositorio desde GitHub.

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
