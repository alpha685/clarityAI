const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Load keys from environment variables
const keys = Object.entries(process.env)
  .filter(([key]) => key.startsWith("OPENROUTER_API_KEY_"))
  .sort(([a], [b]) => a.localeCompare(b)) // Sort to maintain order: 1, 2, 3...
  .map(([_, value]) => value);

let currentKeyIndex = 0;

// Function to rotate and get a working key
async function getValidKey() {
  let retries = 0;
  while (retries < keys.length) {
    const key = keys[currentKeyIndex];
    try {
      // Lightweight ping to validate key
      await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "mistral/mistral-7b-instruct",
          messages: [{ role: "user", content: "ping" }]
        },
        {
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json"
          }
        }
      );
      return key;
    } catch (err) {
      if (err.response?.status === 429 || err.response?.status === 401) {
        console.warn(`❌ Key ${currentKeyIndex + 1} failed. Rotating...`);
        currentKeyIndex = (currentKeyIndex + 1) % keys.length;
        retries++;
      } else {
        throw err;
      }
    }
  }
  throw new Error("All OpenRouter keys are exhausted.");
}

app.get("/", (req, res) => {
  res.send("ClarityAI is running successfully 🚀");
});

app.post("/generate-report", async (req, res) => {
  const userInput = req.body.prompt || "Write a startup report about AI in healthtech.";

  try {
    const key = await getValidKey();
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistral/mistral-7b-instruct",
        messages: [{ role: "user", content: userInput }]
      },
      {
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json"
        }
      }
    );

    const summary = response.data.choices[0]?.message?.content || "No summary found.";
    res.json({ summary });
  } catch (error) {
    console.error("❌ Error generating report:", error.message);
    res.status(500).json({ summary: "Failed to fetch summary." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
