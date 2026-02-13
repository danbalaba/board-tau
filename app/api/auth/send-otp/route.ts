import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateAndStoreOTP, sendOTPEmail } from '@/lib/otp';
import { validateEmail, sanitizeInput } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Sanitize inputs to prevent XSS
    const sanitizedEmail = sanitizeInput(email);

    // Validate email
    const emailError = validateEmail(sanitizedEmail);
    if (emailError) {
      return NextResponse.json(
        { error: emailError },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    // Generate and send OTP
    const otp = await generateAndStoreOTP(sanitizedEmail);
    await sendOTPEmail(sanitizedEmail, otp);

    return NextResponse.json(
      { success: 'OTP sent to your email' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
