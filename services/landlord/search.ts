"use server";

import { db } from "@/lib/db";
import { requireLandlord } from "@/lib/landlord";

export const searchLandlordData = async (query: string, section?: string) => {
  if (!query || query.length < 2) return [];

  const landlord = await requireLandlord();

  const results: any[] = [];

  const fetchProperties = async () => {
    const properties = await db.listing.findMany({
      where: {
        userId: landlord.id,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { region: { contains: query, mode: 'insensitive' } },
        ]
      },
      take: 5,
      select: { id: true, title: true, region: true, imageSrc: true }
    });
    properties.forEach(p => {
      results.push({
        id: `prop-${p.id}`,
        name: p.title,
        section: "Properties",
        subtitle: p.region,
        perform: `/landlord/properties?search=${encodeURIComponent(p.title)}`,
        icon: "building"
      });
    });
  };

  const fetchInquiries = async () => {
    const inquiries = await db.inquiry.findMany({
      where: {
        listing: { userId: landlord.id },
        OR: [
          { user: { name: { contains: query, mode: 'insensitive' } } },
          { message: { contains: query, mode: 'insensitive' } },
        ]
      },
      take: 5,
      include: { 
        user: { select: { name: true } },
        listing: { select: { title: true } }
      }
    });
    inquiries.forEach(i => {
      results.push({
        id: `inq-${i.id}`,
        name: `Inquiry from ${i.user?.name || 'Unknown'}`,
        section: "Inquiries",
        subtitle: `On ${i.listing?.title}`,
        perform: `/landlord/inquiries?search=${encodeURIComponent(i.user?.name || '')}`,
        icon: "message"
      });
    });
  };

  const fetchReservations = async () => {
    const reservations = await db.reservation.findMany({
      where: {
        listing: { userId: landlord.id },
        user: { name: { contains: query, mode: 'insensitive' } }
      },
      take: 5,
      include: {
        user: { select: { name: true } },
        listing: { select: { title: true } }
      }
    });
    reservations.forEach(r => {
      results.push({
        id: `res-${r.id}`,
        name: `Reservation: ${r.user?.name || 'Unknown'}`,
        section: "Reservations",
        subtitle: `Status: ${r.status}`,
        perform: `/landlord/reservations?search=${encodeURIComponent(r.user?.name || '')}`,
        icon: "calendar"
      });
    });
  };

  const fetchBookings = async () => {
    // Assuming bookings are confirmed reservations. 
    // In this codebase, they correspond to RESERVED status
    const bookings = await db.reservation.findMany({
      where: {
        listing: { userId: landlord.id },
        status: 'RESERVED',
        OR: [
          { user: { name: { contains: query, mode: 'insensitive' } } },
          { listing: { title: { contains: query, mode: 'insensitive' } } },
        ]
      },
      take: 5,
      include: {
        user: { select: { name: true } },
        listing: { select: { title: true } }
      }
    });

    bookings.forEach(b => {
      results.push({
        id: `book-${b.id}`,
        name: `Booking: ${b.user?.name || 'Unknown'}`,
        section: "Bookings",
        subtitle: `On ${b.listing?.title}`,
        perform: `/landlord/bookings?search=${encodeURIComponent(b.user?.name || '')}`,
        icon: "calendar-stats"
      });
    });
  };

  const fetchTenants = async () => {
    // Tenants are users who have a reservation on the landlord's properties
    const reservations = await db.reservation.findMany({
      where: {
        listing: { userId: landlord.id },
        user: { name: { contains: query, mode: 'insensitive' } }
      },
      take: 5,
      include: {
        user: { select: { id: true, name: true, image: true } }
      }
    });
    
    // Unique tenants
    const seen = new Set();
    reservations.forEach(r => {
      if (r.user && !seen.has(r.user.id)) {
        seen.add(r.user.id);
        results.push({
          id: `tenant-${r.user.id}`,
          name: r.user.name || 'Unknown Tenant',
          section: "Tenants",
          subtitle: "Current or previous resident",
          perform: `/landlord/tenants?search=${encodeURIComponent(r.user.name || '')}`,
          icon: "users"
        });
      }
    });
  };

  const fetchReviews = async () => {
    const reviews = await db.review.findMany({
      where: {
        listing: { userId: landlord.id },
        OR: [
          { comment: { contains: query, mode: 'insensitive' } },
          { user: { name: { contains: query, mode: 'insensitive' } } }
        ]
      },
      take: 5,
      include: {
        user: { select: { name: true } },
        listing: { select: { title: true } }
      }
    });
    reviews.forEach(r => {
      results.push({
        id: `rev-${r.id}`,
        name: `Review from ${r.user?.name || 'Unknown'}`,
        section: "Reviews",
        subtitle: `"${r.comment?.substring(0, 30)}..."`,
        perform: `/landlord/reviews?search=${encodeURIComponent(r.user?.name || '')}`,
        icon: "star"
      });
    });
  };

  const promises = [];

  if (!section || section === 'properties') promises.push(fetchProperties());
  if (!section || section === 'inquiries') promises.push(fetchInquiries());
  if (!section || section === 'reservations') promises.push(fetchReservations());
  if (!section || section === 'bookings') promises.push(fetchBookings());
  if (!section || section === 'tenants') promises.push(fetchTenants());
  if (!section || section === 'reviews') promises.push(fetchReviews());

  await Promise.all(promises);

  return results;
};
