import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createReservation } from '@/services/reservation';

export async function GET(req: Request) {
  try {
    // Get user ID and listing ID from query parameters or use defaults
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || '69840fda512f4b03b7037b7a'; // Current user
    const listingId = searchParams.get('listingId') || '6989973f2cde03982a790a8d'; // First listing

    console.log('Testing reservation creation with:', { userId, listingId });

    // Get actual listing price from database
    const listing = await db.listing.findUnique({
      where: { id: listingId }
    });

    if (!listing) {
      throw new Error(`Listing not found: ${listingId}`);
    }

    // Generate random dates
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() + 1); // Next month
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 3); // 3 months stay

    const reservation = await createReservation({
      listingId,
      userId,
      startDate,
      endDate,
      totalPrice: listing.price * 3 // Actual price * 3 months
    });

    console.log('Reservation created:', reservation);

    // Also check if we can find the reservation in the database
    const foundReservation = await db.reservation.findUnique({
      where: { id: reservation.id }
    });

    console.log('Found reservation in DB:', foundReservation);

    return NextResponse.json({
      success: true,
      reservation,
      foundReservation
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
