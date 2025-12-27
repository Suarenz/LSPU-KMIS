import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import fileStorageService from '@/lib/services/file-storage-service';
import enhancedDocumentService from '@/lib/services/enhanced-document-service';
import { qproAnalysisService } from '@/lib/services/qpro-analysis-service';
import { qproCacheService } from '@/lib/services/qpro-cache-service';

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const { user } = authResult;

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type (DOCX only)
    const validTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only DOCX files are supported' }, { status: 400 });
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 50MB' }, { status: 400 });
    }

    console.log(`[QPRO Upload] Starting upload for file: ${file.name}`);

    // Upload file to storage
    const storageResult = await fileStorageService.saveFile(file, file.name);
    const fileUrl = storageResult.url;
    const blobName = storageResult.blobName; // Extract blob name for document creation

    console.log(`[QPRO Upload] File uploaded to Azure:`, { fileUrl, blobName });

    // Convert to base64 for Colivara
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Content = buffer.toString('base64');

    // Get current year and quarter for QPRO document
    const currentYear = new Date().getFullYear();
    const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);

    // Create document with blob name and QPRO flag
    const document = await enhancedDocumentService.createDocument(
      file.name.replace(/\.[^.]+$/, ''),
      'QPRO Report',
      'QPRO',
      ['qpro', 'performance', 'report'],
      user.name || user.email,
      fileUrl,
      file.name,
      file.type,
      file.size,
      user.id,
      undefined, // unitId
      base64Content,
      blobName, // Pass the blob name to the document
      {
        year: currentYear,
        quarter: currentQuarter,
        isQproDocument: true, // Flag this as a QPRO document for search
      }
    );

    console.log(`[QPRO Upload] Document created: ${document.id}`);
    console.log(`[QPRO Upload] Base64 content length: ${base64Content.length} characters`);

    // IMPORTANT: Trigger Colivara indexing IMMEDIATELY and WAIT for it
    // This ensures the document is indexed before the response returns
    try {
      console.log(`[QPRO Upload] Starting Colivara indexing for document ${document.id}`);
      const ColivaraService = (await import('@/lib/services/colivara-service')).default;
      const colivaraService = new ColivaraService();
      
      console.log(`[QPRO Upload] Initializing Colivara service...`);
      await colivaraService.initialize();
      console.log(`[QPRO Upload] Colivara service initialized`);
      
      // Start indexing - this will update the document status in the background
      console.log(`[QPRO Upload] Calling indexDocument with base64 content length: ${base64Content.length}`);
      const success = await colivaraService.indexDocument(document.id, base64Content);
      
      if (success) {
        console.log(`[QPRO Upload] ✅ Colivara indexing started successfully for document ${document.id}`);
        console.log(`[QPRO Upload] ⏳ Colivara is now processing the document in the background...`);
      } else {
        console.error(`[QPRO Upload] ❌ Colivara indexing failed for document ${document.id}`);
      }
    } catch (colivaraError) {
      console.error(`[QPRO Upload] ❌ Error starting Colivara indexing:`, colivaraError);
      console.error(`[QPRO Upload] Error stack:`, (colivaraError as Error).stack);
      // Don't fail the upload if Colivara fails - the document is still created
    }

    // Cache the upload metadata
    await qproCacheService.cacheUpload({
      documentId: document.id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileUrl,
      uploadedAt: new Date(),
      userId: user.id,
      status: 'PENDING',
    });

    // Trigger QPRO analysis asynchronously
    setTimeout(async () => {
      try {
        const documentType = file.type.includes('pdf') ? 'PDF' : 'DOCX';
        const year = new Date().getFullYear();
        const quarter = Math.ceil((new Date().getMonth() + 1) / 3);

        console.log(`[QPRO Upload] Triggering analysis for document ${document.id}`);

        const analysis = await qproAnalysisService.createQPROAnalysis({
          documentId: document.id,
          documentTitle: document.title,
          documentPath: fileUrl,
          documentType,
          uploadedById: user.id,
          year,
          quarter,
        });

        console.log(`[QPRO Upload] Analysis completed: ${analysis.id}`);

        // Cache the analysis result
        await qproCacheService.cacheAnalysis({
          documentId: document.id,
          analysisId: analysis.id,
          status: analysis.status || 'COMPLETED',
          achievementScore: (analysis as any).achievementScore,
          kras: (analysis as any).kras,
          activities: (analysis as any).activities,
        });

        // Invalidate user's analyses cache to refresh the list
        await qproCacheService.invalidateUserAnalysesCache(user.id);
      } catch (err) {
        console.error(`[QPRO Upload] Error triggering analysis:`, err);
      }
    }, 500);

    return NextResponse.json(
      {
        success: true,
        documentId: document.id,
        message: 'Document uploaded successfully. Analysis is processing in the background.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[QPRO Upload] Error:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
