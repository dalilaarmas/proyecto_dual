# Consumo Energético del Cabildo de Tenerife
#### Aplicación web informativa que permite visualizar los datos de consumo energético de los edificios del Cabildo de Tenerife, permitiendo a los usuarios consultar datos históricos y estadísticas relevantes para la gestión energética.

##### Los datos son extraídos del siguiente enlace:
https://datos.tenerife.es/es/datos/conjuntos-de-datos/consumo-energetico-del-cabildo-de-tenerife

## Características

- Visualización de consumo energético por periodos
- Tablas ordenables y buscables con datos actualizados
- Gráficos dinámicos con estadísticas relevantes
- Filtros interactivos para refinar la información mostrada
- Filtrado por rango de fechas y consumo
- Exportación de informes en PDF e impresión.

## Tecnologías utilizadas

Este proyecto está desarrollado con las siguientes tecnologías y herramientas:

- **HTML5, CSS3 y JavaScript**: Estructura, estilos y lógica principal de la aplicación.
- **Bootstrap 5**: Framework para diseño responsive y componentes visuales.
- **Bootstrap Icons**: Conjunto de iconos vectoriales utilizados en la interfaz.
- **jQuery**: Librería para simplificar la manipulación del DOM y los eventos.
- **DataTables**: Plugin para enriquecer tablas con búsqueda, ordenación y paginación.
- **Chart.js**: Librería para representar gráficamente los datos energéticos.
- **Ficheros JSON alojados en GitHub**: Los datos del consumo energético se cargan dinámicamente mediante `fetch()` desde archivos `.json` públicos alojados en el repositorio.

## Cómo ejecutar el proyecto
No se requiere instalación ni servidor local.
Para utilizar la aplicación:

1. Descarga o clona este repositorio si quieres usarlo localmente.
2. Abre el archivo `index.html` en cualquier navegador web moderno (por ejemplo, Chrome, Firefox o Edge).
3. La aplicación cargará automáticamente los datos desde archivos `.json` alojados en GitHub a través de `fetch()`.

> ⚠️ Es imprescindible tener conexión a internet para que los datos se carguen correctamente desde GitHub.



## Estructura del proyecto

- **/resources**:  Carpeta principal que agrupa todos los recursos utilizados en el proyecto.
  - **/js**: Scripts JavaScript que manejan la lógica del filtrado, las gráficas y la interacción con el usuario.
  - **/css**: Hojas de estilo personalizadas que complementan Bootstrap para dar formato al sitio web.
  - **/json**: Archivos de datos en formato JSON con la información del consumo energético, cargados desde GitHub.
  - **/imagenes/diagramas**: Imágenes utilizadas en el sitio, como diagramas explicativos o ilustraciones del funcionamiento.

- **index.html**: Punto de entrada de la aplicación web. Contiene la estructura básica del HTML y referencias a scripts, estilos y componentes visuales.

- **README.md**: Documentación del proyecto: explica su objetivo, tecnologías, estructura, cómo usarlo y otra información relevante.



## 7. Diagramas explicativos

Para facilitar la comprensión del diseño y funcionamiento de la aplicación, se incluyen los siguientes diagramas UML:

- **Diagrama de Clases**  
  Muestra las principales clases, sus atributos y métodos, y cómo se relacionan entre ellas.

![Diagrama de Clases](resources/imagenes/diagramas/diagrama_de_clases_v2.png)  

- **Diagrama de Secuencia**  
  Describe la interacción entre objetos durante la ejecución de procesos clave, como la carga y filtrado de datos.

`Diagrama de Secuencia con filtros:`

![Diagrama de Secuencia con filtros](resources/imagenes/diagramas/diagrama_comportamiento_secuencial_filtros.png)  

`Diagrama de Secuencia sin filtros:`

![Diagrama de Secuencia sin filtros](resources/imagenes/diagramas/diagrama_comportamiento_secuencial_sin_filtrar.png) 

- **Diagrama de Actividad**  
  Representa el flujo de actividades y decisiones dentro del sistema para mostrar el proceso lógico general.


![Diagrama de Actividad](resources/imagenes/diagramas/diagrama_comportamiento_actividad.drawio.png)
