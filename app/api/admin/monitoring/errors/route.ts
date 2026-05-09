import { NextRequest, NextResponse } from 'next/server';
import { ApiResponseFormatter } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        ApiResponseFormatter.error('Unauthorized', 'Admin access required'),
        { status: 401 }
      );
    }

    // In a production environment, this data would be fetched from an error tracking service 
    // like Sentry, LogRocket, or an internal error_logs table in the database.
    // For this implementation, we provide a structured real-time simulation.

    const now = new Date();
    const trendData = Array.from({ length: 12 }, (_, i) => {
      const time = new Date(now.getTime() - (11 - i) * 15 * 60 * 1000);
      return {
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        count: 8 + Math.floor(Math.random() * 20),
        highSeverity: Math.floor(Math.random() * 5)
      };
    });

    const errorByType = [
      { name: 'Server (5xx)', value: 45, color: '#ef4444' },
      { name: 'Client (4xx)', value: 30, color: '#f59e0b' },
      { name: 'Database', value: 15, color: '#3b82f6' },
      { name: 'Network', value: 10, color: '#10b981' }
    ];

    const recentErrors = [
      {
        id: 'err-101',
        errorType: '500 Internal Server Error',
        message: 'PrismaClientKnownRequestError: Record to update not found.',
        stackTrace: 'at app/api/admin/moderation/hosts/route.ts:42:15',
        occurrences: 18,
        severity: 'high' as const,
        lastOccurred: '3 minutes ago'
      },
      {
        id: 'err-102',
        errorType: '408 Request Timeout',
        message: 'External API gateway timeout (stripe.com)',
        stackTrace: 'at lib/payments/stripe.ts:112:8',
        occurrences: 54,
        severity: 'medium' as const,
        lastOccurred: '8 minutes ago'
      },
      {
        id: 'err-103',
        errorType: '503 Service Unavailable',
        message: 'Redis cluster unreachable: ETIMEDOUT 127.0.0.1:6379',
        stackTrace: 'at lib/redis.ts:14:22',
        occurrences: 5,
        severity: 'critical' as const,
        lastOccurred: '1 minute ago'
      },
      {
        id: 'err-104',
        errorType: '401 Unauthorized',
        message: 'Authentication failed: JWT signature mismatch',
        stackTrace: 'at middleware.ts:24:9',
        occurrences: 142,
        severity: 'medium' as const,
        lastOccurred: '10 minutes ago'
      }
    ];

    const data = {
      summary: {
        totalErrors: 284 + Math.floor(Math.random() * 50),
        criticalErrors: 5 + Math.floor(Math.random() * 3),
        errorRate: 1.24,
        resolutionRate: 78
      },
      trends: trendData,
      distribution: errorByType,
      recent: recentErrors
    };

    return NextResponse.json(ApiResponseFormatter.success(data));
  } catch (error) {
    console.error('Error tracking API error:', error);
    return NextResponse.json(ApiResponseFormatter.error('Internal Server Error'), { status: 500 });
  }
}
