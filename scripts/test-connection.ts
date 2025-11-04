import prisma from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  
  try {
    // Test basic connection by querying a simple record
    const userCount = await prisma.user.count();
    console.log('✅ Database connection successful!');
    console.log(`📊 Found ${userCount} users in the database`);
    
    // Try to get a sample user
    const sampleUser = await prisma.user.findFirst();
    if (sampleUser) {
      console.log(`👤 Sample user: ${sampleUser.name} (${sampleUser.email})`);
    }
    
    // Test documents table
    const docCount = await prisma.document.count();
    console.log(`📄 Found ${docCount} documents in the database`);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

async function testStorageConnection() {
  console.log('\nTesting storage connection...');
  
  try {
    // Create a Supabase client with service role key for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // This needs to be set in your .env file
    );
    
    // Try to list files in the repository bucket
    const { data, error } = await supabase.storage
      .from('repository-files')
      .list('', { limit: 5 }); // List first 5 files
    
    if (error) {
      console.error('❌ Storage connection failed:', error.message);
      console.log('💡 Make sure you have set SUPABASE_SERVICE_ROLE_KEY in your .env file');
      return false;
    }
    
    console.log('✅ Storage connection successful!');
    console.log(`📁 Found ${data?.length || 0} files in repository bucket`);
    
    if (data && data.length > 0) {
      console.log('📂 Sample files:');
      data.slice(0, 3).forEach((file: any, index: number) => {
        console.log(`   ${index + 1}. ${file.name}`);
      });
    }
    
    return true;
  } catch (error: any) {
    console.error('❌ Storage connection failed:', error?.message || error);
    console.log('💡 Make sure you have set SUPABASE_SERVICE_ROLE_KEY in your .env file');
    return false;
  }
}

async function testDocumentService() {
  console.log('\nTesting Document Service functionality...');
  
  try {
    // Import the document service
    const { default: documentService } = await import('@/lib/services/document-service');
    
    // Test getting documents (without filters to get a general count)
    const result = await documentService.getDocuments(1, 5); // Get first 5 documents
    
    console.log('✅ Document Service test successful!');
    console.log(`📄 Retrieved ${result.documents.length} documents`);
    console.log(`📊 Total documents in system: ${result.total}`);
    
    if (result.documents.length > 0) {
      const firstDoc = result.documents[0];
      console.log(`📝 Sample document: "${firstDoc.title}" by ${firstDoc.uploadedBy}`);
      console.log(`📈 Downloads: ${firstDoc.downloadsCount}, Views: ${firstDoc.viewsCount}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Document Service test failed:', error);
    return false;
 }
}

async function runTests() {
  console.log('🔍 Starting connection tests...\n');
  
  const results = [];
  
  // Test database connection
 const dbResult = await testDatabaseConnection();
  results.push({ name: 'Database', success: dbResult });
  
  // Test storage connection
  const storageResult = await testStorageConnection();
  results.push({ name: 'Storage', success: storageResult });
  
  // Test document service
 const serviceResult = await testDocumentService();
  results.push({ name: 'Document Service', success: serviceResult });
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📋 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  
  let successCount = 0;
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${result.name}: ${status}`);
    if (result.success) successCount++;
  });
  
  console.log('\n' + '='.repeat(50));
  console.log(`Overall: ${successCount}/${results.length} tests passed`);
  
  if (successCount === results.length) {
    console.log('🎉 All tests passed! The system is properly configured.');
  } else {
    console.log('⚠️  Some tests failed. Please check the configuration.');
  }
  
  console.log('='.repeat(50));
  
  // Exit with appropriate code
  process.exit(successCount === results.length ? 0 : 1);
}

// Run the tests
runTests().catch(error => {
  console.error('Test execution error:', error);
  process.exit(1);
});