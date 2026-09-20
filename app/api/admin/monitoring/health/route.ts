import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import os from 'os';

export async function GET() {
  const start = Date.now();
  let dbStatus = 'healthy';
  let dbLatency = 0;
  let userCount = 0;
  let propertyCount = 0;
  let recentLogs: any[] = [];

  try {
    const dbStart = Date.now();
    // Real DB query & metrics
    [userCount, propertyCount] = await Promise.all([
      db.user.count(),
      db.listing.count()
    ]);
    dbLatency = Date.now() - dbStart;

    // Fetch real recent admin audit logs directly from the database
    recentLogs = await db.adminActivityLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: { name: true, role: true }
        }
      }
    });
  } catch (error) {
    console.error('Health Check DB Error:', error);
    dbStatus = 'degraded';
  }

  // Real Node.js process memory & system telemetry
  const memory = process.memoryUsage();
  const heapUsedMb = Math.round(memory.heapUsed / 1024 / 1024);
  const heapTotalMb = Math.round(memory.heapTotal / 1024 / 1024);
  const memoryPercent = Math.min(Math.round((memory.heapUsed / memory.heapTotal) * 100), 100);

  const uptimeSeconds = Math.floor(process.uptime());
  const days = Math.floor(uptimeSeconds / 86400);
  const hours = Math.floor((uptimeSeconds % 86400) / 3600);
  const mins = Math.floor((uptimeSeconds % 3600) / 60);
  const uptimeString = days > 0 ? `${days}d ${hours}h` : `${hours}h ${mins}m`;

  const totalMemGb = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(1);
  const freeMemGb = (os.freemem() / (1024 * 1024 * 1024)).toFixed(1);
  const cpuCores = os.cpus().length;

  const apiLatency = Date.now() - start;

  return NextResponse.json({
    status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
    uptime: uptimeString,
    uptimeSeconds,
    services: {
      database: {
        name: 'MongoDB (Prisma Client)',
        status: dbStatus,
        latencyMs: dbLatency,
        userCount,
        propertyCount
      },
      api: {
        name: 'Next.js App Router API',
        status: 'healthy',
        latencyMs: apiLatency
      }
    },
    system: {
      heapUsedMb,
      heapTotalMb,
      memoryPercent,
      cpuCores,
      totalMemGb,
      freeMemGb
    },
    recentIncidents: recentLogs.map((log) => ({
      id: log.id,
      action: log.action,
      title: log.action.replace(/_/g, ' '),
      createdAt: log.createdAt,
      details: log.details || `Admin action performed by ${log.admin?.name || 'Admin'}`,
      adminName: log.admin?.name || 'System'
    })),
    timestamp: new Date().toISOString()
  });
}

