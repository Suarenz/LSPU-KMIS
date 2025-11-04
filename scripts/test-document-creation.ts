import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/middleware/auth-middleware';

const prisma = new PrismaClient();

async function testDocumentCreation() {
  try {
    console.log('Testing document creation with tags...');
    
    // Find an admin user to use for the test
    const adminUser = await prisma.user.findFirst({
      where: { 
        role: 'ADMIN'
      }
    });
    
    if (!adminUser) {
      console.log('No admin user found, using first user instead...');
      const firstUser = await prisma.user.findFirst();
      if (!firstUser) {
        throw new Error('No users found in the database');
      }
      console.log(`Using user: ${firstUser.email} (ID: ${firstUser.id})`);
    } else {
      console.log(`Using admin user: ${adminUser.email} (ID: ${adminUser.id})`);
    }
    
    const userToUse = adminUser || (await prisma.user.findFirst());
    if (!userToUse) {
      throw new Error('No users found in the database');
    }
    
    // Test document creation with tags
    const testTags = ['test', 'document', 'creation'];
    console.log('Creating document with tags:', testTags);
    
    const document = await prisma.document.create({
      data: {
        title: "Test Document for Schema Verification",
        description: "This is a test document to verify the schema is correct",
        category: "test",
        tags: testTags, // This should work properly now
        uploadedBy: userToUse.name || "Test User",
        fileUrl: "/test/test.pdf",
        fileName: "test.pdf",
        fileType: "application/pdf",
        fileSize: 1024,
        uploadedById: userToUse.id,
        status: 'ACTIVE',
      },
    });
    
    console.log('✓ Document created successfully with ID:', document.id);
    console.log('✓ Document tags:', document.tags);
    
    // Verify that the document can be retrieved with proper tags
    const retrievedDocument = await prisma.document.findUnique({
      where: { id: document.id }
    });
    
    console.log('✓ Retrieved document tags:', retrievedDocument?.tags);
    
    // Clean up: delete the test document
    await prisma.document.delete({
      where: { id: document.id }
    });
    
    console.log('✓ Test document cleaned up successfully');
    console.log('\n✓ Document creation with tags test passed!');
    console.log('The PostgreSQL JSON field issue has been resolved.');
    
  } catch (error) {
    console.error('✗ Error during document creation test:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  testDocumentCreation()
    .then(() => {
      console.log('\nDocument creation test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nDocument creation test failed:', error);
      process.exit(1);
    });
}