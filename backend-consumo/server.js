const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 3000;

const db = new sqlite3.Database("./consumo.db");

app.use(cors());
app.use(express.json());

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

// Ruta raíz
app.get("/", (req, res) => {
  res.send("API de consumo energético funcionando");
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
app.post("/registros", (req, res) => {
  const { cups, direccion, municipio, fecha, consumo } = req.body;
  db.run(
    `INSERT INTO registros (cups, direccion, municipio, fecha, consumo)
     VALUES (?, ?, ?, ?, ?)`,
    [cups, direccion, municipio, fecha, consumo],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Actualizar un registro existente
app.put("/registros/:id", (req, res) => {
  const id = req.params.id;
  const { cups, direccion, municipio, fecha, consumo } = req.body;

  db.run(
    `UPDATE registros SET cups = ?, direccion = ?, municipio = ?, fecha = ?, consumo = ? WHERE id = ?`,
    [cups, direccion, municipio, fecha, consumo, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Registro no encontrado" });
      res.json({ mensaje: "Registro actualizado correctamente" });
    }
  );
});

// Eliminar un registro
app.delete("/registros/:id", (req, res) => {
  const id = req.params.id;

  db.run("DELETE FROM registros WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Registro no encontrado" });
    res.json({ mensaje: "Registro eliminado correctamente" });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
