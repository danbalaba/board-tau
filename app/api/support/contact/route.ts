import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { contactLimiter } from '@/lib/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Invalid email address").max(255, "Email is too long"),
  subject: z.string().min(1, "Subject is required").max(150, "Subject is too long"),
  message: z.string().min(1, "Message is required").max(2000, "Message is too long"),
});

// Basic HTML escaping to prevent XSS in the generated email template
const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await contactLimiter.limit(ip);
    
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    // 2. Parse and Validate Payload
    const body = await req.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map((err: any) => err.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { name, email, subject, message } = result.data;

    // 3. Sanitize inputs for HTML email
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="background-color: #2f7d6d; padding: 24px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; tracking-wide: uppercase;">BoardTAU Support Center</h2>
          </div>
          <div style="padding: 24px;">
            <h3 style="color: #0f172a; margin-top: 0; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">New Support Inquiry Received</h3>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 100px;"><strong>Name:</strong></td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">${safeName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;"><strong>Email:</strong></td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 14px;"><a href="mailto:${safeEmail}" style="color: #2f7d6d; text-decoration: none;">${safeEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;"><strong>Subject:</strong></td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${safeSubject}</td>
              </tr>
            </table>

            <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap;">
${safeMessage}
            </div>
          </div>
          <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
            This email was sent dynamically from the BoardTAU Support System.
          </div>
        </div>
      </div>
    `;

    const response = await resend.emails.send({
      from: `BoardTAU Support <${process.env.EMAIL_FROM}>`,
      to: 'support@boardtau.xyz',
      subject: `[Support Inquiry] ${safeSubject}`,
      html: emailHtml,
      replyTo: safeEmail,
    });

    if (response.error) {
      return NextResponse.json({ error: response.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: response.data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Something went wrong.' }, { status: 500 });
  }
}
