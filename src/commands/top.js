const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getApi } = require('../utils/api');
const db = require('../utils/database');
const { createTopListEmbed, createErrorEmbed } = require('../utils/embeds');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('top')
    .setDescription('🐒 View the top osu! plays')
    .addStringOption(option =>
      option.setName('user')
        .setDescription('Osu! username or mention a Discord user')
        .setRequired(false)),
  
  async execute(interaction) {
    let targetOsuUser = interaction.options.getString('user');
    
    // Resolve user (same logic)
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

      // Fetch top 100 scores
      const allScores = await api.users.scores(osuUser.id, 'best', 'osu', 100, 0);
      
      if (!allScores || allScores.length === 0) {
        return interaction.editReply({ 
          content: `🐒 **${osuUser.username}** has no top plays!` 
        });
      }

      let currentPage = 1;
      const totalPages = Math.ceil(allScores.length / 5);

      const getEmbed = (page) => {
        const start = (page - 1) * 5;
        const pageScores = allScores.slice(start, start + 5);
        return createTopListEmbed(osuUser, pageScores, page);
      };

      const getRow = (page) => {
        return new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('⬅ Previous 5')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 1),
          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next 5 ➡')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === totalPages)
        );
      };

      const response = await interaction.editReply({
        embeds: [getEmbed(currentPage)],
        components: [getRow(currentPage)],
      });

      const collector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 600_000, // 10 minutes
      });

      collector.on('collect', async (i) => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({ content: '🍌 Only the person who used the command can switch pages!', ephemeral: true });
        }

        if (i.customId === 'prev') {
          currentPage--;
        } else if (i.customId === 'next') {
          currentPage++;
        }

        await i.update({
          embeds: [getEmbed(currentPage)],
          components: [getRow(currentPage)],
        });
      });

      collector.on('end', () => {
        interaction.editReply({ components: [] }).catch(() => {});
      });

    } catch (error) {
      logger.error('Error in /top:', error);
      await interaction.editReply({ 
        embeds: [createErrorEmbed(`Failed to fetch top plays: ${error.message}`)] 
      });
    }
  },
};
