import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/otp';
import { validateEmail, validateOTP, sanitizeInput } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    // Validate input
    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Sanitize inputs to prevent XSS
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedOTP = sanitizeInput(otp);

    // Validate inputs
    const emailError = validateEmail(sanitizedEmail);
    const otpError = validateOTP(sanitizedOTP);

    if (emailError) {
      return NextResponse.json(
        { error: emailError },
        { status: 400 }
      );
    }

    if (otpError) {
      return NextResponse.json(
        { error: otpError },
        { status: 400 }
      );
    }

    // Verify OTP
    await verifyOTP(sanitizedEmail, sanitizedOTP);

    return NextResponse.json(
      { success: 'Email verified successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify OTP' },
      { status: error.message?.includes('OTP') ? 400 : 500 }
    );
  }
}
