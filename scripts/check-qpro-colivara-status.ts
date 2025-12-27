import prisma from '../lib/prisma';

async function checkQproColivaraStatus() {
  console.log('🔍 Checking QPRO Documents Colivara Indexing Status\n');

  try {
    // Get all QPRO documents
    const qproDocuments = await prisma.document.findMany({
      where: {
        isQproDocument: true,
      },
      orderBy: {
        uploadedAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        fileName: true,
        uploadedAt: true,
        colivaraDocumentId: true,
        colivaraProcessingStatus: true,
        colivaraProcessedAt: true,
        year: true,
        quarter: true,
      }
    });

    if (qproDocuments.length === 0) {
      console.log('❌ No QPRO documents found in the database.');
      return;
    }

    console.log(`Found ${qproDocuments.length} QPRO document(s):\n`);

    for (const doc of qproDocuments) {
      console.log('─────────────────────────────────────────────────');
      console.log(`📄 Document: ${doc.title || doc.fileName}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Year: ${doc.year}, Quarter: ${doc.quarter}`);
      console.log(`   Uploaded: ${doc.uploadedAt.toLocaleString()}`);
      console.log(`   Colivara Document ID: ${doc.colivaraDocumentId || '❌ Not set'}`);
      console.log(`   Processing Status: ${doc.colivaraProcessingStatus || '❌ Not set'}`);
      console.log(`   Processed At: ${doc.colivaraProcessedAt ? doc.colivaraProcessedAt.toLocaleString() : '❌ Not processed'}`);
      
      // Status indicator
      if (doc.colivaraProcessingStatus === 'COMPLETED') {
        console.log('   ✅ Status: READY FOR SEARCH');
      } else if (doc.colivaraProcessingStatus === 'PROCESSING') {
        console.log('   ⏳ Status: STILL PROCESSING (wait a few minutes)');
      } else if (doc.colivaraProcessingStatus === 'PENDING') {
        console.log('   ⏳ Status: QUEUED FOR PROCESSING');
      } else if (doc.colivaraProcessingStatus === 'FAILED') {
        console.log('   ❌ Status: PROCESSING FAILED');
      } else {
        console.log('   ❓ Status: UNKNOWN - May not have been sent to Colivara');
      }
      console.log('');
    }

    // Summary
    const statusCounts = qproDocuments.reduce((acc, doc) => {
      const status = doc.colivaraProcessingStatus || 'NONE';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('─────────────────────────────────────────────────');
    console.log('📊 Summary:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} document(s)`);
    });
    
    console.log('\n💡 Tips:');
    console.log('   - COMPLETED = Ready to search');
    console.log('   - PROCESSING/PENDING = Wait 2-5 minutes and check again');
    console.log('   - FAILED = Check server logs for errors');
    console.log('   - NONE = Document was not sent to Colivara (check upload process)');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkQproColivaraStatus();
