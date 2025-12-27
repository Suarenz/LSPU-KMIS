// Fix script to recalculate achievement_percent for KRA3-KPI5
// Run with: npx tsx scripts/fix-kra3-achievement.ts

import prisma from '../lib/prisma';
import { targetAggregationService } from '../lib/services/target-aggregation-service';

async function main() {
  console.log('=== Fixing KRA3-KPI5 Achievement Percent ===\n');
  
  // 1. Find the KRAggregation record
  const aggregation = await prisma.kRAggregation.findFirst({
    where: {
      initiative_id: 'KRA3-KPI5',
      year: 2025,
    },
  });
  
  if (!aggregation) {
    console.log('No KRAggregation record found for KRA3-KPI5');
    process.exit(1);
  }
  
  console.log('Before fix:');
  console.log(`  total_reported: ${aggregation.total_reported}`);
  console.log(`  target_value: ${aggregation.target_value?.toString()}`);
  console.log(`  achievement_percent: ${aggregation.achievement_percent?.toString()}`);
  console.log(`  status: ${aggregation.status}`);
  
  // 2. Recalculate using the target aggregation service
  const totalReported = aggregation.total_reported ?? 0;
  const targetType = aggregation.target_type || 'percentage';
  
  console.log(`\nRecalculating with targetType='${targetType}' and value=${totalReported}...`);
  
  const metrics = await targetAggregationService.calculateAggregation(
    aggregation.kra_id,
    aggregation.initiative_id,
    aggregation.year,
    totalReported,
    targetType
  );
  
  console.log('\nCalculated metrics:');
  console.log(`  achievementPercent: ${metrics.achievementPercent}`);
  console.log(`  status: ${metrics.status}`);
  
  // 3. Update the record
  const updated = await prisma.kRAggregation.update({
    where: { id: aggregation.id },
    data: {
      achievement_percent: metrics.achievementPercent,
      status: metrics.status as any,
      last_updated: new Date(),
    },
  });
  
  console.log('\nAfter fix:');
  console.log(`  achievement_percent: ${updated.achievement_percent?.toString()}`);
  console.log(`  status: ${updated.status}`);
  
  console.log('\n=== Fix Complete ===');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
