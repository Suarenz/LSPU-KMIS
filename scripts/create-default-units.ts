import prisma from '../lib/prisma';

const units = [
  { code: 'CAS', name: 'College of Arts and Sciences' },
  { code: 'CBAA', name: 'College of Business Administration and Accountancy' },
  { code: 'CCS', name: 'College of Computer Studies' },
  { code: 'CCJE', name: 'College of Criminal Justice Education' },
  { code: 'COE', name: 'College of Engineering' },
  { code: 'CIT', name: 'College of Industrial Technology' },
  { code: 'CIHTM', name: 'College of International Hospitality and Tourism Management' },
  { code: 'CLAW', name: 'College of Law' },
  { code: 'CONAH', name: 'College of Nursing and Allied Health' },
  { code: 'CTE', name: 'College of Teacher Education' },
  { code: 'SMU', name: 'Supply and Management Unit' },
  { code: 'SMO', name: 'Security Management Office' },
  { code: 'SFA', name: 'Scholarship and Financial Assistance' },
  { code: 'RMO', name: 'Records Management Office' },
  { code: 'RDS', name: 'Research and Development Services' },
  { code: 'OSAS', name: 'Office of the Student Affairs and Services' },
  { code: 'REG', name: 'Office of the Registrar' },
  { code: 'MIS', name: 'Management Information Systems' },
  { code: 'MC', name: 'Medical Clinic' },
  { code: 'PU', name: 'Procurement Unit' },
  { code: 'LSU', name: 'Legal Services Unit' },
  { code: 'IA', name: 'International Affairs' },
  { code: 'IAU', name: 'Internal Audit Unit' },
  { code: 'HRMO', name: 'Human Resource Management Office' },
  { code: 'GSU', name: 'General Services Unit' },
  { code: 'GAD', name: 'Gender and Development' },
  { code: 'CU', name: 'Cashier Unit' },
  { code: 'BO', name: 'Budget Office' },
  { code: 'BAO', name: 'Business Affairs Office' },
  { code: 'BAC', name: 'Bids and Awards Committee Secretariat' },
  { code: 'AAP', name: 'Alumni Affairs and Placement Services' },
];

async function main() {
  for (const unit of units) {
    await prisma.unit.upsert({
      where: { code: unit.code },
      update: { name: unit.name },
      create: { code: unit.code, name: unit.name },
    });
    console.log(`Upserted unit: ${unit.name} (${unit.code})`);
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
