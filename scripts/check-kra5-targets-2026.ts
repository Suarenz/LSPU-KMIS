/**
 * Check specific KPI target values for year 2026
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  try {
    // Check KPITarget for KRA5-KPI6 and KRA5-KPI7 for year 2026
    const targets = await prisma.kPITarget.findMany({
      where: {
        initiative_id: { in: ['KRA5-KPI6', 'KRA5-KPI7'] },
        year: 2026
      },
      orderBy: [{ initiative_id: 'asc' }, { quarter: 'asc' }]
    });
    
    console.log('KPI Targets for 2026:');
    console.log(JSON.stringify(targets.map(t => ({
      initiative_id: t.initiative_id,
      year: t.year,
      quarter: t.quarter,
      target_value: t.target_value,
      target_type: t.target_type
    })), null, 2));

    // Also check 2025 for comparison
    const targets2025 = await prisma.kPITarget.findMany({
      where: {
        initiative_id: { in: ['KRA5-KPI6', 'KRA5-KPI7'] },
        year: 2025
      },
      orderBy: [{ initiative_id: 'asc' }, { quarter: 'asc' }]
    });
    
    console.log('\nKPI Targets for 2025:');
    console.log(JSON.stringify(targets2025.map(t => ({
      initiative_id: t.initiative_id,
      year: t.year,
      quarter: t.quarter,
      target_value: t.target_value,
      target_type: t.target_type
    })), null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
