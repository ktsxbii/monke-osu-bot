const { Client, Collection, GatewayIntentBits, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const logger = require('./utils/logger');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
  ],
});

client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      logger.info(`Loaded command: /${command.data.name}`);
    } else {
      logger.error(`The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

client.once('ready', () => {
  logger.info(`Logged in as ${client.user.tag}!`);
  logger.info('Monke is awake 🐒');
  
  // Set the static funny bot status
  client.user.setActivity('Clicking circles while from trees 🍌', { type: ActivityType.Custom });
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    logger.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(`Error executing /${interaction.commandName}`, error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
});

client.on('error', (error) => {
  logger.error(`Discord Client Error: ${error.message}`);
});

if (process.env.NODE_ENV !== 'test') {
  if (!process.env.DISCORD_TOKEN) {
    logger.error('DISCORD_TOKEN is not defined in environment variables!');
    process.exit(1);
  }
  client.login(process.env.DISCORD_TOKEN).catch((err) => {
    logger.error(`Failed to login: ${err.message}`);
  });
}

module.exports = client;
