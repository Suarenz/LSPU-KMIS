import fs from 'fs/promises';
import path from 'path';

interface TimelineData {
  year: number;
  target_value: string | number;
}

interface Target {
  type: string;
  unit_basis?: string;
  currency?: string;
  timeline_data: TimelineData[];
}

interface Initiative {
  id: string;
  key_performance_indicator: {
    outputs: string;
    outcomes: string | string[];
  };
  strategies: string[];
  programs_activities: string[];
  responsible_offices: string[];
  targets: Target;
}

interface KRA {
  kra_id: string;
  kra_title: string;
  guiding_principle: string;
  initiatives: Initiative[];
}

interface StrategicPlan {
  strategic_plan_meta: {
    university: string;
    period: string;
    vision: string;
    total_kras: number;
  };
  kras: KRA[];
}

class StrategicPlanService {
  private cachedPlan: StrategicPlan | null = null;

  async getStrategicPlan(): Promise<StrategicPlan> {
    // Return cached plan if available
    if (this.cachedPlan) {
      return this.cachedPlan;
    }

    try {
      const filePath = path.join(process.cwd(), 'strategic_plan.json');
      const fileContent = await fs.readFile(filePath, 'utf-8');
      this.cachedPlan = JSON.parse(fileContent) as StrategicPlan;
      return this.cachedPlan;
    } catch (error) {
      console.error('Error loading strategic plan:', error);
      throw new Error('Failed to load strategic plan');
    }
  }

  async getKRA(kraId: string): Promise<KRA | null> {
    const plan = await this.getStrategicPlan();
    return plan.kras.find((k) => k.kra_id === kraId) || null;
  }

  async getInitiative(
    kraId: string,
    initiativeId: string
  ): Promise<Initiative | null> {
    const kra = await this.getKRA(kraId);
    if (!kra) return null;
    return kra.initiatives.find((i) => i.id === initiativeId) || null;
  }

  async getTargetType(
    kraId: string,
    initiativeId: string
  ): Promise<string | null> {
    const initiative = await this.getInitiative(kraId, initiativeId);
    if (!initiative) return null;
    return initiative.targets.type;
  }

  /**
   * Get all KRAs with their target types
   */
  async getAllKRAsWithTypes(): Promise<
    Array<{
      kraId: string;
      kraTitle: string;
      initiativeId: string;
      targetType: string;
    }>
  > {
    const plan = await this.getStrategicPlan();
    const result = [];

    for (const kra of plan.kras) {
      for (const initiative of kra.initiatives) {
        result.push({
          kraId: kra.kra_id,
          kraTitle: kra.kra_title,
          initiativeId: initiative.id,
          targetType: initiative.targets.type,
        });
      }
    }

    return result;
  }

  /**
   * Invalidate cache (call after updating strategic plan)
   */
  invalidateCache(): void {
    this.cachedPlan = null;
  }
}

export const strategicPlanService = new StrategicPlanService();
export default strategicPlanService;
