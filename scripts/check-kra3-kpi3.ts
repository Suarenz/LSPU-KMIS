import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.kRAggregation.findMany({
    where: {
      initiative_id: 'KRA3-KPI3',
      quarter: 1
    },
    orderBy: { year: 'asc' },
    select: {
      year: true,
      quarter: true,
      manual_override: true,
      target_value: true,
      target_type: true,
      current_value: true,
      achievement_percent: true,
    }
  });
  console.log('KRA3-KPI3 Q1 rows (ordered by year):');
  for (const r of rows) {
    console.log(`Year ${r.year}:`, JSON.stringify({
      manual_override: r.manual_override?.toString(),
      target_value: r.target_value?.toString(),
      target_type: r.target_type,
      current_value: r.current_value,
      achievement_percent: r.achievement_percent?.toString()
    }));
  }
  await prisma.$disconnect();
}
main().catch(console.error);
