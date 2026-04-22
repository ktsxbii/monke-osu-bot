const logger = require('../../src/utils/logger');

describe('Logger Utility', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('logger.info(message) should log to console.log', () => {
    const message = 'Test info message';
    logger.info(message);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[INFO]'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining(message));
  });

  test('logger.error(message) should log to console.error', () => {
    const message = 'Test error message';
    logger.error(message);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('[ERROR]'));
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining(message));
  });
});
