const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Load keys
let { keys } = require("./apiKeys.json");
let currentKeyIndex = 0;

// Function to get the next working key
async function getValidKey() {
  while (currentKeyIndex < keys.length) {
    const key = keys[currentKeyIndex];
    try {
      // Test the key with a lightweight request
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
        currentKeyIndex++;
      } else {
        throw err;
      }
    }
  }
  throw new Error("All OpenRouter keys exhausted.");
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
    console.error(error);
    res.status(500).json({ summary: "Failed to fetch summary." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
