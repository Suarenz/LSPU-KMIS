import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import documentService from '@/lib/services/document-service';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import fileStorageService from '@/lib/services/file-storage-service';
import jwtService from '@/lib/services/jwt-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Extract token from query parameter
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication token required' },
        { status: 401 }
      );
    }

    // Verify the token manually since we're not using the header
    const decoded = await jwtService.verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // Get document using the document service to check permissions
    const document = await documentService.getDocumentById(id, userId);

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    // Record the download
    await documentService.recordDownload(id, userId);

    // Extract the filename from the stored URL
    const fileName = document.fileUrl.split('/').pop();
    if (!fileName) {
      return NextResponse.json(
        { error: 'Invalid file URL' },
        { status: 500 }
      );
    }

    // Get the file URL from Azure Storage using the fileStorageService
    const fileUrl = await fileStorageService.getFileUrl(fileName);

    // Create a response that redirects to the file URL to trigger the download
    return NextResponse.redirect(fileUrl);
  } catch (error) {
    console.error('Error in direct download:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}