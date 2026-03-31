const axios  = require("axios");
const logger = require("./logger");

/**
 * Send a critical alert to the configured Telegram channel.
 * Non-blocking — failures are logged but never throw.
 */
async function alertAdmin(message) {
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id:    chatId,
      text:       `🚨 *Kortana Node Sale Alert*\n\n${message}`,
      parse_mode: "Markdown",
    });
  } catch (err) {
    logger.error("Telegram alert failed:", err.message);
  }
}

module.exports = { alertAdmin };
