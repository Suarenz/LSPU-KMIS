import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import prisma from '@/lib/prisma';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { computeAggregatedAchievement, getInitiativeTargetMeta, normalizeKraId } from '@/lib/utils/qpro-aggregation';

interface ActivityToRegenerate {
  name: string;
  kraId: string;
  initiativeId: string;
  reported: number;
  target: number;
  achievement: number;
  status: 'MET' | 'MISSED' | 'EXCEEDED';
  index: number;
  targetType?: string;
  aiInsight?: string;
  prescriptiveAnalysis?: string;
  dataType?: string;
  evidenceSnippet?: string;
  confidenceScore?: number;
}

/**
 * Helper function to find the target value from strategic plan based on KRA, KPI, and year
 */
function findTargetFromStrategicPlan(
  strategicPlan: any,
  kraId: string,
  initiativeId: string,
  year: number
): { target: number | null; targetType: string } {
  const kras = strategicPlan.kras || [];
  
  // Find the KRA using normalized ID for consistent lookup
  const normalizedKraIdVal = normalizeKraId(kraId);
  const kra = kras.find((k: any) => normalizeKraId(k.kra_id) === normalizedKraIdVal);
  if (!kra) {
    console.log(`[findTargetFromStrategicPlan] KRA not found: ${kraId}`);
    return { target: null, targetType: 'unknown' };
  }
  
  console.log(`[findTargetFromStrategicPlan] Found KRA: ${kraId}, looking for initiative: ${initiativeId}`);
  console.log(`[findTargetFromStrategicPlan] Available initiatives:`, kra.initiatives?.map((i: any) => i.id));
  
  // Find the initiative/KPI within the KRA - try multiple formats
  let initiative = kra.initiatives?.find((i: any) => i.id === initiativeId);
  
  // If not found, try alternative formats (e.g., "KRA3-KPI5" vs "KRA 3-KPI5")
  if (!initiative && initiativeId) {
    // Normalize the initiative ID by removing spaces
    const normalizedId = initiativeId.replace(/\s+/g, '');
    initiative = kra.initiatives?.find((i: any) => 
      i.id.replace(/\s+/g, '') === normalizedId
    );
    
    // Also try matching just by KPI number if still not found
    if (!initiative) {
      const kpiMatch = initiativeId.match(/KPI(\d+)/i);
      if (kpiMatch) {
        const kpiNumber = kpiMatch[1];
        initiative = kra.initiatives?.find((i: any) => i.id.includes(`KPI${kpiNumber}`));
      }
    }
  }
  
  if (!initiative || !initiative.targets) {
    console.log(`[findTargetFromStrategicPlan] Initiative not found: ${initiativeId}`);
    return { target: null, targetType: 'unknown' };
  }
  
  console.log(`[findTargetFromStrategicPlan] Found initiative: ${initiative.id}`);
  
  const targetType = initiative.targets.type || 'percentage';
  const timelineData = initiative.targets.timeline_data || [];
  
  // Find the target for the specific year
  const yearTarget = timelineData.find((t: any) => t.year === year);
  if (yearTarget && typeof yearTarget.target_value === 'number') {
    console.log(`[findTargetFromStrategicPlan] Found target for year ${year}: ${yearTarget.target_value}`);
    return { target: yearTarget.target_value, targetType };
  }
  
  // If no exact year match, try to find the closest year or default
  const numericTargets = timelineData.filter((t: any) => typeof t.target_value === 'number');
  if (numericTargets.length > 0) {
    // Get the most recent target before or on the year
    const validTargets = numericTargets.filter((t: any) => t.year <= year);
    if (validTargets.length > 0) {
      const target = validTargets[validTargets.length - 1].target_value;
      console.log(`[findTargetFromStrategicPlan] Using closest target: ${target}`);
      return { target, targetType };
    }
    // Otherwise use the first available target
    const target = numericTargets[0].target_value;
    console.log(`[findTargetFromStrategicPlan] Using first available target: ${target}`);
    return { target, targetType };
  }
  
  console.log(`[findTargetFromStrategicPlan] No numeric target found for ${initiativeId}`);
  return { target: null, targetType };
}

/**
 * Calculate achievement and status based on reported and target values
 */
