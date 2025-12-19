import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import prisma from '@/lib/prisma';
import strategicPlan from '@/lib/data/strategic_plan.json';
import { getInitiativeTargetMeta, normalizeKraId } from '@/lib/utils/qpro-aggregation';
import { mapTargetType } from '@/lib/utils/target-type-utils';

// Helper to map strategic plan target types
function mapTargetTypeFromPlan(planType: string): 'MILESTONE' | 'COUNT' | 'PERCENTAGE' | 'FINANCIAL' | 'TEXT_CONDITION' {
  return mapTargetType(planType);
}

interface KPIProgressItem {
  initiativeId: string;
  year: number;
  quarter: number;
  targetValue: string | number;
  currentValue: number | string; // Can be string for text_condition or numeric for others
  achievementPercent: number;
  status: 'MET' | 'ON_TRACK' | 'MISSED' | 'PENDING';
  submissionCount: number;
  participatingUnits: string[];
  targetType: 'MILESTONE' | 'COUNT' | 'PERCENTAGE' | 'FINANCIAL' | 'TEXT_CONDITION'; // Type of input
  // Manual override fields - allows users to correct QPRO-derived values
  manualOverride?: number | string | null;
  manualOverrideReason?: string | null;
  manualOverrideBy?: string | null;
  manualOverrideAt?: string | null;
  valueSource: 'qpro' | 'manual' | 'none';
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
        
        // Map target type from strategic plan
        const planTargetType = initiative?.targets?.type || 'count';
        const targetType = mapTargetTypeFromPlan(planTargetType);
        
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
          targetType,
          manualOverride: null,
          manualOverrideReason: null,
          manualOverrideBy: null,
          manualOverrideAt: null,
          valueSource: 'none',
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
            const currentNum = typeof progressItem.currentValue === 'number' ? progressItem.currentValue : 0;
            progressItem.currentValue = currentNum + reported;
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
      
      // Determine value source and final current value
      const hasManualOverride = agg.manual_override !== null && agg.manual_override !== undefined;
      const qproValue = agg.total_reported ?? 0;
      const finalValue = hasManualOverride ? (agg.manual_override?.toNumber() ?? qproValue) : qproValue;
      const valueSource: 'qpro' | 'manual' | 'none' = hasManualOverride ? 'manual' 
        : qproValue > 0 ? 'qpro' 
        : 'none';
      
