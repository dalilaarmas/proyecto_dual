# 💡 Consumo Energético del Cabildo de Tenerife

Aplicación web informativa que permite visualizar el consumo energético de los edificios del Cabildo de Tenerife. Los usuarios pueden consultar datos históricos, aplicar filtros y obtener estadísticas relevantes para la gestión energética.

📊 **Fuente de datos oficial**:  
https://datos.tenerife.es/es/datos/conjuntos-de-datos/consumo-energetico-del-cabildo-de-tenerife

---

## ⚙️ Funcionalidades implementadas

* Visualización del consumo energético por año, mes y día.
* Tabla interactiva con filtros combinables por municipio, CUPS*, dirección, fecha y consumo energético. 
* Filtro por consumo mínimo y/o máximo, sin necesidad de completar ambos campos.
* Filtro de fechas flexible: permite introducir solo el año, año y mes, o fecha completa.
* Tooltips informativos integrados en cada filtro, compatibles con dispositivos móviles.
* Gráficos dinámicos generados con Chart.js según los filtros aplicados.
* Paginación personalizada con selección directa de página.
* Resúmenes automáticos de consumo: día, mes y año con mayor y menor consumo.
* **CRUD completo:** creación, edición y eliminación de registros con modales Bootstrap
* Interfaz responsive adaptada con Bootstrap 5.
* Backend con **Node.js** + **Express** + **SQLite** para almacenamiento y gestión de datos.
* La web carga datos dinámicamente desde la base SQLite mediante API REST.
* 🖨️ **Impresión inteligente** de contenidos: permite imprimir todos los registros de la tabla según los filtros seleccionados. Si no se aplican filtros se pueden imprimir todos los registros por rangos para que no se bloquee el navegador.
* ⏳ Indicador de **carga inicial** mientras se procesan los archivos grandes (loading spinner)

🪧CUPS (Código Universal del Punto de Suministro): Identificador único del punto donde se mide el consumo.


### 🖨️ Funcionalidad de impresión avanzada

Se ha implementado un **sistema de impresión selectiva mediante un modal de configuración**, que permitirá al usuario:

* **Elegir qué secciones imprimir** (tabla de registros, gráfica de consumo, resúmenes anuales, resumen global, etc.).
* **Aplicar filtros específicos desde el modal**, como:

  * Rango de años o fechas
  * Número de registros (ej: del 100 al 300)
  * Campos comunes como CUPS, dirección, municipio, consumo mínimo/máximo


## 🚀 Cómo usar el proyecto localmente

### Requisitos

