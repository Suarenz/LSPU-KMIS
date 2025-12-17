import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import { qproAnalysisService } from '@/lib/services/qpro-analysis-service';
import { qproCacheService } from '@/lib/services/qpro-cache-service';

export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const { user } = authResult;

    console.log(`[QPRO Analyses] Fetching analyses for user: ${user.id}`);

    // Check cache first
    const cachedAnalyses = await qproCacheService.getUserAnalysesCache(user.id);
    if (cachedAnalyses) {
      console.log(`[QPRO Analyses] Cache hit for user: ${user.id}`);
      return NextResponse.json(cachedAnalyses);
    }

    // Get all analyses for this user
    const analyses = await qproAnalysisService.getQPROAnalysesByUser(user.id);

    // Format response
    const formatted = analyses.map((analysis: any) => ({
      id: analysis.id,
      documentTitle: analysis.documentTitle,
      documentType: analysis.documentType,
      uploadedDate: analysis.createdAt,
      status: analysis.status || 'COMPLETED',
      overallAchievement: analysis.achievementScore || 0,
      kraCount: analysis.kras ? (Array.isArray(analysis.kras) ? analysis.kras.length : 0) : 0,
      activitiesCount: analysis.activities ? (Array.isArray(analysis.activities) ? analysis.activities.length : 0) : 0,
      year: analysis.year,
      quarter: analysis.quarter,
    }));

    // Cache the formatted analyses for future requests
    await qproCacheService.cacheUserAnalyses(user.id, formatted);

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('[QPRO Analyses] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch analyses' }, { status: 500 });
  }
}
