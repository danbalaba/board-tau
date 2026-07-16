"use server";

import { Resend } from 'resend';
import validator from 'validator';
import { render } from '@react-email/render';
import React from 'react';
import ApplicationApproved from '@/emails/ApplicationApproved';
import ApplicationRejected from '@/emails/ApplicationRejected';
import ApplicationConfirmation from '@/emails/ApplicationConfirmation';
import AdminApplicationAlert from '@/emails/AdminApplicationAlert';
import InquiryReceived from '@/emails/InquiryReceived';
import InquiryReceipt from '@/emails/InquiryReceipt';
import InquiryStatusUpdate from '@/emails/InquiryStatusUpdate';
import ReservationFeeNotification from '@/emails/ReservationFeeNotification';
import ReviewReceipt from '@/emails/ReviewReceipt';
import ReviewResponseAlert from '@/emails/ReviewResponseAlert';
import NewReviewAlert from '@/emails/NewReviewAlert';
import NewMessageAlert from '@/emails/NewMessageAlert';
import GenericNotification from '@/emails/GenericNotification';
import PasswordChangedEmail from '@/emails/PasswordChanged';
import NewLoginAlertEmail from '@/emails/NewLoginAlert';
import ResetPasswordEmail from '@/emails/ResetPasswordEmail';
import OAuthReminderEmail from '@/emails/OAuthReminderEmail';
import StrikeWarningEmail from '@/emails/StrikeWarningEmail';
import BanNoticeEmail from '@/emails/BanNoticeEmail';
import SuspensionNoticeEmail from '@/emails/SuspensionNoticeEmail';
import ReactivationNoticeEmail from '@/emails/ReactivationNoticeEmail';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

import { baseUrl, lightLogoUrl, darkLogoUrl } from './constants';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

import { db } from '@/lib/db';

