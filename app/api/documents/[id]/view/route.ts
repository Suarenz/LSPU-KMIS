import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import documentService from '@/lib/services/document-service';
import fileStorageService from '@/lib/services/file-storage-service';
import jwtService from '@/lib/services/jwt-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // Verify token from query parameter
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let userId: string;
    try {
      const payload = await jwtService.verifyToken(token);
      if (!payload) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }
      userId = payload.userId;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get document
    const document = await documentService.getDocumentById(id, userId);
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    // Record the view
    await documentService.recordView(document.id, userId);

    // Get the blob name (UUID filename) or fallback to extracting from URL
    let fileName: string;
    const docWithBlob = document as any; // Type assertion to access Prisma fields
    
    if (docWithBlob.blobName) {
      fileName = docWithBlob.blobName;
      console.log('[View] Using blobName:', fileName);
    } else {
      // Fallback for older documents without blobName
      const extractedName = document.fileUrl.split('/').pop();
      if (!extractedName) {
        console.error('[View] No blobName and could not extract filename from URL:', document.fileUrl);
        return NextResponse.json(
          { error: 'Invalid file URL' },
          { status: 500 }
        );
      }
      fileName = extractedName;
      console.log('[View] Using extracted filename:', fileName);
    }

    try {
      // Get the file from Azure Blob Storage
      const fileUrl = await fileStorageService.getFileUrl(fileName, 'repository-files');
      console.log('[View] Generated SAS URL for file:', fileName);
      
      // Fetch the file from Azure
      const fileResponse = await fetch(fileUrl);
      if (!fileResponse.ok) {
        console.error('[View] Failed to fetch from Azure:', {
          status: fileResponse.status,
          statusText: fileResponse.statusText,
          fileName,
          documentId: document.id
        });
        throw new Error(`Failed to fetch file from storage: ${fileResponse.status} ${fileResponse.statusText}`);
      }

      console.log('[View] Successfully fetched file from Azure');

      // Get the file as a blob
      const fileBlob = await fileResponse.blob();
      const fileBuffer = await fileBlob.arrayBuffer();

      // Determine content type based on file extension
      const ext = fileName.split('.').pop()?.toLowerCase() || '';
      let contentType = 'application/octet-stream';
      
      if (ext === 'pdf') contentType = 'application/pdf';
      else if (ext === 'docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      else if (ext === 'doc') contentType = 'application/msword';
      else if (ext === 'xlsx') contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      else if (ext === 'xls') contentType = 'application/vnd.ms-excel';
      else if (ext === 'pptx') contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      else if (ext === 'ppt') contentType = 'application/vnd.ms-powerpoint';
      else if (['jpg', 'jpeg'].includes(ext)) contentType = 'image/jpeg';
      else if (ext === 'png') contentType = 'image/png';
      else if (ext === 'gif') contentType = 'image/gif';

      // Return the file with inline content disposition (no filename to prevent download)
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': 'inline',
          'Cache-Control': 'public, max-age=3600',
          'Accept-Ranges': 'bytes',
        },
      });
    } catch (error) {
      console.error('[View] Error getting file:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        fileName,
        documentId: document.id,
        fileUrl: document.fileUrl,
        blobName: docWithBlob.blobName
      });
      return NextResponse.json(
        { 
          error: 'Failed to retrieve file',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[View] Error in view endpoint:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