* Tener instalado [Node.js](https://nodejs.org/)
* No necesitas instalar SQLite porque el paquete `sqlite3` lo maneja internamente.

### Instalación y arranque

1. Clona o descarga el repositorio completo (mantén la estructura).
2. En la raíz, abre una terminal y ejecuta:

```bash
npm install
node server.js
```

3. Abre en tu navegador: [http://localhost:3000](http://localhost:3000)

La aplicación web estará funcionando con conexión al backend para consultar y modificar datos.

---

## 🧩 Tecnologías usadas

* **Node.js** y **Express**: servidor y API REST.
* **SQLite3**: base de datos local ligera.
* **Bootstrap 5**: diseño y componentes (modales, botones, layout).
* **Chart.js**: visualización gráfica.
* **Fetch API**: comunicación frontend-backend asíncrona.
* **JavaScript moderno (ES6+)**: lógica cliente y servidor.

---

## 🛠️ Funcionalidades CRUD (Crear, Leer, Actualizar, Borrar)

* **Crear registros**: botón + modal con formulario para añadir registros nuevos.
* **Leer registros**: tabla con datos cargados desde la base.
* **Actualizar registros**: modal para editar cualquier campo de un registro.
* **Eliminar registros**: confirmación con modal antes de borrar.

---

## 📝 Notas adicionales

* Los datos se almacenan y gestionan en SQLite (`consumo.db`).
* El backend provee una API REST para operaciones CRUD.
* La web consume esta API para mostrar y modificar datos.
* Los modales Bootstrap mejoran UX para edición y confirmación.
* Se usa paginación para manejar grandes volúmenes.
* Cualquier cambio en el backend requiere reiniciar el servidor (`Ctrl+C` y `node server.js`).


---

## 🧭 Guía de uso de la aplicación

### Principales controles e interacción
* **Botón "Nuevo registro"** abre modal para añadir registros.
* **Botón "Editar"** en cada fila para modificar datos.
* **Botón "Eliminar"** con modal para confirmar antes de borrar.
* **Impresión avanzada** desde modal para elegir qué imprimir.

### 🔍 Filtros disponibles

Puedes aplicar varios filtros a la vez para acotar los resultados. Los filtros se encuentran en la cabecera de la tabla, y se despliegan al hacer clic en el icono de filtro correspondiente.

#### 📌 Municipio / CUPS / Dirección

* Introduce **al menos 3 caracteres** para que el filtro empiece a funcionar.

🎨 **Colores del icono:**

* 🔴 Rojo: el campo está vacío.
* 🟡 Amarillo: Aviso de que el filtro no se está aplicando. Requiere mínimo 3 caracteres para aplicarse el filtro.
* 🔵 Azul: se está aplicando el filtro (3 o más caracteres).

#### 📅 Fecha

* Permite buscar con distintos niveles de detalle:

  * Solo el **año**: `2023`
  * Año y mes: `2023-05`
  * Fecha completa: `2023-05-15`
* Puedes escribir solo el campo "Desde", solo el campo "Hasta" o ambos.


#### ⚡ Consumo (kWh)

* Puedes usar:

  * Solo **mínimo**
  * Solo **máximo**
  * O **ambos** para establecer un rango

---

### ℹ️ Tooltips informativos

* Junto a cada filtro hay un icono `ℹ️` que muestra una breve explicación sobre su funcionamiento:

  * **En ordenador:** clic sobre el icono.
  * **En móvil:** toca con el dedo.

---

### 📊 Gráfica de consumo

* Representa el total de consumo según los filtros aplicados.
* Se actualiza automáticamente.
* Puedes **mostrar u ocultar** la gráfica con el botón correspondiente.

---

### 🧾 Resumen general

* Muestra datos clave:

  * Día de mayor y menor consumo
  * Top 3 días con mayor y menor consumo global
  * Año con más y menos consumo
  * Mes con menor consumo global

* Aparece junto a la gráfica en pantallas grandes.

---

### 📅 Tarjetas anuales

* Cada año tiene su propia tarjeta con:

  * Consumo total
  * Promedio mensual
  * Mes con mayor consumo
* Botón para **mostrar/ocultar detalles mensuales por año**.
* Las tarjetas también se pueden ocultar en bloque desde el botón general.

---

### 📋 Tabla de datos

* Muestra los registros filtrados en forma tabular.
* Incluye paginación con selección directa de página.
* El contenido es responsive y se adapta a cualquier dispositivo.

---


## 📁 Estructura del proyecto


/backend-consumo

├── /json ← Archivos JSON con datos originales

├── consumo.db ← Base de datos SQLite con datos actuales

├── server.js  ← Servidor backend Node.js + Express

└── /public  ← Carpeta servida estáticamente

    ├── index.html  ← Página principal

    ├── README.md  ← Documentación del proyecto

    └── /resources

        ├── /js  ← Scripts cliente (filtros, renderizado, gráficos, CRUD)

        ├── /css ← Estilos personalizados sobre Bootstrap

        └── /imagenes/diagramas← Diagramas UML explicativos

---

## 🧩 Diagramas UML

Para entender el diseño y funcionamiento del sistema, se incluyen los siguientes diagramas:

### 🧱 Diagrama de Clases
Representa las estructuras de datos utilizadas (consumo, registros, atributos clave).

![Clases](backend-consumo\public\resources\imagenes\diagramas\diagrama_de_clases_v2.png)

### 🔁 Diagramas de Secuencia
Explican el flujo de interacción entre los componentes:

- **Con filtros:**  
  ![Con filtros](backend-consumo\public\resources\imagenes\diagramas\diagrama_comportamiento_secuencial_filtros.png)

- **Sin filtros:**  
  ![Sin filtros](backend-consumo\public\resources\imagenes\diagramas\diagrama_comportamiento_secuencial_sin_filtrar.png)

### 🔄 Diagrama de Actividad
Muestra el flujo lógico general de funcionamiento de la aplicación:

![Actividad](backend-consumo\public\resources\imagenes\diagramas\diagrama_comportamiento_actividad.drawio.png)
