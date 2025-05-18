require('dotenv').config(); // Add this as the first line after imports
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
// POST endpoint
app.post('/generate-report', async (req, res) => {
  const { input } = req.body;
  console.log("Received input:", input);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-prover-v2:free",
        messages: [
          {
            role: "system",
            content: "You're an AI startup research analyst. Given a topic, generate a startup research summary."
          },
          {
            role: "user",
            content: input
          }
        ]
      })
    });

    const data = await response.json();
    const summary = data.choices[0]?.message?.content || "No summary available.";

    res.status(200).json({ summary });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({ summary: "Failed to fetch summary." });
  }
});


app.listen(port, () => {
  console.log(`ClarityYAI backend listening on port ${port}`);
});
