import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateAndStoreOTP, sendInquiryOTPEmail } from '@/lib/otp';
import { validateEmail, sanitizeInput } from '@/lib/validators';
import { getCurrentUser } from '@/services/user';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.email) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await request.json();

    // The email they are verifying must match their logged-in session email
    if (user.email !== email) {
      return NextResponse.json({ error: "Email mismatch" }, { status: 403 });
    }

    // Sanitize inputs to prevent XSS
    const sanitizedEmail = sanitizeInput(email);

    // Validate email
    const emailError = validateEmail(sanitizedEmail);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }

    // Generate and send OTP using the existing library (which includes Brute-Force Rate Limiting)
    const otp = await generateAndStoreOTP(sanitizedEmail);
    await sendInquiryOTPEmail(sanitizedEmail, otp, user.name || "User");

    return NextResponse.json(
      { success: 'Security OTP sent to your email' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error sending Inquiry OTP:', error);
    
    // Catch rate limit errors and forward them to the UI
    if (error.message?.includes('wait') || error.message?.includes('locked')) {
       return NextResponse.json({ error: error.message }, { status: 429 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to send Security OTP' },
      { status: 500 }
    );
  }
}
