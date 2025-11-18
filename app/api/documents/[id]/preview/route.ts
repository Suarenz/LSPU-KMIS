import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import documentService from '@/lib/services/document-service';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import fileStorageService from '@/lib/services/file-storage-service';

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
    const userId = user.id;

    // Get document using the document service to check permissions
    const document = await documentService.getDocumentById(id, userId);

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    // We allow all file types to be accessed for preview, as the frontend handles display
    // Check if the document exists and user has permissions (this is handled by getDocumentById)
    // All uploaded file types are now allowed for preview
    
    // Record the view
    await documentService.recordView(id, userId);

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
      const previewUrl = await fileStorageService.getFileUrl(fileName);
      
      // Return document info with preview URL
      return NextResponse.json({
        id: document.id,
        title: document.title,
        fileName: document.fileName,
        fileType: document.fileType,
        previewUrl: previewUrl,
        uploadedBy: document.uploadedBy,
        uploadedAt: document.uploadedAt,
        category: document.category,
        tags: document.tags,
        downloads: document.downloadsCount,
        views: document.viewsCount,
      });
    } catch (error) {
      console.error('Error getting file URL:', error);
      return NextResponse.json(
        { error: 'Failed to generate preview URL' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error getting document preview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}