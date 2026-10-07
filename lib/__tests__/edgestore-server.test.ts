import { backendClient } from '../edgestore-server';

jest.mock('../edgestore-router', () => ({
  edgeStoreRouter: {
    client: 'mockBackendClient'
  }
}));

describe('edgestore-server', () => {
  it('exports backendClient', () => {
    expect(backendClient).toBe('mockBackendClient');
  });
});
