import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    // Get all reservations
    const reservations = await db.reservation.findMany({
      orderBy: { createdAt: 'asc' },
    });

    console.log(`Found ${reservations.length} reservations`);

    // Delete duplicate reservations for the same user and listing
    const uniqueReservations: string[] = [];
    const duplicates: string[] = [];

    for (const reservation of reservations) {
      const key = `${reservation.userId}-${reservation.listingId}`;
      if (uniqueReservations.includes(key)) {
        duplicates.push(reservation.id);
      } else {
        uniqueReservations.push(key);
      }
    }

    if (duplicates.length > 0) {
      await db.reservation.deleteMany({
        where: { id: { in: duplicates } },
      });
      console.log(`Deleted ${duplicates.length} duplicate reservations`);
    }

    const remainingReservations = await db.reservation.findMany();

    return NextResponse.json({
      success: true,
      originalCount: reservations.length,
      deletedCount: duplicates.length,
      remainingCount: remainingReservations.length,
      deletedIds: duplicates,
    });
  } catch (error) {
    console.error('Error cleaning up reservations:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
