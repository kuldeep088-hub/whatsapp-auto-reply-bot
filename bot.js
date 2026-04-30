const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const path = require("path");
const config = require("./config");
const memory = require("./memory");
const availability = require("./availability");
const { generateReply } = require("./ai");

let contacts = [];

function loadContacts() {
  const file = path.join(__dirname, "contacts.json");
  contacts = JSON.parse(fs.readFileSync(file, "utf8"));
  console.log(`[Bot] Loaded ${contacts.length} whitelisted contacts`);
}

function findContact(number) {
  const senderClean = number.replace(/[^0-9]/g, "").trim();
  for (const c of contacts) {
    const contactClean = c.number.replace(/[^0-9]/g, "").trim();
    if (senderClean === contactClean || senderClean.includes(contactClean) || contactClean.includes(senderClean)) {
      return c;
    }
  }
  console.log(`[Debug] No match. Sender: "${senderClean}" | Contacts: ${contacts.map(c => '"' + c.number.replace(/[^0-9]/g, "") + '"').join(", ")}`);
  return null;
}

function randomDelay() {
  return Math.floor(
    Math.random() * (config.REPLY_DELAY_MAX - config.REPLY_DELAY_MIN) +
      config.REPLY_DELAY_MIN
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createClient() {
  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    }
  });

  client.on("qr", (qr) => {
    console.log("\n[Bot] Scan this QR code with your WhatsApp:\n");
    qrcode.generate(qr, { small: true });
    console.log("\nOpen WhatsApp → Linked Devices → Link a Device → Scan\n");
  });

  client.on("ready", () => {
    console.log("[Bot] WhatsApp connected! Bot is ready.");
    console.log(`[Bot] Toggle page: http://localhost:${config.TOGGLE_PORT}`);
  });

  client.on("auth_failure", () => {
    console.error("[Bot] Authentication failed. Delete the .wwebjs_auth folder and restart.");
  });

  client.on("disconnected", (reason) => {
    console.log("[Bot] Disconnected:", reason);
  });

  client.on("message", async (msg) => {
    try {
      // Ignore messages from self, groups, status updates
      if (msg.fromMe) return;
      if (msg.from.includes("@g.us")) return;
      if (msg.from === "status@broadcast") return;

      // Resolve actual phone number (handles both @c.us and @lid formats)
      let senderNumber = msg.from;
      if (msg.from.includes("@lid")) {
        try {
          const contactObj = await msg.getContact();
          senderNumber = contactObj.number + "@c.us";
        } catch (e) {
          senderNumber = msg.author || msg.from;
        }
      }

      console.log(`[Debug] Incoming from: ${senderNumber} | Bot active: ${availability.isBotActive()}`);

      // If user is present, don't auto-reply
      if (!availability.isBotActive()) return;

      // Use contact info if found, else use generic
      let contact = findContact(senderNumber);
      if (!contact) {
        contact = {
          name: "Friend",
          number: senderNumber.replace(/[^0-9]/g, ""),
          relationship: "This is a friend chatting with me on WhatsApp.",
          language: "Hinglish",
          notes: ""
        };
      }

      const incomingText = msg.body;
      if (!incomingText || incomingText.trim() === "") return;

      console.log(`[Bot] Message from ${contact.name}: ${incomingText}`);

      // Save incoming message to memory
      memory.addMessage(contact.number, "contact", incomingText);

      // Mark as read
      await msg.getChat().then((chat) => chat.sendSeen());

      // Simulate typing delay
      const delay = randomDelay();
      const chat = await msg.getChat();
      await chat.sendStateTyping();
      await sleep(delay);
      await chat.clearState();

      // Get conversation history
      const history = memory.getHistory(contact.number);

      // Generate AI reply
      const reply = await generateReply(contact, history, incomingText);

      if (!reply) {
        console.error(`[Bot] Failed to generate reply for ${contact.name}`);
        return;
      }

      // Send reply
      await client.sendMessage(msg.from, reply);
      memory.addMessage(contact.number, "me", reply);

      console.log(`[Bot] Replied to ${contact.name}: ${reply}`);
    } catch (err) {
      console.error("[Bot] Error handling message:", err.message);
    }
  });

  return client;
}

loadContacts();

module.exports = { createClient };
