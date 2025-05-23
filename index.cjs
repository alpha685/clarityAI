const express = require("express");
const axios = require("axios");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

// ✅ Allow local frontend + framer
const allowedOrigins = [
  "http://localhost:3000",
  "https://fuchsia-meeting-913037.framer.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed for this origin"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ✅ Manual headers just in case (belt & suspenders)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.options("*", (req, res) => {
  res.sendStatus(204);
});

app.use(express.json());

app.get("/", (req, res) => {
  res.send("ClarityAI backend is running successfully 🚀");
});

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
    console.error("❌ Together API error:", error?.response?.data || error.message);
    res.status(500).json({ summary: "Failed to fetch summary." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
