import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/services/user/user';
import { createHostApplication, getHostApplicationByUser, getHostApplications, updateApplicationStatus } from '@/services/landlord/applications';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please login to submit an application' },
        { status: 401 }
      );
    }

    const data = await request.json();

    const result = await createHostApplication(data);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error submitting host application:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit application' },
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
    if (user.role === 'admin') {
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
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only admins can update application status' },
        { status: 401 }
      );
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
