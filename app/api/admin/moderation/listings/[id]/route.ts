import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponseFormatter } from '@/lib/api-response';
import { PrismaErrorHandler } from '@/lib/prisma-error-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        ApiResponseFormatter.error('Unauthorized', 'You must be an admin to access this resource'),
        { status: 401 }
      );
    }

    const { id } = params;
    const { action, reason } = await req.json();

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        ApiResponseFormatter.error('Invalid action', 'Action must be either "approve" or "reject"'),
        { status: 400 }
      );
    }

    // Process the decision
    const status = action === 'approve' ? 'approved' : 'rejected';

    const updatedListing = await db.listing.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
        // Check if there are fields for rejections in the Listing model
        // If not, we might just store it in notes or similar
      },
    });

    return NextResponse.json(
      ApiResponseFormatter.success(updatedListing, `Listing ${status} successfully`)
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to process listing decision', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}
