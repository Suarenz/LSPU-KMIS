/**
 * Script to add target_time_scope: "cumulative" to KPIs that have ONLY a 2029 target
 * (i.e., range targets for the entire 2025-2029 period).
 * 
 * This does NOT modify the timeline_data - we keep the original single 2029 entry.
 * The cumulative logic will use that 2029 target for all years.
 * 
 * Run: npx tsx scripts/mark-cumulative-range-targets.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRATEGIC_PLAN_PATH = path.join(__dirname, '..', 'lib', 'data', 'strategic_plan.json');

interface TimelineData {
  year: number;
  target_value: number | string;
}

interface Target {
  type: string;
  target_time_scope?: 'annual' | 'cumulative';
  timeline_data: TimelineData[];
  [key: string]: any;
}

interface Initiative {
  id: string;
  key_performance_indicator: {
    outputs: string;
    outcomes?: string | string[];
  };
  targets: Target;
  [key: string]: any;
}

interface KRA {
  kra_id: string;
  kra_title: string;
  initiatives: Initiative[];
  [key: string]: any;
}

interface StrategicPlan {
  strategic_plan_meta: any;
  kras: KRA[];
}

/**
 * Determine if a KPI should be cumulative based on its target structure.
 * 
 * A KPI is cumulative if:
 * 1. It has ONLY a 2029 target (meaning the target is for the entire 2025-2029 period)
 * 2. OR it has identical targets across all years (maintained state)
 */
function shouldBeCumulative(initiative: Initiative): { isCumulative: boolean; reason: string } {
  const timeline = initiative.targets.timeline_data || [];
  
  // Already marked
  if (initiative.targets.target_time_scope === 'cumulative') {
    return { isCumulative: true, reason: 'Already marked cumulative' };
  }
  
  // Check if it ONLY has a 2029 target (range target for 2025-2029)
  if (timeline.length === 1 && timeline[0].year === 2029) {
    return { isCumulative: true, reason: 'Single 2029 target (range target for 2025-2029)' };
  }
  
  // Check if all values are identical (maintained state across years)
  if (timeline.length > 1) {
    const firstValue = timeline[0].target_value;
    const allSame = timeline.every(t => t.target_value === firstValue);
    if (allSame) {
      return { isCumulative: true, reason: `Maintained target (${firstValue}) across all years` };
    }
  }
  
  // Default: annual (each year has different independent targets)
  return { isCumulative: false, reason: 'Annual targets (different values per year)' };
}

async function main() {
  console.log('📋 Analyzing strategic plan for cumulative range targets...\n');
  console.log('NOTE: This script only adds target_time_scope field, it does NOT modify timeline_data.\n');
  
  // Read strategic plan
  const content = fs.readFileSync(STRATEGIC_PLAN_PATH, 'utf-8');
  const plan: StrategicPlan = JSON.parse(content);
  
  const cumulativeKPIs: Array<{ id: string; kra: string; reason: string; outputs: string; timeline: string }> = [];
  const annualKPIs: Array<{ id: string; kra: string; reason: string }> = [];
  let updatedCount = 0;
  
  // Analyze each KPI
  for (const kra of plan.kras) {
    for (const initiative of kra.initiatives) {
      const analysis = shouldBeCumulative(initiative);
      const timeline = initiative.targets.timeline_data || [];
      const timelineStr = timeline.map(t => `${t.year}:${t.target_value}`).join(', ');
      
      if (analysis.isCumulative) {
        cumulativeKPIs.push({
          id: initiative.id,
          kra: kra.kra_id,
          reason: analysis.reason,
          outputs: initiative.key_performance_indicator?.outputs?.substring(0, 50) || '',
          timeline: timelineStr
        });
        
        // Update the initiative if not already marked
        if (initiative.targets.target_time_scope !== 'cumulative') {
          initiative.targets.target_time_scope = 'cumulative';
          updatedCount++;
        }
      } else {
        annualKPIs.push({
          id: initiative.id,
          kra: kra.kra_id,
          reason: analysis.reason
        });
      }
    }
  }
  
  // Display results
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    CUMULATIVE RANGE TARGETS                    ');
  console.log('   (Contributions from ALL years count toward the 2029 goal)   ');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  for (const kpi of cumulativeKPIs) {
    console.log(`✅ ${kpi.id} (${kpi.kra})`);
    console.log(`   Timeline: ${kpi.timeline}`);
    console.log(`   Reason: ${kpi.reason}`);
    console.log(`   Outputs: ${kpi.outputs}...`);
    console.log('');
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                      ANNUAL TARGET KPIs                        ');
  console.log('   (Each year has independent targets)                         ');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log(`Total: ${annualKPIs.length} KPIs have annual targets\n`);
  for (const kpi of annualKPIs.slice(0, 10)) {
    console.log(`  - ${kpi.id} (${kpi.kra})`);
  }
  if (annualKPIs.length > 10) {
    console.log(`  ... and ${annualKPIs.length - 10} more`);
  }
  
  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                          SUMMARY                               ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Total KPIs analyzed: ${cumulativeKPIs.length + annualKPIs.length}`);
  console.log(`  Cumulative (range) KPIs: ${cumulativeKPIs.length}`);
  console.log(`  Annual KPIs: ${annualKPIs.length}`);
  console.log(`  KPIs updated: ${updatedCount}`);
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  if (updatedCount > 0) {
    // Write updated strategic plan
    fs.writeFileSync(STRATEGIC_PLAN_PATH, JSON.stringify(plan, null, 2), 'utf-8');
    console.log(`✅ Updated strategic_plan.json with ${updatedCount} cumulative KPIs`);
  } else {
    console.log('ℹ️  No changes needed');
  }
  
  // Clean up temp file if exists
  const tempFile = path.join(__dirname, '..', 'temp_original.json');
  if (fs.existsSync(tempFile)) {
    fs.unlinkSync(tempFile);
  }
}

main().catch(console.error);
