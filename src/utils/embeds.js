const { EmbedBuilder } = require('discord.js');
const logger = require('./logger');

const COLORS = {
  PINK: 0xff66aa,   // Monke / User
  YELLOW: 0xffcc00, // Rank
  GREEN: 0x00ff88,  // PP
  BLUE: 0x66ccff,   // Accuracy
  ERROR: 0xff5555   // Error
};

const EMOJIS = {
  SSH: '<:osu_SSH:1496350341929631804>',
  SS: '<:osu_SS:1496350361651384481>',
  SH: '<:osu_SH:1496350308711010334>',
  S: '<:osu_S:1496350256735191230>',
  A: '<:osu_A:1496350397911007252>',
  B: '<:osu_B:1496350432769871962>',
  C: '<:osu_C:1496350472725074023>',
  D: '<:osu_D:1496350513942368287>',
  F: '<:osu_D:1496350513942368287>'
};

/**
 * Gets the custom emoji for an osu! rank string.
 */
function getRankEmoji(rank) {
  if (!rank) return '❓';
  
  const r = rank.toString().toUpperCase();
  
  // Map API variations to our EMOJIS keys
  if (r === 'X' || r === 'SS') return EMOJIS.SS;
  if (r === 'XH' || r === 'SSH') return EMOJIS.SSH;
  if (r === 'SH') return EMOJIS.SH;
  if (r === 'S') return EMOJIS.S;
  
  return EMOJIS[r] || `**${r}**`;
}

/**
 * Converts 2-letter country code to flag emoji.
 */
function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Formats a number with commas.
 */
const formatNum = (num) => num?.toLocaleString() || '0';

/**
 * Converts ISO date to Discord Timestamp markdown.
 */
function toDiscordTS(dateString) {
  if (!dateString) return 'unknown';
  const unix = Math.floor(new Date(dateString).getTime() / 1000);
  return `<t:${unix}:R>`;
}

/**
 * Calculates time ago manually for use in Footers.
 * Rounds up if there is less than half a year remaining until the next year.
 */
function timeAgoManual(dateString) {
  if (!dateString) return 'unknown';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  // Year calculation with rounding: 0.5+ rule
  const yearsExact = diffDays / 365.25;
  const yearsRounded = Math.round(yearsExact);
  
  if (yearsRounded > 0) return `${yearsRounded} year${yearsRounded === 1 ? '' : 's'} ago`;
  const diffMonths = Math.floor(diffDays / 30.44);
  if (diffMonths > 0) return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
  if (diffDays > 0) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  return 'recently';
}

function createStatsEmbed(userData) {
  const stats = userData.statistics;
  const countryCode = userData.country_code;
  const flagEmoji = getFlagEmoji(countryCode);
  
  const peak = userData.rank_highest || userData.rankHistory?.highest || { rank: 0, updated_at: null };
  const peakTime = peak.updated_at ? toDiscordTS(peak.updated_at) : 'unknown';

  const embed = new EmbedBuilder()
    .setTitle(`${flagEmoji} osu! profile for ${userData.username}`)
    .setColor(COLORS.PINK)
    .setThumbnail(userData.avatar_url)
    .addFields(
      { 
        name: 'Bancho Rank:', 
        value: `**#${formatNum(stats.global_rank)}** (${countryCode}#${formatNum(stats.country_rank)})\n` +
               `Peak Rank: **#${formatNum(peak.rank)}** (${peakTime})`,
        inline: false 
      },
      { 
        name: 'Stats:', 
        value: `Level: **${stats.level.current}** (${stats.level.progress}%)\n` +
               `Performance: **${formatNum(stats.pp)} PP**\n` +
               `Accuracy: **${stats.hit_accuracy.toFixed(2)}%**\n` +
               `Play Count: **${formatNum(stats.play_count)}**`, 
        inline: false 
      }
    );

  const grades = stats.grade_counts;
  const gradeText = [
    `${EMOJIS.SS} ${formatNum(grades.ss + grades.ssh)}`,
    `${EMOJIS.S} ${formatNum(grades.s + grades.sh)}`,
    `${EMOJIS.A} ${formatNum(grades.a)}`
  ].join(' | ');

  embed.addFields({ name: 'Ranks:', value: gradeText, inline: false });
  
  // Footer with join date and Monke emoji branding
  const joinDate = new Date(userData.join_date);
  const joinYMD = joinDate.toISOString().split('T')[0];
  const joinAgo = timeAgoManual(userData.join_date);
  embed.setFooter({ text: `Joined osu! ${joinYMD} (${joinAgo}) | 🐒 Monke osu!` });

  return embed;
}

function createErrorEmbed(message) {
  return new EmbedBuilder()
    .setTitle('🐒 OOPSIE! Monke error')
    .setDescription(message)
    .setColor(COLORS.ERROR);
}

function createTopListEmbed(userData, scores, page = 1) {
  const embed = new EmbedBuilder()
    .setTitle(`🐒 Top osu! plays for ${userData.username}`)
    .setColor(COLORS.PINK)
    .setThumbnail(userData.avatar_url)
    .setFooter({ text: `Page ${page} of 20 • 🐒 Monke osu!` });

  const description = scores.map((score, index) => {
    const rankNum = (page - 1) * 5 + index + 1;
    const map = score.beatmapset;
    const diff = score.beatmap.version;
    const mods = score.mods.length > 0 ? ` +${score.mods.join('')}` : '';
    const stars = score.beatmap.difficulty_rating.toFixed(2);
    const time = toDiscordTS(score.created_at);
    
    const rankEmoji = getRankEmoji(score.rank);
    
    return `${rankNum}. **[${map.title} [${diff}]](https://osu.ppy.sh/b/${score.beatmap.id})**${mods} (${stars}★)\n` +
           `└ ${rankEmoji} | **${formatNum(score.pp)}PP** | ${(score.accuracy * 100).toFixed(2)}% | Miss: ${score.statistics.count_miss} | ${time}`;
  }).join('\n');

  embed.setDescription(description || 'No plays found!');

  return embed;
}

function createRecentScoreEmbed(userData, score) {
  const map = score.beatmapset;
  const diff = score.beatmap.version;
  const mods = score.mods.length > 0 ? ` +${score.mods.join('')}` : '';
  const stars = score.beatmap.difficulty_rating.toFixed(2);
  const time = toDiscordTS(score.created_at);
  const stats = score.statistics;
  const rankEmoji = getRankEmoji(score.rank);
  
  const ppValue = score.pp ? `**${formatNum(score.pp)} PP**` : '`No PP`';

  const embed = new EmbedBuilder()
    .setTitle(`🐒 Recent play for ${userData.username}`)
    .setColor(COLORS.PINK)
    .setThumbnail(map.covers.list || map.covers.cover)
    .addFields(
      { 
        name: `${map.title} [${diff}]${mods}`, 
        value: `**${stars} ★** | ${ppValue} | **${(score.accuracy * 100).toFixed(2)}%**\n` +
               `**Rank:** ${rankEmoji} | **Combo:** ${score.max_combo}x | **Score:** ${formatNum(score.score)} | ${time}`,
        inline: false 
      },
      { 
        name: 'Hits:', 
        value: `300: **${stats.count_300}** | 100: **${stats.count_100}** | 50: **${stats.count_50}** | Miss: **${stats.count_miss}**`, 
        inline: false 
      }
    )
    .setFooter({ text: `🐒 Monke osu!` });

  return embed;
}

module.exports = {
  createStatsEmbed,
  createErrorEmbed,
  createTopListEmbed,
  createRecentScoreEmbed
};
