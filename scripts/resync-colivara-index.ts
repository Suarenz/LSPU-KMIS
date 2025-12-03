import { PrismaClient } from '@prisma/client';
import ColivaraService from '@/lib/services/colivara-service';

const prisma = new PrismaClient();

async function resyncColivaraIndex() {
  console.log('Starting Colivara index re-sync process...');
  
  try {
    // Initialize Colivara service
    const colivaraService = new ColivaraService();
    await colivaraService.initialize();
    
    // Fetch all documents that have been processed by Colivara
    const documents = await prisma.document.findMany({
      where: {
        colivaraDocumentId: { not: null },
        colivaraProcessingStatus: { not: null }
      },
      select: {
        id: true,
        title: true,
        colivaraDocumentId: true,
        colivaraProcessingStatus: true
      }
    });
    
    console.log(`Found ${documents.length} documents with Colivara entries to delete...`);
    
    let deletedCount = 0;
    let failedCount = 0;
    
    for (const document of documents) {
      try {
        console.log(`Deleting document ${document.id} (${document.title}) from Colivara index...`);
        
        // Delete the document from Colivara index
        const success = await colivaraService.deleteFromIndex(document.id);
        
        if (success) {
          console.log(`✓ Successfully deleted document ${document.id} from Colivara index`);
          deletedCount++;
        } else {
          console.log(`✗ Failed to delete document ${document.id} from Colivara index`);
          failedCount++;
        }
      } catch (error) {
        console.error(`Error deleting document ${document.id} from Colivara index:`, error);
        failedCount++;
      }
    }
    
    console.log(`\nStarting re-indexing process for all documents...`);
    
    // Fetch all documents that should be indexed (active documents)
    const allDocuments = await prisma.document.findMany({
      where: {
        status: 'ACTIVE'
      },
      select: {
        id: true,
        title: true,
        fileName: true,
        fileUrl: true,
        fileSize: true,
        fileType: true,
        uploadedAt: true,
        updatedAt: true
      }
    });
    
    console.log(`Found ${allDocuments.length} active documents to re-index...`);
    
    let indexedCount = 0;
    let indexFailedCount = 0;
    
    for (const document of allDocuments) {
      try {
        console.log(`Re-indexing document ${document.id} (${document.title})...`);
        
        // Trigger indexing for each document
        const success = await colivaraService.indexDocument(document.id);
        
        if (success) {
          console.log(`✓ Successfully started indexing for document ${document.id}`);
          indexedCount++;
        } else {
          console.log(`✗ Failed to start indexing for document ${document.id}`);
          indexFailedCount++;
        }
      } catch (error) {
        console.error(`Error starting indexing for document ${document.id}:`, error);
        indexFailedCount++;
      }
    }
    
    console.log(`\nRe-sync process completed:`);
    console.log(`- Successfully deleted: ${deletedCount} documents`);
    console.log(`- Failed to delete: ${failedCount} documents`);
    console.log(`- Successfully started re-indexing: ${indexedCount} documents`);
    console.log(`- Failed to start re-indexing: ${indexFailedCount} documents`);
    console.log(`- Total documents processed: ${documents.length} (deleted) + ${allDocuments.length} (re-indexed)`);
    
  } catch (error) {
    console.error('Error during Colivara index re-sync:', error);
    throw error;
 } finally {
    await prisma.$disconnect();
  }
}

// Run the re-sync process if this script is executed directly
if (require.main === module) {
  resyncColivaraIndex()
    .then(() => {
      console.log('Colivara index re-sync completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Colivara index re-sync failed:', error);
      process.exit(1);
    });
}

export { resyncColivaraIndex };