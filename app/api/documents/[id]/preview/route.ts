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

    // Validate the document ID format before attempting to retrieve the document
    // Document IDs should be valid CUIDs or UUIDs, not filenames
    // Allow dots in Colivara document IDs, but reject specific file extensions
    if (!id || typeof id !== 'string' || id.trim() === '' || id.includes('undefined') ||
        (id.includes('.pdf') && !id.includes('_')) || // Reject .pdf in basic format but allow in Colivara format
        (id.includes('.docx') && !id.includes('_')) || // Reject .docx in basic format but allow in Colivara format
        (id.includes('.xlsx') && !id.includes('_')) || // Reject .xlsx in basic format but allow in Colivara format
        (id.includes('.pptx') && !id.includes('_')) || // Reject .pptx in basic format but allow in Colivara format
        (id.includes('.jpg') && !id.includes('_')) || // Reject .jpg in basic format but allow in Colivara format
        (id.includes('.jpeg') && !id.includes('_')) || // Reject .jpeg in basic format but allow in Colivara format
        (id.includes('.png') && !id.includes('_'))) { // Reject .png in basic format but allow in Colivara format
      return NextResponse.json(
        { error: 'Invalid document ID format. Document ID must be a valid identifier, not a filename.' },
        { status: 400 }
      );
    }

    // First, try to get the document using the ID directly (this would be the database ID)
    let document = await documentService.getDocumentById(id, userId);
    
    // If the document wasn't found, try to find by Colivara document ID as fallback
    if (!document) {
      // Try to find the document by its Colivara document ID
      document = await documentService.getDocumentByColivaraId(id, userId);
    }

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    // We allow all file types to be accessed for preview, as the frontend handles display
    // Check if the document exists and user has permissions (this is handled by getDocumentById)
    // All uploaded file types are now allowed for preview
    
    // Record the view using the database document ID, not necessarily the ID used in the URL
    // Only record the view if the document exists
    if (document.id) {
      await documentService.recordView(document.id, userId);
    }

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