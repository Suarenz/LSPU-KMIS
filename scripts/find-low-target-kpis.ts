/**
 * Find all KPIs with annual targets < 4 that will have 0 in Q1-Q3
 * These are the ones potentially showing 0/0 in the UI
 */

import strategicPlan from '../lib/data/strategic_plan.json';

const kras = (strategicPlan as any).kras || [];

console.log('========================================');
console.log('  KPIs with Annual Target < 4');
console.log('  (These will show 0 in Q1-Q3 quarters)');
console.log('========================================\n');

const problematicKpis: string[] = [];

for (const kra of kras) {
  for (const initiative of kra.initiatives || []) {
    const timelineData = initiative.targets?.timeline_data || [];
    const targetType = initiative.targets?.type || 'count';
    
    // Only COUNT type has this issue (other types repeat the value each quarter)
    if (targetType.toLowerCase() === 'count') {
      for (const yearData of timelineData) {
        const targetValue = typeof yearData.target_value === 'number' 
          ? yearData.target_value 
          : parseFloat(String(yearData.target_value));
          
        if (targetValue < 4 && targetValue > 0) {
          console.log(`${initiative.id} (${yearData.year}): target=${targetValue} → Q1-Q3 will be 0, Q4 will be ${targetValue}`);
          problematicKpis.push(`${initiative.id}-${yearData.year}`);
        }
      }
    }
  }
}

console.log('\n========================================');
console.log(`  Total affected: ${problematicKpis.length} KPI-year combinations`);
console.log('========================================');

// Unique KPIs affected
const uniqueKpis = [...new Set(problematicKpis.map(k => k.split('-').slice(0, -1).join('-')))];
console.log(`\nUnique KPIs affected: ${uniqueKpis.length}`);
console.log(uniqueKpis.join(', '));
