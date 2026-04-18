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

export const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const lightLogoUrl = `${baseUrl}/images/TauBOARD-Light.png`;
const darkLogoUrl = `${baseUrl}/images/TauBOARD-Dark.png`;

const safe = (str: any): string => {
    if (str === null || str === undefined) return '';
    return validator.escape(String(str));
};

/**
 * Returns a star rating string using a constant lookup array.
 * This satisfies CodeQL's 'Resource exhaustion' check by avoiding variable-length String.repeat() calls.
 */
const getStars = (rating: any): string => {
    const n = Math.floor(Number(rating));
    const safeIndex = isFinite(n) ? Math.max(0, Math.min(5, n)) : 0;
    const starModels = ["☆☆☆☆☆", "★☆☆☆☆", "★★☆☆☆", "★★★☆☆", "★★★★☆", "★★★★★"];
    return starModels[safeIndex];
};

/**
 * Common BoardTAU Premium Layout
 * @param {string} title - The email title, will be auto-escaped.
 * @param {string} safeHtmlContent - Pre-sanitized HTML content.
 */
const wrapLayout = (title: string, safeHtmlContent: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safe(title)}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; line-height: 1.6; }
        .email-container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08); overflow: hidden; border: 1px solid #e2e8f0; }
        .email-header { background: linear-gradient(135deg, #2F7D6D 0%, #1E5F50 100%); padding: 30px 40px; text-align: center; }
        .email-body { padding: 40px; }
        .greeting { font-size: 22px; font-weight: 600; color: #1e293b; margin-bottom: 8px; text-align: center; }
        .info-section { background: #f8fafc; border-left: 4px solid #2F7D6D; padding: 20px; border-radius: 8px; margin: 30px 0; }
        .field-label { font-size: 11px; font-weight: bold; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px; }
        .field-value { font-size: 15px; color: #1e293b; font-weight: 500; margin-bottom: 15px; }
        .attachment-thumb { width: 100%; height: 120px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0; }
        .cta-button { display: inline-block; background-color: #2F7D6D; color: #ffffff !important; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin-top: 10px; }
        .email-footer { background-color: #f8fafc; padding: 30px 40px; border-top: 1px solid #e2e8f0; text-align: center; }
        .footer-text { font-size: 13px; color: #94a3b8; margin-bottom: 12px; }
        .company-info { font-size: 12px; color: #cbd5e1; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <img src="${lightLogoUrl}" alt="BoardTAU" style="height: 40px; width: auto; display: block; margin: 0 auto;">
        </div>
        <div class="email-body">
            ${safeHtmlContent}
        </div>
        <div class="email-footer">
            <p class="footer-text">Need help? Visit our <a href="${baseUrl}/help" style="color: #2F7D6D; text-decoration: none; font-weight: 600;">Help Center</a></p>
            <div class="company-info">
                <p>You received this email because you are a registered user of BoardTAU.</p>
                <p>© ${new Date().getFullYear()} BoardTAU. All rights reserved.</p>
                <p>Camiling, Tarlac, Philippines</p>
            </div>
        </div>
    </div>
</body>
</html>
`;

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
// Inquiry Submission Notification (to Landlord)
export const sendInquirySubmissionEmail = async (landlord: any, tenant: any, listing: any, room: any, inquiryData: any) => {
  const inquiryLink = `${baseUrl}/landlord/inquiries`;
  
  const content = `
    <h1 class="greeting">New Inquiry Received</h1>
    <p style="text-align: center; color: #64748b; margin-bottom: 30px;">A student is interested in your property</p>
    
    <div class="info-section">
        <div class="field-label" style="margin-bottom: 8px;">Requested Booking Details</div>
        <div style="background: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
            <div style="font-weight: 800; color: #1e293b; font-size: 16px;">${safe(listing.title)}</div>
            <div style="font-size: 13px; color: #64748b;">Room: ${safe(room.name)} (${safe(room.roomType)})</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9;">
            <div>
                <div class="field-label">Occupants</div>
                <div class="field-value">${safe(inquiryData.occupantsCount || 1)} ${inquiryData.occupantsCount === 1 ? 'Person' : 'People'}</div>
            </div>
            <div>
                <div class="field-label">Reservation Fee</div>
                <div class="field-value" style="color: #2F7D6D; font-weight: 700;">₱ ${safe(inquiryData.reservationFee?.toLocaleString() || '0')}</div>
            </div>
        </div>
        
        <div class="field-label">Inquiried By</div>
        <div class="field-value" style="margin-bottom: 20px;">
           <span style="font-weight: 700;">${safe(tenant.name)}</span>
           <span style="font-size: 11px; background: #f1f5f9; padding: 3px 10px; border-radius: 20px; color: #64748b; margin-left: 8px; vertical-align: middle;">Student</span>
        </div>
        
        <div class="field-label">Student message</div>
        <div style="font-style: italic; color: #4b5563; border-left: 3px solid #2F7D6D; background: #f8fafc; padding: 15px; border-radius: 0 8px 8px 0; margin-top: 5px;">
            "${safe(inquiryData.message || 'No message provided.')}"
        </div>
    </div>

    <div style="text-align: center; margin-top: 40px;">
        <a href="${safe(inquiryLink)}" class="cta-button">Manage Inquiries</a>
    </div>

    <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px dashed #e2e8f0;">
        Timely responses improve your performance score and search visibility.
    </p>
  `;

  return await sendEmail({
    to: landlord.email,
    subject: `New Inquiry: ${listing.title}`,
    html: wrapLayout('New Inquiry Received', content)
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

  const content = `
    <h1 class="greeting">Inquiry Update</h1>
    <p style="text-align: center; color: #64748b; margin-bottom: 30px;">
        The landlord of <strong>${safe(listing.title)}</strong> has ${isApproved ? 'accepted' : 'declined'} your inquiry.
    </p>
    
    <div style="margin: 30px 0; padding: 30px; border-radius: 12px; background: #f8fafc; border: 2px solid ${color}; text-align: center;">
        <p style="font-size: 12px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Current Status</p>
        <h1 style="color: ${color}; margin: 0; font-size: 36px; letter-spacing: -1px;">${statusText}</h1>
    </div>

    ${isApproved && inquiryData ? `
    <div class="info-section">
        <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;">
            <div class="field-label">Occupancy Agreement</div>
            <div class="field-value">${safe(inquiryData.occupantsCount || 1)} ${inquiryData.occupantsCount === 1 ? 'Person' : 'People'}</div>
        </div>
        <div>
            <div class="field-label">Total Reservation Fee Due</div>
            <div class="field-value" style="color: #2F7D6D; font-size: 20px; font-weight: 800;">₱ ${safe(inquiryData.reservationFee?.toLocaleString() || '0')}</div>
        </div>
    </div>
    ` : ''}

    ${message ? `
    <div class="info-section" style="border-left-color: ${color}; background: #fffaf0; border: 1px solid #fef3c7;">
        <div class="field-label" style="color: #d97706;">Message from Landlord</div>
        <div style="color: #92400e;">"${safe(message)}"</div>
    </div>
    ` : ''}

    <div style="text-align: center; margin-top: 40px;">
        <a href="${safe(inquiryLink)}" class="cta-button" style="background-color: ${isApproved ? '#2F7D6D' : '#64748b'}">
            ${isApproved ? 'Proceed to Inquiry' : 'View Inquiry History'}
        </a>
    </div>
  `;

  return await sendEmail({
    to: tenant.email,
    subject: `Inquiry Update: ${listing.title}`,
    html: wrapLayout('Inquiry Status Update', content)
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
  overrideLink?: string
) => {
  const bookingLink = overrideLink || (isLandlord ? `${baseUrl}/landlord/reservations` : `${baseUrl}/reservations`);
  const isConfirmed = status === "RESERVED" || status === "PAID" || status === "CHECKED_IN";
  const color = isConfirmed ? "#2F7D6D" : "#64748b";
  
  const content = `
    <h1 class="greeting">${safe(title)}</h1>
    <p style="text-align: center; color: #64748b; margin-bottom: 30px;">
        ${isLandlord ? 'Updates for your property at BoardTAU' : 'Quick update on your stay at BoardTAU'}
    </p>

    <div style="margin: 30px 0; padding: 30px; border-radius: 12px; background: #f0fdfa; border: 2px solid ${color}; text-align: center;">
        <p style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Transaction Status</p>
        <h1 style="color: ${color}; margin: 0; font-size: 32px; letter-spacing: -1px; font-weight: 800;">${safe(status.replace('_', ' '))}</h1>
    </div>
    
    <div class="info-section">
        <div class="field-label">Listing</div>
        <div class="field-value">${safe(listing.title)}</div>
        
        <div class="field-label">Official Update</div>
        <div class="field-value" style="font-weight: 500; color: #334155;">${safe(description)}</div>
    </div>

    <div style="text-align: center; margin-top: 40px;">
        <a href="${safe(bookingLink)}" class="cta-button">
            ${isLandlord ? 'Manage Reservations' : 'My Reservations'}
        </a>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject: `${safe(title)}: ${listing.title}`,
    html: wrapLayout(title, content)
  });
};

/**
 * Inquiry Submission Receipt (to Tenant) - Detailed with Images
 */
export const sendInquiryReceiptEmail = async (tenant: any, listing: any, room: any, inquiryData: any) => {
  const moveInStr = new Date(inquiryData.moveInDate).toLocaleDateString();
  const checkOutStr = new Date(inquiryData.checkOutDate).toLocaleDateString();
  const roomImage = room.images?.[0]?.url || listing.imageSrc;

  const content = `
    <div style="margin-bottom: 25px; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
        <img src="${safe(roomImage)}" alt="Room" style="width: 100%; height: 200px; object-fit: cover; display: block;">
        <div style="padding: 15px; background: #fff;">
            <p style="font-weight: 800; color: #1e293b; margin: 0;">${safe(listing.title)}</p>
            <p style="font-size: 13px; color: #64748b; margin: 0;">${safe(room.name)}</p>
        </div>
    </div>

    <h1 class="greeting">Inquiry Received</h1>
    <p style="text-align: center; color: #64748b; margin-bottom: 30px;">
        Hi ${safe(tenant.name)}, your inquiry has been successfully sent to the landlord.
    </p>
    
    <div class="info-section">
        <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #e2e8f0;">
            <div class="field-label">Move-In Window</div>
            <div class="field-value">${safe(moveInStr)} — ${safe(checkOutStr)}</div>
        </div>
        
        <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #e2e8f0;">
            <div class="field-label">Pricing Agreement (Monthly)</div>
            <div class="field-value">₱ ${safe(room.price.toLocaleString())}</div>
        </div>

        <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #e2e8f0;">
            <div class="field-label">Occupants / Members</div>
            <div class="field-value">${safe(inquiryData.occupantsCount || 1)} ${inquiryData.occupantsCount === 1 ? 'Person' : 'People'}</div>
        </div>

        <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #e2e8f0;">
            <div class="field-label">Reservation Deposit Total</div>
            <div class="field-value">
               <span style="font-weight: 700; color: #2F7D6D; font-size: 18px;">₱ ${safe(inquiryData.reservationFee.toLocaleString())}</span>
               <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">
                  Breakdown: ${safe(inquiryData.occupantsCount || 1)} × ₱ ${safe(room.reservationFee.toLocaleString())} base fee
               </div>
            </div>
        </div>

        ${inquiryData.message ? `
            <div class="field-label">Notes for Landlord</div>
            <div style="font-style: italic; color: #64748b; font-size: 14px; background: white; padding: 12px; border-radius: 8px; border: 1px solid #f1f5f9;">"${safe(inquiryData.message)}"</div>
        ` : ''}

        <div style="margin-top: 25px; background: #fffbeb; border: 1px solid #fef3c7; padding: 15px; border-radius: 8px;">
            <p style="font-size: 12px; font-weight: 800; color: #92400e; text-transform: uppercase; margin-bottom: 8px;">What happens next?</p>
            <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #b45309;">
                <li>Landlord reviews your application and identity documents.</li>
                <li>You will get an email alert if they accept or decline.</li>
                <li>If accepted, you'll have a window to pay the reservation fee to lock your slot.</li>
            </ol>
        </div>
    </div>

    <div style="text-align: center; margin-top: 40px;">
        <a href="${baseUrl}/inquiries" class="cta-button">Track Inquiry</a>
    </div>
  `;

  return await sendEmail({
    to: tenant.email,
    subject: `Receipt: Inquiry for ${listing.title}`,
    html: wrapLayout('Inquiry Received', content)
  });
};

/**
 * New Review Notification (to Landlord)
 */
export const sendNewReviewEmail = async (landlord: any, tenant: any, listing: any, rating: number, comment?: string) => {
  const reviewsLink = `${baseUrl}/landlord/reviews`;
  const safeRating = Math.floor(Number(rating) || 0);
  const stars = getStars(safeRating);

  const content = `
    <h1 class="greeting">New Rating Received</h1>
    
    <div style="text-align: center; margin: 30px 0;">
        <div style="color: #fbbf24; font-size: 40px; line-height: 1; margin-bottom: 10px;">${stars}</div>
        <p style="font-size: 14px; color: #64748b;">${safeRating} out of 5 Stars</p>
    </div>

    <div class="info-section">
        <div class="field-label">Impacted Property</div>
        <div class="field-value" style="color: #2F7D6D;">${safe(listing.title)}</div>
        
        <div class="field-label">Feedback From</div>
        <div class="field-value">${safe(tenant.name)}</div>
        
        ${comment ? `
        <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 10px;">
            <div class="field-label">Guest's Experience</div>
            <div style="font-style: italic; color: #1e293b; font-size: 15px;">"${safe(comment)}"</div>
        </div>
        ` : ''}
    </div>

    <div style="background: #f0fdf4; border: 1px solid #dcfce7; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
        <p style="font-size: 11px; font-weight: 800; color: #166534; text-transform: uppercase;">⚡ Tip for Landlords</p>
        <p style="font-size: 13px; color: #15803d; margin-top: 5px;">Responding to negative reviews with a professional solution can increase your future booking rate by up to 20%.</p>
    </div>

    <div style="text-align: center;">
        <a href="${safe(reviewsLink)}" class="cta-button">Manage Review</a>
    </div>
  `;

  return await sendEmail({
    to: landlord.email,
    subject: `New Review for ${listing.title}`,
    html: wrapLayout('New Guest Review', content)
  });
};

/**
 * Review Response Notification (to Tenant)
 */
export const sendReviewResponseEmail = async (tenant: any, listing: any, response: string) => {
  const reviewsLink = `${baseUrl}/my-reviews`;

  const content = `
    <h1 class="greeting">Landlord Responded!</h1>
    <p style="text-align: center; color: #64748b; margin-bottom: 30px;">The landlord of <strong>${safe(listing.title)}</strong> has replied to your review.</p>
    
    <div class="info-section" style="background: #f0fdfa; border-left-color: #0d9488;">
        <div class="field-label" style="color: #0d9488;">Landlord's Message</div>
        <div style="color: #115e59; font-weight: 500; font-size: 16px;">"${safe(response)}"</div>
    </div>

    <div style="text-align: center;">
        <a href="${safe(reviewsLink)}" class="cta-button">See My Reviews</a>
    </div>
  `;

  return await sendEmail({
    to: tenant.email,
    subject: `Response to your review of ${listing.title}`,
    html: wrapLayout('New Review Response', content)
  });
};

/**
 * Review Submission Receipt (to Guest)
 */
export const sendReviewReceiptEmail = async (tenant: any, listing: any, rating: number) => {
  const reviewsLink = `${baseUrl}/my-reviews`;
  const safeRating = Math.floor(Number(rating) || 0);
  const stars = getStars(safeRating);

  const content = `
    <h1 class="greeting">Review Successfully Logged!</h1>
    <p style="text-align: center; color: #64748b; margin-bottom: 20px;">
        Hi ${safe(tenant.name)}, thank you for sharing your experience at <strong>${safe(listing.title)}</strong>.
    </p>
    
    <div style="margin: 30px 0; padding: 25px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; text-align: center;">
        <p style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Your Official Rating</p>
        <div style="color: #fbbf24; font-size: 32px; line-height: 1; margin-bottom: 5px;">${stars}</div>
        <p style="font-size: 13px; color: #1e293b; font-weight: 700;">${rating} / 5.0 Rating</p>
    </div>

    <div class="info-section" style="border-left-color: #2F7D6D;">
        <p style="font-size: 14px; color: #475569; margin: 0;">
            Your feedback helps our community of students and staff make informed decisions. The property owner has been notified and may provide a response to your reflection soon.
        </p>
    </div>

    <div style="text-align: center; margin-top: 30px;">
        <a href="${safe(reviewsLink)}" class="cta-button">View My Reviews</a>
    </div>

    <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px dashed #e2e8f0;">
        Thank you for helping us maintain the high standards of BoardTAU accommodations.
    </p>
  `;

  return await sendEmail({
    to: tenant.email,
    subject: `Receipt: Your review of ${listing.title}`,
    html: wrapLayout('Review Received', content)
  });
};

