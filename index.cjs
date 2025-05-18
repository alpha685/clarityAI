const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// POST endpoint
app.post('/generate', async (req, res) => {
  const userInput = req.body.input;
  console.log("Received input:", userInput);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer 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`,
        'Content-Type': 'application/json'
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
    console.log("Status code:", response.status);
    const data = await response.json();
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
