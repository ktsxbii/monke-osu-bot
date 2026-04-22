const { Client, GatewayIntentBits } = require('discord.js');
const logger = require('../src/utils/logger');

jest.mock('discord.js', () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      login: jest.fn().mockResolvedValue('token'),
      on: jest.fn(),
      once: jest.fn(),
    })),
    GatewayIntentBits: {
      Guilds: 1,
      GuildMessages: 2,
      MessageContent: 4,
    }
  };
});

jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('Bot Entry Point', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize Discord client with correct intents', () => {
    require('../src/index');
    
    expect(Client).toHaveBeenCalledWith(expect.objectContaining({
      intents: [GatewayIntentBits.Guilds]
    }));
  });
});
