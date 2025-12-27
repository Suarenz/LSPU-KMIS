/**
 * Diagnostic script to track KPI contribution and aggregation issues
 * 
 * This shows exactly what happens when multiple documents are uploaded to the same KPI
 * Run: npx tsx scripts/diagnose-multi-upload.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Multi-Upload Aggregation Diagnostics\n');
  
  try {
    // Get all contributions for each unique KPI/year/quarter combination
    const groups = await prisma.kPIContribution.groupBy({
      by: ['initiative_id', 'year', 'quarter'],
      _count: { id: true },
      _sum: { value: true }
    });
    
    console.log(`Found ${groups.length} unique KPI/period combinations with contributions:\n`);
    
    for (const group of groups) {
      const key = `${group.initiative_id} Q${group.quarter} ${group.year}`;
      
      // Get all contributions for this group
      const contributions = await prisma.kPIContribution.findMany({
        where: {
          initiative_id: group.initiative_id,
          year: group.year,
          quarter: group.quarter
        },
        orderBy: { created_at: 'asc' },
        include: {
          qproAnalysis: {
            select: {
              documentTitle: true,
              status: true,
              approvedAt: true,
              createdAt: true
            }
          }
        }
      });
      
      console.log(`📊 ${key}`);
      console.log(`   Total contributions: ${contributions.length}`);
      
      let runningSum = 0;
      contributions.forEach((c, i) => {
        runningSum += c.value;
        const status = c.qproAnalysis?.status || 'UNKNOWN';
        const approvedTime = c.qproAnalysis?.approvedAt?.toISOString().substring(11, 16) || 'NOT APPROVED';
        const docTitle = c.qproAnalysis?.documentTitle?.substring(0, 20) || 'unknown';
        
        console.log(`   ${i + 1}. ${docTitle} (${status}) - value=${c.value}, running_sum=${runningSum}, type=${c.target_type}, approved=${approvedTime}`);
      });
      
      // Calculate expected value based on type
      const targetType = contributions[0]?.target_type.toLowerCase();
      let expected: number;
      
      if (targetType === 'count' || targetType === 'financial') {
        expected = runningSum; // Should be sum
      } else if (targetType === 'snapshot' || targetType === 'milestone' || targetType === 'boolean') {
        expected = contributions[contributions.length - 1]?.value || 0; // Should be latest
      } else if (targetType === 'rate' || targetType === 'percentage') {
        expected = Math.round(contributions.reduce((sum, c) => sum + c.value, 0) / contributions.length); // Should be average
      } else {
        expected = runningSum; // Default to sum
      }
      
      console.log(`   📈 Type: ${targetType}, Expected final value: ${expected}`);
      console.log();
    }
    
    // Now check what the API is actually returning
    console.log('\n🔗 Checking KRA Aggregations Table:\n');
    
    const aggregations = await prisma.kRAggregation.findMany({
      orderBy: { created_at: 'desc' },
      take: 10
    });
    
    aggregations.forEach(agg => {
      console.log(`${agg.initiative_id} Q${agg.quarter} ${agg.year}:`);
      console.log(`  - total_reported: ${agg.total_reported}`);
      console.log(`  - submission_count: ${agg.submission_count}`);
      console.log(`  - achievement_percent: ${agg.achievement_percent}%`);
      console.log();
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
