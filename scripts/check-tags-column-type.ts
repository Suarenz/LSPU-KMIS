import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTagsColumnType() {
  try {
    console.log('Checking the actual type of the tags column in the database...');
    
    // Query the PostgreSQL information schema to check the column type
    const result = await prisma.$queryRaw<{column_name: string, data_type: string, udt_name: string}[]>`
      SELECT 
        column_name, 
        data_type, 
        udt_name
      FROM information_schema.columns 
      WHERE table_name = 'documents' 
      AND column_name = 'tags'
    `;
    
    console.log('Tags column information:', result);
    
    if (result.length > 0) {
      const columnInfo = result[0];
      console.log(`Column: ${columnInfo.column_name}`);
      console.log(`Data type: ${columnInfo.data_type}`);
      console.log(`UDT name: ${columnInfo.udt_name}`);
      
      if (columnInfo.data_type !== 'jsonb' && columnInfo.udt_name !== 'jsonb') {
        console.log('⚠️  Warning: tags column is not configured as JSONB!');
        console.log('This could be the source of the array dimensions error.');
      } else {
        console.log('✓ tags column is properly configured as JSONB');
      }
    } else {
      console.log('Tags column not found in documents table');
    }
    
    // Also check if there are any existing documents and what their tags look like
    const sampleDocuments = await prisma.document.findMany({
      take: 5, // Just get a few sample documents
      select: {
        id: true,
        title: true,
        tags: true
      }
    });
    
    console.log('\nSample documents with tags:');
    for (const doc of sampleDocuments) {
      console.log(`- ${doc.id}: ${doc.title}`);
      console.log(`  Tags:`, doc.tags, `(Type: ${typeof doc.tags})`);
    }
    
  } catch (error) {
    console.error('Error checking tags column:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  checkTagsColumnType()
    .then(() => {
      console.log('\nColumn type check completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nColumn type check failed:', error);
      process.exit(1);
    });
}