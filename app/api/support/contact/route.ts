import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

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
                <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;"><strong>Email:</strong></td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 14px;"><a href="mailto:${email}" style="color: #2f7d6d; text-decoration: none;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;"><strong>Subject:</strong></td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${subject}</td>
              </tr>
            </table>

            <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap;">
              ${message}
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
      to: 'support@boardtau.com',
      subject: `[Support Inquiry] ${subject}`,
      html: emailHtml,
      replyTo: email,
    });

    if (response.error) {
      return NextResponse.json({ error: response.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: response.data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Something went wrong.' }, { status: 500 });
  }
}
