/**
 * Verification Script: Check KRA3-KPI6 targets
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyTargets() {
  console.log('========================================');
  console.log('  Verifying KRA3-KPI6 Targets');
  console.log('========================================\n');
  
  // Check 2025 targets
  const targets2025 = await prisma.kPITarget.findMany({
    where: {
      kra_id: 'KRA 3',
      initiative_id: 'KRA3-KPI6',
      year: 2025
    },
    orderBy: { quarter: 'asc' }
  });
  
  console.log('📊 KRA3-KPI6 - 2025 Targets:');
  console.log('────────────────────────────────────────\n');
  
  if (targets2025.length === 0) {
    console.log('❌ NO TARGETS FOUND!\n');
  } else {
    targets2025.forEach(t => {
      console.log(`Q${t.quarter}: ${t.target_value} (type: ${t.target_type})`);
    });
    
    const total = targets2025.reduce((sum, t) => sum + Number(t.target_value), 0);
    console.log(`\nTotal Annual Target: ${total}`);
  }
  
  console.log('\n========================================\n');
  
  await prisma.$disconnect();
}

verifyTargets().catch(console.error);
