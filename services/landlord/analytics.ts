"use server";

import { db } from "@/lib/db";
import { requireLandlord } from "@/lib/landlord";
import { cache } from "@/lib/redis";

export const getLandlordDashboardStats = async () => {
  const landlord = await requireLandlord();

  // 1. Check Cache first
  const cacheKey = `landlord:dashboard:${landlord.id}`;
  const cachedData = await cache.get(cacheKey);
  if (cachedData) return cachedData;

  const [
    propertyCount,
    activeListingsCount,
    pendingInquiriesCount,
    confirmedBookingsCount,
    reviewStats,
    revenueStats,
    occupancyData,
  ] = await Promise.all([
    // Total properties (active + pending)
    db.listing.count({
      where: {
        userId: landlord.id,
      },
    }),
    // Active listings
    db.listing.count({
      where: {
        userId: landlord.id,
        status: "active",
      },
    }),
    // Pending inquiries
    db.inquiry.count({
      where: {
        listing: {
          userId: landlord.id,
        },
        status: "PENDING",
      },
    }),
    // Confirmed bookings
    db.reservation.count({
      where: {
        listing: {
          userId: landlord.id,
        },
        status: "RESERVED",
      },
    }),
    // Review statistics
    db.review.aggregate({
      where: {
        listing: {
          userId: landlord.id,
        },
        status: "approved",
      },
      _avg: { rating: true },
      _count: { id: true },
    }),
    // Revenue statistics (this month)
    db.reservation.aggregate({
      where: {
        listing: {
          userId: landlord.id,
        },
        status: "RESERVED",
        paymentStatus: "PAID",
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { totalPrice: true },
    }),
    // Occupancy statistics
    (async () => {
      // 1. Get all rooms for landlord's properties in one go
      const activeListings = await db.listing.findMany({
        where: { userId: landlord.id, status: "active" },
        select: { id: true }
      });
      const listingIds = activeListings.map(l => l.id);

      const allRooms = await db.room.findMany({
        where: { listingId: { in: listingIds } },
        select: { id: true, capacity: true }
      });
      
      const roomIds = allRooms.map(r => r.id);
      const totalCapacity = allRooms.reduce((sum, r) => sum + r.capacity, 0);

      // 2. Get ALL active reservations for these rooms in ONE query
      const now = new Date();
      const activeReservations = await db.reservation.findMany({
        where: {
          roomId: { in: roomIds },
          status: "RESERVED",
          startDate: { lte: now },
          endDate: { gte: now },
        },
        select: { roomId: true }
      });

      // 3. Group and sum in memory (O(N) instead of O(N^2))
      const resCounts: Record<string, number> = {};
      activeReservations.forEach(r => {
        resCounts[r.roomId] = (resCounts[r.roomId] || 0) + 1;
      });

      let occupiedRooms = 0;
      allRooms.forEach(room => {
        occupiedRooms += Math.min(resCounts[room.id] || 0, room.capacity);
      });

      // 4. Count reservations ending within 30 days (expiring leases)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const expiringLeases = await db.reservation.count({
        where: {
          listing: { userId: landlord.id },
          status: "RESERVED",
          endDate: { gte: now, lte: thirtyDaysFromNow },
        },
      });

      return {
        vacantRooms: Math.max(0, totalCapacity - occupiedRooms),
        occupiedRooms,
        expiringLeases,
      };
    })(),
  ]);

  // Calculate occupancy rate
  const totalRooms = occupancyData.vacantRooms + occupancyData.occupiedRooms;
  const occupancyRate = totalRooms > 0 
    ? Math.round((occupancyData.occupiedRooms / totalRooms) * 100) 
    : 0;

  const result = {
    totalProperties: propertyCount,
    activeListings: activeListingsCount,
    pendingInquiries: pendingInquiriesCount,
    confirmedBookings: confirmedBookingsCount,
    averageRating: reviewStats._avg.rating || 0,
    totalReviews: reviewStats._count.id,
    monthlyRevenue: revenueStats._sum.totalPrice || 0,
    occupancyRate,
    vacantRooms: occupancyData.vacantRooms,
    occupiedRooms: occupancyData.occupiedRooms,
    expiringLeases: occupancyData.expiringLeases,
  };

  // 2. Save to Cache (60s TTL)
  await cache.set(cacheKey, result, 60);

  return result;
};

