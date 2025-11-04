import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import enhancedDocumentService from '@/lib/services/enhanced-document-service';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import fileStorageService from '@/lib/services/file-storage-service';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await requireAuth(request);
    if ('status' in authResult) { // Check if it's a NextResponse (error case)
      return authResult;
    }
    
    const { user } = authResult;

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10'))); // Limit to 100 max, 1 min
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const unitId = searchParams.get('unit') || undefined; // NEW: Unit filter
    const adminOnly = searchParams.get('adminOnly') === 'true'; // NEW: Admin only filter
    const sort = searchParams.get('sort') || undefined;
    const orderParam = searchParams.get('order') || 'desc';
    const order = orderParam === 'asc' ? 'asc' : 'desc'; // Ensure order is either 'asc' or 'desc'

    const userId = user.userId;

    let result;
    if (adminOnly && unitId) {
      // Get documents by unit - this function now allows admins to see all documents in the unit
      result = await enhancedDocumentService.getAdminDocumentsByUnit(unitId, page, limit, userId);
    } else {
      // Get documents using the enhanced document service
      // Note: The document service expects parameters in this order: page, limit, category, search, userId, sort, order, unitId
      result = await enhancedDocumentService.getDocuments(
        page,
        limit,
        category,
        search,
        userId,
        sort,
        order,
        unitId // NEW: Unit filter
      );
    }

    const { documents, total } = result;

    return NextResponse.json({
      documents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting document upload process...');
    // Verify authentication and check role
    const authResult = await requireAuth(request, ['ADMIN', 'FACULTY']);
    if ('status' in authResult) { // Check if it's a NextResponse (error case)
      console.log('Authentication failed:', authResult);
      return authResult;
    }
    
    const { user } = authResult;
    console.log('User authenticated:', user.userId, user.role);

    const userId = user.userId;
    const userRole = user.role;

    // Parse form data for file upload
    console.log('Parsing form data...');
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const tags = formData.get('tags') as string;
    const unitId = formData.get('unitId') as string; // NEW: Unit assignment
    const file = formData.get('file') as File | null;

    if (!title || !description || !category || !file) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Process tags
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : [];

    // Additional validation
    if (title.length > 255) {
      return NextResponse.json(
        { error: 'Title exceeds maximum length of 255 characters' },
        { status: 400 }
      );
    }

    if (description.length > 1000) {
      return NextResponse.json(
        { error: 'Description exceeds maximum length of 1000 characters' },
        { status: 400 }
      );
    }

    try {
      // Save file to storage
      console.log('Starting file upload process...');
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      const result = await fileStorageService.saveFile(file, file.name);
      console.log('File uploaded successfully:', result.url);
      const fileName = file.name;
      const fileType = file.type;
      const fileSize = file.size;
      // Get the full URL for the file from Supabase
      const fileUrl = await fileStorageService.getFileUrl(result.url);
      console.log('File URL generated:', fileUrl);

      // Create the document in the database
      console.log('Creating document in database...');
      const document = await enhancedDocumentService.createDocument(
        title,
        description,
        category,
        tagArray,
        user.email, // Using email as name for now
        fileUrl,
        fileName,
        fileType,
        fileSize,
        userId,
        unitId || undefined // NEW: Pass unitId if provided
      );
      console.log('Document created successfully:', document.id);

      return NextResponse.json(document, { status: 201 });
    } catch (storageError) {
      console.error('Error in file storage or document creation:', storageError);
      const errorMessage = storageError instanceof Error ? storageError.message : 'Failed to create document';
      // Check if this is specifically a file storage error to return a more specific status
      if (storageError instanceof Error && storageError.message.includes('Failed to upload file to Supabase')) {
        return NextResponse.json(
          { error: `File upload failed: ${storageError.message}` },
          { status: 500 }
        );
      } else if (storageError instanceof Error && storageError.message.includes('Error accessing file')) {
        return NextResponse.json(
          { error: `File access error: ${storageError.message}` },
          { status: 500 }
        );
      } else {
        return NextResponse.json(
          { error: errorMessage },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Error creating document:', error);
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        );
      } else if (error.message.includes('malicious')) {
        return NextResponse.json(
          { error: 'File contains potentially malicious content and cannot be uploaded' },
          { status: 400 }
        );
      } else if (error.message.includes('token')) {
        return NextResponse.json(
          { error: 'Authentication token is invalid or expired' },
          { status: 401 }
        );
      } else if (error.message.includes('Failed to upload file to Supabase')) {
        return NextResponse.json(
          { error: `File upload failed: ${error.message}` },
          { status: 500 }
        );
      } else {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}