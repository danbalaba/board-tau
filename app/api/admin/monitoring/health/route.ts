import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const start = Date.now();
  let dbStatus = 'error';
  let dbLatency = 0;

  try {
    // A simple query to check database connectivity
    await db.user.findFirst({ select: { id: true } });
    dbStatus = 'healthy';
    dbLatency = Date.now() - start;
  } catch (error) {
    console.error('Health Check DB Error:', error);
  }

  return NextResponse.json({
    status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
    services: {
      database: {
        status: dbStatus,
        latencyMs: dbLatency
      },
      api: {
        status: 'healthy',
        latencyMs: Date.now() - start
      }
    },
    timestamp: new Date().toISOString()
  });
}
