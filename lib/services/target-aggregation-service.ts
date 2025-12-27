import prisma from '@/lib/prisma';
import { strategicPlanService } from './strategic-plan-service';

interface TimelineData {
  year: number;
  target_value: string | number;
}

export interface TargetMetrics {
  achieved: number | string;
  target: number | string;
  achievementPercent: number;
  status: 'MET' | 'MISSED' | 'ON_TRACK' | 'NOT_APPLICABLE';
  variance: number;
  message: string;
}

export interface AggregationResult {
  kraId: string;
  initiativeId: string;
  year: number;
  quarter: number;
  targetType: string;
  metrics: TargetMetrics;
  participatingUnits: string[];
  submissionCount: number;
}

class TargetAggregationService {
  /**
   * Get target value from strategic plan for a specific year
   */
  private async getTargetValue(
    kraId: string,
    initiativeId: string,
    year: number
  ): Promise<TimelineData | null> {
    try {
      const strategicPlan = await strategicPlanService.getStrategicPlan();
      const kra = strategicPlan.kras.find((k) => k.kra_id === kraId);
      if (!kra) return null;

      const initiative = kra.initiatives.find((i) => i.id === initiativeId);
      if (!initiative) return null;

      const timeline = initiative.targets.timeline_data.find(
        (t) => t.year === year
      );
      return timeline || null;
    } catch (error) {
      console.error('Error fetching target value:', error);
      return null;
    }
  }

  /**
   * Calculate achievement for COUNT type targets
   * Sums all reported values and compares to single target
   */
  private calculateCountAggregation(
    reported: number,
    target: number
  ): TargetMetrics {
    const achievementPercent = (reported / target) * 100;
    const variance = reported - target;

    return {
      achieved: reported,
      target,
      achievementPercent: Math.round(achievementPercent * 100) / 100,
      status:
        achievementPercent >= 100
          ? 'MET'
          : achievementPercent >= 80
            ? 'ON_TRACK'
            : 'MISSED',
      variance,
      message: `${reported}/${target} items achieved (${achievementPercent.toFixed(1)}%)`,
    };
  }

  /**
   * Calculate achievement for PERCENTAGE type targets
   * Compares reported percentage against target percentage
   */
  private calculatePercentageAggregation(
    reported: number,
    target: number
  ): TargetMetrics {
    // Validate reported percentage (0-100)
    if (reported < 0 || reported > 100) {
      return {
        achieved: reported,
        target,
        achievementPercent: 0,
        status: 'NOT_APPLICABLE',
        variance: 0,
        message: `Invalid percentage value: ${reported}% (must be 0-100)`,
      };
    }

    const achievementPercent = (reported / target) * 100;
    const variance = reported - target;

    return {
      achieved: reported,
      target,
      achievementPercent: Math.round(achievementPercent * 100) / 100,
      status:
        reported >= target
          ? 'MET'
          : reported >= target * 0.8
            ? 'ON_TRACK'
            : 'MISSED',
      variance,
      message: `${reported}% / ${target}% target (${achievementPercent.toFixed(1)}% achievement)`,
    };
  }

  /**
   * Calculate achievement for FINANCIAL type targets
   * Compares reported amount against target amount in PHP
   */
  private calculateFinancialAggregation(
    reported: number,
    target: number
  ): TargetMetrics {
    const achievementPercent = (reported / target) * 100;
    const variance = reported - target;

    return {
      achieved: `₱${reported.toLocaleString()}`,
      target: `₱${target.toLocaleString()}`,
      achievementPercent: Math.round(achievementPercent * 100) / 100,
      status:
        achievementPercent >= 100
          ? 'MET'
          : achievementPercent >= 80
            ? 'ON_TRACK'
            : 'MISSED',
      variance,
      message: `₱${reported.toLocaleString()} / ₱${target.toLocaleString()} achieved (${achievementPercent.toFixed(1)}%)`,
    };
  }