      if (!progressItem) {
        progressItem = {
          initiativeId: agg.initiative_id,
          year: agg.year,
          quarter: agg.quarter,
          targetValue: agg.target_value?.toNumber() ?? 0,
          currentValue: finalValue,
          achievementPercent: agg.achievement_percent?.toNumber() ?? 0,
          status: (agg.status as any) || 'PENDING',
          submissionCount: agg.submission_count,
          participatingUnits: (agg.participating_units as string[]) || [],
          targetType: (agg.target_type as any) || 'COUNT',
          manualOverride: hasManualOverride ? agg.manual_override?.toNumber() : null,
          manualOverrideReason: agg.manual_override_reason || null,
          manualOverrideBy: agg.manual_override_by || null,
          manualOverrideAt: agg.manual_override_at?.toISOString() || null,
          valueSource,
        };
        progressItems.push(progressItem);
      } else {
        // Update with aggregation data (more accurate)
        progressItem.currentValue = finalValue;
        if (agg.achievement_percent != null) {
          progressItem.achievementPercent = agg.achievement_percent.toNumber();
        }
        if (agg.status) {
          progressItem.status = agg.status as any;
        }
        // Add manual override info
        progressItem.manualOverride = hasManualOverride ? agg.manual_override?.toNumber() : null;
        progressItem.manualOverrideReason = agg.manual_override_reason || null;
        progressItem.manualOverrideBy = agg.manual_override_by || null;
        progressItem.manualOverrideAt = agg.manual_override_at?.toISOString() || null;
        progressItem.valueSource = valueSource;
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
          const currentNum = typeof item.currentValue === 'number' ? item.currentValue : parseFloat(String(item.currentValue)) || 0;
          if (item.achievementPercent === 0 && currentNum > 0) {
            const target = typeof item.targetValue === 'number'
              ? item.targetValue
              : parseFloat(String(item.targetValue)) || 0;

            if (target > 0) {
              item.achievementPercent = Math.round((currentNum / target) * 100 * 100) / 100;
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
            item.currentValue = Math.min(100, Math.max(0, currentNum));
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
              // Map target type from strategic plan
              const planTargetType = initiative.targets?.type || 'count';
              const targetType = mapTargetTypeFromPlan(planTargetType);
              
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
                targetType,
                manualOverride: null,
                manualOverrideReason: null,
                manualOverrideBy: null,
                manualOverrideAt: null,
                valueSource: 'none',
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

/**
 * PATCH /api/kpi-progress
 * 
 * Save a manual override for a specific KPI's current value
 * 
 * Body:
 * - kraId: string (e.g., "KRA 5")
 * - initiativeId: string (e.g., "KRA5-KPI9")
 * - year: number
 * - quarter: number
 * - value: number | null (set to null to clear override and use QPRO value)
 * - reason?: string (optional reason for override)
 */
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;
    const { user } = authResult;

    const body = await request.json();
    const { kraId, initiativeId, year, quarter, value, reason, targetType } = body;

    // Validate required fields
    if (!kraId || !initiativeId || !year || !quarter) {
      return NextResponse.json(
        { error: 'Missing required fields: kraId, initiativeId, year, quarter' },
        { status: 400 }
      );
    }

    // Determine targetType if not provided
    let finalTargetType = targetType;
    if (!finalTargetType) {
      // Get from strategic plan
      const allKras = (strategicPlan as any).kras || [];
      const normalizedKraId = normalizeKraId(kraId);
      const targetKra = allKras.find((k: any) => normalizeKraId(k.kra_id) === normalizedKraId);
      const initiative = targetKra?.initiatives?.find((i: any) => i.id === initiativeId);
      finalTargetType = mapTargetTypeFromPlan(initiative?.targets?.type || 'count');
    }

    // Normalize KRA ID for database lookup
    const normalizedKraId = normalizeKraId(kraId);
    const kraIdVariants = [kraId, normalizedKraId, normalizedKraId.replace(/\s+/g, '')];

    // Find existing aggregation record
    const existingAgg = await prisma.kRAggregation.findFirst({
      where: {
        kra_id: { in: kraIdVariants },
        initiative_id: initiativeId,
        year,
        quarter,
      },
    });

    if (!existingAgg) {
      // Create a new aggregation record if it doesn't exist
      // Get target from strategic plan
      const allKras = (strategicPlan as any).kras || [];
      const targetKra = allKras.find((k: any) => normalizeKraId(k.kra_id) === normalizedKraId);
      const initiative = targetKra?.initiatives?.find((i: any) => i.id === initiativeId);
      const timelineData = initiative?.targets?.timeline_data?.find((t: any) => t.year === year);
      const targetValue = timelineData?.target_value ?? 0;

      // Calculate achievement based on target type
      let achievementPercent = 0;
      let manualOverrideNum: number | null = null;
      let status: 'MET' | 'ON_TRACK' | 'MISSED' | 'NOT_APPLICABLE' = 'NOT_APPLICABLE';
      
      if (value !== null) {
        if (finalTargetType === 'TEXT_CONDITION') {
          // Qualitative mapping for text conditions
          if (value === 'Met') {
            achievementPercent = 100;
            status = 'MET';
          } else if (value === 'In Progress') {
            achievementPercent = 50;
            status = 'ON_TRACK';
          } else {
            achievementPercent = 0;
            status = 'MISSED';
          }
          // Don't set manualOverrideNum for TEXT_CONDITION - keep it null
        } else if (finalTargetType === 'MILESTONE') {
          // Binary: 0% or 100%
          achievementPercent = (value === 1 || value === '1') ? 100 : 0;
          manualOverrideNum = (value === 1 || value === '1') ? 1 : 0;
          status = (value === 1 || value === '1') ? 'MET' : 'NOT_APPLICABLE';
        } else {
          // Numeric types: COUNT, PERCENTAGE, FINANCIAL
          const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, '')) || 0;
          const targetNum = typeof targetValue === 'number' ? targetValue : parseFloat(String(targetValue)) || 0;
          achievementPercent = targetNum > 0 ? (numValue / targetNum) * 100 : 0;
          manualOverrideNum = numValue;
          
          // Determine status
          if (achievementPercent >= 100) {
            status = 'MET';
          } else if (achievementPercent >= 80) {
            status = 'ON_TRACK';
          } else if (numValue > 0) {
            status = 'MISSED';
          }
        }
      }

      const newAgg = await prisma.kRAggregation.create({
        data: {
          kra_id: normalizedKraId,
          kra_title: targetKra?.kra_title || '',
          initiative_id: initiativeId,
          year,
          quarter,
          total_reported: 0,
          target_value: typeof targetValue === 'number' ? targetValue : parseFloat(String(targetValue)) || 0,
          achievement_percent: achievementPercent,
          submission_count: 0,
          participating_units: [],
          status,
          target_type: finalTargetType,
          current_value: value !== null ? String(value) : null,
          manual_override: manualOverrideNum,
          manual_override_reason: reason || null,
          manual_override_by: user.id,
          manual_override_at: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Manual override created',
        data: {
          id: newAgg.id,
          kraId: normalizedKraId,
          initiativeId,
          year,
          quarter,
          value: value,
          valueSource: value !== null ? 'manual' : 'none',
        },
      });
    }

    // Update existing record with manual override
    const targetValue = existingAgg.target_value?.toNumber() ?? 0;
    
    // Calculate achievement and status based on target type
    let achievementPercent = 0;
    let effectiveValue: number | string = value !== null ? value : (existingAgg.total_reported ?? 0);
    let manualOverrideNum: number | null = null;
    let status: 'MET' | 'ON_TRACK' | 'MISSED' | 'NOT_APPLICABLE' = 'NOT_APPLICABLE';
    
    if (value !== null) {
      if (finalTargetType === 'TEXT_CONDITION') {
        // Qualitative mapping for text conditions
        if (value === 'Met') {
          achievementPercent = 100;
          status = 'MET';
        } else if (value === 'In Progress') {
          achievementPercent = 50;
          status = 'ON_TRACK';
        } else {
          achievementPercent = 0;
          status = 'MISSED';
        }
        effectiveValue = String(value);
      } else if (finalTargetType === 'MILESTONE') {
        // Binary: 0% or 100%
        const isAchieved = value === 1 || value === '1';
        achievementPercent = isAchieved ? 100 : 0;
        status = isAchieved ? 'MET' : 'NOT_APPLICABLE';
        manualOverrideNum = isAchieved ? 1 : 0;
        effectiveValue = manualOverrideNum;
      } else {
        // Numeric types: COUNT, PERCENTAGE, FINANCIAL
        const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, '')) || 0;
        effectiveValue = numValue;
        manualOverrideNum = numValue;
        
        if (targetValue > 0) {
          achievementPercent = (numValue / targetValue) * 100;
        }
        
        // Determine status based on achievement
        if (achievementPercent >= 100) {
          status = 'MET';
        } else if (achievementPercent >= 80) {
          status = 'ON_TRACK';
        } else if (numValue > 0) {
          status = 'MISSED';
        }
      }
    } else {
      // Clearing override - use existing QPRO value
      const qproValue = existingAgg.total_reported ?? 0;
      effectiveValue = qproValue;
      if (targetValue > 0 && qproValue > 0) {
        achievementPercent = (qproValue / targetValue) * 100;
        if (achievementPercent >= 100) status = 'MET';
        else if (achievementPercent >= 80) status = 'ON_TRACK';
        else status = 'MISSED';
      }
    }

    const updatedAgg = await prisma.kRAggregation.update({
      where: { id: existingAgg.id },
      data: {
        target_type: finalTargetType,
        current_value: value !== null ? String(value) : existingAgg.current_value,
        manual_override: manualOverrideNum,
        manual_override_reason: value !== null ? (reason || null) : null,
        manual_override_by: value !== null ? user.id : null,
        manual_override_at: value !== null ? new Date() : null,
        achievement_percent: achievementPercent,
        status,
      },
    });

    return NextResponse.json({
      success: true,
      message: value !== null ? 'Manual override saved' : 'Manual override cleared',
      data: {
        id: updatedAgg.id,
        kraId: existingAgg.kra_id,
        initiativeId,
        year,
        quarter,
        currentValue: effectiveValue,
        manualOverride: value,
        qproValue: existingAgg.total_reported,
        achievementPercent,
        status,
        targetType: finalTargetType,
        valueSource: value !== null ? 'manual' : (existingAgg.total_reported ?? 0) > 0 ? 'qpro' : 'none',
      },
    });

  } catch (error) {
    console.error('Error saving KPI manual override:', error);
    return NextResponse.json(
      { error: 'Failed to save manual override', details: (error as Error).message },
      { status: 500 }
    );
  }
}
