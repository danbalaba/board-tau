import { EdgeStoreProvider, useEdgeStore } from '../edgestore';

jest.mock('@edgestore/react', () => ({
  createEdgeStoreProvider: jest.fn().mockReturnValue({
    EdgeStoreProvider: 'MockProvider',
    useEdgeStore: jest.fn().mockReturnValue('MockHook')
  })
}));

describe('edgestore', () => {
  it('exports EdgeStoreProvider and useEdgeStore', () => {
    expect(EdgeStoreProvider).toBe('MockProvider');
    expect(useEdgeStore()).toBe('MockHook');
  });
});
