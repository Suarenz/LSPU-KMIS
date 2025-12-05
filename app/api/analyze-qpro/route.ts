import { qproAnalysisService } from '@/lib/services/qpro-analysis-service';
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import { PrismaClient } from '@prisma/client';
import { BlobServiceClient } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Initialize Azure Blob Storage client
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING!
);

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request);
    if ('status' in authResult) {
      return authResult; // Return the NextResponse error
    }
    
    const user = authResult.user;
    
    const formData = await request.formData();
    const file = formData.get('qproFile') as File;
    const title = formData.get('title') as string || 'Untitled QPRO Document';
    
    // Validate file exists and is a File
    if (!file || !(file instanceof File)) {
      return Response.json({ error: 'No file uploaded' }, { status: 40 });
    }

    // Validate file type (support both PDF and DOCX)
    if (!file.type || (file.type !== 'application/pdf' && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      return Response.json({ error: 'Only PDF and DOCX files are allowed' }, { status: 400 });
    }

    // Validate file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    // Upload file to QPRO-specific container in Azure Blob Storage
    const containerName = 'qpro-files'; // Separate container for QPRO documents
    const fileName = `${uuidv4()}_${file.name}`;
    const blobName = `${user.id}/${fileName}`; // Organize by user ID
    
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Convert File to ArrayBuffer and then to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload the file to Azure Blob Storage
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: file.type
      }
    });
    
    // Create document record in database with the blob URL
    const document = await prisma.document.create({
      data: {
        title: title,
        description: `QPRO document uploaded by ${user.name || user.email}`,
        category: 'QPRO',
        tags: [],
        uploadedById: user.id,
        fileUrl: blockBlobClient.url, // Use the Azure Blob URL
        fileName: fileName,
        fileType: file.type,
        fileSize: file.size,
        unitId: user.unitId || null,
      }
    });
    
    // Create and store the QPRO analysis
    const analysis = await qproAnalysisService.createQPROAnalysis({
      documentId: document.id,
      documentTitle: document.title,
      documentPath: blobName, // Store the blob path for reference
      documentType: file.type,
      uploadedById: user.id,
    });
    
    return Response.json({
      analysis: analysis.analysisResult,
      documentId: document.id,
      analysisId: analysis.id
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    
    // Return more specific error messages based on error type
    if (error.message?.includes('PDF') || error.message?.includes('document')) {
      return Response.json({ error: 'Invalid document file' }, { status: 400 });
    }
    
    return Response.json({ error: 'Analysis failed: ' + error.message }, { status: 500 });
  }
}