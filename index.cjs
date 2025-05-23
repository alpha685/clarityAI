const express = require("express");
const axios = require("axios");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Add CORS middleware BEFORE routes
app.use(cors({
  origin: "*", // OR use 'http://localhost:3000' during local dev
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Explicit preflight handler
app.options("*", (req, res) => {
  res.sendStatus(204);
});

app.use(express.json());


// ✅ Also manually set headers just in case
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// ✅ Preflight route for OPTIONS
app.options("*", (req, res) => {
  res.sendStatus(200);
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
