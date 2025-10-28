import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import documentService from '@/lib/services/document-service';
import { requireAuth } from '@/lib/middleware/auth-middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Verify authentication
    const authResult = await requireAuth(request);
    if ('status' in authResult) { // Check if it's a NextResponse (error case)
      return authResult;
    }
    
    const { user } = authResult;
    const userId = user.userId;

    // Get document permissions using the document service
    const permissions = await documentService.getDocumentPermissions(id, userId);

    return NextResponse.json(permissions);
  } catch (error) {
    console.error('Error fetching document permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Verify authentication
    const authResult = await requireAuth(request);
    if ('status' in authResult) { // Check if it's a NextResponse (error case)
      return authResult;
    }
    
    const { user } = authResult;

    const userId = user.userId;
    const userRole = user.role;

    // Only admins and document admins can manage permissions
    if (userRole !== 'ADMIN') {
      // Check if user has admin permission for this specific document
      const docPermissions = await documentService.getDocumentPermissions(id, userId);
      const userDocPermission = docPermissions.find(p => p.userId === userId);
      
      if (!userDocPermission || userDocPermission.permission !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Forbidden: Only admins and document admins can manage permissions' },
          { status: 403 }
        );
      }
    }

    // Parse request body
    const body = await request.json();
    const { targetUserId, permission } = body;

    if (!targetUserId || !['READ', 'WRITE', 'ADMIN'].includes(permission)) {
      return NextResponse.json(
        { error: 'Invalid request: targetUserId and valid permission required' },
        { status: 400 }
      );
    }

    // Set document permission
    const newPermission = await documentService.setDocumentPermission(
      id,
      userId,
      targetUserId,
      permission as 'READ' | 'WRITE' | 'ADMIN'
    );

    return NextResponse.json(newPermission);
  } catch (error) {
    console.error('Error setting document permission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}