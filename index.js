require("dotenv").config();
const express = require("express");
const path = require("path");
const config = require("./config");
const availability = require("./availability");
const { createClient } = require("./bot");

// Validate API key
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
  console.error("\n[ERROR] GEMINI_API_KEY not set in .env file!");
  console.error("Get your free key from: https://aistudio.google.com/apikey\n");
  process.exit(1);
}

// Start WhatsApp bot
const client = createClient();
client.initialize();

// Start availability schedule
availability.startSchedule();

// Start toggle web server
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "toggle-ui")));

app.get("/status", (req, res) => {
  res.json(availability.getStatus());
});

app.post("/toggle", (req, res) => {
  const botActive = availability.toggle();
  res.json({ ...availability.getStatus(), toggled: true });
});

app.post("/set", (req, res) => {
  const { present } = req.body;
  availability.setUserPresent(present);
  res.json(availability.getStatus());
});

const server = app.listen(config.TOGGLE_PORT, () => {
  console.log(`[Server] Toggle page running at http://localhost:${config.TOGGLE_PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`[Server] Port ${config.TOGGLE_PORT} busy, trying ${config.TOGGLE_PORT + 1}...`);
    app.listen(config.TOGGLE_PORT + 1, () => {
      console.log(`[Server] Toggle page running at http://localhost:${config.TOGGLE_PORT + 1}`);
    });
  }
});

process.on("SIGINT", async () => {
  console.log("\n[Bot] Shutting down...");
  await client.destroy();
  process.exit(0);
});
