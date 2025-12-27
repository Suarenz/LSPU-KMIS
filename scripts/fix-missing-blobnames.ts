/**
 * Fix documents with missing blobName by extracting from fileUrl
 * This script updates all documents in the database that have a NULL blobName
 * by extracting the blob path from their fileUrl field
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMissingBlobNames() {
  console.log('Starting blobName fix script...\n');

  try {
    // Find all documents with NULL blobName
    const documents = await prisma.document.findMany({
      where: {
        blobName: null
      },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        category: true
      }
    });

    console.log(`Found ${documents.length} documents with missing blobName\n`);

    if (documents.length === 0) {
      console.log('✓ No documents need fixing!');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const doc of documents) {
      try {
        // Extract blob name from Azure URL
        // Example URL: https://lspukmis.blob.core.windows.net/qpro-files/user-id/uuid_filename.docx
        // We want: user-id/uuid_filename.docx
        
        const url = new URL(doc.fileUrl!);
        const pathParts = url.pathname.split('/');
        
        // Remove the first empty string and container name
        // pathParts: ['', 'qpro-files', 'user-id', 'uuid_filename.docx']
        // We want: 'user-id/uuid_filename.docx'
        // IMPORTANT: Decode URL encoding (%20 -> space, etc.)
        const blobName = decodeURIComponent(pathParts.slice(2).join('/'));

        if (!blobName) {
          console.log(`✗ Document ${doc.id}: Could not extract blobName from URL`);
          failCount++;
          continue;
        }

        // Update the document
        await prisma.document.update({
          where: { id: doc.id },
          data: { blobName }
        });

        console.log(`✓ Document ${doc.id} (${doc.category}): ${doc.fileName}`);
        console.log(`  blobName set to: ${blobName}\n`);
        successCount++;
      } catch (error) {
        console.log(`✗ Document ${doc.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        failCount++;
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Total documents processed: ${documents.length}`);
    console.log(`Successfully updated: ${successCount}`);
    console.log(`Failed: ${failCount}`);

  } catch (error) {
    console.error('Error running fix script:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixMissingBlobNames()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
