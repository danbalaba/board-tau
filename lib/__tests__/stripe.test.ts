import { stripe } from '../stripe';

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn(),
      }
    }
  }));
});

describe('stripe', () => {
  it('exports stripe instance or null', () => {
    // Depending on process.env in tests, it might be null or instance
    expect(stripe).toBeDefined(); // can be null, which is defined
  });
});
