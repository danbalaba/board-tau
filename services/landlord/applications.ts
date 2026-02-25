"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "../user/user";
import { validateEmail, validatePassword, validateName, validatePhoneNumber } from "@/lib/validators";
import {
  sendApplicationConfirmationEmail,
  sendApplicationApprovalEmail,
  sendApplicationRejectionEmail,
  sendAdminApplicationNotification
} from '../email/notifications';

export interface HostApplicationData {
  businessInfo: {
    businessName: string;
    businessType: string;
    businessRegistrationNumber: string;
    taxIdentificationNumber: string;
    businessDescription: string;
    yearsExperience: string;
  };
  propertyInfo: {
    propertyName: string;
    description: string;
    category: string[];
    roomType: string;
    price: number;
    leaseTerms: string;
  };
  contactInfo: {
    fullName: string;
    phoneNumber: string;
    email: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phoneNumber: string;
    };
  };
  propertyConfig: {
    totalRooms: number;
    rooms: Array<{
      roomType: string;
      count: number;
      price: number;
      bedType: string;
      capacity: number;
      description?: string;
      amenities: string[];
    }>;
    bathroomCount: number;
    bathroomType: string;
    amenities: string[];
    rules: string[];
    smokingAllowed: string;
    petsAllowed: string;
    visitorsAllowed: string;
    // Rules / Preferences
    femaleOnly: boolean;
    maleOnly: boolean;
    // Advanced Filters
    security24h: boolean;
    cctv: boolean;
    fireSafety: boolean;
    nearTransport: boolean;
    studyFriendly: boolean;
    quietEnvironment: boolean;
    flexibleLease: boolean;
  };
  propertyImages: {
    property: string[];
    rooms: Record<number, string[]>;
  };
  documents: {
    governmentId: string;
    businessPermit: string;
    landTitle: string;
    barangayClearance: string;
    fireSafetyCertificate: string;
    otherDocuments?: string;
  };
}

export const createHostApplication = async (data: HostApplicationData) => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Please login to submit an application");
  }

  // Check if user already has an application
  const existingApplication = await db.hostApplication.findUnique({
    where: { userId: user.id },
  });

  if (existingApplication) {
    throw new Error("You have already submitted an application");
  }

  // Validate business info
  if (!data.businessInfo.businessName || data.businessInfo.businessName.length < 3) {
    throw new Error("Business name must be at least 3 characters");
  }

  if (!data.businessInfo.businessDescription || data.businessInfo.businessDescription.length < 50) {
    throw new Error("Business description must be at least 50 characters");
  }

  // Validate property info
  if (!data.propertyInfo.propertyName || data.propertyInfo.propertyName.length < 3) {
    throw new Error("Property name must be at least 3 characters");
  }

  if (!data.propertyInfo.description || data.propertyInfo.description.length < 50) {
    throw new Error("Property description must be at least 50 characters");
  }

  if (!data.propertyInfo.price || data.propertyInfo.price < 1000 || data.propertyInfo.price > 50000) {
    throw new Error("Price must be between ₱1,000 and ₱50,000 per month");
  }

  // Validate contact info
  const nameError = validateName(data.contactInfo.fullName);
  if (nameError) {
    throw new Error(nameError);
  }

  const phoneError = validatePhoneNumber(data.contactInfo.phoneNumber);
  if (phoneError) {
    throw new Error(phoneError);
  }

  const emailError = validateEmail(data.contactInfo.email);
  if (emailError) {
    throw new Error(emailError);
  }

  // Validate property config
  if (!data.propertyConfig.totalRooms || data.propertyConfig.totalRooms < 1 || data.propertyConfig.totalRooms > 50) {
    throw new Error("Total rooms must be between 1 and 50");
  }

  if (!data.propertyConfig.rooms || data.propertyConfig.rooms.length === 0) {
    throw new Error("Please add at least one room type");
  }

  // Validate rooms
  data.propertyConfig.rooms.forEach((room, index) => {
    if (!room.roomType) {
      throw new Error(`Room type is required for room ${index + 1}`);
    }

    if (!room.count || room.count < 1 || room.count > 20) {
      throw new Error(`Room count must be between 1 and 20 for room ${index + 1}`);
    }

    if (!room.price || room.price < 1000 || room.price > 50000) {
      throw new Error(`Price must be between ₱1,000 and ₱50,000 for room ${index + 1}`);
    }

    if (!room.capacity || room.capacity < 1 || room.capacity > 10) {
      throw new Error(`Capacity must be between 1 and 10 for room ${index + 1}`);
    }
  });

  // Validate documents
  const requiredDocuments = ['governmentId', 'businessPermit', 'landTitle', 'barangayClearance', 'fireSafetyCertificate'];
  for (const doc of requiredDocuments) {
    const documentValue = data.documents[doc as keyof typeof data.documents];
    if (!documentValue || !documentValue.startsWith('http')) {
      throw new Error(`Please upload a valid ${doc} document`);
    }
  }

   // Create application
  const application = await db.hostApplication.create({
    data: {
      userId: user.id,
      businessInfo: data.businessInfo,
      propertyInfo: data.propertyInfo,
      contactInfo: data.contactInfo,
      propertyConfig: data.propertyConfig,
      propertyImages: data.propertyImages,
      documents: data.documents,
      status: 'pending'
    },
  });

  // Send confirmation emails (fire and forget)
  sendApplicationConfirmationEmail(user, application);
  // Get admin users
  const adminUsers = await db.user.findMany({
    where: { role: 'admin' }
  });
  adminUsers.forEach(admin => {
    sendAdminApplicationNotification(admin, application);
  });

  return {
    success: true,
    data: application,
    message: "Application submitted successfully. Please wait for admin review."
  };
};

export const getHostApplicationByUser = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Please login to view your application");
  }

  const application = await db.hostApplication.findUnique({
    where: { userId: user.id },
  });

  return application;
};

export const getHostApplications = async (filter: { status?: string; search?: string; page?: number; limit?: number }) => {
  const { status, search, page = 1, limit = 10 } = filter;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { businessInfo: { businessName: { contains: search, mode: 'insensitive' } } },
      { propertyInfo: { propertyName: { contains: search, mode: 'insensitive' } } },
      { contactInfo: { fullName: { contains: search, mode: 'insensitive' } } },
      { contactInfo: { email: { contains: search, mode: 'insensitive' } } }
    ];
  }

  const [applications, total] = await Promise.all([
    db.hostApplication.findMany({
      where,
      include: {
        user: true
      },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: 'desc'
      }
    }),
    db.hostApplication.count({ where })
  ]);

  return {
    applications,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export const updateApplicationStatus = async (id: string, status: 'approved' | 'rejected', adminId: string, reason?: string) => {
  const application = await db.hostApplication.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!application) {
    throw new Error("Application not found");
  }

  // Update application status
  const updatedApplication = await db.hostApplication.update({
    where: { id },
    data: {
      status,
      approvedBy: status === 'approved' ? adminId : null,
      rejectedBy: status === 'rejected' ? adminId : null,
      rejectedReason: status === 'rejected' ? reason : null
    }
  });

  // If approved, update user role to landlord
  if (status === 'approved') {
    await db.user.update({
      where: { id: application.userId },
      data: {
        role: 'landlord',
        isVerifiedLandlord: true,
        landlordApprovedAt: new Date()
      }
    });
    // Send approval email (fire and forget)
    sendApplicationApprovalEmail(application.user, updatedApplication);
  } else {
    // Send rejection email (fire and forget)
    sendApplicationRejectionEmail(application.user, updatedApplication, reason || 'Application rejected');
  }

  return updatedApplication;
};
