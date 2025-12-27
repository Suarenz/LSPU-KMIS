// Debug script to check KPI contributions for multiple documents
// Run with: npx tsx scripts/debug-multi-doc-contributions.ts

import prisma from '../lib/prisma';

async function main() {
  console.log('=== Checking KPI Contributions for Multiple Documents ===\n');
  
  // Get all KPIContributions
  const contributions = await prisma.kPIContribution.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      qproAnalysis: {
        select: { id: true, documentTitle: true, status: true }
      }
    }
  });
  
  console.log(`Total KPIContribution records: ${contributions.length}\n`);
  
  // Group by initiative_id
  const byInitiative = new Map<string, typeof contributions>();
  for (const c of contributions) {
    if (!byInitiative.has(c.initiative_id)) {
      byInitiative.set(c.initiative_id, []);
    }
    byInitiative.get(c.initiative_id)!.push(c);
  }
  
  console.log('Contributions by Initiative:');
  for (const [initId, contribs] of byInitiative) {
    console.log(`\n  ${initId}:`);
    for (const c of contribs) {
      console.log(`    - value=${c.value}, year=${c.year}, Q${c.quarter}, analysis=${c.qproAnalysis?.documentTitle?.slice(0, 30) || c.analysis_id?.slice(0, 8)}...`);
    }
    
    // Calculate expected total
    const total = contribs.reduce((sum, c) => sum + c.value, 0);
    console.log(`    → Total sum: ${total}`);
  }
  
  // Check KRAggregation
  console.log('\n\n=== KRAggregation Records ===');
  const aggregations = await prisma.kRAggregation.findMany({
    where: { year: 2025 },
    orderBy: { initiative_id: 'asc' }
  });
  
  for (const agg of aggregations) {
    const contribs = byInitiative.get(agg.initiative_id) || [];
    const expectedTotal = contribs.reduce((sum, c) => sum + c.value, 0);
    const match = agg.total_reported === expectedTotal ? '✅' : '❌';
    
    console.log(`\n  ${agg.initiative_id}:`);
    console.log(`    - total_reported: ${agg.total_reported}`);
    console.log(`    - expected (sum of contributions): ${expectedTotal} ${match}`);
    console.log(`    - submission_count: ${agg.submission_count}`);
    console.log(`    - achievement_percent: ${agg.achievement_percent?.toString()}`);
    console.log(`    - target_type: ${agg.target_type}`);
  }
  
  console.log('\n=== Done ===');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
