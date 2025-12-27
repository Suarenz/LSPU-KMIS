import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixWrongInitiativeIds() {
  console.log('Starting to fix wrong initiative_id values...\n');

  // Find all KPIContributions where initiative_id looks like just a KRA ID (e.g., "KRA 3" instead of "KRA3-KPI5")
  const wrongContributions = await prisma.kPIContribution.findMany({
    where: {
      initiative_id: {
        // Match patterns like "KRA 3", "KRA3", "KRA 12" but NOT "KRA3-KPI5"
        not: {
          contains: '-KPI'
        }
      }
    },
    include: {
      qproAnalysis: {
        select: {
          activities: true
        }
      }
    }
  });

  console.log(`Found ${wrongContributions.length} KPIContribution records with wrong initiative_id\n`);

  let fixed = 0;
  let errors = 0;

  for (const contrib of wrongContributions) {
    try {
      // Get the activities from the QPRO analysis
      const activities = contrib.qproAnalysis?.activities as any[] || [];
      
      // Find an activity that matches this contribution's KRA
      const matchingActivity = activities.find((act: any) => {
        const actKraId = String(act.kraId || '').trim();
        const contribKraId = String(contrib.kra_id || '').trim();
        return actKraId === contribKraId && act.initiativeId && String(act.initiativeId).includes('-KPI');
      });

      if (matchingActivity && matchingActivity.initiativeId) {
        console.log(`Fixing contribution ${contrib.id}:`);
        console.log(`  Old initiative_id: "${contrib.initiative_id}"`);
        console.log(`  New initiative_id: "${matchingActivity.initiativeId}"`);

        await prisma.kPIContribution.update({
          where: { id: contrib.id },
          data: {
            initiative_id: matchingActivity.initiativeId
          }
        });

        fixed++;
      } else {
        console.log(`⚠️  Could not find correct initiative_id for contribution ${contrib.id} (kra_id: ${contrib.kra_id})`);
        errors++;
      }
    } catch (error) {
      console.error(`Error fixing contribution ${contrib.id}:`, error);
      errors++;
    }
  }

  console.log(`\n✅ Fixed ${fixed} contributions`);
  console.log(`❌ Errors: ${errors}`);

  // Also fix aggregation_activities table
  console.log('\nFixing aggregation_activities table...\n');

  const wrongActivities = await prisma.aggregationActivity.findMany({
    where: {
      initiative_id: {
        not: {
          contains: '-KPI'
        }
      }
    },
    include: {
      qproAnalysis: {
        select: {
          activities: true
        }
      }
    }
  });

  console.log(`Found ${wrongActivities.length} AggregationActivity records with wrong initiative_id\n`);

  let fixedActivities = 0;
  let errorActivities = 0;

  for (const aggActivity of wrongActivities) {
    try {
      const activities = aggActivity.qproAnalysis?.activities as any[] || [];
      
      // Match by activity name
      const matchingActivity = activities.find((act: any) => {
        return act.name === aggActivity.activity_name && act.initiativeId && String(act.initiativeId).includes('-KPI');
      });

      if (matchingActivity && matchingActivity.initiativeId) {
        console.log(`Fixing activity ${aggActivity.id}:`);
        console.log(`  Name: "${aggActivity.activity_name}"`);
        console.log(`  Old initiative_id: "${aggActivity.initiative_id}"`);
        console.log(`  New initiative_id: "${matchingActivity.initiativeId}"`);

        await prisma.aggregationActivity.update({
          where: { id: aggActivity.id },
          data: {
            initiative_id: matchingActivity.initiativeId
          }
        });

        fixedActivities++;
      } else {
        console.log(`⚠️  Could not find correct initiative_id for activity "${aggActivity.activity_name}"`);
        errorActivities++;
      }
    } catch (error) {
      console.error(`Error fixing activity ${aggActivity.id}:`, error);
      errorActivities++;
    }
  }

  console.log(`\n✅ Fixed ${fixedActivities} aggregation activities`);
  console.log(`❌ Errors: ${errorActivities}`);
}

fixWrongInitiativeIds()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
