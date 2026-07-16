import { edgeStoreRouter } from '../edgestore-router';
import { initEdgeStore } from '@edgestore/server';

jest.mock('@edgestore/server', () => ({
  initEdgeStore: {
    context: () => ({
      create: () => ({
        router: (config: any) => config,
        fileBucket: () => ({
          metadata: jest.fn().mockReturnThis(),
          beforeUpload: jest.fn().mockReturnThis(),
          beforeDelete: jest.fn().mockReturnThis(),
          input: jest.fn().mockReturnThis(),
          path: jest.fn().mockReturnThis(),
          accessControl: jest.fn().mockReturnThis(),
        }),
      }),
    }),
  },
}));

describe('edgestore-router', () => {
  it('exports a valid router configuration', () => {
    expect(edgeStoreRouter).toBeDefined();
    expect((edgeStoreRouter as any).publicFiles || (edgeStoreRouter as any).buckets?.publicFiles).toBeDefined();
    expect((edgeStoreRouter as any).reviewMedia || (edgeStoreRouter as any).buckets?.reviewMedia).toBeDefined();
    expect((edgeStoreRouter as any).identityDocs || (edgeStoreRouter as any).buckets?.identityDocs).toBeDefined();
  });
});
