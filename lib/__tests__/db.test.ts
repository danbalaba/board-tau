import { db } from '../db';
import { PrismaClient } from '@prisma/client';

describe('db.ts', () => {
  it('exports a db instance which is a PrismaClient', () => {
    expect(db).toBeDefined();
    expect(db).toBeInstanceOf(PrismaClient);
  });
});
