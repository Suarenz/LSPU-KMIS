import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const prisma = new PrismaClient();
const execPromise = promisify(exec);

async function checkAndAddDepartmentIdColumn() {
  try {
    console.log('Checking if departmentId column exists in users table...');
    
    // Try to query the users table to see if departmentId column exists
    try {
      const sampleUser = await prisma.$queryRaw`SELECT "departmentId" FROM users LIMIT 1`;
      console.log('✓ departmentId column already exists in users table');
      return;
    } catch (error: any) {
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('✗ departmentId column does not exist in users table');
        
        // Add the departmentId column to the users table
        console.log('Adding departmentId column to users table...');
        await prisma.$executeRaw`ALTER TABLE users ADD COLUMN "departmentId" TEXT`;
        
        console.log('✓ departmentId column added to users table');
      } else {
        throw error;
      }
    }
    
    // Check if departments table exists, if not create it
    try {
      await prisma.$queryRaw`SELECT id FROM departments LIMIT 1`;
      console.log('✓ departments table already exists');
    } catch (error: any) {
      if (error.message.includes('does not exist') || error.message.includes('relation "departments" does not exist')) {
        console.log('Creating departments table...');
        
        await prisma.$executeRaw`CREATE TABLE "departments" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "code" TEXT NOT NULL,
          "description" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL
        )`;
        
        await prisma.$executeRaw`CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name")`;
        await prisma.$executeRaw`CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code")`;
        
        console.log('✓ departments table created');
      } else {
        throw error;
      }
    }
    
    console.log('Schema update completed successfully!');
  } catch (error) {
    console.error('Error updating schema:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  checkAndAddDepartmentIdColumn()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}