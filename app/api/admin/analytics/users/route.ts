import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponseFormatter } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Ensure the route is always fresh and skips static optimization
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(ApiResponseFormatter.error('Unauthorized'), { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '30d';

    // 1. Fetch Core Data (Direct Profile Fields Only)
    const allUsers = await db.user.findMany({
      select: {
        id: true,
        createdAt: true,
        role: true,
        isVerifiedLandlord: true,
        deletedAt: true,
        lastLogin: true,
        city: true,
        region: true
      }
    });

    // Filter out deleted users for the dashboard
    const activeRaw = allUsers.filter(u => u.deletedAt === null);

    // 2. Role Distribution
    const rolesMap: Record<string, number> = { 'Admin': 0, 'Landlord': 0, 'User': 0 };
    activeRaw.forEach(u => {
      let r = 'User';
      const roleStr = (u.role || '').toUpperCase();
      if (roleStr === 'ADMIN') r = 'Admin';
      else if (roleStr === 'LANDLORD') r = 'Landlord';
      else r = 'User';
      
      rolesMap[r] = (rolesMap[r] || 0) + 1;
    });
    const userRoles = Object.entries(rolesMap)
      .filter(([_, count]) => count > 0)
      .map(([role, count]) => ({ role, count }));

    // 3. User Locations (STRICT PROFILE QUERY ONLY)
    const locationMap: Record<string, number> = {};
    
    activeRaw.forEach(user => {
      const location = user.city || user.region;
      if (location) {
        locationMap[location] = (locationMap[location] || 0) + 1;
      }
    });

    const locationData = Object.entries(locationMap)
      .map(([city, users]) => ({ city, users }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 5);

    // 4. Verification Status
    const verifiedCount = activeRaw.filter(u => u.isVerifiedLandlord).length;
    const verificationStatus = [
      { isVerifiedLandlord: true, count: verifiedCount },
      { isVerifiedLandlord: false, count: activeRaw.length - verifiedCount }
    ];

    // 5. Growth Data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const growthData = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const mIdx = d.getMonth();
      const mYear = d.getFullYear();
      
      const count = activeRaw.filter(u => {
        const cDate = new Date(u.createdAt);
        return cDate.getMonth() === mIdx && cDate.getFullYear() === mYear;
      }).length;

      return {
        month: months[mIdx],
        newUsers: count,
        activeUsers: activeRaw.length
      };
    });

    // Calculate Active Users based on lastLogin
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const trulyActiveCount = activeRaw.filter(u => u.lastLogin && new Date(u.lastLogin) >= thirtyDaysAgo).length;

    return NextResponse.json(ApiResponseFormatter.success({
      totalUsers: activeRaw.length,
      newUsers: activeRaw.filter(u => u.createdAt >= thirtyDaysAgo).length,
      activeUsers: trulyActiveCount || Math.max(1, activeRaw.length),
      userRoles,
      verificationStatus,
      locationData,
      growthData,
      timeRange: range
    }));

  } catch (error) {
    console.error('SYSTEM SYNC ERROR:', error);
    return NextResponse.json(ApiResponseFormatter.error('Database query failed'), { status: 500 });
  }
}
