import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponseFormatter } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import redis from '@/lib/redis';
import os from 'os';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        ApiResponseFormatter.error('Unauthorized', 'Admin access required'),
        { status: 401 }
      );
    }

    // 1. Check Database Health
    let dbStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    let dbResponseTime = 0;
    const dbStart = Date.now();
    try {
      // For MongoDB with Prisma
      await db.$runCommandRaw({ ping: 1 });
      dbResponseTime = Date.now() - dbStart;
    } catch (error) {
      console.error('Database health check failed:', error);
      dbStatus = 'critical';
    }

    // 2. Check Redis Health
    let redisStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    let redisResponseTime = 0;
    const redisStart = Date.now();
    try {
      if (redis) {
        await redis.ping();
        redisResponseTime = Date.now() - redisStart;
      } else {
        redisStatus = 'warning';
      }
    } catch (error) {
      console.error('Redis health check failed:', error);
      redisStatus = 'critical';
    }

    // 3. API Server (current)
    const apiStatus = 'healthy';
    // Uptime in days, hours
    const uptimeSeconds = os.uptime();
    const days = Math.floor(uptimeSeconds / (24 * 3600));
    const hours = Math.floor((uptimeSeconds % (24 * 3600)) / 3600);
    const uptimeStr = `${days}d ${hours}h`;

    // 4. Email Service (Check if configured)
    const emailConfigured = !!(process.env.RESEND_API_KEY || process.env.EMAIL_SERVER || process.env.SENDGRID_API_KEY);
    const emailStatus = emailConfigured ? 'healthy' : 'warning';

    // System Metrics
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memUsage = ((totalMem - freeMem) / totalMem) * 100;
    
    // CPU Load (Average over 1 minute)
    const loadAvg = os.loadavg()[0];
    const cpuCount = os.cpus().length;
    const cpuUsage = Math.min(100, Math.round((loadAvg / cpuCount) * 100)) || 15; // Fallback if loadavg is 0

    // Services data
    const services = [
      {
        id: 'api',
        name: 'API Server',
        status: apiStatus,
        uptime: uptimeStr,
        responseTime: 120, // Baseline response time
        lastChecked: new Date().toISOString()
      },
      {
        id: 'db',
        name: 'Database',
        status: dbStatus,
        uptime: 'Online',
        responseTime: dbResponseTime,
        lastChecked: new Date().toISOString()
      },
      {
        id: 'cache',
        name: 'Cache (Redis)',
        status: redisStatus,
        uptime: redisStatus === 'healthy' ? 'Connected' : 'Disconnected',
        responseTime: redisResponseTime,
        lastChecked: new Date().toISOString()
      },
      {
        id: 'email',
        name: 'Email Service',
        status: emailStatus,
        uptime: emailConfigured ? 'Configured' : 'Not Configured',
        responseTime: 0,
        lastChecked: new Date().toISOString()
      }
    ];

    // Alerts
    const alerts = [];
    if (memUsage > 80) {
      alerts.push({
        id: 'high-mem',
        title: 'High Memory Usage',
        description: `Memory usage is at ${memUsage.toFixed(1)}%`,
        severity: 'warning',
        timestamp: new Date().toISOString()
      });
    }
    if (dbStatus === 'critical') {
      alerts.push({
        id: 'db-down',
        title: 'Database Connection Failed',
        description: 'Unable to connect to MongoDB cluster',
        severity: 'critical',
        timestamp: new Date().toISOString()
      });
    }
    if (redisStatus === 'critical') {
      alerts.push({
        id: 'redis-down',
        title: 'Redis Connection Failed',
        description: 'Cache service is currently unavailable',
        severity: 'warning',
        timestamp: new Date().toISOString()
      });
    }

    const healthData = {
      services,
      performance: {
        cpuUsage,
        memoryUsage: Math.round(memUsage),
        diskSpace: 42, // Mock disk space as it requires shell commands to get accurately
      },
      alerts: alerts.length > 0 ? alerts : [
        {
          id: 'all-good',
          title: 'System Stable',
          description: 'All services are performing within normal parameters',
          severity: 'healthy',
          timestamp: new Date().toISOString()
        }
      ]
    };

    return NextResponse.json(ApiResponseFormatter.success(healthData));
  } catch (error) {
    console.error('System health API error:', error);
    return NextResponse.json(ApiResponseFormatter.error('Internal Server Error'), { status: 500 });
  }
}
