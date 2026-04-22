const { SlashCommandBuilder } = require('discord.js');
const { getApi } = require('../utils/api');
const db = require('../utils/database');
const { createStatsEmbed, createErrorEmbed } = require('../utils/embeds');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('🐒 View an osu! profile')
    .addStringOption(option =>
      option.setName('user')
        .setDescription('Osu! username or mention a Discord user')
        .setRequired(false)),
  
  async execute(interaction) {
    let targetOsuUser = interaction.options.getString('user');
    
    // Resolve user
    if (!targetOsuUser) {
      const linked = db.prepare('SELECT osu_username FROM users WHERE discord_id = ?').get(interaction.user.id);
      if (linked) {
        targetOsuUser = linked.osu_username;
      } else {
        return interaction.reply({ 
          embeds: [createErrorEmbed('You haven\'t linked your profile yet! Use `/profileset <username>`')],
          ephemeral: true 
        });
      }
    } else {
      const mentionMatch = targetOsuUser.match(/<@!?(\d+)>/);
      if (mentionMatch) {
        const discordId = mentionMatch[1];
        const linked = db.prepare('SELECT osu_username FROM users WHERE discord_id = ?').get(discordId);
        if (linked) {
          targetOsuUser = linked.osu_username;
        } else {
          return interaction.reply({ 
            embeds: [createErrorEmbed('That Discord user hasn\'t linked their osu! profile.')],
            ephemeral: true 
          });
        }
      }
    }

    await interaction.deferReply();

    try {
      const api = await getApi();
      const osuUser = await api.users.get(targetOsuUser, 'osu');
      
      if (!osuUser) {
        return interaction.editReply({ 
          embeds: [createErrorEmbed(`Could not find osu! user: **${targetOsuUser}**`)] 
        });
      }
      
      const embed = createStatsEmbed(osuUser);
      await interaction.editReply({ embeds: [embed] });
      
    } catch (error) {
      logger.error('Error in /profile:', error);
      await interaction.editReply({ 
        embeds: [createErrorEmbed(`Failed to fetch profile stats: ${error.message}`)] 
      });
    }
  },
};
