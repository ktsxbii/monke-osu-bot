const { v2 } = require('osu-api-v2');
const api = require('../src/utils/api');

jest.mock('osu-api-v2', () => ({
  v2: {
    login: jest.fn()
  }
}));

describe('API Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OSU_CLIENT_ID = '123';
    process.env.OSU_CLIENT_SECRET = 'secret';
  });

  test('should authenticate using environment variables', async () => {
    v2.login.mockResolvedValue('token');
    
    await api.getClient();
    
    expect(v2.login).toHaveBeenCalledWith('123', 'secret');
  });

  test('should throw error if credentials missing', async () => {
    delete process.env.OSU_CLIENT_ID;
    
    await expect(api.getClient()).rejects.toThrow('OSU_CLIENT_ID or OSU_CLIENT_SECRET missing');
  });
});
