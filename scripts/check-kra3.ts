import prisma from '../lib/prisma';

async function checkKRA3() {
  const kra3 = await prisma.kRAggregation.findMany({
    where: { kra_id: 'KRA 3', year: 2025, quarter: 1 }
  });
  console.log(JSON.stringify(kra3, null, 2));
  await prisma.$disconnect();
}
checkKRA3();
