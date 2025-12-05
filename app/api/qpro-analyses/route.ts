import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import { qproAnalysisService } from '@/lib/services/qpro-analysis-service';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request);
    if ('status' in authResult) {
      return authResult; // Return the NextResponse error
    }
    
    const user = authResult.user;
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    const analysisId = searchParams.get('id');
    
    if (analysisId) {
      // Get specific analysis by ID
      const analysis = await qproAnalysisService.getQPROAnalysisById(analysisId);
      if (!analysis) {
        return Response.json({ error: 'Analysis not found' }, { status: 404 });
      }
      
      // Check if user has permission to access this analysis
      if (analysis.uploadedById !== user.id) {
        return Response.json({ error: 'Unauthorized to access this analysis' }, { status: 403 });
      }
      
      return Response.json({ analysis });
    } else if (documentId) {
      // Get all analyses for a specific document
      const analyses = await qproAnalysisService.getQPROAnalysesByDocument(documentId);
      
      // Check if user has permission to access analyses for this document
      // For simplicity, we're allowing access if the user uploaded any of the analyses
      // In a real implementation, you'd have more sophisticated permission checks
      const hasPermission = analyses.some((analysis: any) => analysis.uploadedById === user.id);
      if (!hasPermission && user.role !== 'ADMIN') {
        return Response.json({ error: 'Unauthorized to access analyses for this document' }, { status: 403 });
      }
      
      return Response.json({ analyses });
    } else {
      // Get all analyses for the current user
      const analyses = await qproAnalysisService.getQPROAnalysesByUser(user.id);
      return Response.json({ analyses });
    }
  } catch (error: any) {
    console.error('Error fetching QPRO analyses:', error);
    return Response.json({ error: 'Failed to fetch QPRO analyses' }, { status: 500 });
  }
}