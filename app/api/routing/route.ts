import { NextResponse } from 'next/server';
import { cache } from '@/lib/redis';

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

    const cacheKey = cache.generateKey("api:routing", { start, end });
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(cachedData);
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

    // Cache the result for 30 days in Redis
    await cache.set(cacheKey, data, 60 * 60 * 24 * 30);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[ROUTING_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to calculate route', details: error.message },
      { status: 500 }
    );
  }
}
