/**
 * Script to check what KPI Progress API returns for a specific KPI
 * 
 * Run: npx tsx scripts/check-kpi-progress-api.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== KPI Progress Data Check ===\n');
  
  const year = 2025;
  const quarter = 1;
  const kraId = 'KRA 3';
  const initiativeId = 'KRA3-KPI5';

  // 1. Check KPIContribution records
  console.log('1. KPIContribution Records:');
  const contributions = await prisma.kPIContribution.findMany({
    where: { initiative_id: initiativeId, year, quarter }
  });
  
  let total = 0;
  for (const c of contributions) {
    console.log(`   - value=${c.value}, target_type=${c.target_type}`);
    total += c.value;
  }
  console.log(`   Total: ${total}, Count: ${contributions.length}`);
  
  // For RATE type, API should return average
  const avgValue = contributions.length > 0 ? total / contributions.length : 0;
  console.log(`   Expected currentValue (RATE average): ${avgValue}`);

  // 2. Check KRAggregation record
  console.log('\n2. KRAggregation Record:');
  const agg = await prisma.kRAggregation.findFirst({
    where: { initiative_id: initiativeId, year, quarter }
  });
  
  if (agg) {
    console.log(`   - total_reported: ${agg.total_reported}`);
    console.log(`   - submission_count: ${agg.submission_count}`);
    console.log(`   - target_type: ${agg.target_type}`);
    console.log(`   - target_value: ${agg.target_value}`);
    console.log(`   - achievement_percent: ${agg.achievement_percent}`);
    
    // For RATE type, achievement = (average / target) * 100
    const expectedAchievement = agg.target_value ? (avgValue / Number(agg.target_value)) * 100 : 0;
    console.log(`   Expected achievement (avg/target*100): ${expectedAchievement.toFixed(2)}%`);
  } else {
    console.log('   NOT FOUND!');
  }

  // 3. Simulate what kpi-progress API should calculate
  console.log('\n3. Simulated API Response:');
  
  // From contributionTotals (how API builds it)
  const contributionData = {
    total: total,
    count: contributions.length,
    targetType: contributions[0]?.target_type || 'count',
    latestValue: contributions[0]?.value || 0,
  };
  
  // Calculate finalContribValue like the API does
  let finalContribValue: number;
  const targetType = contributionData.targetType.toUpperCase();
  
  if (targetType === 'SNAPSHOT' || targetType === 'MILESTONE' || targetType === 'BOOLEAN' || targetType === 'TEXT_CONDITION') {
    finalContribValue = contributionData.latestValue;
  } else if (targetType === 'RATE' || targetType === 'PERCENTAGE') {
    finalContribValue = contributionData.count > 0 ? Math.round(contributionData.total / contributionData.count) : 0;
  } else {
    finalContribValue = contributionData.total;
  }
  
  console.log(`   Target Type: ${targetType}`);
  console.log(`   finalContribValue (currentValue): ${finalContribValue}`);
  
  // Calculate achievement
  const targetValue = agg?.target_value ? Number(agg.target_value) : 73;
  const achievement = targetValue > 0 ? (finalContribValue / targetValue) * 100 : 0;
  console.log(`   Achievement: ${finalContribValue} / ${targetValue} * 100 = ${achievement.toFixed(2)}%`);

  console.log('\n=== EXPECTED UI DISPLAY ===');
  console.log(`Current Value: ${finalContribValue}%`);
  console.log(`Target Value: ${targetValue}%`);
  console.log(`Progress Bar Fill: ${achievement.toFixed(2)}% of bar width`);
  console.log(`Progress Bar Label: "${finalContribValue}% / ${targetValue}%"`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
