import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const contribs = await prisma.kPIContribution.findMany({
    where: { initiative_id: 'KRA5-KPI9' },
    orderBy: { created_at: 'desc' },
  });
  
  console.log('KRA5-KPI9 Contributions:');
  contribs.forEach(c => {
    console.log({
      id: c.id.slice(0, 8),
      target_type: c.target_type,
      target_type_upper: c.target_type.toUpperCase(),
      value: c.value,
      unit: c.unit_id.slice(0, 12),
    });
  });
  
  await prisma.$disconnect();
}

main();
