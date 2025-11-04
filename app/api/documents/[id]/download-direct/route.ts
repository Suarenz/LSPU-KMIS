import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import documentService from '@/lib/services/document-service';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import fileStorageService from '@/lib/services/file-storage-service';
import { createClient } from '@/lib/supabase/server';

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

    // Create a Supabase client and get the file
    const supabase = await createClient();
    
    // Get the file from Supabase Storage
    const { data, error } = await supabase.storage
      .from('repository-files')
      .download(fileName);

    if (error) {
      console.error('Error downloading file from storage:', error);
      return NextResponse.json(
        { error: 'Failed to download file' },
        { status: 500 }
      );
    }

    // Get the file content as ArrayBuffer
    const fileContent = await data.arrayBuffer();

    // Create headers to force download
    const headers = new Headers();
    headers.set('Content-Type', document.fileType || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${document.fileName || fileName}"`);
    headers.set('Content-Length', fileContent.byteLength.toString());
    
    // Additional headers to prevent caching and ensure direct download
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    // Return the file content with headers that force download
    return new Response(fileContent, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error in direct download:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}