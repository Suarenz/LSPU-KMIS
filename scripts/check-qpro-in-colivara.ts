import prisma from '@/lib/prisma';

async function checkQproDocuments() {
  try {
    console.log('Checking QPRO documents in database...\n');
    
    const qproDocuments = await prisma.document.findMany({
      where: {
        isQproDocument: true,
      },
      select: {
        id: true,
        title: true,
        fileName: true,
        colivaraDocumentId: true,
        colivaraProcessingStatus: true,
        colivaraProcessedAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    console.log(`Found ${qproDocuments.length} QPRO documents:\n`);
    
    qproDocuments.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.title}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   File: ${doc.fileName}`);
      console.log(`   Colivara ID: ${doc.colivaraDocumentId || 'NOT SET'}`);
      console.log(`   Status: ${doc.colivaraProcessingStatus || 'NOT SET'}`);
      console.log(`   Processed: ${doc.colivaraProcessedAt ? doc.colivaraProcessedAt.toISOString() : 'NOT PROCESSED'}`);
      console.log(`   Created: ${doc.createdAt.toISOString()}`);
      console.log('');
    });

    if (qproDocuments.length === 0) {
      console.log('⚠️  No QPRO documents found in database!');
    } else {
      const withColivaraId = qproDocuments.filter(d => d.colivaraDocumentId);
      const completed = qproDocuments.filter(d => d.colivaraProcessingStatus === 'COMPLETED');
      
      console.log(`\nSummary:`);
      console.log(`  Total QPRO docs: ${qproDocuments.length}`);
      console.log(`  With Colivara ID: ${withColivaraId.length}`);
      console.log(`  Status COMPLETED: ${completed.length}`);
      console.log(`  Status PENDING: ${qproDocuments.filter(d => d.colivaraProcessingStatus === 'PENDING').length}`);
      console.log(`  Status PROCESSING: ${qproDocuments.filter(d => d.colivaraProcessingStatus === 'PROCESSING').length}`);
      console.log(`  Status FAILED: ${qproDocuments.filter(d => d.colivaraProcessingStatus === 'FAILED').length}`);
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkQproDocuments();
