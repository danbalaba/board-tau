import { db } from "@/lib/db";

export const createInquiry = async (data: any) => {
  try {
    const {
      listingId,
      roomId,
      userId,
      moveInDate,
      stayDuration,
      occupantsCount,
      role,
      hasPets,
      smokes,
      contactMethod,
      message,
    } = data;

    const inquiry = await db.inquiry.create({
      data: {
        listingId,
        roomId,
        userId,
        moveInDate,
        stayDuration,
        occupantsCount,
        role,
        hasPets,
        smokes,
        contactMethod,
        message,
        status: "pending",
      },
    });

    return inquiry;
  } catch (error) {
    console.error("Error creating inquiry:", error);
    throw error;
  }
};

export const getInquiriesByUser = async (userId: string) => {
  try {
    const inquiries = await db.inquiry.findMany({
      where: {
        userId,
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            imageSrc: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return inquiries;
  } catch (error) {
    console.error("Error getting inquiries:", error);
    throw error;
  }
};

export const getInquiriesByListing = async (listingId: string) => {
  try {
    const inquiries = await db.inquiry.findMany({
      where: {
        listingId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return inquiries;
  } catch (error) {
    console.error("Error getting inquiries by listing:", error);
    throw error;
  }
};

export const updateInquiryStatus = async (id: string, status: "pending" | "approved" | "rejected") => {
  try {
    const inquiry = await db.inquiry.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    return inquiry;
  } catch (error) {
    console.error("Error updating inquiry status:", error);
    throw error;
  }
};
