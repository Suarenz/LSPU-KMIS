import prisma from '@/lib/prisma';

async function checkRecentDocuments() {
  try {
    console.log('Checking recent documents in database...\n');
    
    const recentDocuments = await prisma.document.findMany({
      select: {
        id: true,
        title: true,
        fileName: true,
        category: true,
        isQproDocument: true,
        colivaraDocumentId: true,
        colivaraProcessingStatus: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    console.log(`Found ${recentDocuments.length} recent documents:\n`);
    
    recentDocuments.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.title}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Category: ${doc.category}`);
      console.log(`   Is QPRO: ${doc.isQproDocument}`);
      console.log(`   Colivara ID: ${doc.colivaraDocumentId || 'NOT SET'}`);
      console.log(`   Status: ${doc.colivaraProcessingStatus || 'NOT SET'}`);
      console.log(`   Created: ${doc.createdAt.toISOString()}`);
      console.log('');
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkRecentDocuments();
