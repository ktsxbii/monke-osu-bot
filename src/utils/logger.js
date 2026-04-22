/**
 * Simple logger utility for the bot.
 */
const logger = {
  /**
   * Logs an info message to the console.
   * @param {string} message 
   */
  info: (message) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] 🐒🍌 ${message}`);
  },

  /**
   * Logs an error message to the console.
   * @param {string} message 
   */
  error: (message, error) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR] 🐒🍌 ${message}`);
    if (error) {
      console.error(error);
    }
  }
};

module.exports = logger;