// Send email with error handling
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    // 1. Check Global Feature Flag
    const emailFlag = await db.featureFlag.findUnique({
      where: { name: 'GLOBAL_EMAIL_NOTIFICATIONS' }
    });
    
    if (emailFlag && !emailFlag.enabled) {
      console.log('Email sending skipped: GLOBAL_EMAIL_NOTIFICATIONS is disabled.');
      return false;
    }

    // 2. Proceed with sending
    const { data, error } = await resend.emails.send({
      from: `BoardTAU <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('Resend error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};


// Application submission confirmation email
export const sendApplicationConfirmationEmail = async (user: any, application: any) => {
  const emailHtml = await render(React.createElement(ApplicationConfirmation, {
    userName: user.name,
    applicationId: application.id,
    businessName: application.businessInfo.businessName,
    propertyName: application.propertyInfo.propertyName
  }));

  return await sendEmail({
    to: user.email,
    subject: 'BoardTAU Landlord Application Submitted',
    html: emailHtml
  });
};

// Application approval email
export const sendApplicationApprovalEmail = async (user: any, application: any) => {
  const dashboardLink = `${baseUrl}/landlord`;
  const emailHtml = await render(React.createElement(ApplicationApproved, {
    userName: user.name,
    dashboardLink: dashboardLink
  }));

  return await sendEmail({
    to: user.email,
    subject: 'BoardTAU Landlord Application Approved',
    html: emailHtml
  });
};

// Application rejection email
export const sendApplicationRejectionEmail = async (user: any, application: any, reason: string) => {
  const emailHtml = await render(React.createElement(ApplicationRejected, {
    userName: user.name,
    reason: reason
  }));

  return await sendEmail({
    to: user.email,
    subject: 'BoardTAU Landlord Application Update',
    html: emailHtml
  });
};

// Admin notification email
export const sendAdminApplicationNotification = async (admin: any, application: any) => {
  const adminDashboardLink = `${baseUrl}/admin/applications`;
  const emailHtml = await render(React.createElement(AdminApplicationAlert, {
    adminName: admin.name,
    applicationId: application.id,
    applicantName: application.contactInfo.fullName,
    businessName: application.businessInfo.businessName,
    propertyName: application.propertyInfo.propertyName,
    email: application.contactInfo.email,
    phone: application.contactInfo.phoneNumber,
    reviewLink: adminDashboardLink
  }));

  return await sendEmail({
    to: admin.email,
    subject: 'New Landlord Application - BoardTAU',
    html: emailHtml
  });
};
// Inquiry Submission Notification (to Landlord)
export const sendInquirySubmissionEmail = async (landlord: any, tenant: any, listing: any, room: any, inquiryData: any) => {
  const inquiryLink = `${baseUrl}/landlord/inquiries`;
  
  const emailHtml = await render(React.createElement(InquiryReceived, {
    listingTitle: listing.title,
    roomName: room.name,
    roomType: room.roomType,
    occupantsCount: inquiryData.occupantsCount || 1,
    reservationFee: inquiryData.reservationFee || 0,
    baseFee: room.reservationFee || 0,
    isSoloBuyout: inquiryData.isSoloBuyout || false,
    tenantName: tenant.name,
    message: inquiryData.message || 'No message provided.',
    manageInquiriesLink: inquiryLink
  }));

  return await sendEmail({
    to: landlord.email,
    subject: `New Inquiry: ${listing.title}`,
    html: emailHtml
  });
};

/**
 * Inquiry Status Update (to Tenant)
 */
export const sendInquiryStatusEmail = async (tenant: any, listing: any, status: string, message?: string, inquiryData?: any) => {
  const isApproved = status === "APPROVED";
  const color = isApproved ? "#2F7D6D" : "#ef4444";
  const statusText = isApproved ? "APPROVED" : "DECLINED";
  const inquiryLink = `${baseUrl}/inquiries`;

  const emailHtml = await render(React.createElement(InquiryStatusUpdate, {
    tenantName: tenant.name,
    listingTitle: listing.title,
    status: isApproved ? 'APPROVED' : 'REJECTED',
    rejectionReason: message,
    actionLink: `${baseUrl}/inquiries`
  }));

  return await sendEmail({
    to: tenant.email,
    subject: `Inquiry Update: ${listing.title}`,
    html: emailHtml
  });
};

/**
 * Reservation & Booking Updates (Both)
 */
export const sendReservationNotificationEmail = async (
  user: any,
  listing: any,
  status: string,
  title: string,
  description: string,
  isLandlord: boolean = false,
  overrideLink?: string,
  overrideLabel?: string
) => {
  const bookingLink = overrideLink || (isLandlord ? `${baseUrl}/landlord/reservations` : `${baseUrl}/reservations`);
  const buttonLabel = overrideLabel || (isLandlord ? 'Manage Reservations' : 'My Reservations');

  const emailHtml = await render(React.createElement(GenericNotification, {
    title: title,
    description: description,
    actionLabel: buttonLabel,
    actionLink: bookingLink
  }));

  return await sendEmail({
    to: user.email,
    subject: `${title}: ${listing.title}`,
    html: emailHtml
  });
};

/**
 * Reservation Fee Notification (to Landlord) - Detailed
 */
export const sendReservationFeeEmail = async (landlord: any, tenant: any, listing: any, amount: number) => {
  const manageLink = `${baseUrl}/landlord/reservations`;
  
  const emailHtml = await render(React.createElement(ReservationFeeNotification, {
    landlordName: landlord.name,
    tenantName: tenant.name,
    listingTitle: listing.title,
    amount: amount,
    manageLink: manageLink
  }));

  return await sendEmail({
    to: landlord.email,
    subject: `💰 Payment Received: ${listing.title}`,
    html: emailHtml
  });
};

/**
 * Inquiry Submission Receipt (to Tenant) - Detailed with Images
 */
export const sendInquiryReceiptEmail = async (tenant: any, listing: any, room: any, inquiryData: any) => {
  const moveInStr = new Date(inquiryData.moveInDate).toLocaleDateString();
  const checkOutStr = new Date(inquiryData.checkOutDate).toLocaleDateString();
  const roomImage = room.images?.[0]?.url || listing.imageSrc;

  const emailHtml = await render(React.createElement(InquiryReceipt, {
    tenantName: tenant.name,
    listingTitle: listing.title,
    roomName: room.name,
    roomImage: roomImage,
    moveInDate: moveInStr,
    checkOutDate: checkOutStr,
    monthlyPrice: room.price,
    occupantsCount: inquiryData.occupantsCount || 1,
    reservationFee: inquiryData.reservationFee,
    baseFee: room.reservationFee,
    isSoloBuyout: inquiryData.isSoloBuyout || false,
    message: inquiryData.message,
    trackInquiryLink: `${baseUrl}/inquiries`
  }));

  return await sendEmail({
    to: tenant.email,
    subject: `Receipt: Inquiry for ${listing.title}`,
    html: emailHtml
  });
};

/**
 * New Review Notification (to Landlord)
 */
export const sendNewReviewEmail = async (landlord: any, tenant: any, listing: any, rating: number, comment?: string) => {
  const reviewsLink = `${baseUrl}/landlord/reviews`;
  
  const emailHtml = await render(React.createElement(NewReviewAlert, {
    listingTitle: listing.title,
    tenantName: tenant.name,
    rating: rating,
    comment: comment,
    manageReviewLink: reviewsLink
  }));

  return await sendEmail({
    to: landlord.email,
    subject: `New Review for ${listing.title}`,
    html: emailHtml
  });
};

/**
 * Review Response Notification (to Tenant)
 */
export const sendReviewResponseEmail = async (tenant: any, listing: any, response: string) => {
  const reviewsLink = `${baseUrl}/my-reviews`;

  const emailHtml = await render(React.createElement(ReviewResponseAlert, {
    tenantName: tenant.name,
    listingTitle: listing.title,
    response: response,
    viewReviewsLink: reviewsLink
  }));

  return await sendEmail({
    to: tenant.email,
    subject: `Response to your review of ${listing.title}`,
    html: emailHtml
  });
};

/**
 * Review Submission Receipt (to Guest)
 */
export const sendReviewReceiptEmail = async (tenant: any, listing: any, rating: number) => {
  const reviewsLink = `${baseUrl}/my-reviews`;

  const emailHtml = await render(React.createElement(ReviewReceipt, {
    tenantName: tenant.name,
    listingTitle: listing.title,
    rating: rating,
    viewReviewsLink: reviewsLink
  }));

  return await sendEmail({
    to: tenant.email,
    subject: `Receipt: Your review of ${listing.title}`,
    html: emailHtml
  });
};

/**
 * New Message Notification (Direct Chat)
 */
export const sendNewMessageEmail = async (receiver: any, senderName: string, listingTitle: string, messageContent: string, deepLink: string) => {
  const emailHtml = await render(React.createElement(NewMessageAlert, {
    senderName: senderName,
    listingTitle: listingTitle,
    messageContent: messageContent,
    viewReplyLink: baseUrl + deepLink
  }));

  return await sendEmail({
    to: receiver.email,
    subject: `New message from ${senderName}: ${listingTitle}`,
    html: emailHtml
  });
};

/**
 * Password Change Security Notification
 */
export const sendPasswordChangeEmail = async (user: any) => {
  const emailHtml = await render(React.createElement(PasswordChangedEmail, {
    userName: user.name || 'Valued User',
  }));

  return await sendEmail({
    to: user.email,
    subject: 'Security Alert: BoardTAU Password Changed',
    html: emailHtml
  });
};

/**
 * New Login Alert Security Notification
 */
export const sendNewLoginEmail = async (user: any, loginInfo: { browser: string; device: string; time: string }) => {
  const emailHtml = await render(React.createElement(NewLoginAlertEmail, {
    userName: user.name || 'Valued User',
    browser: loginInfo.browser,
    device: loginInfo.device,
    time: loginInfo.time,
  }));

  return await sendEmail({
    to: user.email,
    subject: 'Security Alert: New Login to BoardTAU',
    html: emailHtml
  });
};

/**
 * Password Reset Link Email
 */
export const sendPasswordResetEmail = async (
  user: any, 
  resetLink: string, 
  loginInfo: { browser: string; device: string; ipAddress: string }
) => {
  const emailHtml = await render(React.createElement(ResetPasswordEmail, {
    userName: user.name || 'Valued User',
    resetLink,
    browser: loginInfo.browser,
    device: loginInfo.device,
    ipAddress: loginInfo.ipAddress,
  }));

  return await sendEmail({
    to: user.email,
    subject: 'Reset Your BoardTAU Password',
    html: emailHtml
  });
};

/**
 * OAuth Login Reminder Email (for Forgot Password flow)
 */
export const sendOAuthReminderEmail = async (user: any, provider: string) => {
  const emailHtml = await render(React.createElement(OAuthReminderEmail, {
    userName: user.name || 'Valued User',
    provider: provider,
  }));

  return await sendEmail({
    to: user.email,
    subject: `Login Reminder: Your BoardTAU account uses ${provider}`,
    html: emailHtml
  });
};
/**
 * Strike Warning Email (for cancellations/violations)
 */
export const sendStrikeWarningEmail = async (user: any, strikeCount: number, reason: string, isRepeatOffender: boolean = false) => {
  const emailHtml = await render(React.createElement(StrikeWarningEmail, {
    userName: user.name || 'User',
    strikeCount: strikeCount,
    reason: reason,
    isRepeatOffender: isRepeatOffender,
  }));

  return await sendEmail({
    to: user.email,
    subject: `⚠️ Warning: Strike ${strikeCount}/3 on your BoardTAU Account`,
    html: emailHtml
  });
};

/**
 * Permanent Ban Notice Email
 */
export const sendBanNoticeEmail = async (user: any, reason: string) => {
  const emailHtml = await render(React.createElement(BanNoticeEmail, {
    userName: user.name || 'User',
    reason: reason,
  }));

  return await sendEmail({
    to: user.email,
    subject: `🚨 Account Banned: BoardTAU Security Notice`,
    html: emailHtml
  });
};

/**
 * Temporary Suspension Notice Email
 */
export const sendSuspensionNoticeEmail = async (user: any, reason: string) => {
  const emailHtml = await render(React.createElement(SuspensionNoticeEmail, {
    userName: user.name || 'User',
    reason: reason,
  }));

  return await sendEmail({
    to: user.email,
    subject: `⚠️ Account Suspended: BoardTAU Security Notice`,
    html: emailHtml
  });
};

/**
 * Account Reactivation Notice Email
 */
export const sendReactivationEmail = async (user: any) => {
  const emailHtml = await render(React.createElement(ReactivationNoticeEmail, {
    userName: user.name || 'User',
  }));

  return await sendEmail({
    to: user.email,
    subject: `✅ Account Reactivated: Welcome back to BoardTAU!`,
    html: emailHtml
  });
};
