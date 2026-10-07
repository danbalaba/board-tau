import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyOTP } from '@/lib/otp';
import { validateEmail, sanitizeInput } from '@/lib/validators';
import { getCurrentUser } from '@/services/user';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.email) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { otp } = await request.json();

    if (!otp) {
      return NextResponse.json({ error: 'OTP is required' }, { status: 400 });
    }

    // Sanitize OTP input
    const sanitizedEmail = sanitizeInput(user.email);
    const sanitizedOTP = sanitizeInput(otp);

    // Validate email format
    const emailError = validateEmail(sanitizedEmail);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }

    // Verify OTP using authenticated session email
    await verifyOTP(sanitizedEmail, sanitizedOTP);

    return NextResponse.json(
      { success: 'Identity verified successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error verifying Inquiry OTP:', error);
    
    // Catch rate limit errors and forward them to the UI
    if (
      error.message?.includes('wait') || 
      error.message?.includes('locked') || 
      error.message?.includes('limit') || 
      error.message?.includes('AccountSuspended')
    ) {
       return NextResponse.json({ error: error.message }, { status: 429 });
    }

    return NextResponse.json(
      { error: error.message || 'Invalid OTP' },
      { status: 400 }
    );
  }
}
