const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

// ✅ Enable CORS (allow localhost + framer)
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://fuchsia-meeting-913037.framer.app"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// ✅ Handle preflight OPTIONS request explicitly
app.options("*", (req, res) => {
  res.sendStatus(204);
});

app.use(express.json());

// ✅ Health check
app.get("/", (req, res) => {
  res.send("ClarityAI is running successfully 🚀");
});

// ✅ Main API
app.post("/generate-report", async (req, res) => {
  const userInput = req.body.prompt || "Write a startup report about AI in healthtech.";
  try {
    const response = await axios.post(
      "https://api.together.xyz/v1/chat/completions",
      {
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        messages: [{ role: "user", content: userInput }]
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
    console.error("❌ Error:", error?.response?.data || error.message);
    res.status(500).json({ summary: "Failed to fetch summary." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