  /**
   * Calculate achievement for MILESTONE type targets
   * Binary status: completed (Y/N)
   */
  private calculateMilestoneAggregation(
    reported: string | boolean,
    targetLabel: string
  ): TargetMetrics {
    const isCompleted =
      reported === true ||
      reported === 'yes' ||
      reported === 'completed' ||
      reported === 'YES' ||
      reported === 'true';

    return {
      achieved: isCompleted ? 'Completed' : 'Not Completed',
      target: targetLabel,
      achievementPercent: isCompleted ? 100 : 0,
      status: isCompleted ? 'MET' : 'MISSED',
      variance: 0,
      message: `Milestone: ${targetLabel} - ${isCompleted ? 'COMPLETED' : 'PENDING'}`,
    };
  }

  /**
   * Calculate achievement for TEXT_CONDITION type targets
   * Narrative/qualitative assessment
   */
  private calculateTextConditionAggregation(
    reported: string,
    condition: string
  ): TargetMetrics {
    // Check if reported value matches or satisfies the condition
    const satisfies = reported
      .toLowerCase()
      .includes(condition.toLowerCase());

    return {
      achieved: reported,
      target: condition,
      achievementPercent: satisfies ? 100 : 0,
      status: satisfies ? 'MET' : 'MISSED',
      variance: 0,
      message: `Condition: ${condition} - ${satisfies ? 'SATISFIED' : 'NOT SATISFIED'}`,
    };
  }

