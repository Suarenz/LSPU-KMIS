import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const strategicPlan = JSON.parse(fs.readFileSync(path.join(__dirname, '../lib/data/strategic_plan.json'), 'utf-8'));

async function main() {
  console.log('=== Adding KRA5-KPI11 and KRA5-KPI12 to Database ===\n');

  // Find KRA5 in strategic plan
  const kra5 = strategicPlan.kras.find((k: any) => k.kra_id === 'KRA 5');
  if (!kra5) {
    console.error('KRA 5 not found in strategic plan!');
    return;
  }

  // Find KPI11 and KPI12
  const kpi11 = kra5.initiatives.find((i: any) => i.id === 'KRA5-KPI11');
  const kpi12 = kra5.initiatives.find((i: any) => i.id === 'KRA5-KPI12');

  if (!kpi11 || !kpi12) {
    console.error('KPI11 or KPI12 not found in strategic plan!');
    return;
  }

  console.log('Found KPI11:', kpi11.key_performance_indicator.outputs);
  console.log('Found KPI12:', kpi12.key_performance_indicator.outputs);
  console.log();

  const kpisToAdd = [
    { id: 'KRA5-KPI11', data: kpi11 },
    { id: 'KRA5-KPI12', data: kpi12 }
  ];

  for (const kpi of kpisToAdd) {
    console.log(`\n--- Processing ${kpi.id} ---`);
    
    // Check if records already exist
    const existing = await prisma.kRAggregation.findMany({
      where: { initiative_id: kpi.id },
      select: { year: true, quarter: true }
    });

    if (existing.length > 0) {
      console.log(`⚠️  Found ${existing.length} existing records. Skipping to avoid duplicates.`);
      console.log('   If you want to recreate them, delete existing records first.');
      continue;
    }

    const targetType = kpi.data.targets.type.toUpperCase();
    const timelineData = kpi.data.targets.timeline_data;
    const isPercentage = targetType === 'PERCENTAGE';
    
    console.log(`Target Type: ${targetType}`);
    console.log(`Timeline Data:`, timelineData.map((t: any) => `${t.year}=${t.target_value}`).join(', '));

    // Create records for each year and quarter
    const recordsToCreate = [];
    
    for (const timeline of timelineData) {
      const year = timeline.year;
      const targetValue = timeline.target_value;
      
      // Create 4 quarters for each year
      for (let quarter = 1; quarter <= 4; quarter++) {
        recordsToCreate.push({
          kra_id: 'KRA 5',
          initiative_id: kpi.id,
          year: year,
          quarter: quarter,
          target_type: targetType,
          target_value: targetValue,
          current_value: '0',
          achievement_percent: 0,
          status: 'NOT_APPLICABLE',
          submission_count: 0,
          participating_units: [],
          manual_override: null,
          manual_override_reason: null,
          manual_override_by: null,
          manual_override_at: null,
        });
      }
    }

    console.log(`Creating ${recordsToCreate.length} records (${timelineData.length} years × 4 quarters)...`);

    // Insert all records
    const result = await prisma.kRAggregation.createMany({
      data: recordsToCreate,
      skipDuplicates: true,
    });

    console.log(`✅ Successfully created ${result.count} records for ${kpi.id}`);
  }

  console.log('\n=== Verification ===');
  
  for (const kpi of kpisToAdd) {
    const count = await prisma.kRAggregation.count({
      where: { initiative_id: kpi.id }
    });
    console.log(`${kpi.id}: ${count} records in database`);
    
    // Show sample records
    const samples = await prisma.kRAggregation.findMany({
      where: { initiative_id: kpi.id },
      select: {
        year: true,
        quarter: true,
        target_value: true,
        target_type: true,
        current_value: true,
      },
      orderBy: [{ year: 'asc' }, { quarter: 'asc' }],
      take: 4,
    });
    
    console.log('  Sample records:');
    for (const s of samples) {
      console.log(`    ${s.year} Q${s.quarter}: target=${s.target_value}, type=${s.target_type}, current=${s.current_value}`);
    }
  }

  console.log('\n✅ Setup complete! The new KPIs are now ready to use in the system.');
  console.log('You can now:');
  console.log('  1. View them in the dashboard/repository');
  console.log('  2. Add manual overrides via the QPRO interface');
  console.log('  3. Submit documents that contribute to these KPIs');

  await prisma.$disconnect();
}

main().catch(console.error);
