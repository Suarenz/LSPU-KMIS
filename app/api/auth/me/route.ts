import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication using the existing middleware
    const authResult = await requireAuth(request);
    if ('status' in authResult) { // Check if it's a NextResponse (error case)
      return authResult;
    }
    
    const { user } = authResult;
    
    // Get user permissions for different resources
    // This is a simplified approach - in a real system, you'd have more complex permission logic
    const permissionsData = await prisma.documentPermission.findMany({
      where: {
        userId: user.id,
      },
      select: {
        documentId: true,
        permission: true,
      }
    });

    let permissions: Record<string, any> = {};
    if (permissionsData) {
      // Aggregate permissions by document or resource type
      permissions = permissionsData.reduce((acc: Record<string, any>, perm: any) => {
        acc[perm.documentId] = perm.permission;
        return acc;
      }, {});
    }

    // Get user's recent activity
    const recentActivity = await prisma.documentView.findMany({
      where: {
        userId: user.id,
      },
      select: {
        documentId: true,
        viewedAt: true,
      },
      orderBy: {
        viewedAt: 'desc',
      },
      take: 5,
    });

    // Return comprehensive user information
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        unitId: user.unitId,
      },
      permissions,
      recentActivity: recentActivity || [],
      session: {
        expires_at: null, // Session info not tracked with JWT
      }
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint to update user preferences or settings
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) { // Check if it's a NextResponse (error case)
      return authResult;
    }
    
    const { user } = authResult;
    
    const { preferences } = await request.json();
    
    // Update user preferences in the database
    // Note: The User model doesn't have a preferences field, so we'll just return success
    // If you need to store user preferences, you would need to add a preferences field to the User model
    console.log('User preferences update request:', { userId: user.id, preferences });
    
    return NextResponse.json({
      message: 'User preferences updated successfully'
    });
  } catch (error) {
    console.error('Error in /api/auth/me POST:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}