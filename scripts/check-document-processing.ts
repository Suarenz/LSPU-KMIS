import prisma from '../lib/prisma';

async function checkDocumentProcessing() {
  try {
    console.log('Checking document processing status...\n');

    // Get all documents with their processing status
    const documents = await prisma.document.findMany({
      select: {
        id: true,
        title: true,
        fileName: true,
        fileType: true,
        colivaraProcessingStatus: true,
        colivaraDocumentId: true,
        colivaraProcessedAt: true,
        isQproDocument: true,
        uploadedAt: true,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
      take: 10,
    });

    console.log(`Found ${documents.length} recent documents:\n`);

    for (const doc of documents) {
      console.log('─'.repeat(80));
      console.log(`Title: ${doc.title}`);
      console.log(`File: ${doc.fileName} (${doc.fileType})`);
      console.log(`ID: ${doc.id}`);
      console.log(`QPRO Document: ${doc.isQproDocument ? 'Yes' : 'No'}`);
      console.log(`Processing Status: ${doc.colivaraProcessingStatus || 'NOT_STARTED'}`);
      console.log(`Colivara Doc ID: ${doc.colivaraDocumentId || 'None'}`);
      console.log(`Processed At: ${doc.colivaraProcessedAt ? doc.colivaraProcessedAt.toISOString() : 'Not processed'}`);
      console.log(`Uploaded At: ${doc.uploadedAt.toISOString()}`);
      
      // Calculate time since upload
      const timeSinceUpload = Date.now() - doc.uploadedAt.getTime();
      const minutesSinceUpload = Math.floor(timeSinceUpload / 60000);
      console.log(`Time since upload: ${minutesSinceUpload} minutes`);
      
      // Status indicator
      if (doc.colivaraProcessingStatus === 'COMPLETED') {
        console.log('✅ Ready for search');
      } else if (doc.colivaraProcessingStatus === 'PROCESSING') {
        console.log('⏳ Currently processing...');
      } else if (doc.colivaraProcessingStatus === 'FAILED') {
        console.log('❌ Processing failed');
      } else {
        console.log('⚠️  Not yet processed by Colivara');
      }
      console.log();
    }

    console.log('─'.repeat(80));
    console.log('\nSummary:');
    const statusCounts = documents.reduce((acc, doc) => {
      const status = doc.colivaraProcessingStatus || 'NOT_STARTED';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('Status breakdown:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

  } catch (error) {
    console.error('Error checking document processing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDocumentProcessing();
