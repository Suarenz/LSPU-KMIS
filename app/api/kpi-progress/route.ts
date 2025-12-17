import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import prisma from '@/lib/prisma';
import strategicPlan from '@/strategic_plan.json';
import { getInitiativeTargetMeta, normalizeKraId } from '@/lib/utils/qpro-aggregation';

interface KPIProgressItem {
  initiativeId: string;
  year: number;
  quarter: number;
  targetValue: string | number;
  currentValue: number;
  achievementPercent: number;
  status: 'MET' | 'ON_TRACK' | 'MISSED' | 'PENDING';
  submissionCount: number;
  participatingUnits: string[];
}

interface KPIProgress {
  kraId: string;
  kraTitle: string;
  initiatives: {
    id: string;
    outputs: string;
    outcomes: string;
    targetType: string;
    progress: KPIProgressItem[];
  }[];
}

/**
 * GET /api/kpi-progress
 * 
 * Returns the progress/achievement for each KPI based on approved QPRO analyses
 * 
 * Query params:
 * - kraId: Filter by specific KRA (e.g., "KRA 1")
 * - year: Filter by year (default: current year)
 * - quarter: Filter by quarter (1-4, optional)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const { searchParams } = new URL(request.url);
    const kraId = searchParams.get('kraId');
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const quarter = searchParams.get('quarter') ? parseInt(searchParams.get('quarter')!) : undefined;

    // Get KRA from strategic plan using normalized ID
    const allKras = (strategicPlan as any).kras || [];
    const normalizedKraIdParam = kraId ? normalizeKraId(kraId) : null;
    const targetKra = normalizedKraIdParam 
      ? allKras.find((k: any) => normalizeKraId(k.kra_id) === normalizedKraIdParam)
      : null;

    if (kraId && !targetKra) {
      return NextResponse.json({ error: 'KRA not found' }, { status: 404 });
    }

    // Build query conditions for aggregation activities
    const whereConditions: any = {
      isApproved: true, // Only count approved activities
    };

    // Get approved aggregation activities
    const aggregationActivities = await prisma.aggregationActivity.findMany({
      where: whereConditions,
      include: {
        qproAnalysis: {
          select: {
            year: true,
            quarter: true,
            unitId: true,
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
    });

    // Also get from KRAggregation table for aggregated data
    // NOTE: kra_id may be stored as "KRA3" or "KRA 3" depending on historical data.
    const kraIdVariants = (() => {
      if (!kraId) return null;
      const normalized = normalizeKraId(kraId);
      const compact = normalized.replace(/\s+/g, '');
      return Array.from(new Set([kraId, normalized, compact]));
    })();

    // Get KPIContributions - the source of truth for per-document contributions
    const kpiContributions = await prisma.kPIContribution.findMany({
      where: {
        year,
        ...(quarter && { quarter }),
        ...(kraIdVariants && { kra_id: { in: kraIdVariants } }),
      },
    });

    // Build contribution totals by KPI (sum of all per-document contributions)
    const contributionTotals = new Map<string, { total: number; count: number; targetType: string }>();
    for (const contrib of kpiContributions) {
      const key = `${normalizeKraId(contrib.kra_id)}|${contrib.initiative_id}|${contrib.year}|${contrib.quarter}`;
      const existing = contributionTotals.get(key) || { total: 0, count: 0, targetType: contrib.target_type };
      existing.total += contrib.value;
      existing.count += 1;
      contributionTotals.set(key, existing);
    }

    const kraAggregations = await prisma.kRAggregation.findMany({
      where: {
        year,
        ...(quarter && { quarter }),
        ...(kraIdVariants && { kra_id: { in: kraIdVariants } }),
      },
    });

    // Build progress map
    const progressMap = new Map<string, Map<string, KPIProgressItem[]>>();

    const toFiniteNumber = (raw: unknown): number | null => {
      if (raw === null || raw === undefined) return null;
      const n = typeof raw === 'number' ? raw : Number(String(raw).replace(/,/g, '').trim());
      return Number.isFinite(n) ? n : null;
    };

    // Process aggregation activities
    for (const activity of aggregationActivities) {
      const qpro = activity.qproAnalysis;
      if (!qpro) continue;

      // Filter by year and quarter
      if (qpro.year !== year) continue;
      if (quarter && qpro.quarter !== quarter) continue;

      const initiativeId = activity.initiative_id;
      
      // Extract KRA from initiative ID (e.g., "KRA1-KPI1" -> "KRA 1") using normalized format
      const kraMatch = initiativeId.match(/^(KRA\s?\d+)/i);
      const rawKraId = kraMatch ? kraMatch[1] : null;
      const activityKraId = rawKraId ? normalizeKraId(rawKraId) : null;
      
      // Use normalized comparison for KRA ID filtering
      if (kraId && activityKraId !== normalizeKraId(kraId)) continue;
      if (!activityKraId) continue;

      // Initialize maps
      if (!progressMap.has(activityKraId)) {
        progressMap.set(activityKraId, new Map());
      }
      const kraMap = progressMap.get(activityKraId)!;
      
      if (!kraMap.has(initiativeId)) {
        kraMap.set(initiativeId, []);
      }
      
      const progressItems = kraMap.get(initiativeId)!;
      
      // Find or create progress item for this year/quarter
      let progressItem = progressItems.find(
        p => p.year === qpro.year && p.quarter === qpro.quarter
      );
      
      if (!progressItem) {
        // Get target from strategic plan using normalized KRA ID
        const normalizedActKraId = normalizeKraId(activityKraId);
        const kra = allKras.find((k: any) => normalizeKraId(k.kra_id) === normalizedActKraId);
        const initiative = kra?.initiatives.find((i: any) => i.id === initiativeId);
        const timelineData = initiative?.targets?.timeline_data?.find((t: any) => t.year === qpro.year);
        
        progressItem = {
          initiativeId,
          year: qpro.year,
          quarter: qpro.quarter,
          targetValue: timelineData?.target_value ?? 0,
          currentValue: 0,
          achievementPercent: 0,
          status: 'PENDING',
          submissionCount: 0,
          participatingUnits: [],
        };
        progressItems.push(progressItem);
      }

      // Aggregate reported values.
      // NOTE: For percentage KPIs we must NOT sum across units/activities; we aggregate as a mean measurement.
      if (activity.reported != null) {
        const reported = toFiniteNumber(activity.reported);
        if (reported !== null) {
          const meta = getInitiativeTargetMeta(
            strategicPlan as any,
            activityKraId,
            initiativeId,
            qpro.year
          );
          const targetType = String(meta.targetType || '').toLowerCase();

          if (targetType === 'percentage') {
            // Normalize percent:
            // - Accept 0..100
            // - If reported is a count and activity.target is a denominator, convert to percent
            let pct: number | null = null;
            if (reported >= 0 && reported <= 100) {
              pct = reported;
            } else {
              const denom = toFiniteNumber(activity.target);
              if (denom !== null && denom > 0 && reported >= 0) {
                const computed = (reported / denom) * 100;
                if (computed >= 0 && computed <= 100) pct = computed;
              }
            }

            if (pct !== null) {
              const sumKey = '_pctSum';
              const countKey = '_pctCount';
              (progressItem as any)[sumKey] = ((progressItem as any)[sumKey] || 0) + pct;
              (progressItem as any)[countKey] = ((progressItem as any)[countKey] || 0) + 1;
            }
          } else {
            progressItem.currentValue += reported;
          }
        }
      }
      progressItem.submissionCount++;
      
      // Track participating units
      if (qpro.unit && !progressItem.participatingUnits.includes(qpro.unit.code)) {
        progressItem.participatingUnits.push(qpro.unit.code);
      }
    }

    // Also use KRAggregation data for more accurate totals
    for (const agg of kraAggregations) {
      const kraMapKey = normalizeKraId(agg.kra_id);
      
      if (!progressMap.has(kraMapKey)) {
        progressMap.set(kraMapKey, new Map());
      }
      const kraMap = progressMap.get(kraMapKey)!;
      
      if (!kraMap.has(agg.initiative_id)) {
        kraMap.set(agg.initiative_id, []);
      }
      
      const progressItems = kraMap.get(agg.initiative_id)!;
      
      // Find or update progress item
      let progressItem = progressItems.find(
        p => p.year === agg.year && p.quarter === agg.quarter
      );
      
      if (!progressItem) {
        progressItem = {
          initiativeId: agg.initiative_id,
          year: agg.year,
          quarter: agg.quarter,
          targetValue: agg.target_value?.toNumber() ?? 0,
          currentValue: agg.total_reported ?? 0,
          achievementPercent: agg.achievement_percent?.toNumber() ?? 0,
          status: (agg.status as any) || 'PENDING',
          submissionCount: agg.submission_count,
          participatingUnits: (agg.participating_units as string[]) || [],
        };
        progressItems.push(progressItem);
      } else {
        // Update with aggregation data (more accurate)
        if (agg.total_reported != null) {
          progressItem.currentValue = agg.total_reported;
        }
        if (agg.achievement_percent != null) {
          progressItem.achievementPercent = agg.achievement_percent.toNumber();
        }
        if (agg.status) {
          progressItem.status = agg.status as any;
        }
      }
    }

    // Finalize percentage KPI averages and calculate achievement/status for items without aggregation data
    for (const [kraIdKey, kraMap] of progressMap) {
      for (const [initiativeIdKey, progressItems] of kraMap) {
        for (const item of progressItems) {

          // If we accumulated pct values, convert to mean
          const pctCount = (item as any)._pctCount as number | undefined;
          const pctSum = (item as any)._pctSum as number | undefined;
          if (pctCount && pctSum !== undefined) {
            // Store as an integer percent for consistency with DB/UI inputs.
            item.currentValue = Math.round(pctSum / pctCount);
          }

          // Prefer explicit aggregation table if present; otherwise compute from current/target.
          if (item.achievementPercent === 0 && (item.currentValue || 0) > 0) {
            const target = typeof item.targetValue === 'number'
              ? item.targetValue
              : parseFloat(String(item.targetValue)) || 0;

            if (target > 0) {
              item.achievementPercent = Math.round((item.currentValue / target) * 100 * 100) / 100;
            }
          }

          // Clamp for UI progress bars
          item.achievementPercent = Math.min(100, Math.max(0, item.achievementPercent || 0));

          // Only clamp currentValue for percentage KPIs.
          const meta = getInitiativeTargetMeta(
            strategicPlan as any,
            kraIdKey,
            initiativeIdKey,
            item.year
          );
          const targetType = String(meta.targetType || '').toLowerCase();
          if (targetType === 'percentage') {
            item.currentValue = Math.min(100, Math.max(0, item.currentValue || 0));
          }
          
          // Update status based on achievement
          if (item.status === 'PENDING' && item.achievementPercent > 0) {
            if (item.achievementPercent >= 100) {
              item.status = 'MET';
            } else if (item.achievementPercent >= 80) {
              item.status = 'ON_TRACK';
            } else {
              item.status = 'MISSED';
            }
          }
        }
      }
    }

    // Build response
    const krasToProcess = kraId ? [targetKra] : allKras;
    const response: KPIProgress[] = [];

    for (const kra of krasToProcess) {
      if (!kra) continue;
      
      // Use normalized KRA ID for consistent lookup
      const normalizedKraIdForLookup = normalizeKraId(kra.kra_id);
      
      const kraProgress: KPIProgress = {
        kraId: kra.kra_id,
        kraTitle: kra.kra_title,
        initiatives: [],
      };

      for (const initiative of kra.initiatives || []) {
        const kraMap = progressMap.get(normalizedKraIdForLookup);
        const progressItems = kraMap?.get(initiative.id) || [];

        // If no progress data exists, create empty entries for the year
        if (progressItems.length === 0) {
          const timelineData = initiative.targets?.timeline_data?.find((t: any) => t.year === year);
          if (timelineData) {
            // Create entries for all quarters if no specific quarter requested
            const quartersToCreate = quarter ? [quarter] : [1, 2, 3, 4];
            for (const q of quartersToCreate) {
              progressItems.push({
                initiativeId: initiative.id,
                year,
                quarter: q,
                targetValue: timelineData.target_value,
                currentValue: 0,
                achievementPercent: 0,
                status: 'PENDING',
                submissionCount: 0,
                participatingUnits: [],
              });
            }
          }
        }

        kraProgress.initiatives.push({
          id: initiative.id,
          outputs: initiative.key_performance_indicator?.outputs || '',
          outcomes: initiative.key_performance_indicator?.outcomes || '',
          targetType: initiative.targets?.type || 'count',
          progress: progressItems,
        });
      }

      response.push(kraProgress);
    }

    return NextResponse.json({
      success: true,
      year,
      quarter,
      data: kraId ? response[0] : response,
    });

  } catch (error) {
    console.error('Error fetching KPI progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KPI progress', details: (error as Error).message },
      { status: 500 }
    );
  }
}
