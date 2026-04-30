const Groq = require("groq-sdk");
const fs = require("fs");
const path = require("path");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

let personaText = "";

function loadPersona() {
  const personaFile = path.join(__dirname, "persona.txt");
  if (fs.existsSync(personaFile)) {
    personaText = fs.readFileSync(personaFile, "utf8");
  }
}

function buildHistoryText(history) {
  if (!history || history.length === 0) return "No previous messages.";
  return history
    .map((msg) => `[${msg.role === "me" ? "Me" : "Them"}]: ${msg.text}`)
    .join("\n");
}

async function generateReply(contact, history, incomingMessage) {
  if (!personaText) loadPersona();

  const systemPrompt = `You are a real person chatting on WhatsApp. Reply exactly as this person would — naturally, casually, like a real human texting.

MY PERSONALITY AND BACKGROUND:
${personaText}

WHO I AM TALKING TO:
Name: ${contact.name}
Relationship: ${contact.relationship}
Language style: ${contact.language}
Extra notes: ${contact.notes || ""}

IMPORTANT RULES:
- Reply ONLY as me, not as an AI or assistant
- Sound like a real person texting on WhatsApp, not writing an essay
- Use ${contact.language} naturally (mix Hindi and English if Hinglish)
- Keep reply short: 1 to 3 sentences usually
- Ask a follow-up question sometimes to keep conversation going
- Use emojis occasionally but naturally
- NEVER say you are a bot, AI, or automated
- NEVER use formal language
- Match the emotional tone of their message
- Just write the reply message only, nothing else`;

  const userMessage = `CONVERSATION SO FAR:\n${buildHistoryText(history)}\n\nNEW MESSAGE FROM ${contact.name}:\n${incomingMessage}`;

  const models = ["llama-3.3-70b-versatile", "llama3-70b-8192", "llama3-8b-8192"];

  for (const model of models) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        max_tokens: 150,
        temperature: 0.85
      });
      const reply = completion.choices[0].message.content.trim();
      console.log(`[AI] Reply generated using ${model}: ${reply}`);
      return reply;
    } catch (err) {
      console.error(`[AI] ${model} failed: ${err.message}`);
    }
  }
  return null;
}

loadPersona();

module.exports = { generateReply };
