import pkg from "pg";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function importa() {
  try {
    const raw = fs.readFileSync("seed.json", "utf-8");
    const prodotti = JSON.parse(raw);

    for (let p of prodotti) {
      const [lunghezza, larghezza] = p.dimensione
        .toLowerCase()
        .split("x")
        .map(Number);

      // controllo duplicato (stesso nome + posizione)
      const check = await pool.query(
        `SELECT id FROM prodotti 
         WHERE nome=$1 AND fila=$2 AND scaffale=$3 AND ripiano=$4`,
        [p.nome, p.fila, p.scaffale.toLowerCase(), p.ripiano]
      );

      if (check.rows.length === 0) {
        await pool.query(
          `INSERT INTO prodotti 
          (nome, lunghezza, larghezza, spessore, fila, scaffale, ripiano)
          VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [
            p.nome,
            lunghezza,
            larghezza,
            p.spessore,
            p.fila,
            p.scaffale.toLowerCase(),
            p.ripiano
          ]
        );

        console.log("Inserito:", p.nome);
      } else {
        console.log("Già presente:", p.nome);
      }
    }

    console.log("✅ Import completato");
    process.exit();
  } catch (err) {
    console.error("Errore:", err);
    process.exit(1);
  }
}

importa();