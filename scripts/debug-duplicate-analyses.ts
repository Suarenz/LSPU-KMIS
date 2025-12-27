// Debug script to check for duplicate analyses
// Run with: npx tsx scripts/debug-duplicate-analyses.ts

import prisma from '../lib/prisma';

async function main() {
  console.log('=== Checking for Duplicate Analyses ===\n');
  
  // Get recent analyses
  const analyses = await prisma.qPROAnalysis.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      documentId: true,
      status: true,
      createdAt: true,
      achievementScore: true,
      uploadedById: true,
    }
  });
  
  console.log('Recent QPROAnalysis records:');
  for (const a of analyses) {
    console.log(`  ${a.status.padEnd(10)} doc=${a.documentId?.slice(0,8) || 'null'}... score=${a.achievementScore ?? 'null'} created=${a.createdAt.toISOString().slice(0,19)}`);
  }
  
  // Group by documentId to find duplicates
  const byDoc = new Map<string, typeof analyses>();
  for (const a of analyses) {
    const docId = a.documentId || 'no-doc';
    if (!byDoc.has(docId)) byDoc.set(docId, []);
    byDoc.get(docId)!.push(a);
  }
  
  console.log('\n=== Documents with Multiple Analyses ===');
  for (const [docId, list] of byDoc) {
    if (list.length > 1) {
      console.log(`\nDocument ${docId} has ${list.length} analyses:`);
      for (const a of list) {
        console.log(`  - ${a.id}: status=${a.status}, score=${a.achievementScore}`);
      }
    }
  }
  
  // Check for analyses without documents
  const noDocAnalyses = analyses.filter(a => !a.documentId);
  if (noDocAnalyses.length > 0) {
    console.log(`\n=== Analyses Without Documents ===`);
    for (const a of noDocAnalyses) {
      console.log(`  - ${a.id}: status=${a.status}`);
    }
  }
  
  console.log('\n=== Done ===');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