export const getPropertyPerformance = async (propertyId: string) => {
  const landlord = await requireLandlord();

  // Verify property belongs to landlord
  const property = await db.listing.findFirst({
    where: {
      id: propertyId,
      userId: landlord.id,
    },
  });

  if (!property) {
    throw new Error("Property not found");
  }

  const [
    inquiryCount,
    bookingCount,
    reviewStats,
    monthlyBookings,
  ] = await Promise.all([
    db.inquiry.count({
      where: {
        listingId: propertyId,
      },
    }),
    db.reservation.count({
      where: {
        listingId: propertyId,
        status: "RESERVED",
      },
    }),
    db.review.aggregate({
      where: {
        listingId: propertyId,
        status: "approved",
      },
      _avg: { rating: true },
      _count: { id: true },
    }),
    // Monthly bookings for the last 6 months
    db.reservation.findMany({
      where: {
        listingId: propertyId,
        status: "RESERVED",
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1),
        },
      },
      select: {
        createdAt: true,
        totalPrice: true,
      },
    }),
  ]);

  // Group bookings by month
  const monthlyData = Array(6).fill(0);
  const now = new Date();

  monthlyBookings.forEach((booking) => {
    const bookingMonth = booking.createdAt.getMonth();
    const bookingYear = booking.createdAt.getFullYear();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let monthDiff = (currentYear - bookingYear) * 12 + (currentMonth - bookingMonth);

    if (monthDiff >= 0 && monthDiff < 6) {
      monthlyData[6 - monthDiff - 1] += booking.totalPrice;
    }
  });

  return {
    inquiryCount,
    bookingCount,
    averageRating: reviewStats._avg.rating || 0,
    totalReviews: reviewStats._count.id,
    monthlyRevenue: monthlyData,
  };
};

export const getRevenueReport = async (period: "month" | "quarter" | "year" = "month") => {
  const landlord = await requireLandlord();

  let startDate = new Date();

  switch (period) {
    case "month":
      startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      break;
    case "quarter":
      const quarter = Math.floor(startDate.getMonth() / 3);
      startDate = new Date(startDate.getFullYear(), quarter * 3, 1);
      break;
    case "year":
      startDate = new Date(startDate.getFullYear(), 0, 1);
      break;
  }

  const baseWhere = {
    listing: { userId: landlord.id },
    status: "RESERVED" as const,
    paymentStatus: "PAID" as const,
    createdAt: { gte: startDate },
  };

  // ============================================================
  // OPTIMIZED: Use groupBy aggregation instead of loading all records
  // ============================================================
  const [totalStats, revenueByPropertyRaw, listings] = await Promise.all([
    // 1. Total revenue + count computed in MongoDB
    db.reservation.aggregate({
      where: baseWhere,
      _sum: { totalPrice: true },
      _count: { id: true },
    }),
    // 2. Revenue per property — grouped in MongoDB
    db.reservation.groupBy({
      by: ['listingId'],
      where: baseWhere,
      _sum: { totalPrice: true },
      _count: { id: true },
    }),
    // 3. Listing titles for display (lightweight)
    db.listing.findMany({
      where: { userId: landlord.id },
      select: { id: true, title: true },
    }),
  ]);

  const totalRevenue = totalStats._sum.totalPrice || 0;
  const bookingsCount = totalStats._count.id;
  const listingTitleMap = new Map(listings.map(l => [l.id, l.title]));

  const revenueByProperty = revenueByPropertyRaw.map(r => ({
    title: listingTitleMap.get(r.listingId) || 'Unknown Property',
    amount: r._sum.totalPrice || 0,
  }));

  // Monthly breakdown — still needs individual dates, but with select only (no include)
  const bookingDates = await db.reservation.findMany({
    where: baseWhere,
    select: { createdAt: true, totalPrice: true },
  });

  const monthlyBreakdown: Record<string, number> = {};
  bookingDates.forEach((booking) => {
    const key = `${booking.createdAt.getFullYear()}-${String(
      booking.createdAt.getMonth() + 1
    ).padStart(2, "0")}`;
    monthlyBreakdown[key] = (monthlyBreakdown[key] || 0) + booking.totalPrice;
  });

  return {
    period,
    startDate,
    endDate: new Date(),
    totalRevenue,
    bookingsCount,
    averageBookingValue: bookingsCount > 0 ? totalRevenue / bookingsCount : 0,
    revenueByProperty,
    monthlyBreakdown,
  };
};

