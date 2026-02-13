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
        status: "pending",
      },
    }),
    // Confirmed bookings
    db.reservation.count({
      where: {
        listing: {
          userId: landlord.id,
        },
        status: "confirmed",
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
        status: "confirmed",
        paymentStatus: "paid",
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { totalPrice: true },
    }),
  ]);

  return {
    totalProperties: propertyCount,
    activeListings: activeListingsCount,
    pendingInquiries: pendingInquiriesCount,
    confirmedBookings: confirmedBookingsCount,
    averageRating: reviewStats._avg.rating || 0,
    totalReviews: reviewStats._count.id,
    monthlyRevenue: revenueStats._sum.totalPrice || 0,
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
        status: "confirmed",
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
        status: "confirmed",
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
      status: "confirmed",
      paymentStatus: "paid",
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
    status: "confirmed",
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
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
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
