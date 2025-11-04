import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDocumentsDepartmentId() {
  try {
    console.log('Testing documents.departmentId field access...');
    
    // Try to fetch a document with departmentId field
    const document = await prisma.document.findFirst({
      select: {
        id: true,
        title: true,
        departmentId: true,  // This was causing the error before
      }
    });
    
    if (document) {
      console.log('✓ Successfully fetched document with departmentId field:');
      console.log('  - ID:', document.id);
      console.log(' - Title:', document.title);
      console.log('  - Department ID:', document.departmentId);
    } else {
      console.log('⚠ No documents found, but departmentId field access works');
    }
    
    // Test document count which was failing
    const documentCount = await prisma.document.count();
    console.log(`✓ Successfully counted documents: ${documentCount} total documents`);
    
    console.log('\n✓ All documents departmentId field tests passed!');
    console.log('The documents table schema issue has been resolved.');
  } catch (error) {
    console.error('✗ Error testing documents departmentId field:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  testDocumentsDepartmentId()
    .then(() => {
      console.log('\nScript completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nScript failed:', error);
      process.exit(1);
    });
}