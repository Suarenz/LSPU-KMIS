// Test script to debug KPI Progress API
// Run with: npx tsx scripts/test-kpi-progress-api.ts

import prisma from '../lib/prisma';
import strategicPlan from '../lib/data/strategic_plan.json';

async function main() {
  console.log('=== Testing KPI Progress Data Flow ===\n');
  
  // 1. Check KPIContribution records
  const contributions = await prisma.kPIContribution.findMany({
    where: {
      kra_id: { in: ['KRA 3', 'KRA3'] },
      initiative_id: 'KRA3-KPI5',
      year: 2025,
    },
    orderBy: { created_at: 'desc' },
  });
  
  console.log('1. KPIContribution records:');
  contributions.forEach((c) => {
    console.log(`   - id=${c.id}, value=${c.value}, quarter=${c.quarter}, target_type=${c.target_type}`);
  });
  
  if (contributions.length === 0) {
    console.log('   ⚠️ No KPIContribution records found!');
    process.exit(1);
  }
  
  // 2. Check KRAggregation record
  const aggregation = await prisma.kRAggregation.findFirst({
    where: {
      initiative_id: 'KRA3-KPI5',
      year: 2025,
    },
  });
  
  console.log('\n2. KRAggregation record:');
  if (aggregation) {
    console.log(`   - id=${aggregation.id}`);
    console.log(`   - kra_id=${aggregation.kra_id}`);
    console.log(`   - total_reported=${aggregation.total_reported}`);
    console.log(`   - target_value=${aggregation.target_value?.toString()}`);
    console.log(`   - achievement_percent=${aggregation.achievement_percent?.toString()}`);
    console.log(`   - status=${aggregation.status}`);
  } else {
    console.log('   ⚠️ No KRAggregation record found!');
  }
  
  // 3. Check strategic plan data
  const kras = (strategicPlan as any).kras || (strategicPlan as any).KRAs || [];
  
  console.log('\n3. Strategic Plan lookup:');
  const kra = kras.find((k: any) => {
    const kraId = k.kra_id || k.kraId;
    return kraId === 'KRA 3' || kraId === 'KRA3';
  });
  
  if (kra) {
    console.log(`   - Found KRA: ${kra.kra_id || kra.kraId} - ${kra.kra_title || kra.kraTitle}`);
    
    const initiative = kra.initiatives?.find((i: any) => i.id === 'KRA3-KPI5');
    if (initiative) {
      console.log(`   - Found Initiative: ${initiative.id} - ${initiative.indicator}`);
      console.log(`   - Target type: ${initiative.targets?.target_type}`);
      
      const timeline2025 = initiative.targets?.timeline_data?.find((t: any) => t.year === 2025);
      if (timeline2025) {
        console.log(`   - 2025 target_value: ${timeline2025.target_value}`);
      } else {
        console.log('   ⚠️ No 2025 timeline data found!');
      }
    } else {
      console.log('   ⚠️ Initiative KRA3-KPI5 not found!');
    }
  } else {
    console.log('   ⚠️ KRA 3 not found in strategic plan!');
  }
  
  // 4. Expected calculation
  console.log('\n4. Expected KPI Progress Calculation:');
  const contribution = contributions[0];
  const targetValue = kra?.initiatives?.find((i: any) => i.id === 'KRA3-KPI5')?.targets?.timeline_data?.find((t: any) => t.year === 2025)?.target_value || 0;
  
  console.log(`   - Contribution value: ${contribution.value}`);
  console.log(`   - Target value: ${targetValue}`);
  
  if (targetValue > 0) {
    const achievementPercent = Math.round((contribution.value / targetValue) * 100 * 100) / 100;
    console.log(`   - Expected achievement: ${achievementPercent}%`);
  } else {
    console.log('   ⚠️ Target value is 0!');
  }
  
  console.log('\n=== Test Complete ===');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
