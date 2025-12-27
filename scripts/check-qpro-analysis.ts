import prisma from '@/lib/prisma';

async function checkQproAnalysis() {
  try {
    console.log('Checking QPRO documents and their analyses...\n');
    
    const qproDocuments = await prisma.document.findMany({
      where: {
        isQproDocument: true,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        title: true,
        fileName: true,
        colivaraDocumentId: true,
        qproAnalyses: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    console.log(`Found ${qproDocuments.length} active QPRO documents:\n`);
    
    qproDocuments.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.title}`);
      console.log(`   Document ID: ${doc.id}`);
      console.log(`   Colivara ID: ${doc.colivaraDocumentId || 'NOT SET'}`);
      console.log(`   Has Analysis: ${doc.qproAnalyses.length > 0 ? 'YES' : 'NO'}`);
      if (doc.qproAnalyses.length > 0) {
        console.log(`   Analysis ID: ${doc.qproAnalyses[0].id}`);
        console.log(`   Analysis Status: ${doc.qproAnalyses[0].status}`);
      }
      console.log('');
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkQproAnalysis();
