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

// POST endpoint
app.post('/generate', async (req, res) => {
  const userInput = req.body.input;
  console.log("Received input:", userInput);
  console.log("Using API Key:", process.env.OPENROUTER_API_KEY); // ✅ New


  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000' // or your Framer/public site if deployed
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-prover-v2:free',
        messages: [
          {
            role: 'system',
            content: 'You are a startup analyst that writes concise and insightful market summaries for VCs and founders.'
          },
          {
            role: 'user',
            content: userInput
          }
        ]
      })      
    });

    const data = await response.json();
    console.log("Full response:", JSON.stringify(data, null, 2));
    console.log("Status code:", response.status);
    console.log("OpenRouter response:", JSON.stringify(data, null, 2));

    const summary = data.choices?.[0]?.message?.content || "No summary generated.";
    res.json({ summary });

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

app.listen(port, () => {
  console.log(`ClarityYAI backend listening on port ${port}`);
});
