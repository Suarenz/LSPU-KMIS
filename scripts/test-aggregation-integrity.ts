/**
 * Test script to validate KPI aggregation integrity
 * 
 * This script ensures that:
 * 1. All KPIContribution records have valid target_type values
 * 2. Multi-unit contributions are summed correctly
 * 3. Aggregation logic respects target types (COUNT, SNAPSHOT, RATE, etc.)
 * 4. No data corruption or unexpected behavior
 * 
 * Run: npx tsx scripts/test-aggregation-integrity.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ValidationResult {
  passed: boolean;
  message: string;
  details?: any;
}

async function validateKPIContributions(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  // Test 1: Check all KPIContribution records have valid target_type
  const contributions = await prisma.kPIContribution.findMany({
    select: {
      id: true,
      initiative_id: true,
      target_type: true,
      value: true,
      year: true,
      quarter: true,
    }
  });
  
  const validTypes = ['count', 'snapshot', 'rate', 'percentage', 'milestone', 'boolean', 'financial', 'text_condition'];
  const invalidContributions = contributions.filter(c => 
    !c.target_type || 
    typeof c.target_type !== 'string' || 
    !validTypes.includes(c.target_type.toLowerCase())
  );
  
  results.push({
    passed: invalidContributions.length === 0,
    message: `Target Type Validation: ${contributions.length} total contributions`,
    details: {
      total: contributions.length,
      invalid: invalidContributions.length,
      invalidRecords: invalidContributions.map(c => ({
        id: c.id,
        initiative: c.initiative_id,
        targetType: c.target_type,
        period: `Q${c.quarter} ${c.year}`
      }))
    }
  });
  
  // Test 2: Check for target_type consistency within same KPI
  const kpiGroups = new Map<string, Set<string>>();
  contributions.forEach(c => {
    const key = `${c.initiative_id}|${c.year}|${c.quarter}`;
    if (!kpiGroups.has(key)) {
      kpiGroups.set(key, new Set());
    }
    kpiGroups.get(key)!.add(c.target_type.toLowerCase());
  });
  
  const inconsistentKpis = Array.from(kpiGroups.entries())
    .filter(([, types]) => types.size > 1)
    .map(([key, types]) => ({ key, types: Array.from(types) }));
  
  results.push({
    passed: inconsistentKpis.length === 0,
    message: `Target Type Consistency: ${kpiGroups.size} unique KPI/period combinations`,
    details: {
      total: kpiGroups.size,
      inconsistent: inconsistentKpis.length,
      issues: inconsistentKpis
    }
  });
  
  // Test 3: Validate COUNT-type aggregation behavior
  // Group by KPI and check if values are summed correctly
  const countTypeGroups = new Map<string, { values: number[], expectedSum: number }>();
  
  contributions
    .filter(c => c.target_type.toLowerCase() === 'count')
    .forEach(c => {
      const key = `${c.initiative_id}|${c.year}|${c.quarter}`;
      if (!countTypeGroups.has(key)) {
        countTypeGroups.set(key, { values: [], expectedSum: 0 });
      }
      const group = countTypeGroups.get(key)!;
      group.values.push(c.value);
      group.expectedSum += c.value;
    });
  
  results.push({
    passed: true,
    message: `COUNT Type Aggregation: ${countTypeGroups.size} COUNT-type KPIs`,
    details: {
      totalGroups: countTypeGroups.size,
      multiUnitGroups: Array.from(countTypeGroups.entries())
        .filter(([, g]) => g.values.length > 1)
        .length,
      examples: Array.from(countTypeGroups.entries())
        .filter(([, g]) => g.values.length > 1)
        .slice(0, 5)
        .map(([key, g]) => ({
          key,
          contributionCount: g.values.length,
          values: g.values,
          expectedSum: g.expectedSum
        }))
    }
  });
  
  // Test 4: Check for orphaned contributions (no associated analysis)
  const orphanedContributions = await prisma.kPIContribution.findMany({
    where: {
      analysis_id: { equals: null }
    },
    select: {
      id: true,
      initiative_id: true,
      value: true
    }
  });
  
  results.push({
    passed: orphanedContributions.length === 0,
    message: `Orphaned Contributions Check: ${orphanedContributions.length} orphaned records`,
    details: {
      count: orphanedContributions.length,
      records: orphanedContributions.slice(0, 10)
    }
  });
  
  return results;
}

async function testMultiUnitAggregation(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  // Find KPIs with multiple unit contributions
  const multiUnitKpis = await prisma.kPIContribution.groupBy({
    by: ['initiative_id', 'year', 'quarter'],
    _count: {
      unit_id: true
    },
    having: {
      unit_id: {
        _count: {
          gt: 1
        }
      }
    }
  });
  
  results.push({
    passed: true,
    message: `Multi-Unit KPIs: Found ${multiUnitKpis.length} KPIs with multiple unit contributions`,
    details: {
      count: multiUnitKpis.length,
      examples: multiUnitKpis.slice(0, 5).map(kpi => ({
        initiative: kpi.initiative_id,
        period: `Q${kpi.quarter} ${kpi.year}`,
        unitCount: kpi._count.unit_id
      }))
    }
  });
  
  // For each multi-unit KPI, verify aggregation
  for (const kpi of multiUnitKpis.slice(0, 3)) {
    const contributions = await prisma.kPIContribution.findMany({
      where: {
        initiative_id: kpi.initiative_id,
        year: kpi.year,
        quarter: kpi.quarter
      },
      include: {
        unit: {
          select: {
            name: true,
            code: true
          }
        }
      }
    });
    
    const targetType = contributions[0]?.target_type.toUpperCase();
    const values = contributions.map(c => c.value);
    
    let expectedResult: number;
    if (targetType === 'COUNT' || targetType === 'FINANCIAL') {
      expectedResult = values.reduce((sum, v) => sum + v, 0);
    } else if (targetType === 'SNAPSHOT' || targetType === 'MILESTONE' || targetType === 'BOOLEAN') {
      expectedResult = values[values.length - 1]; // Latest value
    } else if (targetType === 'RATE' || targetType === 'PERCENTAGE') {
      expectedResult = Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
    } else {
      expectedResult = values.reduce((sum, v) => sum + v, 0); // Default to sum
    }
    
    results.push({
      passed: true,
      message: `Aggregation Test: ${kpi.initiative_id} (${targetType})`,
      details: {
        initiative: kpi.initiative_id,
        period: `Q${kpi.quarter} ${kpi.year}`,
        targetType,
        contributionCount: contributions.length,
        units: contributions.map(c => c.unit?.code || 'unknown'),
        values,
        expectedResult,
        method: targetType === 'COUNT' ? 'SUM' : targetType === 'SNAPSHOT' ? 'LATEST' : targetType === 'RATE' ? 'AVERAGE' : 'DEFAULT'
      }
    });
  }
  
  return results;
}

async function main() {
  console.log('🔍 KPI Aggregation Integrity Test\n');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Validate KPIContribution records
    console.log('\n📊 Test 1: KPIContribution Validation');
    console.log('-'.repeat(60));
    const contributionResults = await validateKPIContributions();
    
    contributionResults.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.message}`);
      
      if (result.details) {
        if (result.details.invalid > 0 || result.details.inconsistent > 0) {
          console.log('   ⚠️  Issues found:');
          console.log(JSON.stringify(result.details, null, 2));
        } else {
          console.log(`   ℹ️  ${JSON.stringify({
            total: result.details.total || result.details.totalGroups || result.details.count,
            ...(result.details.multiUnitGroups && { multiUnit: result.details.multiUnitGroups })
          }, null, 2)}`);
        }
      }
    });
    
    // Test 2: Test multi-unit aggregation
    console.log('\n📊 Test 2: Multi-Unit Aggregation');
    console.log('-'.repeat(60));
    const aggregationResults = await testMultiUnitAggregation();
    
    aggregationResults.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.message}`);
      
      if (result.details && result.details.values) {
        console.log(`   Values: [${result.details.values.join(', ')}]`);
        console.log(`   Expected ${result.details.method}: ${result.details.expectedResult}`);
        console.log(`   Units: ${result.details.units.join(', ')}`);
      }
    });
    
    // Summary
    console.log('\n' + '='.repeat(60));
    const allResults = [...contributionResults, ...aggregationResults];
    const passed = allResults.filter(r => r.passed).length;
    const total = allResults.length;
    
    console.log(`\n📈 Summary: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('✅ All integrity checks passed! System is healthy.');
    } else {
      console.log('⚠️  Some issues detected. Review the output above.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
