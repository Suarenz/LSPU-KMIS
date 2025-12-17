import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import prisma from '@/lib/prisma';
import { normalizeKraId } from '@/lib/utils/qpro-aggregation';

/**
 * GET /api/kpi-contributions
 * 
 * Returns the per-document KPI contributions for audit and transparency.
 * This shows exactly which document contributed what value to each KPI.
 * 
 * Query params:
 * - kraId: Filter by specific KRA (e.g., "KRA 5")
 * - initiativeId: Filter by specific initiative/KPI (e.g., "KRA5-KPI1")
 * - year: Filter by year (default: current year)
 * - quarter: Filter by quarter (1-4, optional)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const { searchParams } = new URL(request.url);
    const kraId = searchParams.get('kraId');
    const initiativeId = searchParams.get('initiativeId');
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const quarter = searchParams.get('quarter') ? parseInt(searchParams.get('quarter')!) : undefined;

    // Build query conditions
    const whereConditions: any = {
      year,
    };

    if (quarter) {
      whereConditions.quarter = quarter;
    }

    if (kraId) {
      const normalizedKraId = normalizeKraId(kraId);
      const compact = normalizedKraId.replace(/\s+/g, '');
      whereConditions.kra_id = { in: [kraId, normalizedKraId, compact] };
    }

    if (initiativeId) {
      whereConditions.initiative_id = initiativeId;
    }

    // Get contributions with related document and analysis info
    const contributions = await prisma.kPIContribution.findMany({
      where: whereConditions,
      include: {
        document: {
          select: {
            id: true,
            title: true,
            fileName: true,
            uploadedAt: true,
          },
        },
        qproAnalysis: {
          select: {
            id: true,
            documentTitle: true,
            status: true,
            approvedAt: true,
            unit: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
      orderBy: [
        { year: 'desc' },
        { quarter: 'desc' },
        { created_at: 'desc' },
      ],
    });

    // Group contributions by KPI for summary
    const kpiSummary = new Map<string, { 
      kraId: string; 
      initiativeId: string; 
      totalValue: number; 
      contributionCount: number;
      contributions: typeof contributions;
    }>();

    for (const contrib of contributions) {
      const key = `${contrib.kra_id}|${contrib.initiative_id}`;
      const existing = kpiSummary.get(key) || {
        kraId: contrib.kra_id,
        initiativeId: contrib.initiative_id,
        totalValue: 0,
        contributionCount: 0,
        contributions: [],
      };
      existing.totalValue += contrib.value;
      existing.contributionCount += 1;
      existing.contributions.push(contrib);
      kpiSummary.set(key, existing);
    }

    return NextResponse.json({
      success: true,
      year,
      quarter,
      totalContributions: contributions.length,
      kpiSummaries: Array.from(kpiSummary.values()).map(summary => ({
        kraId: summary.kraId,
        initiativeId: summary.initiativeId,
        totalValue: summary.totalValue,
        contributionCount: summary.contributionCount,
      })),
      contributions: contributions.map((c: typeof contributions[0]) => ({
        id: c.id,
        kraId: c.kra_id,
        initiativeId: c.initiative_id,
        value: c.value,
        year: c.year,
        quarter: c.quarter,
        targetType: c.target_type,
        createdAt: c.created_at,
        document: c.document ? {
          id: c.document.id,
          title: c.document.title,
          fileName: c.document.fileName,
          uploadedAt: c.document.uploadedAt,
        } : null,
        analysis: c.qproAnalysis ? {
          id: c.qproAnalysis.id,
          title: c.qproAnalysis.documentTitle,
          status: c.qproAnalysis.status,
          approvedAt: c.qproAnalysis.approvedAt,
          unit: c.qproAnalysis.unit,
        } : null,
      })),
    });

  } catch (error) {
    console.error('Error fetching KPI contributions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KPI contributions', details: (error as Error).message },
      { status: 500 }
    );
  }
}
