const { SlashCommandBuilder } = require('discord.js');
const { getApi } = require('../utils/api');
const db = require('../utils/database');
const { createRecentScoreEmbed, createErrorEmbed } = require('../utils/embeds');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rs')
    .setDescription('🐒 View the most recent osu! play')
    .addStringOption(option =>
      option.setName('user')
        .setDescription('Osu! username or mention a Discord user')
        .setRequired(false)),
  
  async execute(interaction) {
    let targetOsuUser = interaction.options.getString('user');
    
    // Resolve user (same logic as /profile)
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

      // Fetch recent scores (include fails)
      const scores = await api.users.scores(osuUser.id, 'recent', 'osu', 1, 0, 1);
      
      if (!scores || scores.length === 0) {
        return interaction.editReply({ 
          content: `🐒 **${osuUser.username}** hasn't played anything recently!` 
        });
      }

      const recentScore = scores[0];
      const embed = createRecentScoreEmbed(osuUser, recentScore);
      
      await interaction.editReply({ embeds: [embed] });
      
    } catch (error) {
      logger.error('Error in /rs:', error);
      await interaction.editReply({ 
        embeds: [createErrorEmbed(`Failed to fetch recent play: ${error.message}`)] 
      });
    }
  },
};
