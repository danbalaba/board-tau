import { NextRequest, NextResponse } from 'next/server';
import { updateUserProfile } from '@/services/user/profile';
import { getUserProfile } from '@/services/user/profile';

export async function PUT(request: NextRequest) {
  try {
    const { getCurrentUser } = await import('@/services/user');
    const { hasPermission } = await import('@/lib/rbac');
    
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permitted = await hasPermission(user.id, "UPDATE_PROFILE");
    if (!permitted) {
      return NextResponse.json({ error: "Forbidden: Missing permission UPDATE_PROFILE" }, { status: 403 });
    }

    const data = await request.json();
    const updatedProfile = await updateUserProfile(data);
    return NextResponse.json(updatedProfile);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const profile = await getUserProfile();
    return NextResponse.json(profile);
  } catch (error: any) {
    console.error('Error getting profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get profile' },
      { status: 400 }
    );
  }
}
