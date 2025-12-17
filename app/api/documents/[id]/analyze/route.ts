import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import { qproAnalysisService } from '@/lib/services/qpro-analysis-service';
import enhancedDocumentService from '@/lib/services/enhanced-document-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate the request
    const authResult = await requireAuth(request);
    if ('status' in authResult) {
      return authResult;
    }

    const user = authResult.user;
    const { id } = await params;
    const documentId = id;

    if (!documentId || Array.isArray(documentId)) {
      return NextResponse.json(
        { error: 'Invalid document ID' },
        { status: 400 }
      );
    }

    console.log(`[Document Analysis] Starting QPRO analysis for document ${documentId}`);

    // Fetch the document
    const document = await enhancedDocumentService.getDocumentById(documentId);
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check permissions - user must be admin or the uploader
    if (user.id !== document.uploadedById && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized to analyze this document' },
        { status: 403 }
      );
    }

    // Determine document type
    const documentType = document.fileType.toLowerCase().includes('pdf') ? 'PDF' : 'DOCX';

    // Create QPRO analysis
    const analysis = await qproAnalysisService.createQPROAnalysis({
      documentId: document.id,
      documentTitle: document.title,
      documentPath: document.fileUrl,
      documentType,
      uploadedById: user.id,
      unitId: document.unitId,
      year: new Date().getFullYear(),
      quarter: Math.ceil((new Date().getMonth() + 1) / 3),
    });

    console.log(`[Document Analysis] Analysis completed for document ${documentId}:`, analysis.id);

    return NextResponse.json(analysis, { status: 201 });
  } catch (error) {
    console.error('[Document Analysis] Error analyzing document:', error);
    const message = error instanceof Error ? error.message : 'Failed to analyze document';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate the request
    const authResult = await requireAuth(request);
    if ('status' in authResult) {
      return authResult;
    }

    const user = authResult.user;
    const { id } = await params;
    const documentId = id;

    if (!documentId || Array.isArray(documentId)) {
      return NextResponse.json(
        { error: 'Invalid document ID' },
        { status: 400 }
      );
    }

    // Get all analyses for this document
    const analyses = await qproAnalysisService.getQPROAnalysesByDocument(documentId);

    // Filter analyses based on user permissions
    const permittedAnalyses = analyses.filter(
      (analysis: any) => analysis.uploadedById === user.id || user.role === 'ADMIN'
    );

    return NextResponse.json({ analyses: permittedAnalyses });
  } catch (error) {
    console.error('[Document Analysis] Error fetching document analyses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document analyses' },
      { status: 500 }
    );
  }
}
