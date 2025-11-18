/**
 * Script to process existing documents with Colivara
 * This script will iterate through all existing documents and trigger Colivara processing for them
 */

import prisma from '@/lib/prisma';
import ColivaraService from '@/lib/services/colivara-service';
import { Document } from '@/lib/api/types';

async function processExistingDocuments() {
  console.log('Starting migration of existing documents to Colivara...\n');
  
  try {
    // Initialize Colivara service
    const colivaraService = new ColivaraService();
    await colivaraService.initialize();
    console.log('✅ Colivara service initialized\n');
    
    // Get all documents that haven't been processed by Colivara yet
    const documents = await prisma.document.findMany({
      where: {
        OR: [
          { colivaraProcessingStatus: null },
          { colivaraProcessingStatus: 'PENDING' }
        ]
      },
      include: {
        uploadedByUser: true,
        documentUnit: true,
      }
    });
    
    console.log(`Found ${documents.length} documents to process with Colivara\n`);
    
    if (documents.length === 0) {
      console.log('No documents need processing. All documents have already been processed by Colivara.');
      return;
    }
    
    let processedCount = 0;
    let failedCount = 0;
    
    // Process documents in batches to avoid overwhelming the API
    const batchSize = 5; // Process 5 documents at a time
    
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(documents.length / batchSize)}`);
      
      // Process each document in the batch
      const batchPromises = batch.map(async (doc) => {
        try {
          console.log(`  Processing document: ${doc.title} (${doc.id})`);
          
          // Convert Prisma document to our Document type
          const document: Document = {
            id: doc.id,
            title: doc.title,
            description: doc.description,
            category: doc.category,
            tags: Array.isArray(doc.tags) ? doc.tags as string[] : [],
            uploadedBy: doc.uploadedByUser?.name || doc.uploadedBy,
            uploadedById: doc.uploadedById,
            uploadedAt: new Date(doc.uploadedAt),
            fileUrl: doc.fileUrl,
            fileName: doc.fileName,
            fileType: doc.fileType,
            fileSize: doc.fileSize,
            downloadsCount: doc.downloadsCount || 0,
            viewsCount: doc.viewsCount || 0,
            version: doc.version || 1,
            versionNotes: doc.versionNotes || undefined,
            status: doc.status as 'ACTIVE' | 'ARCHIVED' | 'PENDING_REVIEW',
            createdAt: new Date(doc.createdAt),
            updatedAt: new Date(doc.updatedAt),
            unitId: doc.unitId || undefined,
            unit: doc.documentUnit ? {
              id: doc.documentUnit.id,
              name: doc.documentUnit.name,
              code: doc.documentUnit.code,
              description: doc.documentUnit.description || undefined,
              createdAt: doc.documentUnit.createdAt,
              updatedAt: doc.documentUnit.updatedAt,
            } : undefined,
            colivaraDocumentId: doc.colivaraDocumentId ?? undefined,
            colivaraProcessingStatus: doc.colivaraProcessingStatus as 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' ?? undefined,
            colivaraProcessedAt: doc.colivaraProcessedAt ? new Date(doc.colivaraProcessedAt) : undefined,
            colivaraChecksum: doc.colivaraChecksum ?? undefined,
          };
          
          // Process the document with Colivara
          await colivaraService.processNewDocument(document, doc.fileUrl);
          processedCount++;
          console.log(`    ✅ Successfully queued for processing`);
        } catch (error) {
          failedCount++;
          console.error(`    ❌ Failed to process document ${doc.id}:`, error instanceof Error ? error.message : String(error));
        }
      });
      
      // Wait for all documents in the current batch to be processed
      await Promise.all(batchPromises);
      
      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < documents.length) {
        console.log(`  Waiting 2 seconds before processing next batch...\n`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\nMigration completed!');
    console.log(`Total documents: ${documents.length}`);
    console.log(`Successfully processed: ${processedCount}`);
    console.log(`Failed: ${failedCount}`);
    console.log(`Already processed: ${documents.length - processedCount - failedCount}`);
    
    console.log('\nNote: Document processing happens asynchronously in the background.');
    console.log('Check the database for processing status updates.');
    
  } catch (error) {
    console.error('❌ Error during document migration:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
  
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });
  
  processExistingDocuments()
    .then(() => {
      console.log('\nDocument migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nDocument migration script failed:', error);
      process.exit(1);
    });
}

export default processExistingDocuments;