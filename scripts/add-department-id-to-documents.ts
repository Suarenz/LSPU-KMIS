import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addDepartmentIdToDocuments() {
  try {
    console.log('Checking if departmentId column exists in documents table...');
    
    // Try to query the documents table to see if departmentId column exists
    try {
      const sampleDocument = await prisma.$queryRaw`SELECT "departmentId" FROM documents LIMIT 1`;
      console.log('✓ departmentId column already exists in documents table');
      return;
    } catch (error: any) {
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('✗ departmentId column does not exist in documents table');
        
        // Add the departmentId column to the documents table
        console.log('Adding departmentId column to documents table...');
        await prisma.$executeRaw`ALTER TABLE documents ADD COLUMN "departmentId" TEXT`;
        
        // Add the foreign key constraint
        try {
          await prisma.$executeRaw`ALTER TABLE "documents" ADD CONSTRAINT "documents_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE SET NULL ON UPDATE CASCADE`;
          console.log('✓ Foreign key constraint added for documents.departmentId');
        } catch (fkError) {
          console.log('Foreign key constraint may already exist:', fkError);
        }
        
        console.log('✓ departmentId column added to documents table');
      } else {
        throw error;
      }
    }
    
    console.log('Documents table schema update completed successfully!');
  } catch (error) {
    console.error('Error updating documents table schema:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  addDepartmentIdToDocuments()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}