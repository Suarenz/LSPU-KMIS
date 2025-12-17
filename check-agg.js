const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const aggs = await p.kRAggregation.findMany({
    include: { aggregationActivities: { where: { isApproved: true } } }
  });
  
  console.log('Found', aggs.length, 'KRAggregation records:');
  for (const a of aggs) {
    console.log({
      id: a.id.substring(0,8),
      kra: a.kra_id,
      init: a.initiative_id,
      total: a.total_reported,
      activities: a.aggregationActivities.length
    });
  }
  
  // Find orphaned (no activities)
  const orphaned = aggs.filter(a => a.aggregationActivities.length === 0);
  console.log('\nOrphaned records:', orphaned.length);
  
  await p.$disconnect();
}
main();
