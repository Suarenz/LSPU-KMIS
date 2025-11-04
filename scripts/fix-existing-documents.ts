import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixExistingDocuments() {
  try {
    console.log('Checking for documents with malformed tags...');
    
    // Get all documents to check their tags
    const documents = await prisma.document.findMany({
      select: {
        id: true,
        tags: true,
      }
    });
    
    console.log(`Found ${documents.length} documents to check`);
    
    let fixedCount = 0;
    for (const doc of documents) {
      try {
        // Check if tags is a proper array
        if (doc.tags === null || doc.tags === undefined) {
          // Update to empty array
          await prisma.document.update({
            where: { id: doc.id },
            data: { tags: [] }
          });
          fixedCount++;
          console.log(`Fixed document ${doc.id} - set tags to empty array`);
        } else if (Array.isArray(doc.tags)) {
          // Tags is already an array, check if it's valid
          console.log(`Document ${doc.id} has valid tags array:`, doc.tags);
        } else {
          // Tags is not an array, try to fix it
          console.log(`Document ${doc.id} has non-array tags:`, doc.tags);
          // Try to parse as JSON if it's a string, otherwise set to empty array
          let fixedTags: string[] = [];
          if (typeof doc.tags === 'string') {
            try {
              const parsed = JSON.parse(doc.tags);
              if (Array.isArray(parsed)) {
                fixedTags = parsed;
              }
            } catch {
              // If parsing fails, use empty array
            }
          }
          
          await prisma.document.update({
            where: { id: doc.id },
            data: { tags: fixedTags }
          });
          fixedCount++;
          console.log(`Fixed document ${doc.id} - updated tags to:`, fixedTags);
        }
      } catch (error) {
        console.error(`Error processing document ${doc.id}:`, error);
      }
    }
    
    console.log(`\nFixed ${fixedCount} documents with malformed tags.`);
    
    // Test document creation again
    console.log('\nTesting document creation with tags after fixes...');
    
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    }) || await prisma.user.findFirst();
    
    if (adminUser) {
      const testTags = ['test', 'fix', 'verification'];
      const testDoc = await prisma.document.create({
        data: {
          title: "Test Document After Fixes",
          description: "Test document to verify fixes are working",
          category: "test",
          tags: testTags,
          uploadedBy: adminUser.name || "Test User",
          fileUrl: "/test/fixed.pdf",
          fileName: "fixed.pdf",
          fileType: "application/pdf",
          fileSize: 1024,
          uploadedById: adminUser.id,
          status: 'ACTIVE',
        },
      });
      
      console.log('✓ Successfully created test document with ID:', testDoc.id);
      
      // Clean up
      await prisma.document.delete({
        where: { id: testDoc.id }
      });
      
      console.log('✓ Test document cleaned up successfully');
    }
    
    console.log('\n✓ All document tag fixes completed successfully!');
    
  } catch (error) {
    console.error('✗ Error during document fixes:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  fixExistingDocuments()
    .then(() => {
      console.log('\nDocument fixes completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nDocument fixes failed:', error);
      process.exit(1);
    });
}