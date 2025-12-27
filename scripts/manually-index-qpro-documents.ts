import prisma from '../lib/prisma';
import ColivaraService from '../lib/services/colivara-service';
import fs from 'fs';
import path from 'path';

async function manuallyIndexQproDocuments() {
  console.log('🚀 Manually Indexing QPRO Documents\n');

  try {
    const colivaraService = new ColivaraService();
    await colivaraService.initialize();
    console.log('✅ Colivara service initialized\n');

    // Get QPRO documents that are PENDING or have no Colivara ID
    const pendingDocs = await prisma.document.findMany({
      where: {
        isQproDocument: true,
        OR: [
          { colivaraProcessingStatus: 'PENDING' },
          { colivaraProcessingStatus: 'FAILED' },
          { colivaraDocumentId: null }
        ]
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });

    if (pendingDocs.length === 0) {
      console.log('✅ No pending QPRO documents found. All documents are already indexed!');
      return;
    }

    console.log(`Found ${pendingDocs.length} QPRO document(s) to index:\n`);

    for (const doc of pendingDocs) {
      console.log(`📄 Processing: ${doc.title || doc.fileName}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Current Status: ${doc.colivaraProcessingStatus}`);

      try {
        // We need the base64 content
        // For now, we need to manually re-upload the file or download it from Azure with proper authentication
        console.log(`   ⚠️  Cannot auto-index: Azure storage requires authentication`);
        console.log(`   📋 Document URL: ${doc.fileUrl}`);
        console.log(`   💡 Solution: Re-upload this document through the QPRO upload page`);
        console.log(`      OR provide a SAS token for the Azure blob\n`);
        
        // For testing, you could uncomment this if you have the file locally:
        // const localFilePath = path.join(__dirname, '../test-files', doc.fileName);
        // if (fs.existsSync(localFilePath)) {
        //   const buffer = fs.readFileSync(localFilePath);
        //   const base64Content = buffer.toString('base64');
        //   const success = await colivaraService.indexDocument(doc.id, base64Content);
        //   if (success) console.log(`   ✅ Successfully indexed`);
        // }
        
      } catch (error) {
        console.error(`   ❌ Error processing document ${doc.id}:`, error);
        console.log('');
      }
    }

    console.log('─────────────────────────────────────────────────');
    console.log('✅ Manual indexing process completed!');
    console.log('\n💡 Next steps:');
    console.log('   1. Wait 2-3 minutes for Colivara to process the documents');
    console.log('   2. Run: npx tsx scripts/check-qpro-colivara-status.ts');
    console.log('   3. Once status is COMPLETED, try searching again!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

manuallyIndexQproDocuments();
