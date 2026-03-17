import { NextRequest, NextResponse } from 'next/server';
import { changeUserPassword } from '@/services/user/profile';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { oldPassword, newPassword } = data;

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    await changeUserPassword(oldPassword, newPassword);
    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to change password' },
      { status: 400 }
    );
  }
}
