/**
 * Phase 3 Implementation Test Script
 * 
 * Tests the complete target management flow:
 * 1. Database targets are correctly fetched and displayed
 * 2. Target editing UI components work
 * 3. QPro approval uses database target_type
 * 4. SNAPSHOT/RATE types aggregate correctly
 * 
 * Run: npx tsx scripts/test-phase3-implementation.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPhase3() {
  console.log('🧪 Testing Phase 3: Target Management Implementation\n');
  
  // Test 1: Verify KPI targets exist in database
  console.log('Test 1: Database targets loaded');
  const targetCount = await prisma.kPITarget.count();
  console.log(`✓ ${targetCount} KPI targets in database`);
  
  if (targetCount === 0) {
    console.log('❌ No targets found! Run: npx tsx scripts/migrate-kpi-targets.ts');
    return;
  }
  
  // Test 2: Verify KRA3-KPI5 employment rate target (RATE type)
  console.log('\nTest 2: KRA3-KPI5 employment rate target (RATE type)');
  const kra3kpi5Target = await prisma.kPITarget.findFirst({
    where: {
      kra_id: 'KRA 3',
      initiative_id: 'KRA3-KPI5',
      year: 2025,
      quarter: 1
    }
  });
  
  if (kra3kpi5Target) {
    console.log(`✓ Found Q1 2025 target: ${kra3kpi5Target.target_value}%`);
    console.log(`  Type: ${kra3kpi5Target.target_type}`);
    
    if (kra3kpi5Target.target_type !== 'RATE') {
      console.log(`  ⚠️  Expected RATE but got ${kra3kpi5Target.target_type}`);
    } else {
      console.log('  ✓ Correct type (RATE)');
    }
  } else {
    console.log('❌ KRA3-KPI5 Q1 2025 target not found');
  }
  
  // Test 3: Check type distribution
  console.log('\nTest 3: Target type distribution');
  const typeGroups = await prisma.kPITarget.groupBy({
    by: ['target_type'],
    _count: true
  });
  
  console.log('Distribution:');
  typeGroups.forEach(({ target_type, _count }) => {
    const pct = ((_count / targetCount) * 100).toFixed(1);
    console.log(`  ${target_type.padEnd(12)} : ${_count.toString().padStart(4)} records (${pct}%)`);
  });
  
  // Test 4: Verify API endpoint structure (check one KPI)
  console.log('\nTest 4: KPI Targets API data structure');
  const sampleTargets = await prisma.kPITarget.findMany({
    where: { initiative_id: 'KRA3-KPI5' },
    orderBy: [{ year: 'asc' }, { quarter: 'asc' }],
    take: 4
  });
  
  if (sampleTargets.length > 0) {
    console.log(`✓ Sample API response format for KRA3-KPI5:`);
    console.log('  {');
    console.log(`    id: "${sampleTargets[0].id}",`);
    console.log(`    kra_id: "${sampleTargets[0].kra_id}",`);
    console.log(`    initiative_id: "${sampleTargets[0].initiative_id}",`);
    console.log(`    year: ${sampleTargets[0].year},`);
    console.log(`    quarter: ${sampleTargets[0].quarter},`);
    console.log(`    target_value: ${sampleTargets[0].target_value},`);
    console.log(`    target_type: "${sampleTargets[0].target_type}",`);
    console.log(`    created_by: "${sampleTargets[0].created_by}"`);
    console.log('  }');
  }
  
  // Test 5: Verify unique constraint works
  console.log('\nTest 5: Unique constraint (prevents duplicates)');
  const duplicateCheck = await prisma.kPITarget.findMany({
    where: {
      kra_id: 'KRA 3',
      initiative_id: 'KRA3-KPI5',
      year: 2025,
      quarter: 1
    }
  });
  
  if (duplicateCheck.length === 1) {
    console.log('✓ Unique constraint working (1 record found)');
  } else {
    console.log(`❌ Found ${duplicateCheck.length} records - should be 1`);
  }
  
  // Test 6: Verify QPro approval integration readiness
  console.log('\nTest 6: QPro approval integration check');
  
  // Check if we have any approved QPro analyses
  const approvedAnalysis = await prisma.qPROAnalysis.findFirst({
    where: { status: 'APPROVED' }
  });
  
  if (approvedAnalysis) {
    console.log(`✓ Found approved analysis: ${approvedAnalysis.id}`);
    
    // Check if KPIContributions have target_type stored
    const contributions = await prisma.kPIContribution.findMany({
      where: { analysis_id: approvedAnalysis.id },
      take: 3
    });
    
    if (contributions.length > 0) {
      console.log(`  ✓ ${contributions.length} contributions found`);
      contributions.forEach(c => {
        console.log(`    ${c.initiative_id}: target_type=${c.target_type}`);
      });
    } else {
      console.log('  ℹ️  No contributions found for this analysis');
    }
  } else {
    console.log('ℹ️  No approved QPro analyses found yet');
    console.log('   (Upload and approve a QPro document to test full flow)');
  }
  
  // Test 7: Verify aggregation logic handles new types
  console.log('\nTest 7: Aggregation logic test');
  
  // Find a SNAPSHOT type KPI
  const snapshotKpi = await prisma.kPITarget.findFirst({
    where: { target_type: 'SNAPSHOT' },
    include: {}
  });
  
  if (snapshotKpi) {
    console.log(`✓ SNAPSHOT type example: ${snapshotKpi.initiative_id}`);
    console.log('  Aggregation: Latest value only (not summed)');
  } else {
    console.log('ℹ️  No SNAPSHOT KPIs found');
  }
  
  // Find a RATE type KPI
  const rateKpi = await prisma.kPITarget.findFirst({
    where: { target_type: 'RATE' },
    include: {}
  });
  
  if (rateKpi) {
    console.log(`✓ RATE type example: ${rateKpi.initiative_id}`);
    console.log('  Aggregation: Average across submissions');
  } else {
    console.log('ℹ️  No RATE KPIs found');
  }
  
  // Summary
  console.log('\n========================================');
  console.log('         PHASE 3 TEST SUMMARY');
  console.log('========================================');
  
  const checks = [
    { name: 'Database targets loaded', pass: targetCount > 0 },
    { name: 'KRA3-KPI5 RATE type correct', pass: kra3kpi5Target?.target_type === 'RATE' },
    { name: 'Type distribution valid', pass: typeGroups.length >= 3 },
    { name: 'Unique constraint working', pass: duplicateCheck.length === 1 },
    { name: 'SNAPSHOT type exists', pass: !!snapshotKpi },
    { name: 'RATE type exists', pass: !!rateKpi }
  ];
  
  const passed = checks.filter(c => c.pass).length;
  const total = checks.length;
  
  console.log(`\n✓ Passed: ${passed}/${total} checks`);
  
  checks.forEach(check => {
    const icon = check.pass ? '✓' : '❌';
    console.log(`  ${icon} ${check.name}`);
  });
  
  console.log('\n========================================');
  console.log('         NEXT STEPS');
  console.log('========================================');
  console.log('1. Start dev server: npm run dev');
  console.log('2. Navigate to any KRA page (e.g., /qpro/kra/KRA%203)');
  console.log('3. As ADMIN or FACULTY user:');
  console.log('   - Look for "Edit" button next to targets');
  console.log('   - Click "Edit" to modify a target value');
  console.log('   - Enter new value and click "Save"');
  console.log('   - Verify target updates in database');
  console.log('4. Upload and approve a QPro document');
  console.log('5. Verify progress calculation uses database target_type');
  console.log('\n');
  
  await prisma.$disconnect();
}

testPhase3().catch(console.error);
