import { NextRequest, NextResponse } from 'next/server';
import { changeUserPassword } from '@/services/user/profile';

export async function POST(request: NextRequest) {
  try {
    const { getCurrentUser } = await import('@/services/user');
    const { hasPermission } = await import('@/lib/rbac');
    
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permitted = await hasPermission(user.id, "UPDATE_PASSWORD");
    if (!permitted) {
      return NextResponse.json({ error: "Forbidden: Missing permission UPDATE_PASSWORD" }, { status: 403 });
    }

    const data = await request.json();
    const { oldPassword, newPassword } = data;

    if (!newPassword) {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      );
    }

    await changeUserPassword(oldPassword, newPassword);
    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('API Error:', error);
    
    // List of safe error messages to expose to the user
    const safeMessages = [
      "Current password is incorrect",
      "Current password is required to change your password.",
      "User not authenticated",
      "User not found",
      "User does not have a password set",
      "You cannot reuse a recently used password.",
      "Security Lock"
    ];

    let message = 'An unexpected error occurred. Please try again later.';
    
    if (safeMessages.includes(error.message) || error.message.includes('Please wait')) {
      message = error.message;
    }

    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
