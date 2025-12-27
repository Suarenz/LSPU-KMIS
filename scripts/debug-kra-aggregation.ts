import prisma from '../lib/prisma';

async function main() {
  const agg = await prisma.kRAggregation.findFirst({ 
    where: { initiative_id: 'KRA3-KPI5' } 
  });
  
  if (!agg) {
    console.log('No KRAggregation record found for KRA3-KPI5');
    return;
  }
  
  console.log('KRAggregation for KRA3-KPI5:');
  console.log('  achievement_percent:', agg.achievement_percent?.toString() ?? 'null');
  console.log('  total_reported:', agg.total_reported?.toString() ?? 'null');
  console.log('  target_value:', agg.target_value?.toString() ?? 'null');
  console.log('  kra_id:', agg.kra_id);
  console.log('  year:', agg.year);
  console.log('  quarter:', agg.quarter);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
