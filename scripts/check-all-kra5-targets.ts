import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check all KRA5 KPI targets for 2025
  const targets = await prisma.kPITarget.findMany({
    where: {
      kra_id: 'KRA 5',
      year: 2025
    },
    orderBy: [{ initiative_id: 'asc' }, { quarter: 'asc' }]
  });
  
  console.log('=== All KRA5 KPI targets for 2025 ===');
  console.log(`Found ${targets.length} records`);
  
  // Group by initiative_id
  const grouped: Record<string, number[]> = {};
  targets.forEach(t => {
    if (!grouped[t.initiative_id]) {
      grouped[t.initiative_id] = [];
    }
    grouped[t.initiative_id].push(t.target_value);
  });
  
  Object.entries(grouped).forEach(([kpi, values]) => {
    console.log(`${kpi}: Q1=${values[0]}, Q2=${values[1]}, Q3=${values[2]}, Q4=${values[3]}`);
  });
  
  // Check which KPIs exist in strategic plan but NOT in DB
  const allKRA5KPIs = ['KRA5-KPI1', 'KRA5-KPI2', 'KRA5-KPI3', 'KRA5-KPI4', 'KRA5-KPI5', 'KRA5-KPI6', 'KRA5-KPI7', 'KRA5-KPI8', 'KRA5-KPI9', 'KRA5-KPI10'];
  const kpisInDB = Object.keys(grouped);
  const missingKPIs = allKRA5KPIs.filter(kpi => !kpisInDB.includes(kpi));
  
  console.log('\n=== KPIs missing from DB ===');
  console.log(missingKPIs.length > 0 ? missingKPIs.join(', ') : 'None - all KPIs have DB records');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
