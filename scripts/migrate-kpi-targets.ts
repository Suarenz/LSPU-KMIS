/**
 * ACTUAL MIGRATION: Migrate KPI targets from strategic_plan.json to database
 * 
 * This script populates the kpi_targets table with quarterly targets for all KPIs
 * from 2025-2029 based on the strategic plan JSON data.
 * 
 * IMPORTANT: Review the dry-run output first!
 * Run: npx tsx scripts/migrate-kpi-targets.ts
 */

import { PrismaClient } from '@prisma/client';
import strategicPlan from '../lib/data/strategic_plan.json';

const prisma = new PrismaClient();

type TargetType = 'COUNT' | 'SNAPSHOT' | 'RATE' | 'PERCENTAGE' | 'MILESTONE' | 'FINANCIAL' | 'TEXT_CONDITION';

interface KPITargetRecord {
  kra_id: string;
  initiative_id: string;
  year: number;
  quarter: number;
  target_value: number;
  target_type: TargetType;
  description: string;
}

/**
 * Detect KPI target type based on keywords (same as dry-run)
 */
function detectTargetType(kpi: any, kraTitle: string): { type: TargetType; warnings: string[] } {
  const outputs = String(kpi.key_performance_indicator?.outputs || '').toLowerCase();
  const outcomes = String(kpi.key_performance_indicator?.outcomes || '').toLowerCase();
  const kpiId = String(kpi.id || '');
  const combinedText = `${outputs} ${outcomes} ${kraTitle}`.toLowerCase();
  
  const warnings: string[] = [];
  
  // Priority 1: BOOLEAN/MILESTONE keywords
  const booleanKeywords = ['certified', 'status', 'compliant', 'compliance', 'approved', 'accredited', 'audit'];
  if (booleanKeywords.some(kw => combinedText.includes(kw))) {
    return { type: 'MILESTONE', warnings };
  }
  
  // Priority 2: RATE keywords
  const rateKeywords = ['%', 'rate', 'score', 'satisfaction', 'rating', 'percentage', 'average'];
  if (rateKeywords.some(kw => combinedText.includes(kw))) {
    return { type: 'RATE', warnings };
  }
  
  // Priority 3: SNAPSHOT keywords
  const snapshotKeywords = ['faculty', 'student', 'population', 'active', 'existing', 'current', 'enrolled'];
  const snapshotPhrases = [
    'number of active',
    'number of faculty',
    'number of student',
    'student population',
    'faculty count'
  ];
  
  if (snapshotKeywords.some(kw => combinedText.includes(kw)) || 
      snapshotPhrases.some(phrase => combinedText.includes(phrase))) {
    return { type: 'SNAPSHOT', warnings };
  }
  
  // Priority 4: COUNT
  const countKeywords = ['number of', 'research', 'output', 'generated', 'training', 'event', 'publication', 'graduate'];
  if (countKeywords.some(kw => combinedText.includes(kw))) {
    return { type: 'COUNT', warnings };
  }
  
  // Fallback: COUNT with warning
  warnings.push(`No clear type keywords found - defaulted to COUNT`);
  return { type: 'COUNT', warnings };
}

/**
 * Calculate quarterly targets based on type and annual target
 */
function calculateQuarterlyTargets(annualTarget: number | string, targetType: TargetType): (number | null)[] {
  const annual = typeof annualTarget === 'number' ? annualTarget : parseFloat(String(annualTarget));
  
  if (!Number.isFinite(annual)) {
    return [null, null, null, null];
  }
  
  switch (targetType) {
    case 'COUNT':
      // For COUNT targets, if annual < 4, place entire target in Q4
      // Otherwise, distribute evenly across quarters
      if (annual < 4) {
        return [0, 0, 0, annual];
      }
      const quarterlyCount = Math.round(annual / 4);
      return [quarterlyCount, quarterlyCount, quarterlyCount, quarterlyCount];
    
    case 'RATE':
    case 'PERCENTAGE':
    case 'SNAPSHOT':
      return [annual, annual, annual, annual];
    
    case 'MILESTONE':
    case 'TEXT_CONDITION':
      return [null, null, null, annual];
    
    case 'FINANCIAL':
      const quarterlyFinancial = annual / 4;
      return [quarterlyFinancial, quarterlyFinancial, quarterlyFinancial, quarterlyFinancial];
    
    default:
      return [null, null, null, null];
  }
}

