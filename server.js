import express from "express"
import pkg from "pg"
import dotenv from "dotenv"
import cors from "cors"

dotenv.config()

const { Pool } = pkg
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static("public"))

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

/* ================= GET TUTTI ================= */
app.get("/prodotti", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM prodotti ORDER BY fila, scaffale, ripiano")
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* ================= INSERT ================= */
app.post("/prodotti", async (req, res) => {
  const { nome, lunghezza, larghezza, spessore, fila, scaffale, ripiano } = req.body

  try {
    const result = await pool.query(
      `INSERT INTO prodotti 
      (nome, lunghezza, larghezza, spessore, fila, scaffale, ripiano)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [nome, lunghezza, larghezza, spessore, fila, scaffale, ripiano]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* ================= UPDATE ================= */
app.put("/prodotti/:id", async (req, res) => {
  const { id } = req.params
  const { nome, lunghezza, larghezza, spessore, fila, scaffale, ripiano } = req.body

  try {
    const result = await pool.query(
      `UPDATE prodotti SET
      nome=$1,
      lunghezza=$2,
      larghezza=$3,
      spessore=$4,
      fila=$5,
      scaffale=$6,
      ripiano=$7
      WHERE id=$8
      RETURNING *`,
      [nome, lunghezza, larghezza, spessore, fila, scaffale, ripiano, id]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* ================= DELETE ================= */
app.delete("/prodotti/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM prodotti WHERE id=$1", [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log("Server avviato su porta " + PORT))
