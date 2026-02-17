import express from "express"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"
import path from "path"
import { fileURLToPath } from "url"

dotenv.config()

const app = express()
app.use(express.json())

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.static(path.join(__dirname, "public")))

const supabase = createClient(process.env.SUPABASE_URL, null)

/* ================= API ================= */

// GET tutti prodotti
app.get("/api/prodotti", async (req, res) => {
  const { data, error } = await supabase.from("prodotti").select("*")
  if (error) return res.status(500).json(error)
  res.json(data)
})

// INSERT
app.post("/api/prodotti", async (req, res) => {
  const { data, error } = await supabase.from("prodotti").insert(req.body).select()
  if (error) return res.status(500).json(error)
  res.json(data[0])
})

// UPDATE
app.put("/api/prodotti/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("prodotti")
    .update(req.body)
    .eq("id", req.params.id)
    .select()

  if (error) return res.status(500).json(error)
  res.json(data[0])
})

// DELETE
app.delete("/api/prodotti/:id", async (req, res) => {
  const { error } = await supabase
    .from("prodotti")
    .delete()
    .eq("id", req.params.id)

  if (error) return res.status(500).json(error)
  res.json({ success: true })
})

app.listen(process.env.PORT, () =>
  console.log("Server avviato su porta", process.env.PORT)
)
