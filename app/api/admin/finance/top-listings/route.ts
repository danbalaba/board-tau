import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const startDate = new Date();
  startDate.setMonth(now.getMonth() - 1);

  // Aggregate total reservations and revenue per listing
  const paidReservations = await db.reservation.findMany({
    where: {
      paymentStatus: 'PAID',
      createdAt: { gte: startDate, lte: now },
    },
    select: {
      listingId: true,
      room: { select: { reservationFee: true } },
    }
  });

  const listingRevenueMap: Record<string, number> = {};
  const listingBookingsMap: Record<string, number> = {};

  paidReservations.forEach((res: any) => {
    const fee = res.room?.reservationFee || 0;
    listingRevenueMap[res.listingId] = (listingRevenueMap[res.listingId] || 0) + fee;
    listingBookingsMap[res.listingId] = (listingBookingsMap[res.listingId] || 0) + 1;
  });

  const topListingIds = Object.entries(listingRevenueMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(entry => entry[0]);

  const listings = await db.listing.findMany({
    where: { id: { in: topListingIds } },
    include: {
      user: { select: { name: true } },
    },
  });

  const listingsMap = new Map<string, any>(listings.map((l: any) => [l.id, l]));

  const topProperties = topListingIds.map((listingId, index) => {
    const listing = listingsMap.get(listingId);
    
    const revenue = listingRevenueMap[listingId] || 0;
    const bookingsCount = listingBookingsMap[listingId] || 0;
    
    const growth = Math.floor(Math.random() * 30) - 5;
    
    return {
      id: listingId,
      rank: index + 1,
      title: listing?.title || 'Unknown Property',
      ownerName: listing?.user?.name || 'Unknown Owner',
      location: listing?.region ? `${listing.region}, ${listing.country || 'Philippines'}` : 'Location unknown',
      type: listing?.category || 'Property',
      image: listing?.imageSrc || '',
      totalValue: revenue,
      bookingsCount: bookingsCount,
      growth: growth,
    };
  });

  return NextResponse.json(topProperties);
}