function calculateAchievementAndStatus(
  reported: number,
  target: number
): { achievement: number; status: 'MET' | 'MISSED' | 'EXCEEDED' } {
  if (target === 0) {
    return { achievement: 0, status: 'MISSED' };
  }
  
  const achievement = (reported / target) * 100;
  
  let status: 'MET' | 'MISSED' | 'EXCEEDED';
  if (achievement >= 100) {
    status = achievement > 100 ? 'EXCEEDED' : 'MET';
  } else {
    status = 'MISSED';
  }
  
  return { achievement, status };
}

/**
 * Helper function to intelligently match an activity to the best KPI within a KRA
 * Uses LLM to analyze activity description and find the most appropriate KPI
 */
async function matchActivityToKPI(
  llm: ChatOpenAI,
  activityName: string,
  activityDescription: string,
  kraId: string,
  kraTitle: string,
  kra: any,
  strategicPlan: any
): Promise<{ initiativeId: string; matchedKPI: any } | null> {
  try {
    if (!kra || !kra.initiatives || kra.initiatives.length === 0) {
      console.log(`[matchActivityToKPI] No initiatives found for KRA ${kraId}`);
      return null;
    }

    // Build a menu of available KPIs for this KRA
    const kpiMenu = kra.initiatives
      .map((initiative: any, idx: number) => {
        const description = initiative.description || initiative.kpi_title || '';
        const targetType = initiative.targets?.type || 'numeric';
        const targets = (initiative.targets?.timeline_data || [])
          .slice(-2)
          .map((t: any) => `Year ${t.year}: ${t.target_value}`)
          .join(', ');
        
        return `${idx + 1}. **${initiative.id}**: ${description}\n   Type: ${targetType}\n   Recent targets: ${targets}`;
      })
      .join('\n\n');

    const matchingPrompt = `
You are a strategic planning expert at a university. Your task is to match a reported activity to the MOST APPROPRIATE Key Performance Indicator (KPI) within a Key Result Area (KRA).

**Activity Being Matched:**
Name: ${activityName}
Description: ${activityDescription}

**Target KRA:**
${kraId}: ${kraTitle}

**Available KPIs within this KRA:**
${kpiMenu}

**Task:** 
Analyze the activity name and description. Determine which KPI BEST matches this activity based on:
1. Semantic similarity (does the activity description match the KPI description?)
2. Metric alignment (is the reported value consistent with what this KPI measures?)
3. Strategic fit (does this activity contribute to this KPI's objective?)

**Response Format (JSON):**
{
  "selectedKPINumber": <number 1-${kra.initiatives.length}>,
  "selectedKPIId": "<KPI ID>",
  "confidenceScore": <0.0-1.0>,
  "reason": "<brief explanation of why this KPI was selected>"
}

Select the BEST matching KPI. If none are good matches, still select the closest one.`;

    const messages = [
      new SystemMessage('You are a university performance analyst. Respond only with valid JSON.'),
      new HumanMessage(matchingPrompt),
    ];

    const response = await llm.invoke(messages);
    const responseText = response.content?.toString() || '';

    // Parse the JSON response
    let matchResult;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        matchResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.log(`[matchActivityToKPI] Failed to parse LLM response: ${responseText}`);
      // Fallback: return the first KPI
      return {
        initiativeId: kra.initiatives[0].id,
        matchedKPI: kra.initiatives[0],
      };
    }

    const selectedIndex = (matchResult.selectedKPINumber || 1) - 1;
    if (selectedIndex < 0 || selectedIndex >= kra.initiatives.length) {
      console.log(`[matchActivityToKPI] Invalid index ${selectedIndex}, using first KPI`);
      return {
        initiativeId: kra.initiatives[0].id,
        matchedKPI: kra.initiatives[0],
      };
    }

    const matchedKPI = kra.initiatives[selectedIndex];
    console.log(
      `[matchActivityToKPI] Matched activity "${activityName}" to KPI: ${matchedKPI.id} (confidence: ${matchResult.confidenceScore})`
    );
    console.log(`[matchActivityToKPI] Reason: ${matchResult.reason}`);

    return {
      initiativeId: matchedKPI.id,
      matchedKPI,
    };
  } catch (error) {
    console.error('[matchActivityToKPI] Error during KPI matching:', error);
    return null;
  }
}

