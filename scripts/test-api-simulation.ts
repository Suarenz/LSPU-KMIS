// Test the KPI progress API by calling it directly with a mock user context
// This simulates what the API does internally to debug the cumulative issue
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const strategicPlan = JSON.parse(fs.readFileSync(path.join(__dirname, '../lib/data/strategic_plan.json'), 'utf-8'));

function normalizeKraId(id: string): string {
  const match = String(id).match(/KRA\s*(\d+)/i);
  if (match) return `KRA ${match[1]}`;
  return id;
}

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

async function main() {
  const year = 2026;
  const quarter = 1;
  const STRATEGIC_PLAN_START_YEAR = 2025;
  
  console.log(`=== Simulating API call for year=${year}, quarter=${quarter}, kraId=KRA3 ===\n`);
  
  // 1. Fetch aggregations (same as API)
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
  
  // 2. Build cumulative aggregates
  type CumulativeData = {
    total: number;
    count: number;
    targetType: string;
    latestValue: number;
    latestAt: Date;
    isCumulative: boolean;
    contributingYears: Set<number>;
  };
  
  const cumulativeAggregates = new Map<string, CumulativeData>();
  const processedCumulativeKPIs = new Set<string>();
  
  for (const agg of kraAggregations) {
    const kraMapKey = normalizeKraId(agg.kra_id);
    const isCumulative = isCumulativeTarget(strategicPlan, kraMapKey, agg.initiative_id);
    
    if (!isCumulative) continue;
    
    const cumulativeKey = `${kraMapKey}|${agg.initiative_id}|${agg.quarter}`;
    
    if (agg.year < year) {
      // Prior year - same logic as API
      const hasManualOverride = agg.manual_override !== null && agg.manual_override !== undefined;
      if (hasManualOverride) {
        const manualValue = agg.manual_override?.toNumber() ?? 0;
        const existing = cumulativeAggregates.get(cumulativeKey);
        if (!existing) {
          cumulativeAggregates.set(cumulativeKey, {
            total: manualValue,
            count: 1,
            targetType: (agg.target_type as string) || 'count',
            latestValue: manualValue,
            latestAt: agg.manual_override_at || new Date(),
            isCumulative: true,
            contributingYears: new Set([agg.year]),
          });
        } else {
          existing.total += manualValue;
          existing.count += 1;
          existing.contributingYears.add(agg.year);
        }
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
          targetType: (agg.target_type as string) || 'count',
          latestValue: manualValue,
          latestAt: agg.manual_override_at || new Date(),
          isCumulative: true,
          contributingYears: new Set(hasManualOverride && manualValue > 0 ? [agg.year] : []),
        });
      } else {
        // Only add if value > 0
        if (hasManualOverride && manualValue > 0) {
          existing.total += manualValue;
          existing.contributingYears.add(agg.year);
          existing.count += 1;
        }
        // Otherwise keep existing total (this is the key fix!)
      }
    }
  }
  
  console.log(`\n=== Cumulative Aggregates Built ===`);
  for (const [key, data] of cumulativeAggregates) {
    console.log(`${key}: total=${data.total}, targetType=${data.targetType}, years=${Array.from(data.contributingYears).join(',')}`);
  }
  
  // 3. Simulate "HANDLE CUMULATIVE KPIs" section
  console.log(`\n=== Creating Entries for Cumulative KPIs ===`);
  
  for (const [cumulativeKey, cumulativeData] of cumulativeAggregates) {
    const [kraIdKey, initiativeId, quarterStr] = cumulativeKey.split('|');
    const contribQuarter = parseInt(quarterStr);
    
    // Check if already processed (for our simulation, none are)
    const trackingKey = `${kraIdKey}|${initiativeId}|${contribQuarter}`;
    if (processedCumulativeKPIs.has(trackingKey)) {
      console.log(`  Skipping ${initiativeId} - already processed`);
      continue;
    }
    
    // Calculate final value based on type
    const targetTypeUpper = cumulativeData.targetType.toUpperCase();
    let finalValue: number;
    
    if (targetTypeUpper === 'PERCENTAGE') {
      finalValue = Math.min(100, cumulativeData.total);
    } else {
      finalValue = cumulativeData.total;
    }
    
    console.log(`\n  Creating entry for ${initiativeId}:`);
    console.log(`    year: ${year}`);
    console.log(`    quarter: ${contribQuarter}`);
    console.log(`    currentValue: ${finalValue}`);
    console.log(`    targetType: ${targetTypeUpper}`);
    console.log(`    contributingYears: ${Array.from(cumulativeData.contributingYears).join(',')}`);
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
