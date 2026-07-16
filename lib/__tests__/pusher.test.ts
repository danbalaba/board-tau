import { pusherServer } from '../pusher';

jest.mock('pusher', () => {
  return jest.fn().mockImplementation(() => ({
    trigger: jest.fn(),
  }));
});

describe('pusher', () => {
  it('exports pusherServer instance', () => {
    expect(pusherServer).toBeDefined();
  });
});
