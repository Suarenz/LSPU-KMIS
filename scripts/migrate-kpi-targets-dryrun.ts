/**
 * DRY RUN: Migrate KPI targets from strategic_plan.json to database
 * 
 * This script analyzes the strategic plan and detects KPI types based on keywords,
 * then prints the results to console WITHOUT saving to the database.
 * 
 * Review the output carefully for 5 minutes before running the actual migration.
 * 
 * Run: npx tsx scripts/migrate-kpi-targets-dryrun.ts
 */

import strategicPlan from '../lib/data/strategic_plan.json';

type TargetType = 'COUNT' | 'SNAPSHOT' | 'RATE' | 'PERCENTAGE' | 'MILESTONE' | 'FINANCIAL' | 'TEXT_CONDITION';

interface KPITargetRecord {
  kra_id: string;
  initiative_id: string;
  year: number;
  quarter: number | null;
  target_value: number | string;
  target_type: TargetType;
  description: string;
  detectionMethod: string;
  warnings: string[];
}

/**
 * Detect KPI target type based on keywords in outputs/outcomes/name
 * Priority: BOOLEAN/MILESTONE → RATE → SNAPSHOT → COUNT (default)
 */
function detectTargetType(kpi: any, kraTitle: string): { type: TargetType; method: string; warnings: string[] } {
  const outputs = String(kpi.key_performance_indicator?.outputs || '').toLowerCase();
  const outcomes = String(kpi.key_performance_indicator?.outcomes || '').toLowerCase();
  const kpiId = String(kpi.id || '');
  const combinedText = `${outputs} ${outcomes} ${kraTitle}`.toLowerCase();
  
  const warnings: string[] = [];
  
  // Priority 1: BOOLEAN/MILESTONE keywords
  const booleanKeywords = ['certified', 'status', 'compliant', 'compliance', 'approved', 'accredited', 'audit'];
  if (booleanKeywords.some(kw => combinedText.includes(kw))) {
    return { type: 'MILESTONE', method: 'Boolean keywords detected', warnings };
  }
  
  // Priority 2: RATE keywords (percentage-based metrics that should be averaged)
  const rateKeywords = ['%', 'rate', 'score', 'satisfaction', 'rating', 'percentage', 'average'];
  if (rateKeywords.some(kw => combinedText.includes(kw))) {
    return { type: 'RATE', method: 'Rate keywords detected', warnings };
  }
  
  // Priority 3: SNAPSHOT keywords (point-in-time counts, NOT cumulative)
  const snapshotKeywords = ['faculty', 'student', 'population', 'active', 'existing', 'current', 'enrolled'];
  // Also check for phrases like "number of [existing items]"
  const snapshotPhrases = [
    'number of active',
    'number of faculty',
    'number of student',
    'student population',
    'faculty count'
  ];
  
  if (snapshotKeywords.some(kw => combinedText.includes(kw)) || 
      snapshotPhrases.some(phrase => combinedText.includes(phrase))) {
    return { type: 'SNAPSHOT', method: 'Snapshot keywords detected', warnings };
  }
  
  // Priority 4: COUNT (default for production/output metrics)
  const countKeywords = ['number of', 'research', 'output', 'generated', 'training', 'event', 'publication', 'graduate'];
  if (countKeywords.some(kw => combinedText.includes(kw))) {
    return { type: 'COUNT', method: 'Count keywords detected', warnings };
  }
  
  // Fallback: Default to COUNT with warning
  warnings.push(`[WARNING] No clear type keywords found - defaulted to COUNT. Please verify.`);
  return { type: 'COUNT', method: 'Default (no keywords matched)', warnings };
}

/**
 * Calculate quarterly targets based on type and annual target
 */
