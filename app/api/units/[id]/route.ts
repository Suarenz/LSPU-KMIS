import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth-middleware';

// GET /api/units/[id] - Get a specific unit
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const authResult = await requireAuth(request);
    if ('status' in authResult) { // Check if it's a NextResponse (error case)
      return authResult;
    }
    
    const { user } = authResult;

    const unitId = params.id;

    // Fetch the specific unit from the database
    const unit = await prisma.unit.findUnique({
      where: { id: unitId }
    });

    if (!unit) {
      return NextResponse.json(
        { error: 'Unit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ unit });
  } catch (error) {
    console.error('Error fetching unit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/units/[id] - Update a unit (admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const authResult = await requireAuth(request);
    if ('status' in authResult) { // Check if it's a NextResponse (error case)
      return authResult;
    }
    
    const { user } = authResult;

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only administrators can update units' },
        { status: 403 }
      );
    }

    const unitId = params.id;
    const { name, code, description } = await request.json();

    // Update the unit in the database
    // Format code: convert to uppercase, trim whitespace, and normalize internal spaces
    const formattedCode = code
      ? code.toUpperCase().trim().replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      : undefined;
      
    const unit = await prisma.unit.update({
      where: { id: unitId },
      data: {
        name: name || undefined,
        code: formattedCode,
        description: description || undefined,
      }
    });

    return NextResponse.json({ unit });
  } catch (error) {
    console.error('Error updating unit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/units/[id] - Delete a unit (admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const authResult = await requireAuth(request);
    if ('status' in authResult) { // Check if it's a NextResponse (error case)
      return authResult;
    }
    
    const { user } = authResult;

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only administrators can delete units' },
        { status: 403 }
      );
    }

    const unitId = params.id;

    // Delete the unit from the database
    await prisma.unit.delete({
      where: { id: unitId }
    });

    return NextResponse.json({ message: 'Unit deleted successfully' });
 } catch (error) {
    console.error('Error deleting unit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}