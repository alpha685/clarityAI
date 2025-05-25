const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

// --- CORS Configuration ---
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
app.options("*", cors(corsOptions)); // Preflight support
app.use(express.json());

// --- Health Check Endpoint ---
app.get("/", (req, res) => {
  res.send("✅ ClarityAI is running successfully!");
});

// --- Main Endpoint ---
app.post("/generate-report", async (req, res) => {
  // Manual fallback headers
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  const userInput = req.body.prompt || "AI startups in India";

  // 🔧 SYSTEM PROMPT ENGINEERING — ensures output is sectioned and clean
  const systemPrompt = `
You are a startup analyst AI trained to write Canva-style professional startup reports.

Please generate a full structured report based on the topic below. Follow this format exactly:

1. Executive Summary:
2. Market Overview:
3. Top AI Startups in India:
4. SWOT Analysis:
5. Funding Overview:
6. Strategic Insights:
7. Recommendations:
8. Conclusion:

Each section should contain 3-6 concise sentences, clearly aligned to the heading. Use markdown-style bold for headings if applicable, and preserve newline formatting. Do not include any extra text outside the section labels.

Topic: ${userInput}
`;

  try {
    const response = await axios.post(
      "https://api.together.xyz/v1/chat/completions",
      {
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please write a detailed structured startup insight report on: ${userInput}` }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
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

// --- Error Handler ---
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    res.status(403).json({ error: "CORS policy blocked this request" });
  } else {
    next(err);
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
