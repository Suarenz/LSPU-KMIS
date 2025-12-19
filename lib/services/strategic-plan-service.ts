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
      // Try multiple resolution strategies for the strategic plan JSON:
      // 1. Module-relative (this file's directory -> ../data)
      // 2. Workspace-relative (process.cwd()/lib/data)
      // 3. Workspace root fallback (process.cwd()/strategic_plan.json)
      const strategies: string[] = [];

      try {
        // import.meta.url -> file path for this module (works in ESM)
        // URL -> file path conversion ensures Windows paths are handled
        // Use dynamic require of 'url' only inside try to avoid TypeScript runtime issues
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { fileURLToPath } = require('url');
        const modulePath = fileURLToPath((module as any).url || (module as any).__filename || '');
        if (modulePath) {
          const moduleDir = path.dirname(modulePath);
          strategies.push(path.join(moduleDir, '..', 'data', 'strategic_plan.json'));
        }
      } catch (err) {
        // ignore and continue with other strategies
      }

      strategies.push(path.join(process.cwd(), 'lib', 'data', 'strategic_plan.json'));
      strategies.push(path.join(process.cwd(), 'strategic_plan.json'));

      let fileContent: string | null = null;
      let lastErr: any = null;
      for (const p of strategies) {
        try {
          await fs.access(p);
          fileContent = await fs.readFile(p, 'utf-8');
          break;
        } catch (err) {
          lastErr = err;
        }
      }

      if (!fileContent) {
        throw lastErr || new Error('strategic_plan.json not found');
      }

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
