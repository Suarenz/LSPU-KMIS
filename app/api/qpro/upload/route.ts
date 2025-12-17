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

    // Convert to base64 for Colivara
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Content = buffer.toString('base64');

    // Create document
    const document = await enhancedDocumentService.createDocument(
      file.name.replace(/\.[^.]+$/, ''),
      'QPRO Report',
      'QPRO',
      [],
      user.name || user.email,
      fileUrl,
      file.name,
      file.type,
      file.size,
      user.id,
      undefined,
      base64Content
    );

    console.log(`[QPRO Upload] Document created: ${document.id}`);

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
