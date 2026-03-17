import { Prisma } from '@prisma/client';

export class PrismaErrorHandler {
  static handle(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          return {
            status: 409,
            message: 'Resource already exists',
            details: error.meta?.target,
          };
        case 'P2025':
          return {
            status: 404,
            message: 'Resource not found',
            details: error.meta?.cause,
          };
        case 'P2003':
          return {
            status: 400,
            message: 'Foreign key constraint failed',
            details: error.meta?.field_name,
          };
        default:
          return {
            status: 400,
            message: 'Database operation failed',
            details: error.message,
          };
      }
    }

    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      return {
        status: 500,
        message: 'Unknown database error',
        details: error.message,
      };
    }

    if (error instanceof Prisma.PrismaClientRustPanicError) {
      return {
        status: 500,
        message: 'Database connection error',
        details: error.message,
      };
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return {
        status: 500,
        message: 'Database connection failed',
        details: error.message,
      };
    }

    return {
      status: 500,
      message: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
