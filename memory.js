const fs = require("fs");
const path = require("path");
const config = require("./config");

const MEMORY_FILE = path.join(__dirname, "conversation_memory.json");

let memory = {};

function load() {
  if (fs.existsSync(MEMORY_FILE)) {
    try {
      memory = JSON.parse(fs.readFileSync(MEMORY_FILE, "utf8"));
    } catch {
      memory = {};
    }
  }
}

function save() {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
}

function addMessage(number, role, text) {
  if (!memory[number]) memory[number] = [];
  memory[number].push({ role, text, time: new Date().toISOString() });
  if (memory[number].length > config.MAX_HISTORY * 2) {
    memory[number] = memory[number].slice(-config.MAX_HISTORY * 2);
  }
  save();
}

function getHistory(number) {
  return memory[number] || [];
}

function clearHistory(number) {
  memory[number] = [];
  save();
}

load();

module.exports = { addMessage, getHistory, clearHistory };
