/**
 * Check KPI targets for KRA5-KPI6 and KRA5-KPI7 in the database
 */

import { PrismaClient } from '@prisma/client';
import strategicPlan from '../lib/data/strategic_plan.json';

const prisma = new PrismaClient();

async function check() {
  try {
    // Check KPITarget for KRA5-KPI6 and KRA5-KPI7
    const targets = await prisma.kPITarget.findMany({
      where: {
        OR: [
          { initiative_id: 'KRA5-KPI6' },
          { initiative_id: 'KRA5-KPI7' },
          { initiative_id: 'KRA5-KPI8' },
          { initiative_id: 'KRA5-KPI9' },
          { initiative_id: 'KRA5-KPI10' },
        ]
      },
      orderBy: [{ initiative_id: 'asc' }, { year: 'asc' }, { quarter: 'asc' }]
    });
    console.log('KPI Targets in database for KRA5 initiatives:');
    console.log(`Total found: ${targets.length}`);
    
    // Group by initiative_id
    const grouped: Record<string, any[]> = {};
    targets.forEach(t => {
      if (!grouped[t.initiative_id]) grouped[t.initiative_id] = [];
      grouped[t.initiative_id].push(t);
    });
    
    console.log('\nBy initiative:');
    Object.keys(grouped).sort().forEach(id => {
      console.log(`  ${id}: ${grouped[id].length} records`);
    });
    
    // Check the strategic plan for KRA5 format
    const kras = (strategicPlan as any).kras || [];
    const kra5 = kras.find((k: any) => k.kra_id.includes('5'));
    console.log('\n--- Strategic Plan KRA5 Info ---');
    console.log('KRA5 ID format in strategic plan:', kra5?.kra_id);
    console.log('KRA5 initiatives:', kra5?.initiatives.map((i: any) => i.id));
    
    // Check all KPITarget records for KRA 5 variants
    const allKra5Targets = await prisma.kPITarget.findMany({
      where: {
        OR: [
          { kra_id: 'KRA 5' },
          { kra_id: 'KRA5' },
        ]
      },
      select: {
        initiative_id: true,
        kra_id: true,
      },
      distinct: ['initiative_id']
    });
    
    console.log('\nAll unique initiative_ids in database for KRA 5:');
    console.log(allKra5Targets.map(t => `  ${t.kra_id} -> ${t.initiative_id}`).join('\n'));
    
    // Check how many of each KRA5 KPI exists
    const allKra5 = await prisma.kPITarget.groupBy({
      by: ['initiative_id'],
      where: {
        OR: [
          { kra_id: 'KRA 5' },
          { kra_id: 'KRA5' },
        ]
      },
      _count: true
    });
    
    console.log('\nCount per KRA5 initiative in database:');
    allKra5.forEach(item => {
      console.log(`  ${item.initiative_id}: ${item._count} records`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