export const getOccupancyReport = async (propertyId?: string) => {
  const landlord = await requireLandlord();

  const reservationWhere: any = {
    listing: { userId: landlord.id },
    status: "RESERVED",
  };
  if (propertyId) reservationWhere.listingId = propertyId;

  const listingWhere: any = { userId: landlord.id, status: "active" };
  if (propertyId) listingWhere.id = propertyId;
  
  // Bound to last year to prevent unbounded growth
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  reservationWhere.createdAt = { gte: oneYearAgo };

  // ============================================================
  // OPTIMIZED: select only needed fields, no include: rooms: true
  // ============================================================
  const [bookings, bookingCount, rooms] = await Promise.all([
    // Only fetch dates for day calculation (no listing include)
    db.reservation.findMany({
      where: reservationWhere,
      select: { startDate: true, endDate: true, durationInDays: true },
    }),
    // Count in MongoDB
    db.reservation.count({ where: reservationWhere }),
    // Only fetch capacity — not the entire room document
    db.room.findMany({
      where: {
        listing: listingWhere,
      },
      select: { capacity: true },
    }),
  ]);

  // Calculate total days booked using stored durationInDays when available
  let totalBookedDays = 0;
  bookings.forEach((booking) => {
    if (booking.durationInDays > 0) {
      totalBookedDays += booking.durationInDays;
    } else {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      totalBookedDays += Math.ceil((end.getTime() - start.getTime()) / (1_000 * 60 * 60 * 24));
    }
  });

  const totalSlots = rooms.reduce((sum, room) => sum + room.capacity, 0);
  const occupancyRate = totalSlots > 0 ? (totalBookedDays / (totalSlots * 365)) * 100 : 0;

  return {
    totalBookedDays,
    totalSlots,
    occupancyRate: Math.min(100, Math.max(0, occupancyRate)),
    bookingsCount: bookingCount,
  };
};

export const getDailyRevenueHistory = async (days: number = 30) => {
  const landlord = await requireLandlord();
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const bookings = await db.reservation.findMany({
    where: {
      listing: {
        userId: landlord.id,
      },
      status: "RESERVED",
      paymentStatus: "PAID",
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      createdAt: true,
      totalPrice: true,
    },
  });

  const dailyData: Record<string, { date: string; revenue: number; bookings: number }> = {};
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split('T')[0];
    dailyData[key] = { date: key, revenue: 0, bookings: 0 };
  }

  bookings.forEach((booking) => {
    const key = booking.createdAt.toISOString().split('T')[0];
    if (dailyData[key]) {
      dailyData[key].revenue += booking.totalPrice;
      dailyData[key].bookings += 1;
    }
  });

  return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
};

