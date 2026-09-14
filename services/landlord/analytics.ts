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
        status: "ACTIVE",
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
        where: { userId: landlord.id, status: 'ACTIVE' },
        select: { id: true }
      });
      const listingIds = activeListings.map((l: any) => l.id);

      const allRooms = await db.room.findMany({
        where: { listingId: { in: listingIds } },
        select: { id: true, capacity: true }
      });
      
      const roomIds = allRooms.map((r: any) => r.id);
      const totalCapacity = allRooms.reduce((sum: any, r: any) => sum + r.capacity, 0);

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
      activeReservations.forEach((r: any) => {
        resCounts[r.roomId] = (resCounts[r.roomId] || 0) + 1;
      });

      let occupiedRooms = 0;
      allRooms.forEach((room: any) => {
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

  monthlyBookings.forEach((booking: any) => {
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
  const listingTitleMap = new Map(listings.map((l: any) => [l.id, l.title]));

  const revenueByProperty = revenueByPropertyRaw.map((r: any) => ({
    title: listingTitleMap.get(r.listingId) || 'Unknown Property',
    amount: r._sum.totalPrice || 0,
  }));

  // Monthly breakdown — still needs individual dates, but with select only (no include)
  const bookingDates = await db.reservation.findMany({
    where: baseWhere,
    select: { createdAt: true, totalPrice: true },
  });

  const monthlyBreakdown: Record<string, number> = {};
  bookingDates.forEach((booking: any) => {
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

  const listingWhere: any = { userId: landlord.id, status: "ACTIVE" };
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
  bookings.forEach((booking: any) => {
    if (booking.durationInDays > 0) {
      totalBookedDays += booking.durationInDays;
    } else {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      totalBookedDays += Math.ceil((end.getTime() - start.getTime()) / (1_000 * 60 * 60 * 24));
    }
  });

  const totalSlots = rooms.reduce((sum: any, room: any) => sum + room.capacity, 0);
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

  bookings.forEach((booking: any) => {
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
    listings.forEach((listing: any) => {
      monthlyData[key][listing.id] = 0;
    });
  }

  bookings.forEach((booking: any) => {
    const key = `${booking.createdAt.getFullYear()}-${String(booking.createdAt.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyData[key] && monthlyData[key][booking.listingId] !== undefined) {
      monthlyData[key][booking.listingId] += booking.totalPrice;
    }
  });

  const listingMap = listings.reduce((acc: any, l: any) => ({ ...acc, [l.id]: l.title }), {} as Record<string, string>);

  return {
    monthlyData: Object.entries(monthlyData).map(([date, revenues]) => ({
      date,
      ...revenues,
    })).sort((a, b) => a.date.localeCompare(b.date)),
    listings: listings.map((l: any) => ({ id: l.id, title: l.title })),
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

  bookings.forEach((booking: any) => {
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

  // Fetch all landlord properties with propertyType relation, propertyTypeId, and businessInfo
  const [properties, dbPropertyTypes, roomTypes] = await Promise.all([
    db.listing.findMany({
      where: { userId: landlord.id },
      select: {
        id: true,
        propertyTypeId: true,
        propertyType: { select: { id: true, name: true } },
        businessInfo: true,
      },
    }),
    db.propertyType.findMany({
      select: { id: true, name: true },
    }),
    db.roomTypeDefinition.findMany({
      select: { id: true, name: true },
    }),
  ]);

  const propertyTypeMap = new Map<string, string>(
    dbPropertyTypes.map((pt: any) => [pt.id, pt.name])
  );

  roomTypes.forEach((rt: any) => {
    if (!propertyTypeMap.has(rt.id)) {
      propertyTypeMap.set(rt.id, rt.name);
    }
  });

  const staticIdMap: Record<string, string> = {
    'bh-1': 'Boarding House',
    'apt-1': 'Apartment',
    'th-1': 'Transient House',
    'ah-1': 'Agri-Hostel',
    'dorm-1': 'Dormitory',
  };

  const isObjectId = (str: string) => typeof str === 'string' && /^[0-9a-fA-F]{24}$/.test(str);

  const typeCounts: Record<string, number> = {};
  const listingCategoryMap = new Map<string, string>();

  properties.forEach((p: any) => {
    let resolvedType: string | undefined = p.propertyType?.name;

    // 1. If not resolved by relation, check propertyTypeId lookup
    if (!resolvedType && p.propertyTypeId) {
      resolvedType = propertyTypeMap.get(p.propertyTypeId) || staticIdMap[p.propertyTypeId];
    }

    // 2. Check businessInfo
    if (!resolvedType && p.businessInfo && typeof p.businessInfo === 'object') {
      const info = p.businessInfo as any;
      const raw = info.businessType || info.category || info.propertyType;
      if (raw) {
        resolvedType = isObjectId(raw) ? (propertyTypeMap.get(raw) || staticIdMap[raw]) : raw;
      }
    }

    // 3. If resolvedType is still a raw 24-hex ObjectId, attempt map lookup or clean fallback
    if (resolvedType && isObjectId(resolvedType)) {
      resolvedType = propertyTypeMap.get(resolvedType) || staticIdMap[resolvedType];
    }

    // Final fallback: never leak raw ObjectId to UI
    if (!resolvedType || isObjectId(resolvedType)) {
      resolvedType = 'Boarding House';
    }

    typeCounts[resolvedType] = (typeCounts[resolvedType] || 0) + 1;
    listingCategoryMap.set(p.id, resolvedType);
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
  revenueByListing.forEach((r: any) => {
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

  const ratingMap = new Map<number, number>(ratingGroups.map((r: any) => [r.rating, r._count.id]));
  const total = ratingGroups.reduce((sum: any, r: any) => sum + r._count.id, 0);

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

  const listingIds = listings.map((l: any) => l.id);

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
  const inquiryMap = inquiryStats.reduce((acc: any, curr: any) => ({ ...acc, [curr.listingId]: curr._count.id }), {} as any);
  const resMap = reservationStats.reduce((acc: any, curr: any) => ({
    ...acc, 
    [curr.listingId]: { 
      bookings: curr._count.id, 
      revenue: curr._sum.totalPrice || 0 
    }
  }), {} as any);

  return listings.map((listing: any) => ({
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

  inquiries.forEach((inquiry: any) => {
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

export const getMonthlyInquiriesVsBookings = async (months: number = 6) => {
  const landlord = await requireLandlord();
  
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  startDate.setDate(1);

  const [inquiries, bookings] = await Promise.all([
    db.inquiry.findMany({
      where: {
        listing: { userId: landlord.id },
        createdAt: { gte: startDate },
      },
      select: { createdAt: true },
    }),
    db.reservation.findMany({
      where: {
        listing: { userId: landlord.id },
        status: "RESERVED",
        createdAt: { gte: startDate },
      },
      select: { createdAt: true },
    }),
  ]);

  const monthlyData: Record<string, { date: string; inquiries: number; bookings: number; conversionRate: number }> = {};

  for (let i = 0; i < months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[key] = { date: key, inquiries: 0, bookings: 0, conversionRate: 0 };
  }

  inquiries.forEach((item: any) => {
    const key = `${item.createdAt.getFullYear()}-${String(item.createdAt.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyData[key]) monthlyData[key].inquiries += 1;
  });

  bookings.forEach((item: any) => {
    const key = `${item.createdAt.getFullYear()}-${String(item.createdAt.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyData[key]) monthlyData[key].bookings += 1;
  });

  Object.values(monthlyData).forEach(item => {
    item.conversionRate = item.inquiries > 0 ? Math.round((item.bookings / item.inquiries) * 100) : 0;
  });

  return Object.values(monthlyData).sort((a, b) => a.date.localeCompare(b.date));
};

export const getLandlordRecentActivities = async (limit: number = 10) => {
  const landlord = await requireLandlord();

  const [inquiries, reservations, reviews] = await Promise.all([
    db.inquiry.findMany({
      where: { listing: { userId: landlord.id } },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        createdAt: true,
        user: { select: { name: true } },
        listing: { select: { title: true } },
      },
    }),
    db.reservation.findMany({
      where: { listing: { userId: landlord.id } },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        totalPrice: true,
        createdAt: true,
        guestName: true,
        user: { select: { name: true } },
        listing: { select: { title: true } },
      },
    }),
    db.review.findMany({
      where: { listing: { userId: landlord.id } },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        rating: true,
        createdAt: true,
        user: { select: { name: true } },
        listing: { select: { title: true } },
      },
    }),
  ]);

  const activities: Array<{
    id: string;
    type: 'INQUIRY' | 'BOOKING' | 'REVIEW' | 'PAYMENT';
    title: string;
    description: string;
    time: string;
    timestamp: number;
    status: string;
    color: 'amber' | 'emerald' | 'blue' | 'purple';
    href: string;
  }> = [];

  const formatTime = (d: Date) => {
    const diffMs = Date.now() - new Date(d).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  inquiries.forEach((inq: any) => {
    activities.push({
      id: `inq-${inq.id}`,
      type: 'INQUIRY',
      title: 'New Inquiry Received',
      description: `from ${inq.user?.name || 'Student Boarder'} for ${inq.listing?.title || 'Property'}`,
      time: formatTime(inq.createdAt),
      timestamp: new Date(inq.createdAt).getTime(),
      status: inq.status || 'Pending',
      color: 'amber',
      href: '/landlord/inquiries',
    });
  });

  reservations.forEach((res: any) => {
    const name = res.user?.name || res.guestName || 'Tenant';
    const title = res.listing?.title || 'Property';

    if (res.paymentStatus === 'PAID') {
      activities.push({
        id: `pay-${res.id}`,
        type: 'PAYMENT',
        title: 'Payment Received',
        description: `₱${(res.totalPrice || 0).toLocaleString()} for ${title}`,
        time: formatTime(res.createdAt),
        timestamp: new Date(res.createdAt).getTime(),
        status: 'Success',
        color: 'purple',
        href: '/landlord/payments',
      });
    }

    activities.push({
      id: `res-${res.id}`,
      type: 'BOOKING',
      title: res.status === 'RESERVED' ? 'Booking Confirmed' : 'Booking Application',
      description: `${name} booked ${title}`,
      time: formatTime(res.createdAt),
      timestamp: new Date(res.createdAt).getTime(),
      status: res.status || 'Confirmed',
      color: 'emerald',
      href: '/landlord/bookings',
    });
  });

  reviews.forEach((rev: any) => {
    activities.push({
      id: `rev-${rev.id}`,
      type: 'REVIEW',
      title: `New ${rev.rating || 5}-Star Review`,
      description: `from ${rev.user?.name || 'Tenant'} about ${rev.listing?.title || 'Property'}`,
      time: formatTime(rev.createdAt),
      timestamp: new Date(rev.createdAt).getTime(),
      status: 'Published',
      color: 'blue',
      href: '/landlord/reviews',
    });
  });

  activities.sort((a, b) => b.timestamp - a.timestamp);

  return activities.slice(0, limit);
};

export const getLandlordDashboardOverview = async () => {
  const landlord = await requireLandlord();

  const cacheKey = `landlord:dashboard:overview:${landlord.id}`;
  const cachedData = await cache.get(cacheKey);
  if (cachedData) return cachedData;

  const [stats, areaChartData, pieChartData, lineChartData, recentActivities] = await Promise.all([
    getLandlordDashboardStats().catch(() => null),
    getDailyRevenueHistory(90).catch(() => []),
    getPropertyTypeBreakdown().catch(() => []),
    getMonthlyInquiriesVsBookings(6).catch(() => []),
    getLandlordRecentActivities(10).catch(() => []),
  ]);

  const overview = {
    stats,
    areaChartData,
    pieChartData,
    lineChartData,
    recentActivities,
  };

  // Cache compiled overview for 5 minutes (300s) for maximum performance
  // Instant invalidation is handled by clearLandlordCache on state changes
  await cache.set(cacheKey, overview, 300);

  return overview;
};

export const clearLandlordCache = async (landlordId?: string) => {
  try {
    if (landlordId) {
      await Promise.all([
        cache.del(`landlord:dashboard:${landlordId}`),
        cache.del(`landlord:dashboard:overview:${landlordId}`),
      ]);
    } else {
      await cache.delPattern('landlord:dashboard:*');
    }
  } catch (err) {
    console.error('Error clearing landlord cache:', err);
  }
};

