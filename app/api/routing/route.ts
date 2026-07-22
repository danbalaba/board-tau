import { NextResponse } from 'next/server';

// Simple in-memory cache as a stand-in for Redis
const routeCache = new Map<string, { data: any; expiry: number }>();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start'); // format: lng,lat
    const end = searchParams.get('end');     // format: lng,lat

    if (!start || !end) {
      return NextResponse.json(
        { error: 'Missing start or end coordinates' },
        { status: 400 }
      );
    }

    const cacheKey = `${start}-${end}`;
    const cached = routeCache.get(cacheKey);

    if (cached && cached.expiry > Date.now()) {
      return NextResponse.json(cached.data);
    }

    // Call OSRM API for walking route
    const osrmUrl = `http://router.project-osrm.org/route/v1/foot/${start};${end}?overview=full&geometries=geojson`;
    const response = await fetch(osrmUrl, {
      headers: {
        'User-Agent': 'BoardTAU-App/1.0',
      },
      next: { revalidate: 3600 }, // Optional: Next.js fetch caching
    });

    if (!response.ok) {
      throw new Error(`OSRM API failed with status: ${response.status}`);
    }

    const data = await response.json();

    // Cache the result for 30 days (simplified to 30 days in ms for in-memory)
    routeCache.set(cacheKey, {
      data,
      expiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });

    // Cleanup cache periodically in a real app, or use actual Redis

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[ROUTING_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to calculate route', details: error.message },
      { status: 500 }
    );
  }
}