async function migrateKPITargets() {
  console.log('========================================');
  console.log('  ACTUAL MIGRATION: KPI Targets');
  console.log('========================================\n');
  
  const allKras = (strategicPlan as any).kras || [];
  let totalInserted = 0;
  let skippedNonNumeric = 0;
  let errors = 0;
  
  // Get default system user for created_by (use first admin)
  const systemUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });
  
  if (!systemUser) {
    console.error('❌ No ADMIN user found. Please create a default admin first.');
    process.exit(1);
  }
  
  console.log(`✓ Using system user: ${systemUser.email} (${systemUser.id})\n`);
  
  // Clear existing targets (optional - comment out if you want to keep existing data)
  console.log('🗑️  Clearing existing KPI targets...');
  const deleteResult = await prisma.kPITarget.deleteMany({});
  console.log(`   Deleted ${deleteResult.count} existing records\n`);
  
  for (const kra of allKras) {
    console.log(`\n📊 Processing ${kra.kra_id}: ${kra.kra_title}`);
    
    for (const initiative of kra.initiatives || []) {
      const detection = detectTargetType(initiative, kra.kra_title);
      const description = String(initiative.key_performance_indicator?.outputs || '').substring(0, 500);
      
      // Process timeline data
      const timelineData = initiative.targets?.timeline_data || [];
      for (const yearData of timelineData) {
        if (yearData.year < 2025) continue; // Only 2025+
        
        const annualTarget = yearData.target_value;
        const quarterlyTargets = calculateQuarterlyTargets(annualTarget, detection.type);
        
        // Insert quarterly records
        for (let quarter = 1; quarter <= 4; quarter++) {
          const targetValue = quarterlyTargets[quarter - 1];
          
          if (targetValue === null) {
            continue; // Skip null targets (e.g., MILESTONE Q1-Q3)
          }
          
          try {
            await prisma.kPITarget.create({
              data: {
                kra_id: kra.kra_id,
                initiative_id: initiative.id,
                year: yearData.year,
                quarter,
                target_value: targetValue,
                target_type: detection.type,
                description,
                created_by: systemUser.id,
                updated_by: systemUser.id
              }
            });
            
            totalInserted++;
            
            if (totalInserted % 100 === 0) {
              process.stdout.write(`   Inserted ${totalInserted} records...\r`);
            }
          } catch (error: any) {
            console.error(`\n   ❌ Error inserting ${initiative.id} Q${quarter} ${yearData.year}: ${error.message}`);
            errors++;
          }
        }
      }
    }
  }
  
  console.log('\n\n========================================');
  console.log('           MIGRATION COMPLETE');
  console.log('========================================');
  console.log(`✅ Total Records Inserted: ${totalInserted}`);
  console.log(`⏭️  Skipped Non-Numeric: ${skippedNonNumeric}`);
  console.log(`❌ Errors: ${errors}`);
  console.log('========================================\n');
  
  // Verify the migration
  console.log('🔍 Verifying migration...\n');
  
  const typeCounts = await prisma.kPITarget.groupBy({
    by: ['target_type'],
    _count: true
  });
  
  console.log('Target Type Distribution:');
  typeCounts.forEach(({ target_type, _count }) => {
    console.log(`  ${target_type.padEnd(15)} : ${_count} records`);
  });
  
  // Check KRA3-KPI5 specifically
  console.log('\n🔍 Checking KRA3-KPI5 (Employment Rate):');
  const kra3kpi5Targets = await prisma.kPITarget.findMany({
    where: {
      kra_id: 'KRA 3',
      initiative_id: 'KRA3-KPI5'
    },
    orderBy: [{ year: 'asc' }, { quarter: 'asc' }]
  });
  
  if (kra3kpi5Targets.length > 0) {
    console.log(`  Found ${kra3kpi5Targets.length} quarterly targets`);
    console.log(`  Type: ${kra3kpi5Targets[0].target_type}`);
    console.log(`  2025 Q1 target: ${kra3kpi5Targets[0].target_value}%`);
  } else {
    console.log('  ⚠️  No targets found for KRA3-KPI5');
  }
  
  await prisma.$disconnect();
}

migrateKPITargets().catch((error) => {
  console.error('Fatal error:', error);
  prisma.$disconnect();
  process.exit(1);
});
