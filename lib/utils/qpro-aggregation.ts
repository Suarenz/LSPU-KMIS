export type TargetScope = 'INSTITUTIONAL' | 'PER_UNIT';

export type TargetType = 'count' | 'percentage' | 'financial' | 'milestone' | 'text_condition' | string;

export interface TimelineDatum {
  year: number;
  target_value: string | number;
}

export interface InitiativeLike {
  id: string;
  key_performance_indicator?: {
    outputs?: string;
    outcomes?: string | string[];
  };
  targets?: {
    type?: TargetType;
    unit_basis?: string;
    target_scope?: TargetScope;
    timeline_data?: TimelineDatum[];
  };
}

export interface StrategicPlanLike {
  kras?: Array<{
    kra_id: string;
    kra_title?: string;
    initiatives?: InitiativeLike[];
  }>;
}

export function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const cleaned = String(value).replace(/,/g, '').trim();
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getTargetValueForYear(timeline: any[] | undefined, year: number): number | null {
  if (!Array.isArray(timeline) || timeline.length === 0) return null;

  const exact = timeline.find((t: any) => Number(t?.year) === year);
  const exactValue = toNumberOrNull(exact?.target_value);
  if (exactValue !== null) return exactValue;

  const candidates = timeline
    .map((t: any) => ({ year: Number(t?.year), target: toNumberOrNull(t?.target_value) }))
    .filter((t: any) => Number.isFinite(t.year) && t.target !== null) as Array<{ year: number; target: number }>;

  const pastOrEqual = candidates.filter((t) => t.year <= year).sort((a, b) => b.year - a.year);
  if (pastOrEqual.length > 0) return pastOrEqual[0].target;

  const future = candidates.sort((a, b) => a.year - b.year);
  return future.length > 0 ? future[0].target : null;
}

export function normalizeInitiativeId(id: string): string {
  return String(id || '').replace(/\s+/g, '');
}

/**
 * Normalize KRA ID by removing extra spaces and ensuring consistent format.
 * Handles: "KRA5", "KRA 5", "KRA  5" → "KRA 5" (canonical format in strategic_plan.json)
 */
export function normalizeKraId(kraId: string): string {
  const cleaned = String(kraId || '').trim().replace(/\s+/g, ' ');
  // Match "KRA" followed by number(s), normalize to "KRA {number}"
  const match = cleaned.match(/^KRA\s*(\d+)$/i);
  if (match) {
    return `KRA ${match[1]}`;
  }
  return cleaned;
}

export function findInitiative(
  plan: StrategicPlanLike,
  kraId: string,
  initiativeId: string | undefined | null
): InitiativeLike | null {
  if (!kraId || !initiativeId) return null;
  const kras = plan?.kras || [];
  const normalizedKraId = normalizeKraId(kraId);
  const kra = kras.find((k) => normalizeKraId(k.kra_id) === normalizedKraId);
  if (!kra?.initiatives) return null;

  const normalizedId = normalizeInitiativeId(String(initiativeId));
  let initiative = kra.initiatives.find((i) => normalizeInitiativeId(String(i.id)) === normalizedId);

  if (!initiative) {
    const kpiMatch = String(initiativeId).match(/KPI(\d+)/i);
    if (kpiMatch) {
      initiative = kra.initiatives.find((i) => String(i.id).includes(`KPI${kpiMatch[1]}`));
    }
  }

  return initiative || null;
}

export function getInitiativeTargetMeta(
  plan: StrategicPlanLike,
  kraId: string,
  initiativeId: string | undefined | null,
  year: number
): {
  targetType: TargetType | null;
  targetValue: number | null;
  targetScope: TargetScope;
  unitBasis: string | null;
} {
  const initiative = findInitiative(plan, kraId, initiativeId);
  const targetType = initiative?.targets?.type ?? null;
  const unitBasis = typeof initiative?.targets?.unit_basis === 'string' ? initiative.targets.unit_basis : null;

  // IMPORTANT DEFAULT:
  // If strategic_plan.json doesn't explicitly specify scope, treat targets as INSTITUTIONAL
  // to prevent accidental inflation (e.g., multiplying by activities/programs).
  const targetScope: TargetScope = initiative?.targets?.target_scope === 'PER_UNIT' ? 'PER_UNIT' : 'INSTITUTIONAL';

  const timeline = (initiative?.targets?.timeline_data || []) as any[];
  const targetValue = getTargetValueForYear(timeline, year);

  return { targetType, targetValue, targetScope, unitBasis };
}

