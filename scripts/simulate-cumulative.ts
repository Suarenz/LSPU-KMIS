// Simulates the cumulative aggregation logic
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const strategicPlan = JSON.parse(fs.readFileSync(path.join(__dirname, '../lib/data/strategic_plan.json'), 'utf-8'));

// Inline implementation of isCumulativeTarget
function normalizeInitiativeId(id: string | null | undefined): string {
  if (!id) return '';
  return String(id).trim().toUpperCase().replace(/\s+/g, '');
}

function isCumulativeTarget(plan: any, kraId: string, initiativeId: string): boolean {
  const normalizedKra = String(kraId).toUpperCase().replace(/\s+/g, '');
  const normalizedInit = normalizeInitiativeId(initiativeId);
  
  const kra = plan.kras?.find((k: any) => {
    const kId = String(k.kra_id || '').toUpperCase().replace(/\s+/g, '');
    return kId === normalizedKra || kId === normalizedKra.replace(' ', '');
  });
  
  if (!kra) return false;
  
  const initiative = kra.initiatives?.find((i: any) => {
    const iId = normalizeInitiativeId(i.id);
    return iId === normalizedInit || iId.includes(normalizedInit) || normalizedInit.includes(iId);
  });
  
  if (!initiative?.targets) return false;
  
  const scope = initiative.targets.target_time_scope;
  return scope === 'cumulative' || scope === 'Cumulative';
}

const prisma = new PrismaClient();

function normalizeKraId(id: string): string {
  const match = String(id).match(/KRA\s*(\d+)/i);
  if (match) {
    return `KRA ${match[1]}`;
  }
  return id;
}

async function main() {
  const year = 2026;
  const quarter = 1;
  const STRATEGIC_PLAN_START_YEAR = 2025;
  
  // Fetch aggregations (same as API)
  const kraAggregations = await prisma.kRAggregation.findMany({
    where: {
      year: { gte: STRATEGIC_PLAN_START_YEAR, lte: year },
      quarter: quarter,
      kra_id: { in: ['KRA3', 'KRA 3', 'kra3', 'kra 3'] },
    },
    orderBy: [
      { year: 'asc' },
      { quarter: 'asc' },
    ],
  });
  
  console.log(`Found ${kraAggregations.length} KRAggregation rows`);
  
  const cumulativeAggregates = new Map<string, {
    total: number;
    count: number;
    contributingYears: Set<number>;
  }>();
  
  for (const agg of kraAggregations) {
    const kraMapKey = normalizeKraId(agg.kra_id);
    const isCumulative = isCumulativeTarget(strategicPlan as any, kraMapKey, agg.initiative_id);
    
    console.log(`\nProcessing: ${agg.initiative_id} Year ${agg.year} Q${agg.quarter}`);
    console.log(`  isCumulative: ${isCumulative}`);
    console.log(`  manual_override: ${agg.manual_override}`);
    
    if (!isCumulative) {
      console.log(`  -> Skipping (not cumulative)`);
      continue;
    }
    
    const cumulativeKey = `${kraMapKey}|${agg.initiative_id}|${agg.quarter}`;
    
    if (agg.year < year) {
      // Prior year
      const hasManualOverride = agg.manual_override !== null && agg.manual_override !== undefined;
      if (hasManualOverride) {
        const manualValue = agg.manual_override?.toNumber() ?? 0;
        const existing = cumulativeAggregates.get(cumulativeKey);
        if (!existing) {
          cumulativeAggregates.set(cumulativeKey, {
            total: manualValue,
            count: 1,
            contributingYears: new Set([agg.year]),
          });
          console.log(`  -> Created cumulative aggregate: total=${manualValue}`);
        } else {
          existing.total += manualValue;
          existing.contributingYears.add(agg.year);
          console.log(`  -> Added to cumulative aggregate: total=${existing.total}`);
        }
      } else {
        console.log(`  -> No manual override, skipping`);
      }
    } else if (agg.year === year) {
      // Current year
      const hasManualOverride = agg.manual_override !== null && agg.manual_override !== undefined;
      const manualValue = hasManualOverride ? (agg.manual_override?.toNumber() ?? 0) : 0;
      
      const existing = cumulativeAggregates.get(cumulativeKey);
      if (!existing) {
        cumulativeAggregates.set(cumulativeKey, {
          total: manualValue,
          count: hasManualOverride ? 1 : 0,
          contributingYears: new Set(hasManualOverride && manualValue > 0 ? [agg.year] : []),
        });
        console.log(`  -> Created cumulative aggregate for current year: total=${manualValue}`);
      } else {
        // Only add if value > 0
        if (hasManualOverride && manualValue > 0) {
          existing.total += manualValue;
          existing.contributingYears.add(agg.year);
          console.log(`  -> Added to cumulative aggregate: total=${existing.total}`);
        } else {
          console.log(`  -> Current year value is 0, keeping existing total=${existing.total}`);
        }
      }
    }
  }
  
  console.log('\n=== Cumulative Aggregates ===');
  for (const [key, data] of cumulativeAggregates) {
    console.log(`${key}: total=${data.total}, years=${Array.from(data.contributingYears).join(',')}`);
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