/**
 * POST /api/qpro/regenerate-insights
 *
 * Regenerates KPI/target/achievement for activities with corrected KRAs
 * This endpoint:
 * 1. Takes activities with updated KRAs
 * 2. Uses LLM to intelligently match activities to best KPI within the new KRA
 * 3. Looks up the correct target from strategic plan for the matched KPI
 * 4. Recalculates achievement and status based on new target
 * 5. Generates ONE document-level insight + ONE prescriptive analysis (no per-activity AI blocks)
 * 6. Updates all related fields and saves to database
 * 7. Returns regenerated activities and updated document-level fields
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const { user } = authResult;
    const { analysisId, activities } = await request.json();

    if (!analysisId || !activities || !Array.isArray(activities)) {
      return NextResponse.json(
        { error: 'Missing analysisId or activities' },
        { status: 400 }
      );
    }

    // Check permissions
    if (!['ADMIN', 'FACULTY'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to regenerate insights' },
        { status: 403 }
      );
    }

    // Fetch the analysis
    const analysis = await prisma.qPROAnalysis.findUnique({
      where: { id: analysisId },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // Get strategic plan for KRA context
    const strategicPlanJson = require('@/lib/data/strategic_plan.json');
    const allKRAs = strategicPlanJson.kras || [];
    const reportYear = analysis.year || 2025;

    // Initialize OpenAI LLM
    const llm = new ChatOpenAI({
      model: 'gpt-4o-mini',
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0.7,
      maxTokens: 500,
    });

    // Regenerate KPI/target/achievement for each activity (document-level insights only)
    const regeneratedActivities: ActivityToRegenerate[] = [];

    for (const activity of activities) {
      try {
        // Find the KRA in strategic plan using normalized ID
        const normalizedActivityKraId = normalizeKraId(activity.kraId);
        const kra = allKRAs.find((k: any) => normalizeKraId(k.kra_id) === normalizedActivityKraId);
        const kraTitle = kra?.kra_title || activity.kraId;

        if (!kra) {
          console.log(`[Regenerate] KRA not found: ${activity.kraId}`);
          regeneratedActivities.push({
            ...activity,
            aiInsight: null as any,
            prescriptiveAnalysis: null as any,
          });
          continue;
        }

        console.log(`[Regenerate] Processing activity: ${activity.name}`);
        console.log(`[Regenerate] Original KRA: ${activity.initiativeId}, New KRA: ${activity.kraId}`);

        // Check if a specific KPI/Initiative was explicitly selected by the user
        const userSelectedKPI = (activity as any).userSelectedKPI === true;
        let newInitiativeId = activity.initiativeId;

        // If user explicitly selected a KPI, use it
        if (userSelectedKPI) {
          console.log(`[Regenerate] Using user-selected KPI: ${newInitiativeId}`);
        } else {
          // Otherwise, use LLM to match the activity to the best KPI within the selected KRA
          const kpiMatch = await matchActivityToKPI(
            llm,
            activity.name,
            activity.description || activity.name,
            activity.kraId,
            kraTitle,
            kra,
            strategicPlanJson
          );

          if (kpiMatch) {
            newInitiativeId = kpiMatch.initiativeId;
            console.log(`[Regenerate] Matched to KPI: ${newInitiativeId}`);
          } else {
            console.log(`[Regenerate] Could not match to KPI, using first available for KRA`);
            // Fallback: use first KPI in the KRA
            if (kra.initiatives && kra.initiatives.length > 0) {
              newInitiativeId = kra.initiatives[0].id;
            }
          }
        }

        // Look up the correct target from the strategic plan using the matched KPI
        const { target: newTarget, targetType } = findTargetFromStrategicPlan(
          strategicPlanJson,
          activity.kraId,
          newInitiativeId,
          reportYear
        );

        console.log(`[Regenerate] Found target for ${activity.name}: ${newTarget} (type: ${targetType})`);

        // Use the new target if found, otherwise keep the original
        const finalTarget = newTarget !== null ? newTarget : activity.target;
        
        // Recalculate achievement and status based on the new target
        const { achievement: newAchievement, status: newStatus } = calculateAchievementAndStatus(
          activity.reported,
          finalTarget
        );

        console.log(`[Regenerate] Final target: ${finalTarget}, Achievement: ${newAchievement.toFixed(2)}%, Status: ${newStatus}`);

        const regeneratedActivity = {
          ...activity,
          kraId: activity.kraId,
          initiativeId: newInitiativeId,
          target: finalTarget,
          achievement: newAchievement,
          status: newStatus,
          targetType,
          // Requirement: document-level only (no per-activity AI insight/prescriptive analysis)
          aiInsight: null as any,
          prescriptiveAnalysis: null as any,
        };
        console.log(`[Regenerate] Pushing activity with target:`, regeneratedActivity.target);
        regeneratedActivities.push(regeneratedActivity);
      } catch (activityError) {
        console.error(`Error regenerating insights for activity: ${activity.name}`, activityError);
        // Still include the activity but with empty insights
        regeneratedActivities.push({
          ...activity,
          aiInsight: null as any,
          prescriptiveAnalysis: null as any,
        });
      }
    }

    // Save the updated activities with new KRAs, targets, achievements, and insights to the database
    const existingActivities = (analysis.activities as any[]) || [];

    // Merge regenerated insights into existing activities
    const updatedActivities = existingActivities.map((existingAct: any) => {
      const regeneratedAct = regeneratedActivities.find(
        (regen: any) => regen.name === existingAct.name || regen.index === existingAct.index
      );
      if (regeneratedAct) {
        return {
          ...existingAct,
          kraId: regeneratedAct.kraId,
          initiativeId: regeneratedAct.initiativeId,
          target: regeneratedAct.target,
          achievement: regeneratedAct.achievement,
          status: regeneratedAct.status,
          targetType: regeneratedAct.targetType,
          // Clear any legacy per-activity insight fields
          aiInsight: null,
          prescriptiveAnalysis: null,
        };
      }
      return existingAct;
    });

    // Recalculate overall achievement score at KPI-level (prevents averaging tiny per-item % for count KPIs)
    const year = Number((analysis as any).year ?? reportYear ?? 2025);
    const groups = new Map<string, { kraId: string; initiativeId: string; activities: any[] }>();
    for (const act of updatedActivities) {
      const kraId = String(act.kraId || '').trim();
      const initiativeId = String(act.initiativeId || '').trim();
      if (!kraId || !initiativeId) continue;

      const key = `${kraId}::${initiativeId}`;
      if (!groups.has(key)) {
        groups.set(key, { kraId, initiativeId, activities: [] });
      }
      groups.get(key)!.activities.push(act);
    }

    const kpiSummaries: Array<{ totalTarget: number; totalReported: number; achievementPercent: number; isRateMetric: boolean }> = [];
    for (const g of groups.values()) {
      const meta = getInitiativeTargetMeta({ kras: allKRAs } as any, g.kraId, g.initiativeId, year);

      const fallbackTarget = typeof g.activities?.[0]?.initiativeTarget === 'number'
        ? g.activities[0].initiativeTarget
        : (typeof g.activities?.[0]?.target === 'number' ? g.activities[0].target : Number(g.activities?.[0]?.target || 0));
      const targetValue = meta.targetValue ?? (Number.isFinite(fallbackTarget) && fallbackTarget > 0 ? fallbackTarget : 0);

      const aggregated = computeAggregatedAchievement({
        targetType: meta.targetType || g.activities?.[0]?.targetType,
        targetValue,
        targetScope: meta.targetScope,
        activities: g.activities,
      });

      const isRateMetric = String(meta.targetType || g.activities?.[0]?.targetType || '').toLowerCase() === 'percentage';
      kpiSummaries.push({
        totalTarget: aggregated.totalTarget,
        totalReported: aggregated.totalReported,
        achievementPercent: aggregated.achievementPercent,
        isRateMetric,
      });
    }

    const overallAchievementScore =
      kpiSummaries.length > 0
        ? (kpiSummaries.reduce((sum, k) => sum + (k.achievementPercent || 0), 0) / kpiSummaries.length)
        : 0;

    // Recalculate gaps for activities that missed their targets
    const gapsData: Record<string, { target: number; actual: number; gap: number }> = {};
    
    for (const act of updatedActivities) {
      if (act.status === 'MISSED' || (act.achievement && act.achievement < 100)) {
        const gapValue = act.target - act.reported;
        const gapPercentage = act.target > 0 ? ((act.target - act.reported) / act.target) * 100 : 0;
        gapsData[act.name] = {
          target: act.target,
          actual: act.reported,
          gap: gapPercentage,
        };
      }
    }

    // Add overall summary to gaps
    if (kpiSummaries.length > 0) {
      const allRate = kpiSummaries.every((k) => k.isRateMetric);
      const overallTarget = allRate
        ? (kpiSummaries.reduce((sum, k) => sum + (k.totalTarget || 0), 0) / kpiSummaries.length)
        : kpiSummaries.reduce((sum, k) => sum + (k.totalTarget || 0), 0);
      const overallActual = allRate
        ? (kpiSummaries.reduce((sum, k) => sum + (k.totalReported || 0), 0) / kpiSummaries.length)
        : kpiSummaries.reduce((sum, k) => sum + (k.totalReported || 0), 0);

      const overallGap = overallTarget > 0 ? ((overallTarget - overallActual) / overallTarget) * 100 : 0;
      gapsData['Overall Achievement'] = {
        target: overallTarget,
        actual: overallActual,
        gap: overallGap,
      };
    }

    // Generate overall alignment and opportunities text
    const metActivities = updatedActivities.filter((a: any) => a.status === 'MET' || a.status === 'EXCEEDED' || (a.achievement && a.achievement >= 100));
    const missedActivities = updatedActivities.filter((a: any) => a.status === 'MISSED' || (a.achievement && a.achievement < 100));
    
    // Collect unique KRAs
    const kraIds = [...new Set(updatedActivities.map((a: any) => a.kraId))];
    const kraList = kraIds.map((kraId: any) => {
      const normalizedKraIdForList = normalizeKraId(kraId);
      const kra = allKRAs.find((k: any) => normalizeKraId(k.kra_id) === normalizedKraIdForList);
      return kra?.kra_title || kraId;
    }).join(', ');

    // Create document insight text (markdown-friendly) for legacy fields
    const overallSummary = gapsData['Overall Achievement']
      ? gapsData['Overall Achievement']
      : null;
    const isRateSummary = overallSummary
      ? overallSummary.target <= 100 && overallSummary.actual <= 100
      : false;

    const alignmentText =
      `### Summary\n` +
      `- Activities analyzed: ${updatedActivities.length}\n` +
      `- KRAs covered: ${kraIds.length}${kraList ? ` (${kraList})` : ''}\n` +
      `- Activities met/exceeded: ${metActivities.length}\n` +
      `- Activities missed: ${missedActivities.length}\n` +
      `- Overall achievement score: ${overallAchievementScore.toFixed(2)}%\n` +
      (overallSummary
        ? (`- ${isRateSummary ? 'Average reported rate' : 'Total reported'}: ${overallSummary.actual.toFixed(2)}${isRateSummary ? '%' : ''}\n` +
           `- ${isRateSummary ? 'Target rate' : 'Total target'}: ${overallSummary.target.toFixed(2)}${isRateSummary ? '%' : ''}\n`)
        : '');

    // Screenshot-style document insight paragraph (plain text, no markdown)
    // Treat "high performers" as activities with >80% achievement.
    // If none meet that threshold, do not mention strengths and do NOT generate a Sustain section.
    const strongestHighPerformer = updatedActivities
      .filter((a: any) => Number(a?.achievement || 0) > 80)
      .slice()
      .sort((a: any, b: any) => (Number(b.achievement || 0) - Number(a.achievement || 0)))[0];
    const bottleneck = missedActivities
      .slice()
      .sort((a: any, b: any) => (Number(a.achievement || 0) - Number(b.achievement || 0)))[0];

    const documentInsightPlain = (() => {
      const parts: string[] = [];
      parts.push(`The report indicates an overall achievement score of ${overallAchievementScore.toFixed(2)}% across ${updatedActivities.length} tracked activities.`);
      if (kraList) {
        parts.push(`Coverage spans ${kraIds.length} KRA(s): ${kraList}.`);
      }
      if (strongestHighPerformer?.name) {
        parts.push(`Key strengths appear in "${strongestHighPerformer.name}" (${Number(strongestHighPerformer.achievement || 0).toFixed(1)}% of target).`);
      }
      if (bottleneck?.name) {
        parts.push(`Performance is primarily constrained by "${bottleneck.name}", which is at ${Number(bottleneck.achievement || 0).toFixed(1)}% of target, suggesting a volume or reporting pipeline bottleneck rather than a technical output issue.`);
      }
      return parts.join(' ');
    })();

    // Create detailed opportunities text based on actual results
    let opportunitiesText = '';
    if (metActivities.length > 0) {
      const successSummary = metActivities
        .map((a: any) => `- ${a.name} (${(a.achievement || 0).toFixed(1)}% achievement)`)
        .join('\n');
      opportunitiesText =
        `### High-performing activities\n` +
        `${successSummary}\n`;
    }
    
    if (missedActivities.length > 0) {
      const improvementArea = missedActivities
        .map((a: any) => {
          const gapPct = a.target > 0 ? ((a.target - a.reported) / a.target * 100) : 0;
          const suffix = (a.target <= 100 && a.reported <= 100) ? '%' : '';
          return `- ${a.name}: Target ${Number(a.target || 0).toFixed(2)}${suffix}, Reported ${Number(a.reported || 0).toFixed(2)}${suffix} (Gap ${gapPct.toFixed(1)}%)`;
        })
        .join('\n');
      opportunitiesText += (opportunitiesText ? '\n\n' : '') +
        `### Improvement opportunities\n` +
        `${improvementArea}\n`;
    }

    // Screenshot-style prescriptive items (structured)
    const prescriptiveItems = (() => {
      const items: Array<{ title: string; issue: string; action: string; nextStep?: string }> = [];
      if (bottleneck?.name) {
        items.push({
          title: 'Address the primary performance gap',
          issue: `"${bottleneck.name}" is currently at ${Number(bottleneck.achievement || 0).toFixed(1)}% of target, indicating a scale or reporting workflow constraint.`,
          action: 'Shift from ad-hoc collection to a scalable process (batch collection and centralized consolidation) and align with the responsible office to obtain updated lists by the next reporting cycle.',
        });
      } else {
        items.push({
          title: 'Address the primary performance gap',
          issue: 'At least one KPI area remains below target, limiting overall performance.',
          action: 'Prioritize the lowest-performing KPI and implement targeted interventions with clear owners and deadlines by the next reporting cycle.',
        });
      }

      // Only add Sustain when there is actually a high-performing activity.
      if (strongestHighPerformer?.name) {
        items.push({
          title: 'Sustain and operationalize high performers',
          issue: `High-performing areas (e.g., "${strongestHighPerformer.name}") should be protected from regression as attention shifts to gaps.`,
          action: 'Standardize the execution approach, document evidence artifacts, and transition outputs into ongoing utilization/operations within the next quarter.',
          nextStep: 'Assign an owner to compile evidence and standard operating steps within 2 weeks.',
        });
      }

      items.push({
        title: 'Data quality review',
        issue: 'Ambiguities in what counts as “1 reported” can materially distort achievement calculations.',
        action: 'Validate measurement definitions (unit of count, rate vs count, and evidence rules) and recalibrate reporting instructions before the next submission window.',
      });

      // If no high performers exist, we intentionally return only 2 items.
      return items.slice(0, 3);
    })();

    const prescriptiveTextFormatted = prescriptiveItems
      .map((x, idx) => {
        const lines = [
          `${idx + 1}. ${x.title}`,
          `- Issue: ${x.issue}`,
          `- Action: ${x.action}`,
        ];
        if (x.nextStep) lines.push(`- Next Step: ${x.nextStep}`);
        return lines.join('\n');
      })
      .join('\n\n');

    // Build document-level prescriptive analysis JSON for database
    const prescriptiveAnalysisData = {
      documentInsight: documentInsightPlain,
      prescriptiveAnalysis: prescriptiveTextFormatted,
      prescriptiveItems,
      summary: {
        totalActivities: updatedActivities.length,
        metCount: metActivities.length,
        missedCount: missedActivities.length,
        overallAchievement: overallAchievementScore,
      },
      generatedAt: new Date().toISOString(),
    };

    // Update the analysis in the database
    await prisma.qPROAnalysis.update({
      where: { id: analysisId },
      data: {
        activities: updatedActivities,
        achievementScore: overallAchievementScore,
        gaps: JSON.stringify(gapsData),
        alignment: alignmentText,
        opportunities: opportunitiesText,
        recommendations: prescriptiveTextFormatted,
        prescriptiveAnalysis: prescriptiveAnalysisData,
        updatedAt: new Date(),
      },
    });

    // Log final response before sending
    console.log(`[Regenerate] Sending response with ${regeneratedActivities.length} activities:`);
    regeneratedActivities.forEach((act: any, idx: number) => {
      console.log(`  [${idx}] ${act.name} - Target: ${act.target}, Achievement: ${act.achievement?.toFixed(2) || 'N/A'}%`);
    });

    return NextResponse.json({ 
      activities: regeneratedActivities,
      overallAchievementScore,
      gaps: gapsData,
      alignment: alignmentText,
      opportunities: opportunitiesText,
      recommendations: prescriptiveTextFormatted,
      prescriptiveAnalysis: prescriptiveAnalysisData,
    }, { status: 200 });
  } catch (error) {
    console.error('Error regenerating insights:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to regenerate insights',
      },
      { status: 500 }
    );
  }
}
