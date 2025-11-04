import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth-middleware';

// GET /api/units - List all units
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await requireAuth(request);
    if ('status' in authResult) { // Check if it's a NextResponse (error case)
      return authResult;
    }
    
    const { user } = authResult;

    // Fetch all units from the database
    const units = await prisma.unit.findMany({
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ units });
  } catch (error) {
    console.error('Error fetching units:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/units - Create a new unit (admin only)
export async function POST(request: NextRequest) {
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
        { error: 'Only administrators can create units' },
        { status: 403 }
      );
    }

    const { name, code, description } = await request.json();

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Create the new unit in the database
    // Format code: convert to uppercase, trim whitespace, and normalize internal spaces
    const formattedCode = code
      ? code.toUpperCase().trim().replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      : undefined;
      
    const unit = await prisma.unit.create({
      data: {
        name,
        code: formattedCode,
        description: description || null,
      }
    });

    return NextResponse.json({ unit });
  } catch (error) {
    console.error('Error creating unit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}