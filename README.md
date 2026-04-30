# WhatsApp AI Auto-Reply Bot

A personal WhatsApp bot that auto-replies to messages in your own voice using AI. When you're away or asleep, it reads incoming messages and replies naturally, so your contacts never know it's a bot.

## Features

- Replies in your personal tone and language (Hinglish supported)
- Per-contact profiles: different style for girlfriend, best friend, etc.
- Conversation memory: keeps context of last 15 messages per contact
- Typing simulation with random delay (3–7 seconds) for realism
- Auto-schedule: bot turns ON at night, OFF in the morning
- Web UI to toggle the bot on/off instantly from your browser
- Powered by Groq's free LLaMA-70B API

## How It Works

1. Connect WhatsApp by scanning a QR code once
2. When a message arrives and the bot is ON, it:
   - Marks the chat as read
   - Shows "typing…" for a few seconds
   - Generates a reply using your persona + conversation history
   - Sends the reply

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Get a free Groq API key

Sign up at [console.groq.com](https://console.groq.com) and copy your API key.

### 3. Create `.env` file

```
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Add your contacts

Edit `contacts.json` with the phone numbers and profiles of people you want the bot to reply to:

```json
[
  {
    "name": "Girlfriend",
    "number": "91XXXXXXXXXX",
    "relationship": "She is my girlfriend. We talk about feelings, daily life, future plans.",
    "language": "Hinglish",
    "notes": "I call her Babu or Jaan. Very romantic and sweet tone."
  }
]
```

### 5. Edit your persona

Edit `persona.txt` to describe yourself: your name, how you talk, your interests, personality. The more detail, the more accurate the replies.

### 6. Start the bot

```bash
node index.js
```

Scan the QR code with your phone via **WhatsApp → Linked Devices → Link a Device**.

## Toggle the Bot

Open `http://localhost:3000` in your browser to turn the bot on or off manually.

The bot also auto-schedules based on `config.js`:
- Turns **ON** at `22:00` (you go to sleep)
- Turns **OFF** at `08:00` (you wake up)

## Running in Background (PM2)

```bash
npm install -g pm2
pm2 start index.js --name "whatsapp-bot"
pm2 save
```

Or just double-click `start-bot.bat`.

## Configuration

Edit `config.js` to change:

| Setting | Default | Description |
|---|---|---|
| `REPLY_DELAY_MIN` | 3000 ms | Min typing delay |
| `REPLY_DELAY_MAX` | 7000 ms | Max typing delay |
| `MAX_HISTORY` | 15 | Messages of context sent to AI |
| `SCHEDULE.start` | 22:00 | Bot turns ON (IST) |
| `SCHEDULE.end` | 08:00 | Bot turns OFF (IST) |
| `TOGGLE_PORT` | 3000 | Web UI port |

## Tech Stack

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) - WhatsApp Web automation
- [Groq API](https://console.groq.com) - LLaMA-3.3-70B inference
- [Express](https://expressjs.com) - Toggle web server
- [node-cron](https://github.com/node-cron/node-cron) - Auto-scheduling

## Important Notes

- Keep your `.env` and `.wwebjs_auth/` folder private, never commit them
- This is for personal use only
- Message content is sent to Groq's API for inference
