"use server";

import { db } from "@/lib/db";
import { requireLandlord } from "@/lib/landlord";

export const getLandlordDashboardStats = async () => {
  const landlord = await requireLandlord();

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
      // Get all rooms for landlord's properties
      const properties = await db.listing.findMany({
        where: {
          userId: landlord.id,
          status: "active",
        },
        include: {
          rooms: true,
        },
      });

      // Calculate total capacity and occupied rooms
      let totalCapacity = 0;
      let occupiedRooms = 0;

      for (const property of properties) {
        for (const room of property.rooms) {
          totalCapacity += room.capacity;
          // Count active reservations for this room
          const activeReservations = await db.reservation.count({
            where: {
              roomId: room.id,
              status: "RESERVED",
              startDate: { lte: new Date() },
              endDate: { gte: new Date() },
            },
          });
          occupiedRooms += Math.min(activeReservations, room.capacity);
        }
      }

      // Count reservations ending within 30 days (expiring leases)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const expiringLeases = await db.reservation.count({
        where: {
          listing: {
            userId: landlord.id,
          },
          status: "RESERVED",
          endDate: {
            gte: new Date(),
            lte: thirtyDaysFromNow,
          },
        },
      });

      return {
        vacantRooms: totalCapacity - occupiedRooms,
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

  return {
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
    include: {
      listing: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  // Calculate total revenue
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

  // Calculate revenue by property
  const revenueByProperty: Record<string, { title: string; amount: number }> = {};
  bookings.forEach((booking) => {
    if (!revenueByProperty[booking.listingId]) {
      revenueByProperty[booking.listingId] = {
        title: booking.listing.title,
        amount: 0,
      };
    }
    revenueByProperty[booking.listingId].amount += booking.totalPrice;
  });

  // Calculate monthly breakdown
  const monthlyBreakdown: Record<string, number> = {};
  bookings.forEach((booking) => {
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
    bookingsCount: bookings.length,
    averageBookingValue: bookings.length > 0 ? totalRevenue / bookings.length : 0,
    revenueByProperty: Object.values(revenueByProperty),
    monthlyBreakdown,
  };
};

export const getOccupancyReport = async (propertyId?: string) => {
  const landlord = await requireLandlord();

  const where: any = {
    listing: {
      userId: landlord.id,
    },
    status: "RESERVED",
  };

  if (propertyId) {
    where.listingId = propertyId;
  }

  const bookings = await db.reservation.findMany({
    where,
    include: {
      listing: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  // Calculate total days booked
  let totalBookedDays = 0;
  bookings.forEach((booking) => {
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1_000 * 60 * 60 * 24));
    totalBookedDays += days;
  });

  // Calculate occupancy rate
  const properties = await db.listing.findMany({
    where: {
      userId: landlord.id,
      status: "active",
    },
    include: {
      rooms: true,
    },
  });

  // Calculate total available slots
  const totalSlots = properties.reduce((sum, property) => {
    return sum + property.rooms.reduce((roomSum, room) => roomSum + room.capacity, 0);
  }, 0);

  const occupancyRate = totalSlots > 0 ? (totalBookedDays / (totalSlots * 365)) * 100 : 0;

  return {
    totalBookedDays,
    totalSlots,
    occupancyRate: Math.min(100, Math.max(0, occupancyRate)),
    bookingsCount: bookings.length,
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

  const properties = await db.listing.findMany({
    where: {
      userId: landlord.id,
    },
    select: {
      id: true,
      category: true,
    },
    distinct: ['category'],
  });

  const typeCounts: Record<string, number> = {};
  properties.forEach(p => {
    const type = Array.isArray(p.category) ? p.category.join(', ') : 'Other';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  const bookings = await db.reservation.findMany({
    where: {
      listing: {
        userId: landlord.id,
      },
      status: "RESERVED",
      paymentStatus: "PAID",
    },
    include: {
      listing: {
        select: {
          category: true,
        },
      },
    },
  });

  const revenueByType: Record<string, number> = {};
  bookings.forEach(b => {
    const type = Array.isArray(b.listing.category) ? b.listing.category.join(', ') : 'Other';
    revenueByType[type] = (revenueByType[type] || 0) + b.totalPrice;
  });

  return Object.keys(typeCounts).map(type => ({
    type: type || 'Other',
    count: typeCounts[type],
    revenue: revenueByType[type] || 0,
  }));
};

export const getRatingDistribution = async () => {
  const landlord = await requireLandlord();

  const reviews = await db.review.findMany({
    where: {
      listing: {
        userId: landlord.id,
      },
      status: "approved",
    },
    select: {
      rating: true,
    },
  });

  const distribution = [1, 2, 3, 4, 5].map(rating => ({
    rating: `${rating} Star`,
    value: reviews.filter(r => r.rating === rating).length,
  }));

  const total = distribution.reduce((sum, d) => sum + d.value, 0);
  
  return distribution.map(d => ({
    ...d,
    percentage: total > 0 ? Math.round((d.value / total) * 100) : 0,
  }));
};

export const getAllPropertiesPerformance = async () => {
  const landlord = await requireLandlord();

  const listings = await db.listing.findMany({
    where: {
      userId: landlord.id,
    },
    select: {
      id: true,
      title: true,
    },
  });

  const propertyData = await Promise.all(
    listings.map(async (listing) => {
      const [inquiries, bookings, revenueData] = await Promise.all([
        db.inquiry.count({
          where: { listingId: listing.id },
        }),
        db.reservation.count({
          where: { listingId: listing.id, status: "RESERVED" },
        }),
        db.reservation.aggregate({
          where: {
            listingId: listing.id,
            status: "RESERVED",
            paymentStatus: "PAID",
          },
          _sum: { totalPrice: true },
        }),
      ]);

      return {
        name: listing.title,
        inquiries,
        bookings,
        revenue: revenueData._sum.totalPrice || 0,
      };
    })
  );

  return propertyData;
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
      const monthTotal = inquiries.filter(i => 
        `${i.createdAt.getFullYear()}-${String(i.createdAt.getMonth() + 1).padStart(2, '0')}` === key
      ).length;
      
      monthlyData[key].direct += Math.round(monthTotal * 0.5);
      monthlyData[key].email += Math.round(monthTotal * 0.3);
      monthlyData[key].social += monthTotal - Math.round(monthTotal * 0.5) - Math.round(monthTotal * 0.3);
    }
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
