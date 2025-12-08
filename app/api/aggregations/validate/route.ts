import { requireAuth } from '@/lib/middleware/auth-middleware';
import { targetAggregationService } from '@/lib/services/target-aggregation-service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ('status' in authResult) return authResult;

  try {
    const body = await request.json();
    const { value, targetType, kraId, initiativeId, year } = body;

    if (!value || !targetType || !kraId || !initiativeId || !year) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate input format
    const validation = await targetAggregationService.validateReportedValue(
      value,
      targetType
    );

    if (!validation.valid) {
      return NextResponse.json(
        { valid: false, errors: validation.errors },
        { status: 400 }
      );
    }

    // Calculate aggregation
    const metrics = await targetAggregationService.calculateAggregation(
      kraId,
      initiativeId,
      year,
      value,
      targetType
    );

    return NextResponse.json({
      valid: true,
      metrics,
    });
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
