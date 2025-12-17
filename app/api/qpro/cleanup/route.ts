import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import prisma from '@/lib/prisma';

/**
 * POST /api/qpro/cleanup
 * 
 * Cleans up orphaned KRAggregation records that have no associated approved activities.
 * This can happen when QPRO documents are deleted but the aggregation records persist.
 * 
 * Query params:
 * - year: Filter by year (optional)
 * - quarter: Filter by quarter (optional)
 * - kraId: Filter by KRA ID (optional)
 * - dryRun: If true, only report what would be cleaned without actually deleting (default: true)
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const { user } = authResult;

    // Only ADMIN can run cleanup
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only ADMIN can run cleanup.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
    const quarter = searchParams.get('quarter') ? parseInt(searchParams.get('quarter')!) : undefined;
    const kraId = searchParams.get('kraId') || undefined;
    const dryRun = searchParams.get('dryRun') !== 'false'; // Default to true (safe mode)

    console.log(`[QPRO Cleanup] Starting cleanup - dryRun=${dryRun}, year=${year}, quarter=${quarter}, kraId=${kraId}`);

    // Find all KRAggregation records
    const whereClause: any = {};
    if (year) whereClause.year = year;
    if (quarter) whereClause.quarter = quarter;
    if (kraId) whereClause.kra_id = kraId;

    const aggregations = await prisma.kRAggregation.findMany({
      where: whereClause,
      include: {
        aggregationActivities: {
          where: { isApproved: true },
          select: { id: true, reported: true }
        }
      }
    });

    const orphaned: { id: string; kra_id: string; initiative_id: string; year: number; quarter: number; total_reported: number | null }[] = [];
    const needsRecalc: { id: string; kra_id: string; initiative_id: string; currentTotal: number | null; calculatedTotal: number; activityCount: number }[] = [];

    for (const agg of aggregations) {
      const approvedActivities = agg.aggregationActivities;
      
      if (approvedActivities.length === 0) {
        // Orphaned - no approved activities
        orphaned.push({
          id: agg.id,
          kra_id: agg.kra_id,
          initiative_id: agg.initiative_id,
          year: agg.year,
          quarter: agg.quarter,
          total_reported: agg.total_reported,
        });
      } else {
        // Check if totals match
        const calculatedTotal = approvedActivities.reduce((sum, a) => sum + (a.reported ?? 0), 0);
        if (agg.total_reported !== calculatedTotal) {
          needsRecalc.push({
            id: agg.id,
            kra_id: agg.kra_id,
            initiative_id: agg.initiative_id,
            currentTotal: agg.total_reported,
            calculatedTotal,
            activityCount: approvedActivities.length,
          });
        }
      }
    }

    console.log(`[QPRO Cleanup] Found ${orphaned.length} orphaned aggregations, ${needsRecalc.length} needing recalculation`);

    let deletedCount = 0;
    let recalculatedCount = 0;

    if (!dryRun) {
      // Delete orphaned records
      for (const record of orphaned) {
        await prisma.kRAggregation.delete({
          where: { id: record.id }
        });
        deletedCount++;
        console.log(`[QPRO Cleanup] Deleted orphaned: ${record.kra_id} / ${record.initiative_id} (${record.year} Q${record.quarter})`);
      }

      // Recalculate mismatched records
      for (const record of needsRecalc) {
        const activities = await prisma.aggregationActivity.findMany({
          where: {
            aggregation_id: record.id,
            isApproved: true,
          },
          select: { reported: true }
        });

        const newTotal = activities.reduce((sum, a) => sum + (a.reported ?? 0), 0);
        const agg = await prisma.kRAggregation.findUnique({
          where: { id: record.id },
          select: { target_value: true }
        });

        const targetValue = agg?.target_value?.toNumber() ?? 1;
        const newAchievement = targetValue > 0 ? (newTotal / targetValue) * 100 : 0;

        await prisma.kRAggregation.update({
          where: { id: record.id },
          data: {
            total_reported: newTotal,
            submission_count: activities.length,
            achievement_percent: Math.min(newAchievement, 100),
            last_updated: new Date(),
          }
        });
        recalculatedCount++;
        console.log(`[QPRO Cleanup] Recalculated: ${record.kra_id} / ${record.initiative_id} - ${record.currentTotal} → ${newTotal}`);
      }
    }

    return NextResponse.json({
      success: true,
      dryRun,
      summary: {
        totalAggregations: aggregations.length,
        orphanedFound: orphaned.length,
        needsRecalculation: needsRecalc.length,
        deleted: deletedCount,
        recalculated: recalculatedCount,
      },
      orphaned: orphaned.map(o => ({
        kraId: o.kra_id,
        initiativeId: o.initiative_id,
        year: o.year,
        quarter: o.quarter,
        staleValue: o.total_reported,
      })),
      needsRecalculation: needsRecalc.map(r => ({
        kraId: r.kra_id,
        initiativeId: r.initiative_id,
        currentTotal: r.currentTotal,
        calculatedTotal: r.calculatedTotal,
        activityCount: r.activityCount,
      })),
    });

  } catch (error) {
    console.error('[QPRO Cleanup] Error:', error);
    return NextResponse.json(
      { error: 'Failed to run cleanup' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/qpro/cleanup
 * 
 * Check the status of KRAggregation data integrity without making changes.
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const { user } = authResult;

    // Only ADMIN can check cleanup status
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only ADMIN can check cleanup status.' },
        { status: 403 }
      );
    }

    // Count aggregations and their activity status
    const aggregations = await prisma.kRAggregation.findMany({
      include: {
        aggregationActivities: {
          where: { isApproved: true },
          select: { id: true }
        }
      }
    });

    const orphanedCount = aggregations.filter(a => a.aggregationActivities.length === 0).length;
    const withActivities = aggregations.filter(a => a.aggregationActivities.length > 0).length;

    return NextResponse.json({
      totalAggregations: aggregations.length,
      withApprovedActivities: withActivities,
      orphaned: orphanedCount,
      needsCleanup: orphanedCount > 0,
      message: orphanedCount > 0 
        ? `Found ${orphanedCount} orphaned KRAggregation records. Run POST /api/qpro/cleanup?dryRun=false to clean them up.`
        : 'No orphaned records found. Data integrity is good.',
    });

  } catch (error) {
    console.error('[QPRO Cleanup] Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check cleanup status' },
      { status: 500 }
    );
  }
}
