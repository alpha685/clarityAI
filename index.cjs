const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({ message: "Clarity backend running" });
});

app.post("/generate", (req, res) => {
  const userInput = req.body.input;

  if (!userInput) {
    return res.status(400).json({ error: "Input is required" });
  }

  res.json({
    summary: `Report for: ${userInput}`,
    status: "success",
    date: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
