/**
 * Script to fix KRAggregation records that don't correctly sum KPIContribution values
 * 
 * Run: npx tsx scripts/fix-multi-doc-aggregation.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== FIX MULTI-DOCUMENT AGGREGATION ===\n');

  // Get all unique KRA-KPI combinations from contributions
  const contributionsByKpi = await prisma.kPIContribution.groupBy({
    by: ['kra_id', 'initiative_id', 'year', 'quarter'],
    _sum: { value: true },
    _count: { id: true },
  });

  console.log(`Found ${contributionsByKpi.length} unique KRA-KPI-Year-Quarter combinations\n`);

  for (const group of contributionsByKpi) {
    const { kra_id, initiative_id, year, quarter, _sum, _count } = group;
    const totalValue = _sum.value || 0;
    const submissionCount = _count.id;

    // Get the target type from one of the contributions
    const sampleContrib = await prisma.kPIContribution.findFirst({
      where: { kra_id, initiative_id, year, quarter },
      select: { target_type: true },
    });
    const targetType = sampleContrib?.target_type?.toUpperCase() || 'COUNT';

    // Find existing aggregation
    const existingAgg = await prisma.kRAggregation.findFirst({
      where: { kra_id, initiative_id, year, quarter },
    });

    if (!existingAgg) {
      console.log(`⚠️  No KRAggregation found for ${kra_id}-${initiative_id} (${year} Q${quarter})`);
      continue;
    }

    const targetValue = existingAgg.target_value;
    
    // Calculate correct achievement percent based on target type
    let achievementPercent: number;
    if (targetType === 'RATE' || targetType === 'PERCENTAGE') {
      // For rate/percentage: average the contributions
      const avgValue = totalValue / submissionCount;
      achievementPercent = Math.min((avgValue / targetValue) * 100, 100);
      
      console.log(`\n📊 ${kra_id}-${initiative_id} (${year} Q${quarter}):`);
      console.log(`   Type: ${targetType} (averaging)`);
      console.log(`   Contributions: ${submissionCount}, Sum: ${totalValue}, Avg: ${avgValue.toFixed(2)}`);
      console.log(`   Target: ${targetValue}`);
      console.log(`   Calculated: ${avgValue.toFixed(2)} / ${targetValue} * 100 = ${achievementPercent.toFixed(2)}%`);
    } else {
      // For count/other: sum the contributions
      achievementPercent = Math.min((totalValue / targetValue) * 100, 100);
      
      console.log(`\n📊 ${kra_id}-${initiative_id} (${year} Q${quarter}):`);
      console.log(`   Type: ${targetType} (summing)`);
      console.log(`   Contributions: ${submissionCount}, Total: ${totalValue}`);
      console.log(`   Target: ${targetValue}`);
      console.log(`   Calculated: ${totalValue} / ${targetValue} * 100 = ${achievementPercent.toFixed(2)}%`);
    }

    // Show current vs expected
    console.log(`   Current total_reported: ${existingAgg.total_reported}`);
    console.log(`   Current submission_count: ${existingAgg.submission_count}`);
    console.log(`   Current target_type: ${existingAgg.target_type}`);
    console.log(`   Current achievement_percent: ${existingAgg.achievement_percent}`);

    const needsUpdate = 
      existingAgg.total_reported !== totalValue ||
      existingAgg.submission_count !== submissionCount ||
      existingAgg.target_type !== targetType ||
      Math.abs(existingAgg.achievement_percent - achievementPercent) > 0.01;

    if (needsUpdate) {
      console.log(`   ➡️  UPDATING...`);
      
      await prisma.kRAggregation.update({
        where: { id: existingAgg.id },
        data: {
          total_reported: totalValue,
          submission_count: submissionCount,
          target_type: targetType as any,
          achievement_percent: achievementPercent,
          status: achievementPercent >= 100 ? 'ON_TRACK' : achievementPercent >= 50 ? 'ON_TRACK' : 'NEEDS_ATTENTION',
          last_updated: new Date(),
        },
      });

      console.log(`   ✅ Updated: total_reported=${totalValue}, submission_count=${submissionCount}, target_type=${targetType}, achievement_percent=${achievementPercent.toFixed(2)}%`);
    } else {
      console.log(`   ✔️  Already correct`);
    }
  }

  console.log('\n=== DONE ===');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
