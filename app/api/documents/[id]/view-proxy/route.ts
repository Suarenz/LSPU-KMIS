import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import documentService from '@/lib/services/document-service';
import fileStorageService from '@/lib/services/file-storage-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('[View-Proxy] Request for document ID:', id);

    // Verify authentication - check both header and query param for token
    let authResult = await requireAuth(request);
    
    // If auth fails from header, try query param (for DocViewer compatibility)
    if ('status' in authResult) {
      const token = request.nextUrl.searchParams.get('token');
      console.log('[View-Proxy] Auth failed from header, trying token from query param:', !!token);
      if (token) {
        // Create a new request with the token in the header
        const modifiedRequest = new NextRequest(request.url, {
          headers: {
            ...Object.fromEntries(request.headers),
            'Authorization': `Bearer ${token}`,
          },
        });
        authResult = await requireAuth(modifiedRequest);
        
        // If still failing, return the error
        if ('status' in authResult) {
          console.error('[View-Proxy] Authentication failed');
          return authResult;
        }
      } else {
        console.error('[View-Proxy] No token provided');
        return authResult;
      }
    }

    const { user } = authResult;
    console.log('[View-Proxy] Authenticated user:', user.email);

    // Get the document
    const document = await documentService.getDocumentById(id, user.id);
    if (!document) {
      console.error('[View-Proxy] Document not found:', id);
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    console.log('[View-Proxy] Document found:', {
      title: document.title,
      fileName: document.fileName,
      fileType: document.fileType,
      fileUrl: document.fileUrl
    });

    // Extract filename from URL
    const fileName = document.fileUrl.split('/').pop();
    if (!fileName) {
      console.error('[View-Proxy] Invalid file URL:', document.fileUrl);
      return NextResponse.json(
        { error: 'Invalid file URL' },
        { status: 500 }
      );
    }

    console.log('[View-Proxy] Extracted fileName:', fileName);

    // Get signed URL
    const signedUrl = await fileStorageService.getFileUrl(fileName);
    console.log('[View-Proxy] Generated signed URL (first 100 chars):', signedUrl.substring(0, 100));

    // Fetch the file from Azure Storage
    console.log('[View-Proxy] Fetching file from Azure Storage...');
    const fileResponse = await fetch(signedUrl);
    
    if (!fileResponse.ok) {
      console.error('[View-Proxy] Failed to fetch file from storage:', {
        status: fileResponse.status,
        statusText: fileResponse.statusText
      });
      return NextResponse.json(
        { error: 'Failed to fetch file from storage' },
        { status: 500 }
      );
    }

    console.log('[View-Proxy] File fetched successfully, converting to buffer...');
    const fileBuffer = await fileResponse.arrayBuffer();
    const contentType = fileResponse.headers.get('content-type') || 'application/octet-stream';
    
    console.log('[View-Proxy] File details:', {
      size: fileBuffer.byteLength,
      contentType: contentType
    });

    // Return the file with proper CORS headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${document.fileName}"`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[View-Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
