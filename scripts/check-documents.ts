import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDocuments() {
  try {
    // Count all documents
    const totalDocuments = await prisma.document.count();
    console.log(`Total documents in database: ${totalDocuments}`);
    
    // Get documents with Colivara fields
    const documentsWithColivara = await prisma.document.count({
      where: {
        colivaraDocumentId: { not: null }
      }
    });
    console.log(`Documents with Colivara ID: ${documentsWithColivara}`);
    
    // Get active documents
    const activeDocuments = await prisma.document.count({
      where: {
        status: 'ACTIVE'
      }
    });
    console.log(`Active documents: ${activeDocuments}`);
    
    // Get document statuses
    const statusCounts = await prisma.document.groupBy({
      by: ['status'],
      _count: true,
    });
    console.log('Document status counts:', statusCounts);
    
    // Get a few sample documents to see their structure
    const sampleDocuments = await prisma.document.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        colivaraDocumentId: true,
        colivaraProcessingStatus: true,
        fileName: true,
        fileUrl: true
      }
    });
    console.log('Sample documents:', JSON.stringify(sampleDocuments, null, 2));
    
  } catch (error) {
    console.error('Error checking documents:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  checkDocuments()
    .then(() => {
      console.log('Document check completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Document check failed:', error);
      process.exit(1);
    });
}