import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const count11 = await prisma.kRAggregation.count({ where: { initiative_id: 'KRA5-KPI11' }});
  const count12 = await prisma.kRAggregation.count({ where: { initiative_id: 'KRA5-KPI12' }});
  
  console.log('KRA5-KPI11:', count11, 'records');
  console.log('KRA5-KPI12:', count12, 'records');
  
  if (count11 > 0) {
    const samples11 = await prisma.kRAggregation.findMany({
      where: { initiative_id: 'KRA5-KPI11' },
      select: { year: true, quarter: true, target_value: true, target_type: true },
      orderBy: [{ year: 'asc' }, { quarter: 'asc' }],
      take: 4
    });
    console.log('\nKRA5-KPI11 samples:');
    samples11.forEach(s => console.log(`  ${s.year} Q${s.quarter}: target=${s.target_value}, type=${s.target_type}`));
  }
  
  if (count12 > 0) {
    const samples12 = await prisma.kRAggregation.findMany({
      where: { initiative_id: 'KRA5-KPI12' },
      select: { year: true, quarter: true, target_value: true, target_type: true },
      orderBy: [{ year: 'asc' }, { quarter: 'asc' }],
      take: 4
    });
    console.log('\nKRA5-KPI12 samples:');
    samples12.forEach(s => console.log(`  ${s.year} Q${s.quarter}: target=${s.target_value}, type=${s.target_type}`));
  }
  
  await prisma.$disconnect();
}

check().catch(console.error);
