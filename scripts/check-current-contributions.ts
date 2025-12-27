import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== KRA3-KPI5 Contributions ===');
  const contribs = await prisma.kPIContribution.findMany({
    where: { initiative_id: 'KRA3-KPI5' },
    select: {
      id: true,
      value: true,
      target_type: true,
      year: true,
      quarter: true,
      analysis_id: true,
      created_at: true,
    },
    orderBy: { created_at: 'desc' },
  });

  console.log(`Total contributions: ${contribs.length}`);
  contribs.forEach((c, i) => {
    console.log(`\n[${i + 1}] ${c.analysis_id}`);
    console.log(`  Value: ${c.value}`);
    console.log(`  Type: ${c.target_type}`);
    console.log(`  Period: ${c.year}-Q${c.quarter}`);
    console.log(`  Created: ${c.created_at}`);
  });

  // Calculate aggregation
  console.log('\n=== Aggregation Logic ===');
  const q1Contribs = contribs.filter(c => c.year === 2025 && c.quarter === 1);
  if (q1Contribs.length > 0) {
    const type = q1Contribs[0].target_type;
    if (type === 'RATE' || type === 'PERCENTAGE') {
      const avg = Math.round(
        q1Contribs.reduce((sum, c) => sum + c.value, 0) / q1Contribs.length
      );
      console.log(`Q1 2025 (RATE/PERCENTAGE averaging):`);
      console.log(`  Values: [${q1Contribs.map(c => c.value).join(', ')}]`);
      console.log(`  Average: ${avg}`);
      console.log(`  Achievement: ${avg}/73 = ${Math.round((avg / 73) * 100)}%`);
    } else {
      const sum = q1Contribs.reduce((acc, c) => acc + c.value, 0);
      console.log(`Q1 2025 (COUNT summing):`);
      console.log(`  Sum: ${sum}`);
    }
  }

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
