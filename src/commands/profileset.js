const { SlashCommandBuilder } = require('discord.js');
const { getApi } = require('../utils/api');
const db = require('../utils/database');
const logger = require('../utils/logger');
const { createErrorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profileset')
    .setDescription('🐒 Link your Discord account to an osu! profile')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Your osu! username')
        .setRequired(true)),
  
  async execute(interaction) {
    const username = interaction.options.getString('username');
    
    await interaction.deferReply({ ephemeral: true });
    
    try {
      const api = await getApi();
      const osuUser = await api.users.get(username, 'osu');
      
      if (!osuUser) {
        return interaction.editReply({ 
          embeds: [createErrorEmbed(`Could not find osu! user: **${username}**`)] 
        });
      }
      
      // Save to database
      const upsert = db.prepare(`
        INSERT INTO users (discord_id, osu_id, osu_username)
        VALUES (?, ?, ?)
        ON CONFLICT(discord_id) DO UPDATE SET
          osu_id = excluded.osu_id,
          osu_username = excluded.osu_username
      `);
      
      upsert.run(interaction.user.id, osuUser.id, osuUser.username);
      
      await interaction.editReply({ 
        content: `🐒 **Profile linked!** You are now set as **${osuUser.username}** (ID: ${osuUser.id}).` 
      });
      
    } catch (error) {
      logger.error('Error in /profileset:', error);
      await interaction.editReply({ 
        embeds: [createErrorEmbed(`Failed to link profile: ${error.message}`)] 
      });
    }
  },
};
