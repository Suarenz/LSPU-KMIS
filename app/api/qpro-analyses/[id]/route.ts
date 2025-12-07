import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import { qproAnalysisService } from '@/lib/services/qpro-analysis-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authResult = await requireAuth(request);
    if ('status' in authResult) {
      return authResult;
    }
    
    const user = authResult.user;
    const { id } = await params;
    
    // Get specific analysis by ID
    const analysis = await qproAnalysisService.getQPROAnalysisById(id);
    
    if (!analysis) {
      return Response.json({ error: 'Analysis not found' }, { status: 404 });
    }
    
    // Check if user has permission to access this analysis
    if (analysis.uploadedById !== user.id && user.role !== 'ADMIN') {
      return Response.json({ error: 'Unauthorized to access this analysis' }, { status: 403 });
    }
    
    return Response.json({ analysis });
  } catch (error: any) {
    console.error('Error fetching QPRO analysis:', error);
    return Response.json({ error: 'Failed to fetch QPRO analysis' }, { status: 500 });
  }
}
