import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";

dotenv.config();

const app = express();

// ✅ Allow CORS only from your Framer frontend URL
const allowedOrigin = "https://desirable-building-526665.framer.app";
app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function callOpenRouterDeepSeek(icpInput) {
  const url = "https://openrouter.ai/api/v1/chat/completions";
  const model = "deepseek/deepseek-prover-v2:free";

  const body = {
    model,
    messages: [
      {
        role: "system",
        content:
          "You are a startup research assistant that generates detailed startup reports based on an ICP (Ideal Customer Profile). Provide comprehensive, insightful, and actionable reports.",
      },
      {
        role: "user",
        content: `Generate a detailed startup report for the following ICP:\n${icpInput}`,
      },
    ],
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    const json = JSON.parse(text);

    if (json?.choices?.[0]?.message?.content) {
      return json.choices[0].message.content;
    } else {
      console.error("Invalid response:", json);
      return null;
    }
  } catch (err) {
    console.error("Error calling OpenRouter:", err);
    return null;
  }
}

async function insertReport(icpInput, report) {
  const { data, error } = await supabase
    .from("reports")
    .insert([{ icp_input: icpInput, report }])
    .select();

  if (error) {
    console.error("Error inserting report:", error);
    return null;
  }

  return data;
}

app.post("/generate", async (req, res) => {
  const { icp } = req.body;

  if (!icp) {
    return res.status(400).json({ error: "Missing ICP input" });
  }

  const report = await callOpenRouterDeepSeek(icp);

  if (!report) {
    await insertReport(icp, "Failed to generate report.");
    return res.status(500).json({ error: "Failed to generate report" });
  }

  await insertReport(icp, report);
  return res.json({ icp, report });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
