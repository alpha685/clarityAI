import express from "express"
import cors from "cors"
import bodyParser from "body-parser"

const app = express()
const port = process.env.PORT || 3000

const allowedOrigins = ["https://desirable-building-526665.framer.app"]

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(200)
  }

  next()
})

app.use(bodyParser.json())

app.post("/generate", async (req, res) => {
  console.log("✅ /generate hit with:", req.body)

  // Dummy report
  const report = {
    startupName: "AI Growth Co.",
    insights: [
      "Large TAM in SMB automation.",
      "Early signs of product-market fit.",
      "Opportunity in vertical SaaS expansion."
    ]
  }

  res.json({ report })
})

app.get("/", (req, res) => {
  res.send("ClarityYAI backend is running ✅")
})

app.listen(port, () => {
  console.log(`🚀 Server is listening on port ${port}`)
})
