import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import prisma from '@/lib/prisma';

/**
 * GET /api/qpro/trends
 * 
 * Fetches Quarter-over-Quarter aggregation data for the trend chart.
 * Returns KRAggregation records grouped by quarter for a given year.
 * 
 * Query Parameters:
 * - year: The year to fetch trends for (default: current year)
 * - kraId: Optional filter for a specific KRA
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const kraId = searchParams.get('kraId');

    // Build where clause
    const whereClause: any = {
      year: year,
    };

    if (kraId) {
      whereClause.kra_id = kraId;
    }

    // Fetch aggregation records for all quarters
    const aggregations = await prisma.kRAggregation.findMany({
      where: whereClause,
      orderBy: [
        { quarter: 'asc' },
        { kra_id: 'asc' },
      ],
    });

    // Group by quarter and calculate summary metrics
    const quarterData: Record<number, {
      quarter: number;
      label: string;
      totalReported: number;
      totalTarget: number;
      achievementPercent: number;
      activitiesCount: number;
      kpisCount: number;
      kraBreakdown: Record<string, {
        kraId: string;
        kraTitle: string;
        reported: number;
        target: number;
        achievement: number;
        status: string;
      }>;
    }> = {};

    // Initialize all 4 quarters
    for (let q = 1; q <= 4; q++) {
      quarterData[q] = {
        quarter: q,
        label: `Q${q} ${year}`,
        totalReported: 0,
        totalTarget: 0,
        achievementPercent: 0,
        activitiesCount: 0,
        kpisCount: 0,
        kraBreakdown: {},
      };
    }

    // Process aggregations
    for (const agg of aggregations) {
      const q = agg.quarter;
      if (!quarterData[q]) continue;

      // Add to quarter totals
      quarterData[q].totalReported += agg.total_reported || 0;
      quarterData[q].totalTarget += Number(agg.target_value) || 0;
      quarterData[q].activitiesCount += agg.submission_count || 0;
      quarterData[q].kpisCount += 1;

      // Add KRA breakdown
      quarterData[q].kraBreakdown[agg.kra_id] = {
        kraId: agg.kra_id,
        kraTitle: agg.kra_title || agg.kra_id,
        reported: agg.total_reported || 0,
        target: Number(agg.target_value) || 0,
        achievement: Number(agg.achievement_percent) || 0,
        status: agg.status || 'NOT_STARTED',
      };
    }

    // Calculate overall achievement percentages
    for (const q of Object.keys(quarterData).map(Number)) {
      const data = quarterData[q];
      if (data.totalTarget > 0) {
        data.achievementPercent = (data.totalReported / data.totalTarget) * 100;
      }
    }

    // Convert to array format for frontend
    const trendData = Object.values(quarterData).map((q) => ({
      quarter: q.label,
      quarterNum: q.quarter,
      achievement: Math.round(q.achievementPercent * 10) / 10,
      activities: q.activitiesCount,
      kpis: q.kpisCount,
      reported: q.totalReported,
      target: q.totalTarget,
      kraBreakdown: Object.values(q.kraBreakdown),
    }));

    // Also get previous year's Q4 for YoY comparison
    const previousYearQ4 = await prisma.kRAggregation.findMany({
      where: {
        year: year - 1,
        quarter: 4,
      },
    });

    let previousYearAchievement = 0;
    if (previousYearQ4.length > 0) {
      const totalReported = previousYearQ4.reduce((sum, a) => sum + (a.total_reported || 0), 0);
      const totalTarget = previousYearQ4.reduce((sum, a) => sum + (Number(a.target_value) || 0), 0);
      if (totalTarget > 0) {
        previousYearAchievement = (totalReported / totalTarget) * 100;
      }
    }

    return NextResponse.json({
      year,
      quarters: trendData,
      previousYearQ4Achievement: Math.round(previousYearAchievement * 10) / 10,
      summary: {
        totalKRAs: new Set(aggregations.map((a) => a.kra_id)).size,
        totalSubmissions: aggregations.reduce((sum, a) => sum + (a.submission_count || 0), 0),
        latestQuarter: Math.max(...aggregations.map((a) => a.quarter), 0),
      },
    });
  } catch (error) {
    console.error('[Trends API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trend data' },
      { status: 500 }
    );
  }
}
