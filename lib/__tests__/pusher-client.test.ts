import { pusherClient } from '../pusher-client';

jest.mock('pusher-js', () => {
  return jest.fn().mockImplementation(() => ({
    subscribe: jest.fn(),
  }));
});

describe('pusher-client', () => {
  it('exports pusherClient', () => {
    // In node environment (jest without JSDOM or typeof window === 'undefined'), it might be null or object
    // Since jest usually uses JSDOM, window is defined, so it should be defined.
    expect(pusherClient).toBeDefined();
  });
});
