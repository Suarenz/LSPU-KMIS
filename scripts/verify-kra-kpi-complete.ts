/**
 * Complete KRA-KPI Verification Script
 * 
 * This script performs a comprehensive audit of all KRAs and KPIs:
 * 1. Verifies every KRA has the correct number of KPIs
 * 2. Verifies all KPI IDs match their parent KRA
 * 3. Validates annual targets for each year (2025-2029)
 * 4. Identifies missing or misconfigured data
 * 
 * Run with: npx tsx scripts/verify-kra-kpi-complete.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the strategic plan
const strategicPlanPath = path.join(__dirname, '../lib/data/strategic_plan.json');
const strategicPlan = JSON.parse(fs.readFileSync(strategicPlanPath, 'utf-8'));

// Types
interface TimelineData {
  year: number;
  target_value: string | number;
  note?: string;
}

interface Target {
  type: string;
  unit_basis?: string;
  currency?: string;
  note?: string;
  timeline_data: TimelineData[];
}

interface Initiative {
  id: string;
  key_performance_indicator: {
    outputs: string;
    outcomes: string | string[];
  };
  strategies: string | string[];
  programs_activities: string | string[];
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

// Helper function to extract KRA number from KPI ID
function extractKraNumberFromKpiId(kpiId: string): number | null {
  const match = kpiId.match(/^KRA(\d+)-KPI\d+$/);
  return match ? parseInt(match[1], 10) : null;
}

// Helper function to extract KRA number from KRA ID
function extractKraNumber(kraId: string): number | null {
  const match = kraId.match(/^KRA\s*(\d+)$/i);
  return match ? parseInt(match[1], 10) : null;
}

// Main verification function
function verifyStrategicPlan(plan: StrategicPlan): void {
  console.log('\n' + '='.repeat(80));
  console.log('           COMPLETE KRA-KPI VERIFICATION REPORT');
  console.log('='.repeat(80));
  console.log(`\nUniversity: ${plan.strategic_plan_meta.university}`);
  console.log(`Period: ${plan.strategic_plan_meta.period}`);
  console.log(`Expected Total KRAs: ${plan.strategic_plan_meta.total_kras}`);
  console.log(`Actual KRAs Found: ${plan.kras.length}`);
  
  const allYears = [2025, 2026, 2027, 2028, 2029];
  
  let totalKpis = 0;
  let kpisWithAllYears = 0;
  let kpisWithMissingYears = 0;
  let kpisWithMismatchedKra = 0;
  const issues: string[] = [];
  const missingKraKpiDetails: string[] = [];
  
  // Track all KPIs per KRA
  const kraKpiMap: Map<number, string[]> = new Map();
  
  console.log('\n' + '-'.repeat(80));
  console.log('DETAILED KRA & KPI BREAKDOWN');
  console.log('-'.repeat(80));
  
  for (const kra of plan.kras) {
    const kraNum = extractKraNumber(kra.kra_id);
    console.log(`\n${'▓'.repeat(80)}`);
    console.log(`▓ ${kra.kra_id}: ${kra.kra_title}`);
    console.log(`▓ Guiding Principle: ${kra.guiding_principle}`);
    console.log(`▓ Total KPIs in this KRA: ${kra.initiatives.length}`);
    console.log(`${'▓'.repeat(80)}`);
    
    const kpiIds: string[] = [];
    
    for (const initiative of kra.initiatives) {
      totalKpis++;
      kpiIds.push(initiative.id);
      
      // Extract KRA number from KPI ID
      const kpiKraNum = extractKraNumberFromKpiId(initiative.id);
      
      // Validate KPI ID matches parent KRA
      if (kraNum !== null && kpiKraNum !== null && kraNum !== kpiKraNum) {
        kpisWithMismatchedKra++;
        issues.push(`❌ ${initiative.id} is under ${kra.kra_id} but ID suggests KRA ${kpiKraNum}`);
      }
      
      // Get target info
      const targetType = initiative.targets?.type || 'UNKNOWN';
      const timelineData = initiative.targets?.timeline_data || [];
      
      // Check which years have targets
      const yearsWithTargets = timelineData.map(t => t.year);
      const missingYears = allYears.filter(y => !yearsWithTargets.includes(y));
      
      // Display KPI details
      console.log(`\n  ┌─ ${initiative.id}`);
      console.log(`  │  Type: ${targetType}${initiative.targets?.unit_basis ? ` (${initiative.targets.unit_basis})` : ''}`);
      
      // Truncate outputs for readability
      const outputs = typeof initiative.key_performance_indicator.outputs === 'string' 
        ? initiative.key_performance_indicator.outputs.substring(0, 80) 
        : String(initiative.key_performance_indicator.outputs).substring(0, 80);
      console.log(`  │  Output: ${outputs}${outputs.length >= 80 ? '...' : ''}`);
      
      // Display annual targets in a table format
      console.log(`  │`);
      console.log(`  │  Annual Targets:`);
      console.log(`  │  ┌${'─'.repeat(12)}┬${'─'.repeat(25)}┬${'─'.repeat(20)}┐`);
      console.log(`  │  │    Year    │        Target           │       Notes        │`);
      console.log(`  │  ├${'─'.repeat(12)}┼${'─'.repeat(25)}┼${'─'.repeat(20)}┤`);
      
      for (const year of allYears) {
        const targetEntry = timelineData.find(t => t.year === year);
        if (targetEntry) {
          let targetStr = String(targetEntry.target_value);
          if (targetType === 'financial' && typeof targetEntry.target_value === 'number') {
            targetStr = new Intl.NumberFormat('en-PH', { 
              style: 'currency', 
              currency: initiative.targets?.currency || 'PHP',
              maximumFractionDigits: 0 
            }).format(targetEntry.target_value);
          } else if (targetType === 'percentage' && typeof targetEntry.target_value === 'number') {
            targetStr = `${targetEntry.target_value}%`;
          }
          
          // Truncate if too long
          targetStr = targetStr.length > 23 ? targetStr.substring(0, 20) + '...' : targetStr;
          const noteStr = targetEntry.note ? (targetEntry.note.length > 18 ? targetEntry.note.substring(0, 15) + '...' : targetEntry.note) : '';
          
          console.log(`  │  │    ${year}    │ ${targetStr.padEnd(23)} │ ${noteStr.padEnd(18)} │`);
        } else {
          console.log(`  │  │    ${year}    │ ${'⚠️ MISSING'.padEnd(23)} │ ${''.padEnd(18)} │`);
        }
      }
      console.log(`  │  └${'─'.repeat(12)}┴${'─'.repeat(25)}┴${'─'.repeat(20)}┘`);
      
      // Track issues
      if (missingYears.length > 0) {
        kpisWithMissingYears++;
        const issueMsg = `${initiative.id}: Missing targets for years: ${missingYears.join(', ')}`;
        issues.push(issueMsg);
        missingKraKpiDetails.push(`  - ${initiative.id} in ${kra.kra_id}: No target for ${missingYears.join(', ')}`);
      } else {
        kpisWithAllYears++;
      }
      
      // Validate target values are not null/undefined
      for (const td of timelineData) {
        if (td.target_value === null || td.target_value === undefined) {
          issues.push(`${initiative.id}: Year ${td.year} has null/undefined target value`);
        }
      }
      
      console.log(`  └─`);
    }
    
    if (kraNum !== null) {
      kraKpiMap.set(kraNum, kpiIds);
    }
  }
  
  // Summary Section
  console.log('\n' + '='.repeat(80));
  console.log('                              SUMMARY');
  console.log('='.repeat(80));
  
  console.log(`\n📊 KRA Statistics:`);
  console.log(`   • Expected KRAs: ${plan.strategic_plan_meta.total_kras}`);
  console.log(`   • Found KRAs: ${plan.kras.length}`);
  console.log(`   • Status: ${plan.kras.length === plan.strategic_plan_meta.total_kras ? '✅ Match' : '❌ Mismatch'}`);
  
  console.log(`\n📊 KPI Statistics:`);
  console.log(`   • Total KPIs: ${totalKpis}`);
  console.log(`   • KPIs with complete targets (2025-2029): ${kpisWithAllYears}`);
  console.log(`   • KPIs with missing years: ${kpisWithMissingYears}`);
  console.log(`   • KPIs with mismatched KRA ID: ${kpisWithMismatchedKra}`);
  
  // KPIs per KRA breakdown
  console.log(`\n📊 KPIs per KRA:`);
  console.log('   ┌' + '─'.repeat(12) + '┬' + '─'.repeat(10) + '┬' + '─'.repeat(50) + '┐');
  console.log(`   │    KRA     │   Count  │                    KPI IDs                       │`);
  console.log('   ├' + '─'.repeat(12) + '┼' + '─'.repeat(10) + '┼' + '─'.repeat(50) + '┤');
  
  for (let i = 1; i <= 22; i++) {
    const kpis = kraKpiMap.get(i) || [];
    const kpiStr = kpis.length > 0 ? kpis.join(', ') : '(none found)';
    const truncatedKpis = kpiStr.length > 48 ? kpiStr.substring(0, 45) + '...' : kpiStr;
    console.log(`   │   KRA ${i.toString().padStart(2)}   │    ${kpis.length.toString().padStart(2)}    │ ${truncatedKpis.padEnd(48)} │`);
  }
  console.log('   └' + '─'.repeat(12) + '┴' + '─'.repeat(10) + '┴' + '─'.repeat(50) + '┘');
  
  // Issues Section
  if (issues.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('                         ⚠️  ISSUES FOUND');
    console.log('='.repeat(80));
    
    console.log('\n🔴 KPIs with Missing Annual Targets:');
    if (missingKraKpiDetails.length > 0) {
      for (const detail of missingKraKpiDetails) {
        console.log(detail);
      }
    } else {
      console.log('   None');
    }
    
    console.log('\n🔴 Other Issues:');
    const otherIssues = issues.filter(i => !i.includes('Missing targets'));
    if (otherIssues.length > 0) {
      for (const issue of otherIssues) {
        console.log(`   ${issue}`);
      }
    } else {
      console.log('   None');
    }
  } else {
    console.log('\n✅ No issues found! All KRAs and KPIs are properly configured.');
  }
  
  // Target Type Summary
  console.log('\n' + '='.repeat(80));
  console.log('                    TARGET TYPE DISTRIBUTION');
  console.log('='.repeat(80));
  
  const typeCounts: Map<string, number> = new Map();
  for (const kra of plan.kras) {
    for (const initiative of kra.initiatives) {
      const type = initiative.targets?.type || 'unknown';
      typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    }
  }
  
  console.log('\n   Type Distribution:');
  for (const [type, count] of Array.from(typeCounts.entries()).sort((a, b) => b[1] - a[1])) {
    const bar = '█'.repeat(Math.ceil(count / 2));
    console.log(`   • ${type.padEnd(15)}: ${count.toString().padStart(3)} ${bar}`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('                        END OF REPORT');
  console.log('='.repeat(80) + '\n');
}

// Run the verification
verifyStrategicPlan(strategicPlan as StrategicPlan);
