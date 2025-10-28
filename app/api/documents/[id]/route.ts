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

    // Get document using the document service
    const document = await documentService.getDocumentById(id, userId);

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
 } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Verify authentication and check role
    const authResult = await requireAuth(request, ['ADMIN', 'FACULTY']);
    if ('status' in authResult) { // Check if it's a NextResponse (error case)
      return authResult;
    }
    
    const { user } = authResult;

    const userId = user.userId;
    const userRole = user.role;

    // Parse request body
    const body = await request.json();
    const { title, description, category, tags } = body;

    // Update the document in the database
    const updatedDocument = await documentService.updateDocument(
      id,
      title,
      description,
      category,
      tags,
      userId
    );

    if (!updatedDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Verify authentication and check role
    const authResult = await requireAuth(request, ['ADMIN', 'FACULTY']);
    if ('status' in authResult) { // Check if it's a NextResponse (error case)
      return authResult;
    }
    
    const { user } = authResult;

    const userId = user.userId;

    // Delete the document from the database
    const success = await documentService.deleteDocument(id, userId);

    if (!success) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}