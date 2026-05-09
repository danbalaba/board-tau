"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "../user/user";
import { 
  sendApplicationConfirmationEmail, 
  sendApplicationApprovalEmail, 
  sendApplicationRejectionEmail, 
  sendAdminApplicationNotification 
} from '../email/notifications';

/**
 * Interface representing the new 8-step Host Application data.
 * Focused on Identity and Legitimacy verification.
 */
export interface HostApplicationData {
  businessInfo: {
    businessName: string;
    businessType: string;
    businessDescription: string;
    yearsExperience: string;
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
  selfieUrl: string;
  idCardUrl: string;
  businessPermitUrl: string;
  fireSafetyUrl: string;
  facadePhotoUrl: string;
  latlng: [number, number];
  additionalDocsUrl?: string;
}

/**
 * Creates a new host application in the database.
 * Optimized for the new identity-first verification flow.
 */
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

  // Final Server-side Validation
  if (!data.businessInfo.businessName || data.businessInfo.businessName.length < 3) {
    throw new Error("Business name is too short");
  }

  if (!data.selfieUrl || !data.idCardUrl) {
    throw new Error("Biometric verification is required");
  }

  if (!data.businessPermitUrl || !data.fireSafetyUrl) {
    throw new Error("Legal compliance documents are required");
  }

  try {
    // Create application using the new schema fields
    const application = await db.hostApplication.create({
      data: {
        userId: user.id,
        businessInfo: data.businessInfo,
        contactInfo: data.contactInfo,
        selfieUrl: data.selfieUrl,
        idCardUrl: data.idCardUrl,
        businessPermitUrl: data.businessPermitUrl,
        fireSafetyUrl: data.fireSafetyUrl,
        facadePhotoUrl: data.facadePhotoUrl,
        latlng: data.latlng,
        additionalDocsUrl: data.additionalDocsUrl || "",
        status: 'pending'
      },
    });

    // Send confirmation emails (fire and forget)
    sendApplicationConfirmationEmail(user, application as any);
    
    // Notify Admins
    const adminUsers = await db.user.findMany({
      where: { role: 'ADMIN' }
    });
    
    adminUsers.forEach(admin => {
      sendAdminApplicationNotification(admin, application as any);
    });

    return {
      success: true,
      data: application,
      message: "Application submitted successfully. Please wait for admin review."
    };
  } catch (error) {
    console.error("Submission Error:", error);
    throw new Error("Internal Server Error: Failed to save application.");
  }
};

/**
 * Get the application for the currently logged-in user.
 */
export const getHostApplicationByUser = async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  return await db.hostApplication.findUnique({
    where: { userId: user.id },
  });
};

/**
 * Admin: Get all applications with search and status filtering.
 */
export const getHostApplications = async (filter: { status?: string; search?: string; page?: number; limit?: number }) => {
  const { status, search, page = 1, limit = 10 } = filter;

  const where: any = {};
  if (status) where.status = status;

  if (search) {
    where.OR = [
      { businessInfo: { path: ['businessName'], equals: search } }, // Note: MongoDB path filtering
      { contactInfo: { path: ['fullName'], equals: search } },
      { contactInfo: { path: ['email'], equals: search } }
    ];
  }

  const [applications, total] = await Promise.all([
    db.hostApplication.findMany({
      where,
      include: { user: true },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' }
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

/**
 * Admin: Update application status and grant Landlord role upon approval.
 */
export const updateApplicationStatus = async (id: string, status: 'approved' | 'rejected', adminId: string, reason?: string) => {
  const application = await db.hostApplication.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!application) throw new Error("Application not found");

  const updatedApplication = await db.hostApplication.update({
    where: { id },
    data: {
      status,
      approvedBy: status === 'approved' ? adminId : null,
      rejectedBy: status === 'rejected' ? adminId : null,
      rejectedReason: status === 'rejected' ? reason : null
    }
  });

  if (status === 'approved') {
    await db.user.update({
      where: { id: application.userId },
      data: {
        role: 'LANDLORD',
        isVerifiedLandlord: true,
        landlordApprovedAt: new Date()
      }
    });
    sendApplicationApprovalEmail(application.user, updatedApplication as any);
  } else {
    sendApplicationRejectionEmail(application.user, updatedApplication as any, reason || 'Application rejected');
  }

  return updatedApplication;
};
