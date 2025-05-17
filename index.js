import express from "express"
import cors from "cors"

const app = express()
const port = process.env.PORT || 3000

// ✅ Allow CORS from your Framer domain
app.use(
  cors({
    origin: "https://desirable-building-526665.framer.app",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
)

app.use(express.json())

app.post("/generate", async (req, res) => {
  const { query } = req.body
  console.log("✅ Received query:", query)

  // Your report generation logic (simplified here)
  const report = `Here's your report for: ${query}`
  res.json({ report })
})

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`)
})
