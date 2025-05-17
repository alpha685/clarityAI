// index.cjs
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000;

// ✅ Enable CORS for all origins (for testing) — change to Framer domain later
app.use(cors({
  origin: "https://desirable-building-526665.framer.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(bodyParser.json());

app.post("/generate", async (req, res) => {
  console.log("✅ Request received at /generate");

  const input = req.body.input;

  // Dummy response for testing
  const fakeReport = {
    title: "Startup Report",
    inputReceived: input,
    summary: "This is a test summary generated from backend.",
  };

  res.json(fakeReport);
});

app.get("/", (req, res) => {
  res.send("🚀 Backend is running");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