function calculateQuarterlyTargets(annualTarget: number | string, targetType: TargetType): (number | null)[] {
  const annual = typeof annualTarget === 'number' ? annualTarget : parseFloat(String(annualTarget));
  
  if (!Number.isFinite(annual)) {
    // Non-numeric targets (text) - return nulls for quarters, only annual
    return [null, null, null, null];
  }
  
  switch (targetType) {
    case 'COUNT':
      // Production KPIs: divide by 4 (linear trajectory)
      const quarterlyCount = Math.round(annual / 4);
      return [quarterlyCount, quarterlyCount, quarterlyCount, quarterlyCount];
    
    case 'RATE':
    case 'PERCENTAGE':
    case 'SNAPSHOT':
      // Rates and snapshots: copy annual target to all quarters (maintain same level)
      return [annual, annual, annual, annual];
    
    case 'MILESTONE':
    case 'TEXT_CONDITION':
      // Milestones: only end-load to Q4
      return [null, null, null, annual];
    
    case 'FINANCIAL':
      // Financial: divide by 4 for quarterly budgets
      const quarterlyFinancial = annual / 4;
      return [quarterlyFinancial, quarterlyFinancial, quarterlyFinancial, quarterlyFinancial];
    
    default:
      return [null, null, null, null];
  }
}

async function dryRunMigration() {
  console.log('========================================');
  console.log('  DRY RUN: KPI Target Type Detection');
  console.log('========================================\n');
  
  const allKras = (strategicPlan as any).kras || [];
  const allRecords: KPITargetRecord[] = [];
  const typeCounts: Record<string, number> = {};
  const warnings: string[] = [];
  
  for (const kra of allKras) {
    console.log(`\n📊 ${kra.kra_id}: ${kra.kra_title}`);
    console.log('─'.repeat(80));
    
    for (const initiative of kra.initiatives || []) {
      const detection = detectTargetType(initiative, kra.kra_title);
      typeCounts[detection.type] = (typeCounts[detection.type] || 0) + 1;
      
      console.log(`\n  KPI: ${initiative.id}`);
      console.log(`  Output: ${initiative.key_performance_indicator?.outputs || 'N/A'}`);
      console.log(`  ✓ Detected Type: ${detection.type} (${detection.method})`);
      
      if (detection.warnings.length > 0) {
        detection.warnings.forEach(w => console.log(`    ${w}`));
        warnings.push(`${initiative.id}: ${detection.warnings.join(', ')}`);
      }
      
      // Process timeline data
      const timelineData = initiative.targets?.timeline_data || [];
      for (const yearData of timelineData) {
        if (yearData.year < 2025) continue; // Only 2025+
        
        const annualTarget = yearData.target_value;
        const quarterlyTargets = calculateQuarterlyTargets(annualTarget, detection.type);
        
        console.log(`    Year ${yearData.year}: Annual = ${annualTarget}`);
        console.log(`      Quarterly: Q1=${quarterlyTargets[0]} | Q2=${quarterlyTargets[1]} | Q3=${quarterlyTargets[2]} | Q4=${quarterlyTargets[3]}`);
        
        // Store records (but don't save to DB)
        [1, 2, 3, 4].forEach((quarter, idx) => {
          if (quarterlyTargets[idx] !== null) {
            allRecords.push({
              kra_id: kra.kra_id,
              initiative_id: initiative.id,
              year: yearData.year,
              quarter,
              target_value: quarterlyTargets[idx]!,
              target_type: detection.type,
              description: initiative.key_performance_indicator?.outputs || '',
              detectionMethod: detection.method,
              warnings: detection.warnings
            });
          }
        });
      }
    }
  }
  
  // Summary
  console.log('\n\n========================================');
  console.log('           SUMMARY REPORT');
  console.log('========================================\n');
  
  console.log('📈 Type Distribution:');
  Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
    console.log(`  ${type.padEnd(15)} : ${count} KPIs`);
  });
  
  console.log(`\n📋 Total Records to Create: ${allRecords.length}`);
  console.log(`   (Quarterly targets for ${allRecords.length / 4} KPI-year combinations)`);
  
  if (warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${warnings.length}):`);
    warnings.slice(0, 10).forEach(w => console.log(`   - ${w}`));
    if (warnings.length > 10) {
      console.log(`   ... and ${warnings.length - 10} more warnings`);
    }
  }
  
  console.log('\n========================================');
  console.log('         DRY RUN COMPLETE');
  console.log('========================================');
  console.log('\n📝 Review the output above carefully.');
  console.log('   - Check that COUNT/SNAPSHOT/RATE types are correct');
  console.log('   - Verify quarterly target calculations');
  console.log('   - Address any warnings');
  console.log('\n✅ If everything looks good, run:');
  console.log('   npx tsx scripts/migrate-kpi-targets.ts');
  console.log('\n');
}

dryRunMigration().catch(console.error);