  /**
   * Main aggregation method: Determine type and calculate accordingly
   */
  async calculateAggregation(
    kraId: string,
    initiativeId: string,
    year: number,
    reportedValue: number | string | boolean,
    targetType: string
  ): Promise<TargetMetrics> {
    try {
      const timeline = await this.getTargetValue(
        kraId,
        initiativeId,
        year
      );
      if (!timeline) {
        return {
          achieved: typeof reportedValue === 'number' ? reportedValue : 0,
          target: 0,
          achievementPercent: 0,
          status: 'NOT_APPLICABLE',
          variance: 0,
          message: 'Target not found in strategic plan',
        };
      }

      const targetValue = timeline.target_value;

      // Route to appropriate calculation based on target type
      switch (targetType.toLowerCase()) {
        case 'count':
          return this.calculateCountAggregation(
            Number(reportedValue),
            Number(targetValue)
          );

        case 'rate':
        case 'percentage':
          return this.calculatePercentageAggregation(
            Number(reportedValue),
            Number(targetValue)
          );

        case 'snapshot':
          // SNAPSHOT: Latest value only - treat like count for achievement calculation
          return this.calculateCountAggregation(
            Number(reportedValue),
            Number(targetValue)
          );

        case 'financial':
          return this.calculateFinancialAggregation(
            Number(reportedValue),
            Number(targetValue)
          );

        case 'milestone':
          return this.calculateMilestoneAggregation(
            String(reportedValue),
            String(targetValue)
          );

        case 'text_condition':
          return this.calculateTextConditionAggregation(
            String(reportedValue),
            String(targetValue)
          );

        default:
          return {
            achieved: typeof reportedValue === 'number' ? reportedValue : 0,
            target: typeof targetValue === 'number' ? targetValue : 0,
            achievementPercent: 0,
            status: 'NOT_APPLICABLE',
            variance: 0,
            message: `Unknown target type: ${targetType}`,
          };
      }
    } catch (error) {
      console.error('Aggregation calculation error:', error);
      return {
        achieved: typeof reportedValue === 'number' ? reportedValue : 0,
        target: 0,
        achievementPercent: 0,
        status: 'NOT_APPLICABLE',
        variance: 0,
        message: `Error calculating aggregation: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Validate reported value against target type constraints
   */
  async validateReportedValue(
    value: number | string,
    targetType: string
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    switch (targetType.toLowerCase()) {
      case 'count':
        if (typeof value !== 'number' || value < 0 || !Number.isInteger(value)) {
          errors.push('Count must be a non-negative integer');
        }
        break;

      case 'percentage':
        if (typeof value !== 'number' || value < 0 || value > 100) {
          errors.push('Percentage must be between 0 and 100');
        }
        break;

      case 'financial':
        if (typeof value !== 'number' || value < 0) {
          errors.push('Financial amount must be non-negative');
        }
        break;

      case 'milestone':
        if (
          typeof value !== 'string' &&
          typeof value !== 'boolean' &&
          typeof value !== 'number'
        ) {
          errors.push('Milestone must be a status indicator');
        }
        break;

      case 'text_condition':
        if (typeof value !== 'string') {
          errors.push('Text condition must be a string');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Rollup achievements by unit for a specific KRA and period
   */
  async rollupByUnit(
    kraId: string,
    year: number,
    quarter: number
  ): Promise<AggregationResult[]> {
    try {
      // Get all QPRO analyses for this period
      const analyses = await prisma.qPROAnalysis.findMany({
        where: {
          year,
          quarter,
        },
      });

      const results: Map<string, AggregationResult> = new Map();

      // Process each analysis and aggregate by initiative
      for (const analysis of analyses) {
        if (!analysis.kras) continue;

        const kras = Array.isArray(analysis.kras) ? analysis.kras : [analysis.kras];

        for (const kraData of kras) {
          const kraIdMatch = (kraData as any).kraId || (kraData as any).id;
          if (kraIdMatch !== kraId) continue;

          const activities = (kraData as any).activities || [];
          for (const activity of activities) {
            const key = `${kraIdMatch}-${(activity as any).initiativeId}`;

            if (!results.has(key)) {
              results.set(key, {
                kraId: kraIdMatch,
                initiativeId: (activity as any).initiativeId,
                year,
                quarter,
                targetType: (activity as any).targetType || 'count',
                metrics: {
                  achieved: 0,
                  target: (activity as any).target,
                  achievementPercent: 0,
                  status: 'ON_TRACK',
                  variance: 0,
                  message: '',
                },
                participatingUnits: analysis.unitId ? [analysis.unitId] : [],
                submissionCount: 1,
              });
            } else {
              const existing = results.get(key)!;
              if (
                analysis.unitId &&
                !existing.participatingUnits.includes(analysis.unitId)
              ) {
                existing.participatingUnits.push(analysis.unitId);
              }
              existing.submissionCount += 1;
            }
          }
        }
      }

      return Array.from(results.values());
    } catch (error) {
      console.error('Rollup by unit error:', error);
      return [];
    }
  }

  /**
   * Get aggregation status across all KRAs for a period
   */
  async getUniversitySummary(
    year: number,
    quarter: number
  ): Promise<{
    totalKRAs: number;
    metKRAs: number;
    missedKRAs: number;
    onTrackKRAs: number;
    overallAchievementPercent: number;
  }> {
    try {
      const analyses = await prisma.qPROAnalysis.findMany({
        where: { year, quarter },
      });

      let totalKRAs = 0;
      let metCount = 0;
      let missedCount = 0;
      let onTrackCount = 0;
      let totalAchievement = 0;

      const kraSet = new Set<string>();

      for (const analysis of analyses) {
        if (!analysis.kras) continue;

        const kras = Array.isArray(analysis.kras) ? analysis.kras : [analysis.kras];
        for (const kra of kras) {
          const kraId = (kra as any).kraId || (kra as any).id;
          kraSet.add(kraId);

          const status = (kra as any).status;
          if (status === 'MET') metCount++;
          else if (status === 'MISSED') missedCount++;
          else if (status === 'ON_TRACK') onTrackCount++;

          totalAchievement += (kra as any).achievement || 0;
        }
      }

      totalKRAs = kraSet.size;
      const overallAchievementPercent =
        totalKRAs > 0 ? totalAchievement / totalKRAs : 0;

      return {
        totalKRAs,
        metKRAs: metCount,
        missedKRAs: missedCount,
        onTrackKRAs: onTrackCount,
        overallAchievementPercent: Math.round(overallAchievementPercent * 100) / 100,
      };
    } catch (error) {
      console.error('University summary error:', error);
      return {
        totalKRAs: 0,
        metKRAs: 0,
        missedKRAs: 0,
        onTrackKRAs: 0,
        overallAchievementPercent: 0,
      };
    }
  }
}

export const targetAggregationService = new TargetAggregationService();
export default targetAggregationService;
