/**
 * Script to process existing documents with Colivara
 * This script processes all documents in the database that haven't been processed by Colivara yet
 */

import prisma from '@/lib/prisma';
import ColivaraService from '@/lib/services/colivara-service';

async function processExistingDocuments() {
  console.log('Processing existing documents with Colivara...\n');
  
  try {
    // Create Colivara service instance
    const colivaraService = new ColivaraService();
    
    // Initialize the service
    console.log('1. Initializing Colivara service...');
    await colivaraService.initialize();
    console.log('✅ Colivara service initialized successfully');
    
    // Get all documents that haven't been processed by Colivara
    const unprocessedDocuments = await prisma.document.findMany({
      where: {
        OR: [
          { colivaraProcessingStatus: null },
          { colivaraProcessingStatus: 'PENDING' }
        ]
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
    
    console.log(`\n2. Found ${unprocessedDocuments.length} documents to process`);
    
    if (unprocessedDocuments.length === 0) {
      console.log('No documents need processing. All documents have been processed by Colivara.');
      return true;
    }
    
    // Process each document
    let processedCount = 0;
    let errorCount = 0;
    
    for (const doc of unprocessedDocuments) {
      try {
        console.log(`\n  Processing document: ${doc.title} (${doc.fileName})`);
        
        // Prepare metadata for Colivara processing
        const metadata = {
          originalName: doc.fileName,
          size: doc.fileSize,
          type: doc.fileType,
          extension: doc.fileName.split('.').pop() || '',
          uploadedAt: doc.uploadedAt,
          lastModified: doc.updatedAt,
          hash: `${doc.id}_${doc.fileSize}_${doc.updatedAt.getTime()}` // Simple hash
        };
        
        // Upload document to Colivara for processing
        const colivaraDocId = await colivaraService.uploadDocument(
          doc.fileUrl,
          doc.id,
          metadata
        );
        
        console.log(` ✅ Uploaded to Colivara with ID: ${colivaraDocId}`);
        
        // Wait for processing to complete (with timeout)
        const completed = await colivaraService.waitForProcessing(
          colivaraDocId,
          300000 // 5 minute timeout
        );
        
        if (completed) {
          console.log(`  ✅ Processing completed for document: ${doc.title}`);
          
          // Update document with processing completion info
          await prisma.document.update({
            where: { id: doc.id },
            data: {
              colivaraProcessingStatus: 'COMPLETED',
              colivaraProcessedAt: new Date(),
              colivaraDocumentId: colivaraDocId
            }
          });
          
          processedCount++;
        } else {
          console.log(` ❌ Processing failed or timed out for document: ${doc.title}`);
          
          // Update document with failed status
          await prisma.document.update({
            where: { id: doc.id },
            data: {
              colivaraProcessingStatus: 'FAILED'
            }
          });
          
          errorCount++;
        }
      } catch (error) {
        console.error(`  ❌ Error processing document ${doc.title}:`, error instanceof Error ? error.message : String(error));
        
        // Update document with failed status
        try {
          await prisma.document.update({
            where: { id: doc.id },
            data: {
              colivaraProcessingStatus: 'FAILED'
            }
          });
        } catch (updateError) {
          console.error(`    Failed to update document status:`, updateError instanceof Error ? updateError.message : String(updateError));
        }
        
        errorCount++;
      }
    }
    
    console.log('\n3. Processing completed!');
    console.log(`  - Successfully processed: ${processedCount} documents`);
    console.log(` - Failed to process: ${errorCount} documents`);
    
    console.log('\n🎉 Document processing with Colivara completed successfully!');
    return true;
 } catch (error) {
    console.error('❌ Document processing failed:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

// Run the processing if this script is executed directly
if (require.main === module) {
  processExistingDocuments()
    .then(success => {
      console.log(`\nProcessing ${success ? 'completed' : 'failed'}.`);
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unexpected error during processing:', error);
      process.exit(1);
    });
}

export default processExistingDocuments;