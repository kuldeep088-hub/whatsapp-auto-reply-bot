const cron = require("node-cron");
const config = require("./config");

// true = user is present, bot is OFF
// false = user is unavailable, bot is ON
let userPresent = true;

function isBotActive() {
  return !userPresent;
}

function setUserPresent(present) {
  userPresent = present;
  console.log(`[Availability] User is now ${present ? "PRESENT (bot OFF)" : "AWAY (bot ON)"}`);
}

function toggle() {
  setUserPresent(!userPresent);
  return isBotActive();
}

function getStatus() {
  return {
    botActive: isBotActive(),
    userPresent,
    message: isBotActive() ? "Bot is ON — auto-replying" : "Bot is OFF — you are present"
  };
}

function startSchedule() {
  if (!config.SCHEDULE.enabled) return;

  const [startHour, startMin] = config.SCHEDULE.start.split(":").map(Number);
  const [endHour, endMin] = config.SCHEDULE.end.split(":").map(Number);

  // Turn bot ON at schedule start time (you become unavailable)
  cron.schedule(`${startMin} ${startHour} * * *`, () => {
    console.log(`[Schedule] ${config.SCHEDULE.start} — Turning bot ON (you are now away)`);
    setUserPresent(false);
  });

  // Turn bot OFF at schedule end time (you become available again)
  cron.schedule(`${endMin} ${endHour} * * *`, () => {
    console.log(`[Schedule] ${config.SCHEDULE.end} — Turning bot OFF (you are back)`);
    setUserPresent(true);
  });

  console.log(`[Schedule] Auto-schedule set: Bot ON at ${config.SCHEDULE.start}, OFF at ${config.SCHEDULE.end}`);
}

module.exports = { isBotActive, toggle, getStatus, setUserPresent, startSchedule };
