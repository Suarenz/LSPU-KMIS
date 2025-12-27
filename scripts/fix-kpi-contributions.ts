/**
 * Script to fix corrupted KPIContribution and KRAggregation records
 * where initiative_id is just "KRA x" instead of "KRAx-KPIy"
 * 
 * Run: npx tsx scripts/fix-kpi-contributions.ts
 */

import prisma from '../lib/prisma';
import strategicPlan from '../lib/data/strategic_plan.json';

function normalizeKraId(kraId: string): string {
  const match = kraId.match(/KRA\s*(\d+)/i);
  return match ? `KRA ${match[1]}` : kraId;
}

function isValidKpiId(id: string | undefined): boolean {
  if (!id) return false;
  return /^KRA\s?\d+[\s-]KPI\s?\d+$/i.test(id.trim());
}

async function fixKPIContributions() {
  console.log('=== Fixing KPIContribution Records ===\n');
  
  // Find all contributions with invalid initiative_id
  const invalidContributions = await prisma.kPIContribution.findMany({
    where: {
      NOT: {
        initiative_id: {
          contains: 'KPI'
        }
      }
    }
  });
  
  console.log(`Found ${invalidContributions.length} contributions with invalid initiative_id`);
  
  for (const contrib of invalidContributions) {
    const normalizedKraId = normalizeKraId(contrib.kra_id);
    
    // Find the first KPI for this KRA in the strategic plan
    const kra = (strategicPlan as any).kras?.find((k: any) => 
      normalizeKraId(k.kra_id) === normalizedKraId
    );
    
    if (kra?.initiatives?.length > 0) {
      const defaultKpiId = kra.initiatives[0].id; // e.g., "KRA3-KPI5"
      
      console.log(`  Fixing contribution ${contrib.id}: "${contrib.initiative_id}" -> "${defaultKpiId}"`);
      
      await prisma.kPIContribution.update({
        where: { id: contrib.id },
        data: { initiative_id: defaultKpiId }
      });
    } else {
      // Fallback: construct KPIx-KPI1 format
      const compactKraId = normalizedKraId.replace(/\s+/g, '');
      const fallbackKpiId = `${compactKraId}-KPI1`;
      
      console.log(`  Fixing contribution ${contrib.id} (fallback): "${contrib.initiative_id}" -> "${fallbackKpiId}"`);
      
      await prisma.kPIContribution.update({
        where: { id: contrib.id },
        data: { initiative_id: fallbackKpiId }
      });
    }
  }
  
  console.log('\n=== Fixing KRAggregation Records ===\n');
  
  // Find all aggregations with invalid initiative_id
  const invalidAggregations = await prisma.kRAggregation.findMany({
    where: {
      NOT: {
        initiative_id: {
          contains: 'KPI'
        }
      }
    }
  });
  
  console.log(`Found ${invalidAggregations.length} aggregations with invalid initiative_id`);
  
  for (const agg of invalidAggregations) {
    const normalizedKraId = normalizeKraId(agg.kra_id);
    
    const kra = (strategicPlan as any).kras?.find((k: any) => 
      normalizeKraId(k.kra_id) === normalizedKraId
    );
    
    if (kra?.initiatives?.length > 0) {
      const defaultKpiId = kra.initiatives[0].id;
      
      console.log(`  Fixing aggregation ${agg.id}: "${agg.initiative_id}" -> "${defaultKpiId}"`);
      
      await prisma.kRAggregation.update({
        where: { id: agg.id },
        data: { initiative_id: defaultKpiId }
      });
    } else {
      const compactKraId = normalizedKraId.replace(/\s+/g, '');
      const fallbackKpiId = `${compactKraId}-KPI1`;
      
      console.log(`  Fixing aggregation ${agg.id} (fallback): "${agg.initiative_id}" -> "${fallbackKpiId}"`);
      
      await prisma.kRAggregation.update({
        where: { id: agg.id },
        data: { initiative_id: fallbackKpiId }
      });
    }
  }
  
  console.log('\n=== Fixing AggregationActivity Records ===\n');
  
  // Find all activities with invalid initiative_id
  const invalidActivities = await prisma.aggregationActivity.findMany({
    where: {
      initiative_id: {
        not: null
      },
      NOT: {
        initiative_id: {
          contains: 'KPI'
        }
      }
    }
  });
  
  console.log(`Found ${invalidActivities.length} activities with invalid initiative_id`);
  
  for (const activity of invalidActivities) {
    if (!activity.initiative_id) continue;
    
    // Extract KRA from initiative_id
    const kraMatch = activity.initiative_id.match(/^(KRA\s?\d+)/i);
    if (!kraMatch) continue;
    
    const normalizedKraId = normalizeKraId(kraMatch[1]);
    
    const kra = (strategicPlan as any).kras?.find((k: any) => 
      normalizeKraId(k.kra_id) === normalizedKraId
    );
    
    if (kra?.initiatives?.length > 0) {
      const defaultKpiId = kra.initiatives[0].id;
      
      console.log(`  Fixing activity ${activity.id}: "${activity.initiative_id}" -> "${defaultKpiId}"`);
      
      await prisma.aggregationActivity.update({
        where: { id: activity.id },
        data: { initiative_id: defaultKpiId }
      });
    } else {
      const compactKraId = normalizedKraId.replace(/\s+/g, '');
      const fallbackKpiId = `${compactKraId}-KPI1`;
      
      console.log(`  Fixing activity ${activity.id} (fallback): "${activity.initiative_id}" -> "${fallbackKpiId}"`);
      
      await prisma.aggregationActivity.update({
        where: { id: activity.id },
        data: { initiative_id: fallbackKpiId }
      });
    }
  }
  
  console.log('\n=== Fix Complete ===');
  await prisma.$disconnect();
}

fixKPIContributions().catch(console.error);
