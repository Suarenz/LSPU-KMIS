import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixTagsColumn() {
  try {
    console.log('Checking and fixing tags column in documents table...');
    
    // Check if we can query the documents table structure
    console.log('Attempting to query documents table with a test array...');
    
    // Try to create a document with properly serialized JSON tags
    const testTags = ['test', 'document', 'creation'];
    
    // First, let's try to see what the current column type is by introspecting
    console.log('Creating a test document with JSON tags...');
    
    const document = await prisma.$executeRaw`INSERT INTO "documents" (
      id, 
      title, 
      description, 
      category, 
      tags, 
      "uploadedBy", 
      "fileUrl", 
      "fileName", 
      "fileType", 
      "fileSize", 
      "uploadedById", 
      status
    ) VALUES (
      ${'test-doc-' + Date.now()}, 
      ${'Test Document'}, 
      ${'Test description'}, 
      ${'test'}, 
      ${JSON.stringify(testTags)}::JSONB, 
      ${'Test User'}, 
      ${'/test/test.pdf'}, 
      ${'test.pdf'}, 
      ${'application/pdf'}, 
      ${1024}, 
      ${'cmh4cbeij0000lvn4wvfw9tzi'}, 
      ${'ACTIVE'}
    )`;
    
    console.log('✓ Document inserted successfully using JSON.stringify and ::JSONB cast');
    
    // Clean up the test document
    await prisma.$executeRaw`DELETE FROM "documents" WHERE id = ${'test-doc-' + Date.now()}`;
    
    console.log('✓ Test completed - tags column is properly configured');
    
  } catch (error) {
    console.error('✗ Error during tags column test:', error);
    
    // If the error is related to the array dimensions, we'll need to handle it differently
    if (error instanceof Error && error.message.includes('array dimensions')) {
      console.log('\nThis confirms the issue is with how arrays are being passed to the JSONB field.');
      console.log('The issue is likely in how Prisma handles array serialization to JSONB.');
    }
    
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  fixTagsColumn()
    .then(() => {
      console.log('\nTags column test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nTags column test failed:', error);
      process.exit(1);
    });
}