export const getMonthlyRevenueByProperty = async (months: number = 6) => {
  const landlord = await requireLandlord();
  
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  startDate.setDate(1);

  const listings = await db.listing.findMany({
    where: {
      userId: landlord.id,
    },
    select: {
      id: true,
      title: true,
    },
  });

  const bookings = await db.reservation.findMany({
    where: {
      listing: {
        userId: landlord.id,
      },
      status: "RESERVED",
      paymentStatus: "PAID",
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      listingId: true,
      createdAt: true,
      totalPrice: true,
    },
  });

  const monthlyData: Record<string, Record<string, number>> = {};
  
  for (let i = 0; i < months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[key] = {};
    listings.forEach(listing => {
      monthlyData[key][listing.id] = 0;
    });
  }

  bookings.forEach((booking) => {
    const key = `${booking.createdAt.getFullYear()}-${String(booking.createdAt.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyData[key] && monthlyData[key][booking.listingId] !== undefined) {
      monthlyData[key][booking.listingId] += booking.totalPrice;
    }
  });

  const listingMap = listings.reduce((acc, l) => ({ ...acc, [l.id]: l.title }), {} as Record<string, string>);

  return {
    monthlyData: Object.entries(monthlyData).map(([date, revenues]) => ({
      date,
      ...revenues,
    })).sort((a, b) => a.date.localeCompare(b.date)),
    listings: listings.map(l => ({ id: l.id, title: l.title })),
    listingMap,
  };
};

export const getGrowthTrendData = async (months: number = 6) => {
  const landlord = await requireLandlord();
  
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  startDate.setDate(1);

  const bookings = await db.reservation.findMany({
    where: {
      listing: {
        userId: landlord.id,
      },
      status: "RESERVED",
      paymentStatus: "PAID",
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      createdAt: true,
      totalPrice: true,
    },
  });

  const monthlyData: Record<string, { date: string; bookings: number; revenue: number }> = {};

  for (let i = 0; i < months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[key] = { date: key, bookings: 0, revenue: 0 };
  }

  bookings.forEach((booking) => {
    const key = `${booking.createdAt.getFullYear()}-${String(booking.createdAt.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyData[key]) {
      monthlyData[key].bookings += 1;
      monthlyData[key].revenue += booking.totalPrice;
    }
  });

  return Object.values(monthlyData).sort((a, b) => a.date.localeCompare(b.date));
};

export const getPropertyTypeBreakdown = async () => {
  const landlord = await requireLandlord();

  // ============================================================
  // OPTIMIZED: Use lightweight select + groupBy instead of loading all bookings
  // ============================================================
  const properties = await db.listing.findMany({
    where: { userId: landlord.id },
    select: { id: true, category: true },
  });

  const typeCounts: Record<string, number> = {};
  const listingCategoryMap = new Map<string, string>();
  properties.forEach(p => {
    const type = Array.isArray(p.category) ? p.category.join(', ') : 'Other';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
    listingCategoryMap.set(p.id, type);
  });

  // Use groupBy to compute revenue per listing in MongoDB (not JS)
  const revenueByListing = await db.reservation.groupBy({
    by: ['listingId'],
    where: {
      listing: { userId: landlord.id },
      status: "RESERVED",
      paymentStatus: "PAID",
    },
    _sum: { totalPrice: true },
  });

  // Map listing revenue to category type in memory (O(N), not O(N) queries)
  const revenueByType: Record<string, number> = {};
  revenueByListing.forEach(r => {
    const type = listingCategoryMap.get(r.listingId) || 'Other';
    revenueByType[type] = (revenueByType[type] || 0) + (r._sum.totalPrice || 0);
  });

  return Object.keys(typeCounts).map(type => ({
    type: type || 'Other',
    count: typeCounts[type],
    revenue: revenueByType[type] || 0,
  }));
};

export const getRatingDistribution = async () => {
  const landlord = await requireLandlord();

  // ============================================================
  // OPTIMIZED: groupBy in MongoDB instead of fetching all reviews + filtering 5x in JS
  // ============================================================
  const ratingGroups = await db.review.groupBy({
    by: ['rating'],
    where: {
      listing: { userId: landlord.id },
      status: "approved",
    },
    _count: { id: true },
  });

  const ratingMap = new Map(ratingGroups.map(r => [r.rating, r._count.id]));
  const total = ratingGroups.reduce((sum, r) => sum + r._count.id, 0);

  return [1, 2, 3, 4, 5].map(rating => {
    const value = ratingMap.get(rating) || 0;
    return {
      rating: `${rating} Star`,
      value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0,
    };
  });
};

export const getAllPropertiesPerformance = async () => {
  const landlord = await requireLandlord();

  const listings = await db.listing.findMany({
    where: { userId: landlord.id },
    select: { id: true, title: true },
  });

  const listingIds = listings.map(l => l.id);

  // Optimized Bulk Aggregation
  const [inquiryStats, reservationStats] = await Promise.all([
    db.inquiry.groupBy({
      by: ['listingId'],
      where: { listingId: { in: listingIds } },
      _count: { id: true },
    }),
    db.reservation.groupBy({
      by: ['listingId'],
      where: { 
        listingId: { in: listingIds },
        status: "RESERVED"
      },
      _count: { id: true },
      _sum: { totalPrice: true },
    }),
  ]);

  // Create lookup maps for O(1) merging
  const inquiryMap = inquiryStats.reduce((acc, curr) => ({ ...acc, [curr.listingId]: curr._count.id }), {} as any);
  const resMap = reservationStats.reduce((acc, curr) => ({
    ...acc, 
    [curr.listingId]: { 
      bookings: curr._count.id, 
      revenue: curr._sum.totalPrice || 0 
    }
  }), {} as any);

  return listings.map(listing => ({
    name: listing.title,
    inquiries: inquiryMap[listing.id] || 0,
    bookings: resMap[listing.id]?.bookings || 0,
    revenue: resMap[listing.id]?.revenue || 0,
  }));
};

export const getInquirySourceBreakdown = async (months: number = 6) => {
  const landlord = await requireLandlord();
  
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  startDate.setDate(1);

  const inquiries = await db.inquiry.findMany({
    where: {
      listing: {
        userId: landlord.id,
      },
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      createdAt: true,
    },
  });

  const monthlyData: Record<string, { date: string; direct: number; email: number; social: number }> = {};

  for (let i = 0; i < months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[key] = { date: key, direct: 0, email: 0, social: 0 };
  }

  inquiries.forEach((inquiry) => {
    const key = `${inquiry.createdAt.getFullYear()}-${String(inquiry.createdAt.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyData[key]) {
      // In-memory counters instead of O(N^2) filter
      monthlyData[key].direct += 1; // Since source isn't real yet, just count as direct
    }
  });

  // Distribute counts (Simulating the percentages in a single pass)
  Object.values(monthlyData).forEach(item => {
    const total = item.direct;
    item.direct = Math.round(total * 0.5);
    item.email = Math.round(total * 0.3);
    item.social = total - item.direct - item.email;
  });

  const result = Object.values(monthlyData).sort((a, b) => a.date.localeCompare(b.date));
  
  return result.length > 0 ? result : [
    { date: "2024-04", direct: 0, email: 0, social: 0 },
    { date: "2024-05", direct: 0, email: 0, social: 0 },
    { date: "2024-06", direct: 0, email: 0, social: 0 },
    { date: "2024-07", direct: 0, email: 0, social: 0 },
    { date: "2024-08", direct: 0, email: 0, social: 0 },
    { date: "2024-09", direct: 0, email: 0, social: 0 },
  ];
};
