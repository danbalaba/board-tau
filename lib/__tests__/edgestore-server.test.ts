import { backendClient } from '../edgestore-server';

jest.mock('../edgestore-router', () => ({
  edgeStoreRouter: {
    client: {
      publicFiles: 'mockPublicFiles'
    }
  }
}));

describe('edgestore-server', () => {
  it('exports backendClient', () => {
    expect((backendClient as any).publicFiles).toBe('mockPublicFiles');
  });
});

