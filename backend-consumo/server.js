const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware para logging y CSP
app.use((req, res, next) => {
  console.log(`Petición: ${req.method} ${req.url}`);
  res.setHeader("Content-Security-Policy",
    "default-src 'self'; " +
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; " +
    "script-src 'self' https://cdn.jsdelivr.net https://code.jquery.com; " +
    "img-src 'self' data:; " +
    "font-src 'self' https://cdn.jsdelivr.net https://fonts.gstatic.com; " +
    "connect-src 'self';"
  );
  next();
});

// Middlewares para CORS y parseo JSON
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde carpeta public
app.use(express.static(path.join(__dirname, "public")));

// Conexión a la base de datos SQLite
const db = new sqlite3.Database("./consumo.db");

// Crear tabla si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS registros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cups TEXT,
      direccion TEXT,
      municipio TEXT,
      fecha TEXT,
      consumo REAL
    );
  `);
});

// Obtener todos los registros
app.get("/registros", (req, res) => {
  db.all("SELECT * FROM registros", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Obtener un registro por ID
app.get("/registros/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM registros WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Registro no encontrado" });
    res.json(row);
  });
});

// Crear nuevo registro
// app.post("/registros", (req, res) => {
//   const { cups, direccion, municipio, fecha, consumo } = req.body;
//   db.run(
//     `INSERT INTO registros (cups, direccion, municipio, fecha, consumo)
//      VALUES (?, ?, ?, ?, ?)`,
//     [cups, direccion, municipio, fecha, consumo],
//     function (err) {
//       if (err) return res.status(500).json({ error: err.message });
//       res.status(201).json({ id: this.lastID });
//     }
//   );
// });

// Actualizar un registro por ID
app.put("/registros/:id", (req, res) => {
  const id = req.params.id;
   const { municipio, cups_codigo, cups_direccion, fecha, consumo } = req.body;

 db.run(
    `UPDATE registros SET cups = ?, direccion = ?, municipio = ?, fecha = ?, consumo = ? WHERE id = ?`,
    [cups_codigo, cups_direccion, municipio, fecha, consumo, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      console.log(`Filas afectadas: ${this.changes}`);

      if (this.changes === 0) return res.status(404).json({ error: "Registro no encontrado" });
      res.json({ mensaje: "Registro actualizado correctamente" });
    }
  );
});

// Eliminar un registro por ID
app.delete("/registros/:id", (req, res) => {
  const id = req.params.id;

  db.run("DELETE FROM registros WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    if (this.changes === 0) {
      return res.status(404).json({ error: "Registro no encontrado" });
    }
    res.json({ mensaje: "Registro eliminado correctamente" });
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
