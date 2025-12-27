import prisma from '../lib/prisma';

async function debugKPIData() {
  console.log('=== KPIContribution records ===');
  const contribs = await prisma.kPIContribution.findMany({
    take: 10,
    orderBy: { created_at: 'desc' }
  });
  console.log(JSON.stringify(contribs, null, 2));
  console.log('Total KPIContribution:', await prisma.kPIContribution.count());

  console.log('\n=== KRAggregation records ===');
  const aggs = await prisma.kRAggregation.findMany({
    take: 10,
    orderBy: { last_updated: 'desc' }
  });
  console.log(JSON.stringify(aggs, null, 2));
  console.log('Total KRAggregation:', await prisma.kRAggregation.count());

  console.log('\n=== Approved QPROAnalyses ===');
  const analyses = await prisma.qPROAnalysis.findMany({
    where: { status: 'APPROVED' },
    take: 5,
    select: { id: true, status: true, approvedAt: true, year: true, quarter: true }
  });
  console.log(JSON.stringify(analyses, null, 2));
  console.log('Total approved:', await prisma.qPROAnalysis.count({ where: { status: 'APPROVED' } }));

  console.log('\n=== AggregationActivity (approved) ===');
  const activities = await prisma.aggregationActivity.findMany({
    where: { isApproved: true },
    take: 10,
  });
  console.log(JSON.stringify(activities, null, 2));
  console.log('Total approved activities:', await prisma.aggregationActivity.count({ where: { isApproved: true } }));

  await prisma.$disconnect();
}

debugKPIData().catch(console.error);
