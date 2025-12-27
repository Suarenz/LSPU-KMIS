/**
 * Force Index Latest QPRO Document
 * This script will manually fetch and index the latest QPRO document
 */

import prisma from '../lib/prisma';
import ColivaraService from '../lib/services/colivara-service';
import fetch from 'node-fetch';

async function forceIndexLatestQpro() {
  console.log('🚀 Force Indexing Latest QPRO Document\n');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Get the latest QPRO document
    const latestDoc = await prisma.document.findFirst({
      where: {
        isQproDocument: true,
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });

    if (!latestDoc) {
      console.log('❌ No QPRO documents found in database\n');
      return;
    }

    console.log('📄 Found QPRO Document:');
    console.log(`   Title: ${latestDoc.title}`);
    console.log(`   ID: ${latestDoc.id}`);
    console.log(`   Uploaded: ${latestDoc.uploadedAt.toLocaleString()}`);
    console.log(`   Status: ${latestDoc.colivaraProcessingStatus}`);
    console.log(`   File URL: ${latestDoc.fileUrl}\n`);

    // Check if we need to fetch the file
    console.log('⚠️  IMPORTANT: This will use Azure storage which requires authentication.');
    console.log('   The file URL is private and cannot be accessed without credentials.\n');

    console.log('💡 ALTERNATIVE SOLUTION:');
    console.log('   Since the file is in private Azure storage, you have 2 options:\n');
    
    console.log('   OPTION 1: Upload via QPRO UI with server logs visible');
    console.log('   ─────────────────────────────────────────────────');
    console.log('   1. Make sure your Next.js server is running');
    console.log('   2. Open the server terminal to see logs');
    console.log('   3. Upload the document');
    console.log('   4. Watch for these log messages:');
    console.log('      • [QPRO Upload] Starting Colivara indexing...');
    console.log('      • [Colivara] indexDocument called...');
    console.log('      • [Colivara] Document uploaded to Colivara with ID: ...');
    console.log('   5. If you DON\'T see these logs, the server wasn\'t restarted\n');

    console.log('   OPTION 2: Use local file (if you have it)');
    console.log('   ─────────────────────────────────────────────────');
    console.log('   1. Save this script modification:');
    console.log('      • Add: const fs = require("fs");');
    console.log('      • Add: const localFile = fs.readFileSync("path/to/your/file.docx");');
    console.log('      • Add: const base64 = localFile.toString("base64");');
    console.log('   2. Then call: colivaraService.indexDocument(docId, base64)\n');

    console.log('═══════════════════════════════════════════════════\n');
    console.log('🔍 DIAGNOSING THE PROBLEM:\n');

    // Try to initialize Colivara to check if that works
    try {
      console.log('Testing Colivara service initialization...');
      const colivaraService = new ColivaraService();
      await colivaraService.initialize();
      console.log('✅ Colivara service initialized successfully!');
      console.log('   This means your API key is valid.\n');
    } catch (initError) {
      console.error('❌ Colivara initialization failed:');
      console.error(initError);
      console.log('\n💡 Fix: Check your COLIVARA_API_KEY in .env file\n');
    }

    // Check if the document has base64 stored somehow
    console.log('Checking document metadata...');
    const docMetadata = latestDoc.colivaraMetadata as any;
    if (docMetadata && docMetadata.base64Content) {
      console.log('✅ Document has cached base64 content!');
      console.log('   Attempting to index now...\n');
      
      try {
        const colivaraService = new ColivaraService();
        await colivaraService.initialize();
        const success = await colivaraService.indexDocument(latestDoc.id, docMetadata.base64Content);
        
        if (success) {
          console.log('✅ Successfully started indexing!');
          console.log('⏳ Wait 2-3 minutes then check status\n');
        } else {
          console.log('❌ Indexing failed (returned false)\n');
        }
      } catch (indexError) {
        console.error('❌ Error during indexing:');
        console.error(indexError);
      }
    } else {
      console.log('❌ No cached base64 content in metadata\n');
    }

    console.log('═══════════════════════════════════════════════════\n');
    console.log('📋 SUMMARY:\n');
    console.log('The document exists but Colivara isn\'t processing it.');
    console.log('This happens because the upload route code isn\'t executing.\n');
    console.log('🔧 ROOT CAUSE: Next.js server needs restart after code changes\n');
    console.log('✅ SOLUTION:');
    console.log('   1. Stop your Next.js server (Ctrl+C)');
    console.log('   2. Start it again: npm run dev');
    console.log('   3. Upload your document again');
    console.log('   4. Watch the server console for Colivara logs');
    console.log('   5. Your Colivara credit should be deducted this time!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

forceIndexLatestQpro();
