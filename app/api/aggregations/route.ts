import { requireAuth } from '@/lib/middleware/auth-middleware';
import { targetAggregationService } from '@/lib/services/target-aggregation-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ('status' in authResult) return authResult;

  const { searchParams } = new URL(request.url);
  const kraId = searchParams.get('kraId');
  const year = parseInt(searchParams.get('year') || '2025');
  const quarter = parseInt(searchParams.get('quarter') || '1');
  const type = searchParams.get('type') || 'summary';

  try {
    if (type === 'summary') {
      // Get university-wide summary
      const summary = await targetAggregationService.getUniversitySummary(
        year,
        quarter
      );
      return NextResponse.json(summary);
    } else if (type === 'unit' && kraId) {
      // Get rollup by unit
      const rollup = await targetAggregationService.rollupByUnit(
        kraId,
        year,
        quarter
      );
      return NextResponse.json({ aggregations: rollup });
    } else {
      return NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Aggregation API error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
