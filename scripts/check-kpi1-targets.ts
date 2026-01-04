import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check KRA5-KPI1 targets for 2025
  const targets1 = await prisma.kPITarget.findMany({
    where: {
      initiative_id: 'KRA5-KPI1',
      year: 2025
    },
    orderBy: { quarter: 'asc' }
  });
  
  console.log('=== KRA5-KPI1 targets for 2025 ===');
  console.log('Expected annual target from strategic plan: 47');
  let sum1 = 0;
  targets1.forEach(t => {
    console.log(`Q${t.quarter}: ${t.target_value}`);
    sum1 += t.target_value;
  });
  console.log(`Sum of quarterly targets: ${sum1}`);
  
  // Check KRA5-KPI2 targets for 2025
  const targets2 = await prisma.kPITarget.findMany({
    where: {
      initiative_id: 'KRA5-KPI2',
      year: 2025
    },
    orderBy: { quarter: 'asc' }
  });
  
  console.log('\n=== KRA5-KPI2 targets for 2025 ===');
  console.log('Expected annual target from strategic plan: 6');
  let sum2 = 0;
  targets2.forEach(t => {
    console.log(`Q${t.quarter}: ${t.target_value}`);
    sum2 += t.target_value;
  });
  console.log(`Sum of quarterly targets: ${sum2}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
