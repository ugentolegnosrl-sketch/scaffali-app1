import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // serve il frontend

// ================= DATABASE =================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // SSL richiesto da Supabase
});

// ================= SEARCH =================
app.get("/api/search", async (req, res) => {
  try {
    const { nome, spessore, lunghezza, larghezza } = req.query;

    let query = "SELECT * FROM prodotti WHERE 1=1";
    let values = [];
    let i = 1;

    if (spessore) {
      query += ` AND spessore = $${i++}`;
      values.push(spessore);
    }
    if (nome) {
      query += ` AND LOWER(nome) LIKE $${i++}`;
      values.push(`%${nome.toLowerCase()}%`);
    }
    if (lunghezza) {
      query += ` AND lunghezza = $${i++}`;
      values.push(lunghezza);
    }
    if (larghezza) {
      query += ` AND larghezza = $${i++}`;
      values.push(larghezza);
    }

    query += " ORDER BY fila, scaffale, ripiano";

    const result = await pool.query(query, values);
    res.json(result.rows);

  } catch (err) {
    console.error("Errore search:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= GET SCAFFALE =================
app.get("/api/scaffale/:fila/:scaffale", async (req, res) => {
  try {
    const { fila, scaffale } = req.params;

    const filaInt = parseInt(fila);
    if (isNaN(filaInt) || filaInt < 1 || filaInt > 4)
      return res.status(400).json({ error: "Fila non valida" });

    const result = await pool.query(
      "SELECT * FROM prodotti WHERE fila=$1 AND scaffale=$2 ORDER BY ripiano ASC",
      [filaInt, scaffale.toLowerCase()]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Errore get scaffale:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= DELETE =================
app.delete("/api/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await pool.query("DELETE FROM prodotti WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Errore delete:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= ADD =================
app.post("/api/add", async (req, res) => {
  try {
    const { nome, lunghezza, larghezza, spessore, fila, scaffale, ripiano } = req.body;

    await pool.query(
      `INSERT INTO prodotti (nome, lunghezza, larghezza, spessore, fila, scaffale, ripiano)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [nome, lunghezza, larghezza, spessore, fila, scaffale.toLowerCase(), ripiano]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Errore add:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= SPOSTA =================
app.put("/api/sposta/:id", async (req, res) => {
  try {
    const { fila, scaffale } = req.body;
    const id = parseInt(req.params.id);

    await pool.query(
      "UPDATE prodotti SET fila=$1, scaffale=$2 WHERE id=$3",
      [fila, scaffale.toLowerCase(), id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Errore sposta:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= SERVER =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server avviato su porta ${PORT}`));
