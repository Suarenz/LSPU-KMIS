/**
 * Script to add target_time_scope: "cumulative" to KPIs that have range targets
 * spanning 2025-2029 (contributions should carry forward across years).
 * 
 * Run: npx tsx scripts/add-cumulative-target-scope.ts
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
 * Determine if a KPI should be cumulative based on its target pattern.
 * 
 * Cumulative KPIs are those where:
 * 1. The target is a progressive goal (60% → 70% → 80% → 90% → 100%) where
 *    2025 contributions count toward all subsequent years
 * 2. The target represents a maintained state (e.g., "100%" across all years
 *    meaning once achieved, it should stay achieved)
 * 3. Milestone type targets that represent progressive achievements
 * 
 * NOT cumulative:
 * - COUNT targets where each year has independent production goals
 *   (e.g., "6 systems per year" means 6 NEW systems each year)
 */
function shouldBeCumulative(initiative: Initiative): { isCumulative: boolean; reason: string } {
  const type = initiative.targets.type.toLowerCase();
  const timeline = initiative.targets.timeline_data || [];
  const outputs = (initiative.key_performance_indicator?.outputs || '').toLowerCase();
  
  // Already marked
  if (initiative.targets.target_time_scope === 'cumulative') {
    return { isCumulative: true, reason: 'Already marked cumulative' };
  }
  
  // Get numeric target values
  const values = timeline.map(t => {
    const v = t.target_value;
    return typeof v === 'number' ? v : parseFloat(String(v)) || 0;
  });
  
  // Check if it's a progressive percentage target (60 → 70 → 80 → 90 → 100)
  // This pattern indicates cumulative progress toward a goal
  const isProgressivePercentage = (
    type === 'percentage' &&
    values.length >= 3 &&
    values.every((v, i) => i === 0 || v >= values[i - 1]) && // Monotonically increasing
    values[values.length - 1] === 100 // Ends at 100%
  );
  
  if (isProgressivePercentage) {
    return { isCumulative: true, reason: 'Progressive percentage toward 100%' };
  }
  
  // Check for maintained rate targets (same value across all years)
  // e.g., 95% satisfaction rating maintained throughout 2025-2029
  const allSameValue = values.length >= 3 && values.every(v => v === values[0]);
  const isMaintainedRate = (
    (type === 'percentage' || type === 'rate') &&
    allSameValue &&
    values[0] >= 90 // High threshold indicates maintained standard
  );
  
  if (isMaintainedRate) {
    return { isCumulative: true, reason: `Maintained ${values[0]}% rate across all years` };
  }
  
  // Milestone types that represent progressive achievements
  // (Planning → Development → Implementation)
  if (type === 'milestone' || type === 'text_condition') {
    // Check if it's a progressive milestone sequence
    const stringValues = timeline.map(t => String(t.target_value).toLowerCase());
    const hasProgression = (
      stringValues.some(v => v.includes('planning') || v.includes('initial')) &&
      stringValues.some(v => v.includes('implementation') || v.includes('completion') || v.includes('approved'))
    );
    
    if (hasProgression) {
      return { isCumulative: true, reason: 'Progressive milestone sequence' };
    }
    
    // If all milestone values are the same, it's a maintained state
    if (allSameValue || stringValues.every(v => v === stringValues[0])) {
      return { isCumulative: true, reason: 'Maintained milestone state' };
    }
  }
  
  // Check for specific keywords in outputs that indicate cumulative nature
  const cumulativeKeywords = [
    'utilization rate',
    'budget utilization',
    'compliance',
    'accreditation',
    'certification',
    'zero incidence',
    'established',
    'functional',
    'operational'
  ];
  
  const hasCumulativeKeyword = cumulativeKeywords.some(kw => outputs.includes(kw));
  if (hasCumulativeKeyword && (type === 'percentage' || type === 'milestone' || type === 'text_condition')) {
    return { isCumulative: true, reason: `Output indicates cumulative goal: "${outputs.substring(0, 50)}..."` };
  }
  
  // Default: annual (each year's contributions are independent)
  return { isCumulative: false, reason: 'Annual independent targets' };
}

async function main() {
  console.log('📋 Analyzing strategic plan for cumulative target KPIs...\n');
  
  // Read strategic plan
  const content = fs.readFileSync(STRATEGIC_PLAN_PATH, 'utf-8');
  const plan: StrategicPlan = JSON.parse(content);
  
  const cumulativeKPIs: Array<{ id: string; kra: string; reason: string; outputs: string }> = [];
  const annualKPIs: Array<{ id: string; kra: string; reason: string }> = [];
  let updatedCount = 0;
  
  // Analyze each KPI
  for (const kra of plan.kras) {
    for (const initiative of kra.initiatives) {
      const analysis = shouldBeCumulative(initiative);
      
      if (analysis.isCumulative) {
        cumulativeKPIs.push({
          id: initiative.id,
          kra: kra.kra_id,
          reason: analysis.reason,
          outputs: initiative.key_performance_indicator?.outputs?.substring(0, 60) || ''
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
  console.log('                    CUMULATIVE TARGET KPIs                      ');
  console.log('   (Contributions from earlier years carry forward)            ');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  for (const kpi of cumulativeKPIs) {
    console.log(`✅ ${kpi.id} (${kpi.kra})`);
    console.log(`   Reason: ${kpi.reason}`);
    console.log(`   Outputs: ${kpi.outputs}...`);
    console.log('');
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                      ANNUAL TARGET KPIs                        ');
  console.log('   (Each year has independent targets)                         ');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log(`Total: ${annualKPIs.length} KPIs remain as annual targets\n`);
  
  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                          SUMMARY                               ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Total KPIs analyzed: ${cumulativeKPIs.length + annualKPIs.length}`);
  console.log(`  Cumulative KPIs: ${cumulativeKPIs.length}`);
  console.log(`  Annual KPIs: ${annualKPIs.length}`);
  console.log(`  KPIs updated: ${updatedCount}`);
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  if (updatedCount > 0) {
    // Write updated strategic plan
    fs.writeFileSync(STRATEGIC_PLAN_PATH, JSON.stringify(plan, null, 2), 'utf-8');
    console.log(`✅ Updated strategic_plan.json with ${updatedCount} cumulative KPIs`);
    console.log('\nKPIs marked as cumulative:');
    cumulativeKPIs.forEach(kpi => {
      console.log(`  - ${kpi.id}: ${kpi.reason}`);
    });
  } else {
    console.log('ℹ️  No changes needed - all cumulative KPIs already marked');
  }
}

main().catch(console.error);
