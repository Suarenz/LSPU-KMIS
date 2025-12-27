import prisma from '../lib/prisma';
import strategicPlan from '../lib/data/strategic_plan.json';

function normalizeKraId(kraId: string): string {
  const match = kraId.match(/KRA\s*(\d+)/i);
  return match ? `KRA ${match[1]}` : kraId;
}

async function fixInvalidInitiativeIds() {
  console.log('=== Fixing Invalid Initiative IDs ===\n');

  // 1. Fix KPIContribution records
  console.log('Checking KPIContribution records...');
  const contributions = await prisma.kPIContribution.findMany({
    where: {
      NOT: {
        initiative_id: {
          contains: '-KPI'
        }
      }
    }
  });

  console.log(`Found ${contributions.length} contributions with invalid initiative_id`);

  for (const contrib of contributions) {
    const normalizedKraId = normalizeKraId(contrib.kra_id);
    const kra = (strategicPlan as any).kras.find((k: any) => normalizeKraId(k.kra_id) === normalizedKraId);
    
    if (kra && kra.initiatives && kra.initiatives.length > 0) {
      // Default to first KPI in this KRA
      const firstKpi = kra.initiatives[0];
      console.log(`  Fixing contribution ${contrib.id}: "${contrib.initiative_id}" -> "${firstKpi.id}"`);
      
      await prisma.kPIContribution.update({
        where: { id: contrib.id },
        data: { initiative_id: firstKpi.id }
      });
    }
  }

  // 2. Fix KRAggregation records
  console.log('\nChecking KRAggregation records...');
  const aggregations = await prisma.kRAggregation.findMany({
    where: {
      NOT: {
        initiative_id: {
          contains: '-KPI'
        }
      }
    }
  });

  console.log(`Found ${aggregations.length} aggregations with invalid initiative_id`);

  for (const agg of aggregations) {
    const normalizedKraId = normalizeKraId(agg.kra_id);
    const kra = (strategicPlan as any).kras.find((k: any) => normalizeKraId(k.kra_id) === normalizedKraId);
    
    if (kra && kra.initiatives && kra.initiatives.length > 0) {
      const firstKpi = kra.initiatives[0];
      console.log(`  Fixing aggregation ${agg.id}: "${agg.initiative_id}" -> "${firstKpi.id}"`);
      
      await prisma.kRAggregation.update({
        where: { id: agg.id },
        data: { initiative_id: firstKpi.id }
      });
    }
  }

  // 3. Fix AggregationActivity records
  console.log('\nChecking AggregationActivity records...');
  const allActivities = await prisma.aggregationActivity.findMany();
  
  // Filter in JavaScript
  const activities = allActivities.filter(act => 
    act.initiative_id && !act.initiative_id.includes('-KPI')
  );

  console.log(`Found ${activities.length} activities with invalid initiative_id`);

  for (const activity of activities) {
    // Extract KRA from initiative_id
    const kraMatch = activity.initiative_id?.match(/^(KRA\s?\d+)/i);
    if (!kraMatch) continue;
    
    const normalizedKraId = normalizeKraId(kraMatch[1]);
    const kra = (strategicPlan as any).kras.find((k: any) => normalizeKraId(k.kra_id) === normalizedKraId);
    
    if (kra && kra.initiatives && kra.initiatives.length > 0) {
      const firstKpi = kra.initiatives[0];
      console.log(`  Fixing activity ${activity.id}: "${activity.initiative_id}" -> "${firstKpi.id}"`);
      
      await prisma.aggregationActivity.update({
        where: { id: activity.id },
        data: { initiative_id: firstKpi.id }
      });
    }
  }

  console.log('\n✅ Fix complete!');
  await prisma.$disconnect();
}

fixInvalidInitiativeIds().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
