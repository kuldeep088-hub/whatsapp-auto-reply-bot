module.exports = {
  // Typing simulation delay in milliseconds (random between min and max)
  REPLY_DELAY_MIN: 3000,
  REPLY_DELAY_MAX: 7000,

  // How many past messages to send to AI as context
  MAX_HISTORY: 15,

  // Auto-reply schedule (24hr format, IST)
  // Bot turns ON at 'end' time and OFF at 'start' time
  SCHEDULE: {
    enabled: true,
    start: "22:00",  // Bot turns ON at 10 PM (you go to sleep / unavailable)
    end: "08:00"     // Bot turns OFF at 8 AM (you wake up)
  },

  // Port for the local toggle web page
  TOGGLE_PORT: 3000,

  // Gemini model to use (free tier)
  GEMINI_MODEL: "gemini-1.5-flash"
};
