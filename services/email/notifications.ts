import nodemailer from 'nodemailer';
import validator from 'validator';

// Email configuration using Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Send email with error handling
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const mailOptions = {
      from: `"BoardTAU" <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

const safe = (val: any) => validator.escape(String(val || ''));

// Application submission confirmation email
export const sendApplicationConfirmationEmail = async (user: any, application: any) => {
  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2F7D6D;">Application Submitted Successfully!</h2>
      <p>Dear ${safe(user.name)},</p>
      <p>Thank you for applying to become a landlord on BoardTAU. Your application has been received and is currently under review by our admin team.</p>

      <h3>Application Details:</h3>
      <ul>
        <li><strong>Application ID:</strong> ${safe(application.id)}</li>
        <li><strong>Business Name:</strong> ${safe(application.businessInfo.businessName)}</li>
        <li><strong>Property Name:</strong> ${safe(application.propertyInfo.propertyName)}</li>
        <li><strong>Status:</strong> Pending Review</li>
      </ul>

      <p>We typically review applications within 24-48 business hours. You will receive an email notification once a decision has been made.</p>

      <p>Best regards,</p>
      <p>The BoardTAU Team</p>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject: 'BoardTAU Landlord Application Submitted',
    html: emailTemplate
  });
};

// Application approval email
export const sendApplicationApprovalEmail = async (user: any, application: any) => {
  const dashboardLink = `${process.env.NEXTAUTH_URL}/landlord`;

  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2F7D6D;">Congratulations! Your Application is Approved!</h2>
      <p>Dear ${safe(user.name)},</p>
      <p>We are pleased to inform you that your landlord application has been approved!</p>

      <h3>Welcome to the BoardTAU Landlord Community!</h3>

      <p>Your account has been upgraded to landlord status, and you now have access to our comprehensive landlord dashboard.</p>

      <h3>Getting Started:</h3>
      <ol>
        <li>Click the link below to access your dashboard: <a href="${safe(dashboardLink)}" style="color: #2F7D6D;">${safe(dashboardLink)}</a></li>
        <li>Use your existing login credentials to sign in</li>
        <li>Complete your profile and start listing properties</li>
        <li>Review our landlord guide for best practices</li>
      </ol>

      <p>If you need assistance, please don't hesitate to contact our support team.</p>

      <p>Best regards,</p>
      <p>The BoardTAU Team</p>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject: 'BoardTAU Landlord Application Approved',
    html: emailTemplate
  });
};

// Application rejection email
export const sendApplicationRejectionEmail = async (user: any, application: any, reason: string) => {
  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #dc2626;">Application Review Update</h2>
      <p>Dear ${safe(user.name)},</p>
      <p>We regret to inform you that your landlord application has been rejected.</p>

      <h3>Reason for Rejection:</h3>
      <p>${safe(reason)}</p>

      <h3>Next Steps:</h3>
      <p>If you believe this decision was made in error, or if you would like to reapply with additional information, please contact our support team.</p>

      <p>We appreciate your interest in becoming a landlord on BoardTAU.</p>

      <p>Best regards,</p>
      <p>The BoardTAU Team</p>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject: 'BoardTAU Landlord Application Update',
    html: emailTemplate
  });
};

// Admin notification email
export const sendAdminApplicationNotification = async (admin: any, application: any) => {
  const adminDashboardLink = `${process.env.NEXTAUTH_URL}/admin/applications`;

  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2F7D6D;">New Landlord Application Received</h2>
      <p>Dear ${safe(admin.name)},</p>
      <p>A new landlord application has been submitted and is waiting for your review.</p>

      <h3>Application Details:</h3>
      <ul>
        <li><strong>Application ID:</strong> ${safe(application.id)}</li>
        <li><strong>Applicant Name:</strong> ${safe(application.contactInfo.fullName)}</li>
        <li><strong>Business Name:</strong> ${safe(application.businessInfo.businessName)}</li>
        <li><strong>Property Name:</strong> ${safe(application.propertyInfo.propertyName)}</li>
        <li><strong>Email:</strong> ${safe(application.contactInfo.email)}</li>
        <li><strong>Phone:</strong> ${safe(application.contactInfo.phoneNumber)}</li>
      </ul>

      <p>Click the link below to review the application:</p>
      <p><a href="${safe(adminDashboardLink)}" style="color: #2F7D6D;">${safe(adminDashboardLink)}</a></p>

      <p>Best regards,</p>
      <p>The BoardTAU System</p>
    </div>
  `;

  return await sendEmail({
    to: admin.email,
    subject: 'New Landlord Application - BoardTAU',
    html: emailTemplate
  });
};
