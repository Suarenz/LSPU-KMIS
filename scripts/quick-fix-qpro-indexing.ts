/**
 * Quick Fix for QPRO Document Indexing
 * 
 * This script will show you the status and provide instructions for fixing indexing issues.
 */

import prisma from '../lib/prisma';

async function quickFix() {
  console.log('🔧 QPRO Document Indexing Quick Fix\n');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    const qproDocuments = await prisma.document.findMany({
      where: {
        isQproDocument: true,
      },
      orderBy: {
        uploadedAt: 'desc'
      },
      take: 5, // Show last 5 documents
    });

    if (qproDocuments.length === 0) {
      console.log('❌ No QPRO documents found.\n');
      console.log('💡 Please upload a QPRO document first through the QPRO section of the application.\n');
      return;
    }

    console.log(`Found ${qproDocuments.length} recent QPRO document(s):\n`);

    const needsReupload: any[] = [];
    const processing: any[] = [];
    const ready: any[] = [];

    for (const doc of qproDocuments) {
      const status = doc.colivaraProcessingStatus;
      const isReady = status === 'COMPLETED' && doc.colivaraDocumentId;
      const isProcessing = status === 'PROCESSING';
      const needsFix = !status || status === 'PENDING' || status === 'FAILED';

      console.log(`📄 ${doc.title || doc.fileName}`);
      console.log(`   Uploaded: ${doc.uploadedAt.toLocaleString()}`);
      console.log(`   Status: ${status || 'NONE'}`);
      
      if (isReady) {
        console.log(`   ✅ READY - This document can be searched!\n`);
        ready.push(doc);
      } else if (isProcessing) {
        console.log(`   ⏳ PROCESSING - Wait a few minutes\n`);
        processing.push(doc);
      } else {
        console.log(`   ❌ NEEDS FIX - Not indexed\n`);
        needsReupload.push(doc);
      }
    }

    console.log('═══════════════════════════════════════════════════\n');
    console.log('📊 Summary:\n');
    console.log(`   ✅ Ready for search: ${ready.length}`);
    console.log(`   ⏳ Currently processing: ${processing.length}`);
    console.log(`   ❌ Need re-upload: ${needsReupload.length}\n`);

    if (needsReupload.length > 0) {
      console.log('═══════════════════════════════════════════════════\n');
      console.log('🔧 HOW TO FIX:\n');
      console.log('The following documents were not indexed by Colivara.');
      console.log('This usually happens when the background process fails.\n');
      console.log('👉 SOLUTION: Re-upload these documents:\n');
      
      for (const doc of needsReupload) {
        console.log(`   • ${doc.title || doc.fileName}`);
      }
      
      console.log('\n📝 Steps to re-upload:');
      console.log('   1. Go to the QPRO section in your application');
      console.log('   2. Upload the same document again');
      console.log('   3. Wait 2-3 minutes');
      console.log('   4. Run this script again to verify: npx tsx scripts/quick-fix-qpro-indexing.ts');
      console.log('   5. Once status shows ✅ READY, you can search for the document!\n');
    } else if (processing.length > 0) {
      console.log('═══════════════════════════════════════════════════\n');
      console.log('⏳ DOCUMENTS ARE PROCESSING\n');
      console.log('Colivara is currently indexing your documents.');
      console.log('This usually takes 2-5 minutes depending on document size.\n');
      console.log('💡 What to do:');
      console.log('   1. Wait 3-5 minutes');
      console.log('   2. Run this script again: npx tsx scripts/quick-fix-qpro-indexing.ts');
      console.log('   3. Status should change to ✅ READY\n');
    } else {
      console.log('═══════════════════════════════════════════════════\n');
      console.log('✅ ALL DOCUMENTS ARE READY!\n');
      console.log('You can now search for information in these documents');
      console.log('using the AI-Powered Search feature.\n');
      console.log('Example searches:');
      console.log('   • "What is the total number of graduates?"');
      console.log('   • "Show me the performance metrics"');
      console.log('   • "What are the KPIs for this quarter?"\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

quickFix();
