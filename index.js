const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")

const app = express()
const port = process.env.PORT || 3000

// ✅ Whitelist your frontend domain
const allowedOrigins = ["https://desirable-building-526665.framer.app"]

// ✅ Setup CORS with preflight handling
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

  // Dummy report example
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
