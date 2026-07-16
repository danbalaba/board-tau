import { backendClient } from '../edgestore-server';

jest.mock('@edgestore/server/core', () => ({
  initEdgeStoreClient: jest.fn().mockReturnValue('mockBackendClient')
}));

jest.mock('../edgestore-router', () => ({
  edgeStoreRouter: 'mockRouter'
}));

describe('edgestore-server', () => {
  it('exports backendClient', () => {
    expect(backendClient).toBe('mockBackendClient');
  });
});
