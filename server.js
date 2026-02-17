import express from "express"
import pkg from "pg"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

dotenv.config()

const { Pool } = pkg
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

const app = express()
app.use(express.json())

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use(express.static(path.join(__dirname, "public")))

/* ================== API ================== */

// GET tutti prodotti
app.get("/api/prodotti", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM prodotti ORDER BY fila, scaffale, ripiano")
  res.json(rows)
})

// POST nuovo prodotto
app.post("/api/prodotti", async (req, res) => {
  const { nome, lunghezza, larghezza, spessore, fila, scaffale, ripiano } = req.body

  const { rows } = await pool.query(
    `INSERT INTO prodotti (nome, lunghezza, larghezza, spessore, fila, scaffale, ripiano)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [nome, lunghezza, larghezza, spessore, fila, scaffale, ripiano]
  )

  res.json(rows[0])
})

// PUT modifica
app.put("/api/prodotti/:id", async (req, res) => {
  const { id } = req.params
  const { nome, lunghezza, larghezza, spessore, fila, scaffale, ripiano } = req.body

  const { rows } = await pool.query(
    `UPDATE prodotti
     SET nome=$1, lunghezza=$2, larghezza=$3, spessore=$4,
         fila=$5, scaffale=$6, ripiano=$7
     WHERE id=$8
     RETURNING *`,
    [nome, lunghezza, larghezza, spessore, fila, scaffale, ripiano, id]
  )

  res.json(rows[0])
})

// DELETE
app.delete("/api/prodotti/:id", async (req, res) => {
  const { id } = req.params
  await pool.query("DELETE FROM prodotti WHERE id=$1", [id])
  res.json({ success: true })
})

/* ================== START ================== */

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log("Server attivo su porta", PORT))
