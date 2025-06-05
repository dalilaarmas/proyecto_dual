const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const carpetaJSON = path.join(__dirname, "json");
const archivos = fs.readdirSync(carpetaJSON).filter(f => f.endsWith(".json"));
const db = new sqlite3.Database("./consumo.db");

// Crear tabla con restricción de duplicado
db.run(`
  CREATE TABLE IF NOT EXISTS registros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cups TEXT,
    direccion TEXT,
    municipio TEXT,
    fecha TEXT,
    consumo REAL,
    UNIQUE(cups, fecha) ON CONFLICT IGNORE
  );
`, err => {
  if (err) {
    console.error("❌ Error creando la tabla:", err.message);
    return;
  }

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO registros (cups, direccion, municipio, fecha, consumo)
    VALUES (?, ?, ?, ?, ?)
  `);

  let totalInsertados = 0;

  archivos.forEach(nombreArchivo => {
    const ruta = path.join(carpetaJSON, nombreArchivo);

    try {
      const datos = JSON.parse(fs.readFileSync(ruta, "utf8"));

      if (!Array.isArray(datos.municipios)) {
        console.warn(`⚠️ ${nombreArchivo} no contiene un array válido en 'municipios'.`);
        return;
      }

      let insertadosArchivo = 0;

      datos.municipios.forEach(municipio => {
        const nombreMunicipio = municipio.cups_municipio;

        municipio.cups?.forEach(cups => {
          const codigo = cups.cups_codigo;
          const direccion = cups.cups_direccion;

          cups.consumos?.forEach(consumo => {
            stmt.run(codigo, direccion, nombreMunicipio, consumo.fecha, consumo.consumo, err => {
              if (!err) {
                insertadosArchivo++;
                totalInsertados++;
                if (insertadosArchivo % 100 === 0) {
                  process.stdout.write(`\r📦 ${nombreArchivo}: ${insertadosArchivo} insertados...`);
                }
              }
            });
          });
        });
      });

      console.log(`\n✅ Procesado: ${nombreArchivo}`);
    } catch (e) {
      console.error(`❌ Error procesando ${nombreArchivo}:`, e.message);
    }
  });

  stmt.finalize(() => {
    console.log(`\n🎉 Inserciones completadas. Total registros insertados: ${totalInsertados}`);
    db.close();
  });
});
