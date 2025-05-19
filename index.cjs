const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000; // ✅ Railway injects PORT automatically


const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

// ✅ Framer domain
const FRAMER_DOMAIN = "https://fuchsia-meeting-913037.framer.app";

// ✅ CORS middleware
app.use(cors({
  origin: FRAMER_DOMAIN,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ✅ Body parser
app.use(express.json());

// ✅ Manual headers for ALL requests (belt & suspenders)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", FRAMER_DOMAIN);
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// ✅ Explicit preflight response
app.options("*", (req, res) => {
  res.sendStatus(204);
});

// ✅ Health check
app.get("/", (req, res) => {
  res.send("ClarityAI is running successfully 🚀");
});

// ✅ Main API endpoint
app.post("/generate-report", async (req, res) => {
  const userInput = req.body.prompt || "Write a startup report about AI in healthtech.";

  try {
    const response = await axios.post(
      "https://api.together.xyz/v1/chat/completions",
      {
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        messages: [{ role: "user", content: userInput }],
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const summary = response.data.choices[0]?.message?.content || "No summary found.";
    res.json({ summary });
  } catch (error) {
    console.error("❌ Error in Together API:", error?.response?.data || error.message);
    res.status(500).json({ summary: "Failed to fetch summary." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
