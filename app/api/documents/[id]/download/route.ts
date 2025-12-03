import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import documentService from '@/lib/services/document-service';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import fileStorageService from '@/lib/services/file-storage-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify authentication
    const authResult = await requireAuth(request);
    if ('status' in authResult) { // Check if it's a NextResponse (error case)
      return authResult;
    }
    
    const { user } = authResult;
    const userId = user.id;

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

    // For Azure Storage, we need to generate a signed URL for secure access
    // First, extract the filename from the stored URL
    const fileName = document.fileUrl.split('/').pop();
    if (!fileName) {
      return NextResponse.json(
        { error: 'Invalid file URL' },
        { status: 500 }
      );
    }
    
    try {
      // Use the file storage service to get the signed URL
      const downloadUrl = await fileStorageService.getFileUrl(fileName);
      
      // Return document info with download URL
      return NextResponse.json({
        id: document.id,
        title: document.title,
        fileName: document.fileName,
        fileType: document.fileType,
        downloadUrl: downloadUrl,
      });
    } catch (error) {
      console.error('Error getting file URL:', error);
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}