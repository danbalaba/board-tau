import { PrismaErrorHandler } from '../prisma-error-handler';
import { Prisma } from '@prisma/client';

jest.mock('@prisma/client', () => {
  class MockKnownError extends Error {
    code: string;
    meta?: any;
    constructor(msg: string, code: string, meta?: any) {
      super(msg);
      Object.setPrototypeOf(this, MockKnownError.prototype);
      this.code = code;
      this.meta = meta;
    }
  }
  class MockUnknownError extends Error {
    constructor(msg: string) {
      super(msg);
      Object.setPrototypeOf(this, MockUnknownError.prototype);
    }
  }
  class MockRustPanicError extends Error {
    constructor(msg: string) {
      super(msg);
      Object.setPrototypeOf(this, MockRustPanicError.prototype);
    }
  }
  class MockInitError extends Error {
    constructor(msg: string) {
      super(msg);
      Object.setPrototypeOf(this, MockInitError.prototype);
    }
  }

  return {
    Prisma: {
      PrismaClientKnownRequestError: MockKnownError,
      PrismaClientUnknownRequestError: MockUnknownError,
      PrismaClientRustPanicError: MockRustPanicError,
      PrismaClientInitializationError: MockInitError,
    }
  };
});

describe('PrismaErrorHandler', () => {
  it('handles P2002 (Unique constraint failed)', () => {
    const error = new (Prisma.PrismaClientKnownRequestError as any)('msg', 'P2002', { target: ['email'] });
    const result = PrismaErrorHandler.handle(error);
    expect(result.status).toBe(409);
    expect(result.message).toBe('Resource already exists');
    expect(result.details).toEqual(['email']);
  });

  it('handles P2025 (Record not found)', () => {
    const error = new (Prisma.PrismaClientKnownRequestError as any)('msg', 'P2025', { cause: 'Not found' });
    const result = PrismaErrorHandler.handle(error);
    expect(result.status).toBe(404);
    expect(result.message).toBe('Resource not found');
  });

  it('handles P2003 (Foreign key constraint failed)', () => {
    const error = new (Prisma.PrismaClientKnownRequestError as any)('msg', 'P2003', { field_name: 'userId' });
    const result = PrismaErrorHandler.handle(error);
    expect(result.status).toBe(400);
    expect(result.message).toBe('Foreign key constraint failed');
  });

  it('handles generic known request errors', () => {
    const error = new (Prisma.PrismaClientKnownRequestError as any)('msg', 'P9999');
    const result = PrismaErrorHandler.handle(error);
    expect(result.status).toBe(400);
    expect(result.message).toBe('Database operation failed');
  });

  it('handles unknown request errors', () => {
    const error = new (Prisma.PrismaClientUnknownRequestError as any)('unknown msg');
    const result = PrismaErrorHandler.handle(error);
    expect(result.status).toBe(500);
    expect(result.message).toBe('Unknown database error');
  });

  it('handles rust panic errors', () => {
    const error = new (Prisma.PrismaClientRustPanicError as any)('panic');
    const result = PrismaErrorHandler.handle(error);
    expect(result.status).toBe(500);
    expect(result.message).toBe('Database connection error');
  });

  it('handles initialization errors', () => {
    const error = new (Prisma.PrismaClientInitializationError as any)('init');
    const result = PrismaErrorHandler.handle(error);
    expect(result.status).toBe(500);
    expect(result.message).toBe('Database connection failed');
  });

  it('handles standard Error', () => {
    const error = new Error('generic error');
    const result = PrismaErrorHandler.handle(error);
    expect(result.status).toBe(500);
    expect(result.message).toBe('Internal server error');
    expect(result.details).toBe('generic error');
  });
});
