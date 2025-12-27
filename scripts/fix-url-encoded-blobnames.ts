/**
 * Fix blobNames that have URL encoding (e.g., %20 instead of spaces)
 * Azure Blob Storage uses actual characters, not URL encoding
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUrlEncodedBlobNames() {
  console.log('Starting URL-encoded blobName fix script...\n');

  try {
    // Find all documents with blobName containing URL encoding
    const documents = await prisma.document.findMany({
      where: {
        blobName: {
          contains: '%'
        }
      },
      select: {
        id: true,
        fileName: true,
        blobName: true,
        category: true
      }
    });

    console.log(`Found ${documents.length} documents with URL-encoded blobNames\n`);

    if (documents.length === 0) {
      console.log('✓ No documents need fixing!');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const doc of documents) {
      try {
        // Decode the blobName
        const decodedBlobName = decodeURIComponent(doc.blobName!);

        console.log(`Document ${doc.id} (${doc.category}): ${doc.fileName}`);
        console.log(`  Old: ${doc.blobName}`);
        console.log(`  New: ${decodedBlobName}`);

        // Update the document
        await prisma.document.update({
          where: { id: doc.id },
          data: { blobName: decodedBlobName }
        });

        console.log(`  ✓ Updated\n`);
        successCount++;
      } catch (error) {
        console.log(`  ✗ Failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
        failCount++;
      }
    }

    console.log('=== Summary ===');
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

fixUrlEncodedBlobNames()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
