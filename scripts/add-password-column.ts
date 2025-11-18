import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addPasswordColumn() {
  try {
    // Add the password column to the users table
    await prisma.$executeRaw`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password" TEXT`;
    
    console.log('Password column added successfully to the users table.');
  } catch (error) {
    console.error('Error adding password column:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addPasswordColumn();