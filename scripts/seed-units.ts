import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// Use direct database connection for seeding
const prisma = new PrismaClient();

const units = [
  { name: 'College of Arts and Sciences', code: 'CAS', description: 'College of Arts and Sciences' },
  { name: 'College of Business, Administration and Accountancy', code: 'CBAA', description: 'College of Business, Administration and Accountancy' },
  { name: 'College of Computer Studies', code: 'CCS', description: 'College of Computer Studies' },
  { name: 'College of Criminal Justice Education', code: 'CCJE', description: 'College of Criminal Justice Education' },
  { name: 'College of Engineering', code: 'COE', description: 'College of Engineering' },
  { name: 'College of Industrial Technology', code: 'CIT', description: 'College of Industrial Technology' },
  { name: 'College of International Hospitality and Tourism Management', code: 'CIHTM', description: 'College of International Hospitality and Tourism Management' },
  { name: 'College of Law', code: 'COL', description: 'College of Law' },
  { name: 'College of Nursing and Allied Health', code: 'CONAH', description: 'College of Nursing and Allied Health' },
];

async function seedUnits() {
  console.log('Seeding units...');

  for (const unit of units) {
    const existingUnit = await prisma.unit.findUnique({
      where: { code: unit.code },
    });

    if (!existingUnit) {
      await prisma.unit.create({
        data: {
          id: uuidv4(),
          name: unit.name,
          code: unit.code,
          description: unit.description,
        },
      });
      console.log(`Created unit: ${unit.name}`);
    } else {
      console.log(`Unit already exists: ${unit.name}`);
    }
  }

  console.log('Unit seeding completed!');
}

// Run the seeding function
seedUnits()
  .catch((error) => {
    console.error('Error seeding units:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });