const { EmbedBuilder } = require('discord.js');
const { createStatsEmbed, createErrorEmbed, createTopListEmbed } = require('../src/utils/embeds');

describe('Embed Utilities', () => {
  const MONKE_COLOR = 0x8B4513; // SaddleBrown for Monke theme

  describe('createStatsEmbed', () => {
    test('should create a stats embed with user data', () => {
      const userData = {
        username: 'MonkePlayer',
        statistics: {
          pp: 5000,
          global_rank: 1234,
          play_count: 9000,
          hit_accuracy: 98.5
        },
        avatar_url: 'http://avatar.url'
      };

      const embed = createStatsEmbed(userData);

      expect(embed.data.title).toBe('Osu! Stats for MonkePlayer');
      expect(embed.data.color).toBe(MONKE_COLOR);
      expect(embed.data.thumbnail.url).toBe('http://avatar.url');
      expect(embed.data.fields).toEqual(expect.arrayContaining([
        { name: 'PP', value: '5000', inline: true },
        { name: 'Global Rank', value: '#1234', inline: true },
        { name: 'Accuracy', value: '98.5%', inline: true },
        { name: 'Play Count', value: '9000', inline: true }
      ]));
    });
  });

  describe('createErrorEmbed', () => {
    test('should create an error embed', () => {
      const embed = createErrorEmbed('Something went wrong');
      expect(embed.data.title).toBe('🐒 OOPSIE! Monke error');
      expect(embed.data.description).toBe('Something went wrong');
      expect(embed.data.color).toBe(0xFF0000);
    });
  });

  describe('createTopListEmbed', () => {
    test('should create a top list embed', () => {
      const scores = [
        { beatmapset: { title: 'Map 1' }, pp: 500, accuracy: 0.99 },
        { beatmapset: { title: 'Map 2' }, pp: 450, accuracy: 0.98 }
      ];
      const username = 'Monke';

      const embed = createTopListEmbed(username, scores);
      expect(embed.data.title).toBe('Top Plays for Monke');
      expect(embed.data.description).toContain('Map 1');
      expect(embed.data.description).toContain('Map 2');
      expect(embed.data.color).toBe(MONKE_COLOR);
    });
  });
});
