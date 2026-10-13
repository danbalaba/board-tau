import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyOTP } from '@/lib/otp';
import { sanitizeInput } from '@/lib/validators';

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().min(1, 'OTP is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = verifyOtpSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Email and OTP are required' },
        { status: 400 }
      );
    }

    const { email, otp } = parseResult.data;

    // Sanitize inputs to prevent XSS
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedOTP = sanitizeInput(otp);

    // Verify target user exists and is not already verified
    const user = await db.user.findUnique({
      where: { email: sanitizedEmail },
      select: { id: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    // Verify OTP with brute-force / lockout defenses
    await verifyOTP(sanitizedEmail, sanitizedOTP);

    return NextResponse.json(
      { success: 'Email verified successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error verifying OTP:', error?.message || error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify OTP' },
      { status: error.message?.includes('OTP') ? 400 : 500 }
    );
  }
}
