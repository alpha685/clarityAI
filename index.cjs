const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://fuchsia-meeting-913037.framer.app"
  ],
  credentials: true,
  methods: "GET,POST,OPTIONS",
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle preflight


// Apply CORS middleware
app.use(cors(corsOptions));

// Explicit OPTIONS handler
app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(204);
});


// Body parser middleware
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.send("ClarityAI is running successfully 🚀");
});

// Report generation endpoint with manual CORS headers
app.post("/generate-report", async (req, res) => {
  // Set CORS headers manually as fallback
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  const userInput = req.body.prompt || "Write a startup report about AI in healthtech.";

  try {
    const response = await axios.post(
      "https://api.together.xyz/v1/chat/completions",
      {
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        messages: [{ role: "user", content: userInput }],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    const summary = response.data.choices[0]?.message?.content || "No summary found.";
    res.json({ 
      success: true,
      data: summary 
    });

  } catch (error) {
    console.error("❌ Backend Error:", error?.response?.data || error.message);
    res.status(500).json({ 
      success: false,
      error: "Failed to generate report",
      details: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({ error: "CORS policy blocked this request" });
  } else {
    next(err);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});