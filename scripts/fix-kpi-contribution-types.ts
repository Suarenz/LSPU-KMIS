/**
 * Fix KPIContribution target_type for KRA5-KPI9
 * This KPI should be "count" (sum) not "snapshot" (latest)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting KPIContribution target_type fix...\n');

  // Find all KPIContribution records for KRA5-KPI9
  const contributions = await prisma.kPIContribution.findMany({
    where: {
      initiative_id: 'KRA5-KPI9',
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  console.log(`Found ${contributions.length} KPIContribution records for KRA5-KPI9\n`);

  for (const contrib of contributions) {
    console.log(`ID: ${contrib.id}`);
    console.log(`  Current target_type: ${contrib.target_type}`);
    console.log(`  Unit: ${contrib.unit_id}`);
    console.log(`  Quarter: Q${contrib.quarter} ${contrib.year}`);
    console.log(`  Value: ${contrib.value}`);
    console.log(`  Created: ${contrib.created_at}`);
    
    if (contrib.target_type !== 'count') {
      console.log(`  → Updating to 'count'...`);
      await prisma.kPIContribution.update({
        where: { id: contrib.id },
        data: { target_type: 'count' },
      });
      console.log(`  ✓ Updated`);
    } else {
      console.log(`  ✓ Already correct`);
    }
    console.log('');
  }

  console.log('\nFix complete!');
  console.log('The system will now correctly sum values from multiple units.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
