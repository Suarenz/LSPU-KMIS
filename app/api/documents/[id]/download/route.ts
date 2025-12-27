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

    // Use blobName if available (stored for QPRO and repository uploads), otherwise extract from URL
    let blobName = document.blobName;
    
    if (!blobName) {
      // Fallback: Extract the blob path from the stored URL
      // URL format: https://account.blob.core.windows.net/container/path/to/blob
      // We need to extract path/to/blob (everything after /container/)
      const urlWithoutParams = document.fileUrl.split('?')[0];
      const urlParts = urlWithoutParams.split('/'); // ['https:', '', 'account.blob.core.windows.net', 'container', 'path', 'to', 'blob']
      
      // Find container name (after the domain)
      const containerIndex = urlParts.findIndex((part, idx) => idx >= 3 && part && !part.includes('.'));
      
      if (containerIndex !== -1 && containerIndex < urlParts.length - 1) {
        // Everything after the container name is the blob path
        // Decode URL-encoded characters (e.g., %20 -> space)
        blobName = decodeURIComponent(urlParts.slice(containerIndex + 1).join('/'));
      }
    }
    
    console.log('Download attempt:', {
      documentId: id,
      extractedBlobName: blobName,
      storedUrl: document.fileUrl,
    });

    if (!blobName) {
      console.error('Failed to determine blob name for download:', document.fileUrl);
      return NextResponse.json(
        { error: 'Invalid file URL - could not determine blob name' },
        { status: 500 }
      );
    }
    
    try {
      // Determine which container based on URL
      const containerName = document.fileUrl.includes('/qpro-files/') ? 'qpro-files' : 'repository-files';
      
      // Use the file storage service to get the signed URL
      const downloadUrl = await fileStorageService.getFileUrl(blobName, containerName);
      
      // Return document info with download URL
      return NextResponse.json({
        id: document.id,
        title: document.title,
        fileName: document.fileName,
        fileType: document.fileType,
        downloadUrl: downloadUrl,
      });
    } catch (azureError) {
      console.error('Azure Storage error:', {
        blobName,
        error: azureError instanceof Error ? azureError.message : azureError,
        documentFileUrl: document.fileUrl
      });
      return NextResponse.json(
        { error: 'Failed to generate download URL from storage' },
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