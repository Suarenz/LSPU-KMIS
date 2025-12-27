import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Inline normalizeKraId function
function normalizeKraId(kraId: string): string {
  const cleaned = String(kraId || '').trim().replace(/\s+/g, ' ');
  const match = cleaned.match(/^KRA\s*(\d+)$/i);
  if (match) {
    return `KRA ${match[1]}`;
  }
  return cleaned;
}

async function main() {
  const year = 2025;
  
  console.log('=== Full KPIContribution Debug ===');
  
  const allContribs = await prisma.kPIContribution.findMany({
    where: { year },
    orderBy: { created_at: 'desc' },
  });
  
  console.log(`Total contributions for ${year}: ${allContribs.length}`);
  
  if (allContribs.length === 0) {
    console.log('NO CONTRIBUTIONS FOUND!');
  } else {
    allContribs.forEach((c, i) => {
      console.log(`  [${i + 1}] kra_id="${c.kra_id}", init="${c.initiative_id}", val=${c.value}, q=${c.quarter}`);
    });
  }
  
  // Check the KRAggregation too
  console.log('\n=== KRAggregation Check ===');
  const aggs = await prisma.kRAggregation.findMany({
    where: { year },
    orderBy: { initiative_id: 'asc' },
  });
  
  console.log(`Total aggregations: ${aggs.length}`);
  aggs.forEach((a, i) => {
    console.log(`  [${i + 1}] ${a.kra_id}/${a.initiative_id}: reported=${a.total_reported}`);
  });
  
  await prisma.$disconnect();
}

main().catch(console.error);
