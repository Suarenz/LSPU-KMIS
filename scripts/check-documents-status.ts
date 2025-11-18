/**
 * Check script to see document processing status in the database
 * This script checks how many documents exist and their Colivara processing status
 */

import prisma from '@/lib/prisma';

async function checkDocumentsStatus() {
  console.log('Checking document processing status...\n');
  
  try {
    // Count total documents
    const totalDocuments = await prisma.document.count();
    console.log(`Total documents in database: ${totalDocuments}`);
    
    // Count documents with different Colivara processing statuses
    const pendingDocuments = await prisma.document.count({
      where: { colivaraProcessingStatus: 'PENDING' }
    });
    
    const processingDocuments = await prisma.document.count({
      where: { colivaraProcessingStatus: 'PROCESSING' }
    });
    
    const completedDocuments = await prisma.document.count({
      where: { colivaraProcessingStatus: 'COMPLETED' }
    });
    
    const failedDocuments = await prisma.document.count({
      where: { colivaraProcessingStatus: 'FAILED' }
    });
    
    console.log(`Documents with PENDING status: ${pendingDocuments}`);
    console.log(`Documents with PROCESSING status: ${processingDocuments}`);
    console.log(`Documents with COMPLETED status: ${completedDocuments}`);
    console.log(`Documents with FAILED status: ${failedDocuments}`);
    
    // Check for documents without Colivara status (might be old documents)
    const documentsWithoutStatus = await prisma.document.count({
      where: {
        colivaraProcessingStatus: null
      }
    });
    
    console.log(`Documents without Colivara status: ${documentsWithoutStatus}`);
    
    // Get a sample of documents to see their details
    const sampleDocuments = await prisma.document.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        fileName: true,
        colivaraProcessingStatus: true,
        colivaraDocumentId: true,
        colivaraProcessedAt: true
      }
    });
    
    console.log('\nSample documents:');
    sampleDocuments.forEach(doc => {
      console.log(`- ID: ${doc.id}`);
      console.log(`  Title: ${doc.title}`);
      console.log(`  File: ${doc.fileName}`);
      console.log(`  Colivara Status: ${doc.colivaraProcessingStatus || 'Not set'}`);
      console.log(`  Colivara Doc ID: ${doc.colivaraDocumentId || 'Not set'}`);
      console.log(`  Processed At: ${doc.colivaraProcessedAt || 'Not set'}`);
      console.log('');
    });
    
    console.log('🎉 Document status check completed successfully!');
    
    if (totalDocuments === 0) {
      console.log('\nNote: No documents exist in the database. You need to upload documents first.');
    } else if (completedDocuments === 0) {
      console.log('\nNote: Documents exist but none have been processed by Colivara yet.');
      console.log('You may need to run a script to process existing documents with Colivara.');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Document status check failed:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

// Run the check if this script is executed directly
if (require.main === module) {
  checkDocumentsStatus()
    .then(success => {
      console.log(`\nCheck ${success ? 'completed' : 'failed'}.`);
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unexpected error during check:', error);
      process.exit(1);
    });
}

export default checkDocumentsStatus;