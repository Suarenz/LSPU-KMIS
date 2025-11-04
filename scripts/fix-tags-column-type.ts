import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixTagsColumnType() {
  try {
    console.log('Fixing tags column type from ARRAY to JSONB...');
    
    // First, let's check if there are any documents with tags that we need to preserve
    const documentsWithTags = await prisma.document.findMany({
      select: {
        id: true,
        tags: true
      }
    });
    
    console.log(`Found ${documentsWithTags.length} documents with tags to potentially migrate`);
    
    // For each document, we'll need to store the current tags value and then update after column change
    // But first, let's backup the current tags in a temporary format if there are any
    console.log('Converting tags column from ARRAY to JSONB...');
    
    // This will convert the text array to a JSON array
    // The ALTER TABLE statement needs to convert the existing array data properly
    await prisma.$executeRaw`ALTER TABLE "documents" ALTER COLUMN "tags" TYPE JSONB USING CASE 
      WHEN "tags" IS NULL THEN '[]'::JSONB 
      WHEN array_length("tags", 1) IS NULL THEN '[]'::JSONB 
      ELSE array_to_json("tags")::JSONB 
      END`;
    
    console.log('✓ Tags column successfully converted to JSONB type');
    
    // Verify the change
    const result = await prisma.$queryRaw<{column_name: string, data_type: string, udt_name: string}[]>`
      SELECT 
        column_name, 
        data_type, 
        udt_name
      FROM information_schema.columns 
      WHERE table_name = 'documents' 
      AND column_name = 'tags'
    `;
    
    console.log('Updated column information:', result);
    
    if (result.length > 0) {
      const columnInfo = result[0];
      console.log(`Column: ${columnInfo.column_name}`);
      console.log(`Data type: ${columnInfo.data_type}`);
      console.log(`UDT name: ${columnInfo.udt_name}`);
      
      if (columnInfo.data_type === 'jsonb' || columnInfo.udt_name === 'jsonb') {
        console.log('✓ tags column is now properly configured as JSONB');
      } else {
        console.log('⚠️  tags column is still not configured as JSONB');
      }
    }
    
    // Test document creation with tags
    console.log('\nTesting document creation with tags after fix...');
    
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    }) || await prisma.user.findFirst();
    
    if (adminUser) {
      const testTags = ['test', 'fix', 'verification'];
      const testDoc = await prisma.document.create({
        data: {
          title: "Test Document After Column Type Fix",
          description: "Test document to verify column type fix is working",
          category: "test",
          tags: testTags,
          uploadedBy: adminUser.name || "Test User",
          fileUrl: "/test/column-fix.pdf",
          fileName: "column-fix.pdf",
          fileType: "application/pdf",
          fileSize: 1024,
          uploadedById: adminUser.id,
          status: 'ACTIVE',
        },
      });
      
      console.log('✓ Successfully created test document with ID:', testDoc.id);
      console.log('✓ Document tags:', testDoc.tags);
      
      // Clean up
      await prisma.document.delete({
        where: { id: testDoc.id }
      });
      
      console.log('✓ Test document cleaned up successfully');
    }
    
    console.log('\n✓ Tags column type fix completed successfully!');
    
  } catch (error) {
    console.error('✗ Error during column type fix:', error);
    throw error;
 } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
 fixTagsColumnType()
    .then(() => {
      console.log('\nColumn type fix completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nColumn type fix failed:', error);
      process.exit(1);
    });
}