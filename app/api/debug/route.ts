import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    console.log('Debug info request received');

    const users = await db.user.findMany({
      take: 5
    });
    console.log('Found users:', users.length);

    const listings = await db.listing.findMany({
      take: 5
    });
    console.log('Found listings:', listings.length);

    const reservations = await db.reservation.findMany();
    console.log('Found reservations:', reservations.length);

    return NextResponse.json({
      users: users.slice(0, 2),
      listings: listings.slice(0, 2),
      reservations: reservations,
      counts: {
        users: users.length,
        listings: listings.length,
        reservations: reservations.length
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
