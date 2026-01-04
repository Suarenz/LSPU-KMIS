import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const contribs = await prisma.kPIContribution.findMany({
    where: {
      initiative_id: 'KRA3-KPI3'
    },
    select: {
      year: true,
      quarter: true,
      unit_id: true,
      value: true,
    }
  });
  console.log('KPIContribution records for KRA3-KPI3:', contribs.length);
  for (const c of contribs) {
    console.log(`  Year ${c.year} Q${c.quarter}: unit=${c.unit_id}, value=${c.value}`);
  }
  await prisma.$disconnect();
}
main().catch(console.error);
