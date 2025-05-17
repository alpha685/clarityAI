const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000;

// ✅ Enable CORS for all origins
app.use(cors());
app.use(bodyParser.json());

// ✅ Health check route for "/"
app.get("/", (req, res) => {
  res.json({ message: "Clarity backend running" });
});

// ✅ Main report generation endpoint
app.post("/generate", async (req, res) => {
  const userInput = req.body.input;

  if (!userInput) {
    return res.status(400).json({ error: "Input is required" });
  }

  // Simulated response
  const report = {
    summary: `Generated report for: ${userInput}`,
    status: "success",
    date: new Date().toISOString()
  };

  res.json(report);
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
