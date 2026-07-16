import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/services/user/user';
import { createHostApplication, getHostApplicationByUser, getHostApplications, updateApplicationStatus } from '@/services/landlord/applications';
import { hasPermission } from '@/lib/rbac';
import { getPostHogClient } from '@/lib/posthog-server';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please login to submit an application' },
        { status: 401 }
      );
    }

    const permitted = await hasPermission(user.id, "CREATE_HOST_APPLICATION");
    if (!permitted) {
      return NextResponse.json({ success: false, error: 'Forbidden: Missing permission CREATE_HOST_APPLICATION' }, { status: 403 });
    }

    const data = await request.json();

    const result = await createHostApplication(data);

    // Track host application submission
    try {
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: user.id,
        event: "host_application_submitted",
        properties: { success: result.success },
      });
      await posthog.flush();
    } catch (phErr) {
      console.error("PostHog host_application_submitted capture failed:", phErr);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please login' },
        { status: 401 }
      );
    }

    // Check if user is admin (for all applications) or regular user (for their application)
    // IMPORTANT: Roles are stored as uppercase ADMIN in the DB and session
    if (user.role === 'ADMIN') {
      const canModerate = await hasPermission(user.id, "MODERATE_HOSTS");
      if (!canModerate) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }

      const searchParams = request.nextUrl.searchParams;
      const status = searchParams.get('status') || undefined;
      const search = searchParams.get('search') || undefined;
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');

      const results = await getHostApplications({
        status,
        search,
        page,
        limit
      });

      return NextResponse.json({
        success: true,
        data: results
      });
    } else {
      const application = await getHostApplicationByUser();

      return NextResponse.json({
        success: true,
        data: application
      });
    }
  } catch (error: any) {
    console.error('Error fetching host applications:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only admins can update application status' },
        { status: 401 }
      );
    }

    const canModerate = await hasPermission(user.id, "MODERATE_HOSTS");
    if (!canModerate) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const status = searchParams.get('status');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Application ID is required' },
        { status: 400 }
      );
    }

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be approved or rejected' },
        { status: 400 }
      );
    }

    const { reason } = await request.json();

    const updatedApplication = await updateApplicationStatus(
      id,
      status as 'approved' | 'rejected',
      user.id,
      reason
    );

    return NextResponse.json({
      success: true,
      data: updatedApplication
    });
  } catch (error: any) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update application status' },
      { status: 500 }
    );
  }
}
