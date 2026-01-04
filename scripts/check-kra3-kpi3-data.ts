import prisma from '../lib/prisma';

async function checkData() {
  console.log('Checking KRA3-KPI3 data...\n');
  
  // Check KRAggregations
  const aggregations = await prisma.kRAggregation.findMany({
    where: {
      kra_id: { in: ['KRA3', 'KRA 3'] },
      initiative_id: 'KRA3-KPI3',
    },
    orderBy: [
      { year: 'asc' },
      { quarter: 'asc' },
    ],
  });
  
  console.log('=== KRAggregation Entries ===');
  if (aggregations.length === 0) {
    console.log('No entries found in KRAggregation table');
  } else {
    aggregations.forEach(agg => {
      console.log(`Year ${agg.year} Q${agg.quarter}:`);
      console.log(`  - total_reported: ${agg.total_reported}`);
      console.log(`  - manual_override: ${agg.manual_override}`);
      console.log(`  - current_value: ${agg.current_value}`);
      console.log(`  - target_value: ${agg.target_value}`);
      console.log(`  - manual_override_at: ${agg.manual_override_at}`);
      console.log();
    });
  }
  
  // Check KPIContributions
  const contributions = await prisma.kPIContribution.findMany({
    where: {
      kra_id: { in: ['KRA3', 'KRA 3'] },
      initiative_id: 'KRA3-KPI3',
    },
    orderBy: [
      { year: 'asc' },
      { quarter: 'asc' },
    ],
  });
  
  console.log('=== KPIContribution Entries ===');
  if (contributions.length === 0) {
    console.log('No entries found in KPIContribution table');
  } else {
    contributions.forEach(contrib => {
      console.log(`Year ${contrib.year} Q${contrib.quarter}:`);
      console.log(`  - value: ${contrib.value}`);
      console.log(`  - target_type: ${contrib.target_type}`);
      console.log(`  - created_at: ${contrib.created_at}`);
      console.log();
    });
  }
  
  await prisma.$disconnect();
}

checkData().catch(console.error);