export interface ActivityValueLike {
  reported?: number | string | null;
  target?: number | string | null;
  dataType?: string | null;
  initiativeId?: string | null;
}

export function sumNumbers(values: Array<number | null | undefined>): number {
  return values.reduce<number>(
    (acc, v) => acc + (typeof v === 'number' && Number.isFinite(v) ? v : 0),
    0
  );
}

export function averageNumbers(values: Array<number | null | undefined>): number {
  const nums = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  if (nums.length === 0) return 0;
  return nums.reduce<number>((acc, n) => acc + n, 0) / nums.length;
}

export function computeAggregatedAchievement(args: {
  targetType: TargetType | null;
  targetValue: number;
  targetScope?: TargetScope;
  unitMultiplier?: number;
  activities: ActivityValueLike[];
}): {
  totalReported: number;
  totalTarget: number;
  achievementPercent: number;
} {
  const {
    targetType,
    targetValue,
    targetScope = 'INSTITUTIONAL',
    unitMultiplier,
    activities,
  } = args;

  const normalizedType = String(targetType || '').toLowerCase();

  // IMPORTANT: targets are applied ONCE per KPI by default.
  // If a KPI explicitly declares PER_UNIT scope, callers should pass a true unitMultiplier
  // (e.g., number of programs/units). We intentionally default to 1 (not activities.length)
  // because an activity count is not the same as a unit count.
  const effectiveTarget =
    targetScope === 'PER_UNIT'
      ? targetValue * (typeof unitMultiplier === 'number' && Number.isFinite(unitMultiplier) ? unitMultiplier : 1)
      : targetValue;

  // Rate metrics: use mean reported against single target
  if (normalizedType === 'percentage') {
    // Percent KPIs need special handling:
    // - If reported is already 0..100, use it.
    // - If reported is a count (e.g., 154 employed) and activity.target is a denominator (e.g., 200 graduates),
    //   convert to percent: (reported/target)*100.
    // - Ignore invalid values we can't normalize (prevents nonsense like 154% being treated as a percent).
    const toNormalizedPercent = (a: ActivityValueLike): number | null => {
      const reported = toNumberOrNull(a.reported);
      if (reported === null) return null;

      // Already a valid percent
      if (reported >= 0 && reported <= 100) return reported;

      // Try to normalize count/denominator into a percent
      const denom = toNumberOrNull(a.target);
      if (denom !== null && denom > 0 && reported >= 0) {
        const pct = (reported / denom) * 100;
        if (pct >= 0 && pct <= 100) return pct;
      }

      return null;
    };

    const avgReported = averageNumbers(activities.map(toNormalizedPercent));
    const achievementPercent = effectiveTarget > 0 ? (avgReported / effectiveTarget) * 100 : 0;
    return { totalReported: avgReported, totalTarget: effectiveTarget, achievementPercent };
  }

  // Financial and counts: additive
  if (normalizedType === 'financial' || normalizedType === 'count') {
    const sumReported = sumNumbers(activities.map((a) => toNumberOrNull(a.reported)));
    const achievementPercent = effectiveTarget > 0 ? (sumReported / effectiveTarget) * 100 : 0;
    return { totalReported: sumReported, totalTarget: effectiveTarget, achievementPercent };
  }

  // Milestone / text_condition: interpret as completed if any reported is truthy
  if (normalizedType === 'milestone' || normalizedType === 'text_condition') {
    const anyReported = activities.some((a) => {
      const v = a.reported;
      if (typeof v === 'number') return v > 0;
      if (typeof v === 'string') return v.trim().length > 0;
      return false;
    });
    const achievementPercent = anyReported ? 100 : 0;
    return { totalReported: anyReported ? 1 : 0, totalTarget: 1, achievementPercent };
  }

  // Default: treat as additive numeric
  const sumReported = sumNumbers(activities.map((a) => toNumberOrNull(a.reported)));
  const achievementPercent = effectiveTarget > 0 ? (sumReported / effectiveTarget) * 100 : 0;
  return { totalReported: sumReported, totalTarget: effectiveTarget, achievementPercent };
}
