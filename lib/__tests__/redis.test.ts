import { cache } from '../redis';
import { Redis } from '@upstash/redis';

jest.mock('@upstash/redis', () => {
  const mRedis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    exists: jest.fn(),
    flushdb: jest.fn(),
  };
  return {
    Redis: {
      fromEnv: jest.fn(() => mRedis)
    }
  };
});

describe('redis cache utility', () => {
  let mockRedis: any;

  beforeEach(() => {
    mockRedis = Redis.fromEnv();
    jest.clearAllMocks();
  });

  it('generates a consistent cache key', () => {
    const key1 = cache.generateKey('test', { b: 2, a: 1 });
    const key2 = cache.generateKey('test', { a: 1, b: 2 });
    expect(key1).toEqual(key2);
  });

  it('gets parsed data', async () => {
    mockRedis.get.mockResolvedValueOnce('{"value": 1}');
    const result = await cache.get('key');
    expect(result).toEqual({ value: 1 });
    expect(mockRedis.get).toHaveBeenCalledWith('key');
  });

  it('gets null if not found', async () => {
    mockRedis.get.mockResolvedValueOnce(null);
    const result = await cache.get('missing');
    expect(result).toBeNull();
  });

  it('sets data as stringified JSON', async () => {
    mockRedis.set.mockResolvedValueOnce('OK');
    const result = await cache.set('key', { value: 1 }, 100);
    expect(result).toBe(true);
    expect(mockRedis.set).toHaveBeenCalledWith('key', '{"value":1}', { ex: 100 });
  });

  it('deletes data', async () => {
    mockRedis.del.mockResolvedValueOnce(1);
    const result = await cache.del('key');
    expect(result).toBe(true);
    expect(mockRedis.del).toHaveBeenCalledWith('key');
  });

  it('deletes by pattern', async () => {
    mockRedis.keys.mockResolvedValueOnce(['key1', 'key2']);
    mockRedis.del.mockResolvedValueOnce(2);
    const result = await cache.delPattern('key*');
    expect(result).toBe(true);
    expect(mockRedis.keys).toHaveBeenCalledWith('key*');
    expect(mockRedis.del).toHaveBeenCalledWith('key1', 'key2');
  });

  it('checks existence', async () => {
    mockRedis.exists.mockResolvedValueOnce(1);
    const result = await cache.exists('key');
    expect(result).toBe(true);
    expect(mockRedis.exists).toHaveBeenCalledWith('key');
  });

  it('flushes db', async () => {
    mockRedis.flushdb.mockResolvedValueOnce('OK');
    const result = await cache.flush();
    expect(result).toBe(true);
    expect(mockRedis.flushdb).toHaveBeenCalled();
  });
});
