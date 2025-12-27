import prisma from '../lib/prisma';

/**
 * Fix the KRA3 records that were incorrectly mapped to KRA3-KPI1
 * They should be on KRA3-KPI5 (employment rate)
 */
async function fixKRA3Mapping() {
  console.log('=== Fixing KRA3 KPI Mapping ===\n');

  // First, delete the empty KRA3-KPI5 record (it was created earlier with 0 data)
  console.log('Removing empty KRA3-KPI5 record...');
  await prisma.kRAggregation.deleteMany({
    where: {
      kra_id: 'KRA 3',
      initiative_id: 'KRA3-KPI5',
      year: 2025,
      quarter: 1,
      total_reported: 0
    }
  });
  console.log('  ✓ Removed empty record');

  // Update KPIContribution records from KRA3-KPI1 to KRA3-KPI5
  console.log('\nUpdating KPIContribution records...');
  const contribResult = await prisma.kPIContribution.updateMany({
    where: {
      kra_id: 'KRA 3',
      initiative_id: 'KRA3-KPI1'
    },
    data: {
      initiative_id: 'KRA3-KPI5'
    }
  });
  console.log(`  Updated ${contribResult.count} KPIContribution records`);

  // Update KRAggregation records from KRA3-KPI1 to KRA3-KPI5
  console.log('\nUpdating KRAggregation records...');
  const aggResult = await prisma.kRAggregation.updateMany({
    where: {
      kra_id: 'KRA 3',
      initiative_id: 'KRA3-KPI1',
      total_reported: { gt: 0 } // Only update ones with actual data
    },
    data: {
      initiative_id: 'KRA3-KPI5',
      target_value: 73, // Correct target for employment rate
      target_type: 'PERCENTAGE'
    }
  });
  console.log(`  Updated ${aggResult.count} KRAggregation records`);

  // Update AggregationActivity records from KRA3-KPI1 to KRA3-KPI5
  console.log('\nUpdating AggregationActivity records...');
  const activityResult = await prisma.aggregationActivity.updateMany({
    where: {
      initiative_id: 'KRA3-KPI1',
      activity_type: 'percentage' // Employment rate activities
    },
    data: {
      initiative_id: 'KRA3-KPI5'
    }
  });
  console.log(`  Updated ${activityResult.count} AggregationActivity records`);

  // Recalculate achievement percentage for the updated aggregation
  console.log('\nRecalculating achievement percentage...');
  const agg = await prisma.kRAggregation.findFirst({
    where: {
      kra_id: 'KRA 3',
      initiative_id: 'KRA3-KPI5',
      year: 2025,
      quarter: 1
    }
  });

  if (agg && agg.total_reported && agg.target_value) {
    const reported = typeof agg.total_reported === 'number' ? agg.total_reported : 0;
    const target = parseFloat(String(agg.target_value));
    const achievementPercent = target > 0 ? (reported / target) * 100 : 0;
    const status = achievementPercent >= 100 ? 'MET' : achievementPercent >= 80 ? 'ON_TRACK' : 'MISSED';

    await prisma.kRAggregation.update({
      where: { id: agg.id },
      data: {
        achievement_percent: achievementPercent,
        status: status as any
      }
    });

    console.log(`  ✓ Achievement: ${reported}/${target} = ${achievementPercent.toFixed(2)}% (${status})`);
  }

  console.log('\n✅ Fix complete!');
  await prisma.$disconnect();
}

fixKRA3Mapping().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
