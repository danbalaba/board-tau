import { strictLimiter, publicLimiter, standardLimiter, adminLimiter } from '../rate-limit';

jest.mock('@upstash/ratelimit', () => {
  return {
    Ratelimit: Object.assign(
      jest.fn().mockImplementation(() => ({
        limit: jest.fn(),
      })),
      {
        slidingWindow: jest.fn().mockReturnValue('mockLimiter'),
      }
    )
  };
});

jest.mock('../redis', () => ({
  default: 'mockRedis'
}));

describe('rate-limit', () => {
  it('exports all rate limiters', () => {
    expect(strictLimiter).toBeDefined();
    expect(publicLimiter).toBeDefined();
    expect(standardLimiter).toBeDefined();
    expect(adminLimiter).toBeDefined();
  });
});
