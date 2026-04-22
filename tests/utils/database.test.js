const db = require('../../src/utils/database');

describe('Database Utility', () => {
  test('should initialize sqlite database and create users table', () => {
    const tableInfo = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
    expect(tableInfo).toBeDefined();
    expect(tableInfo.name).toBe('users');
  });

  test('users table should have correct columns', () => {
    const columns = db.prepare("PRAGMA table_info(users)").all();
    const columnNames = columns.map(c => c.name);
    
    expect(columnNames).toContain('discord_id');
    expect(columnNames).toContain('osu_id');
    expect(columnNames).toContain('osu_username');
    
    const discordIdCol = columns.find(c => c.name === 'discord_id');
    expect(discordIdCol.type).toBe('TEXT');
    expect(discordIdCol.pk).toBe(1);
  });
});
