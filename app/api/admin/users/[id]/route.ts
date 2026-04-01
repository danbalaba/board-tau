import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // Find the user to ensure they exist
    const user = await db.user.findFirst({
      where: {
        id,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Delete the user
    await db.user.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();

    // Find the user to ensure they exist
    const user = await db.user.findFirst({
      where: {
        id,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Map status to isActive and deletedAt
    const updateData: any = {
      name: body.name,
      email: body.email,
      role: body.role,
    };

    if (body.role === 'LANDLORD') {
      updateData.isVerifiedLandlord = true;
      updateData.landlordApprovedAt = new Date();
    } else if (body.role === 'USER') {
      updateData.isVerifiedLandlord = false;
      updateData.landlordApprovedAt = null;
    }

    if (body.status === 'active') {
      updateData.isActive = true;
      updateData.deletedAt = null;
    } else if (body.status === 'inactive') {
      updateData.isActive = false;
      updateData.deletedAt = null;
    } else if (body.status === 'suspended') {
      updateData.isActive = false;
      updateData.deletedAt = new Date();
    }

    // Update the user
    const updatedUser = await db.user.update({
      where: {
        id,
      },
      data: updateData,
    });

    return NextResponse.json({
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();

    // Find the user to ensure they exist
    const user = await db.user.findFirst({
      where: {
        id,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Handle status patch
    const updateData: any = {};
    if (body.status) {
      if (body.status === 'active') {
        updateData.isActive = true;
        updateData.deletedAt = null;
      } else if (body.status === 'inactive') {
        updateData.isActive = false;
        updateData.deletedAt = null;
      } else if (body.status === 'suspended') {
        updateData.isActive = false;
        updateData.deletedAt = new Date();
      }
    }

    // Update other fields if provided
    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email;
    if (body.role) {
      updateData.role = body.role;
      if (body.role === 'LANDLORD') {
        updateData.isVerifiedLandlord = true;
        updateData.landlordApprovedAt = new Date();
      } else if (body.role === 'USER') {
        updateData.isVerifiedLandlord = false;
        updateData.landlordApprovedAt = null;
      }
    }
    const updatedUser = await db.user.update({
      where: {
        id,
      },
      data: updateData,
    });

    return NextResponse.json({
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
