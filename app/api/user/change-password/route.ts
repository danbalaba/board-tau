import { NextRequest, NextResponse } from 'next/server';
import { changeUserPassword } from '@/services/user/profile';

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    await changeUserPassword(currentPassword, newPassword);
    return NextResponse.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to change password' },
      { status: 400 }
    );
  }
}
