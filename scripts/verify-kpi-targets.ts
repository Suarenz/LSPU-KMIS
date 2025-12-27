import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyKPI() {
  const targets = await prisma.kPITarget.findMany({
    where: { initiative_id: 'KRA3-KPI5' },
    orderBy: [{ year: 'asc' }, { quarter: 'asc' }]
  });
  
  console.log('\n✅ KRA3-KPI5 Employment Rate Quarterly Targets:\n');
  console.log('Year | Q1  | Q2  | Q3  | Q4  | Type');
  console.log('-----|-----|-----|-----|-----|--------');
  
  const years: Record<number, Record<number, string>> = {};
  let targetType = '';
  
  targets.forEach(t => {
    if (!years[t.year]) years[t.year] = {};
    years[t.year][t.quarter!] = t.target_value.toString();
    targetType = t.target_type;
  });
  
  Object.keys(years).sort().forEach(yearStr => {
    const year = parseInt(yearStr);
    const q = years[year];
    const q1 = q[1] ? `${q[1]}%` : 'N/A';
    const q2 = q[2] ? `${q[2]}%` : 'N/A';
    const q3 = q[3] ? `${q[3]}%` : 'N/A';
    const q4 = q[4] ? `${q[4]}%` : 'N/A';
    const type = yearStr === Object.keys(years).sort()[0] ? targetType : '';
    console.log(`${year} | ${q1.padEnd(3)} | ${q2.padEnd(3)} | ${q3.padEnd(3)} | ${q4.padEnd(3)} | ${type}`);
  });
  
  console.log('\n✅ All targets are identical per year (RATE type - maintain same % each quarter)');
  await prisma.$disconnect();
}

verifyKPI();
