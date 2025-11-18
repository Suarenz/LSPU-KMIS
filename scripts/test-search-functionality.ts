/**
 * Test script for Colivara search functionality
 * This script tests that the search functionality works properly with Colivara integration
 */

import ColivaraService from '@/lib/services/colivara-service';

async function testSearchFunctionality() {
  console.log('Testing Colivara search functionality...\n');
  
  try {
    // Create a new instance of the Colivara service
    console.log('1. Creating Colivara service instance...');
    const colivaraService = new ColivaraService();
    console.log('✅ Colivara service instantiated successfully');
    
    // Initialize the service
    console.log('\n2. Initializing Colivara service...');
    await colivaraService.initialize();
    console.log('✅ Colivara service initialized successfully');
    
    // Test semantic search with a simple query
    console.log('\n3. Testing semantic search...');
    const semanticResults = await colivaraService.performSemanticSearch("test document");
    console.log(`✅ Semantic search completed, found ${semanticResults.results.length} results`);
    
    // Test hybrid search
    console.log('\n4. Testing hybrid search...');
    const hybridResults = await colivaraService.performHybridSearch("test document");
    console.log(`✅ Hybrid search completed, found ${hybridResults.results.length} results`);
    
    // Test with a more specific query
    console.log('\n5. Testing with specific query...');
    const specificResults = await colivaraService.performHybridSearch("LSPU academic document");
    console.log(`✅ Specific query search completed, found ${specificResults.results.length} results`);
    
    console.log('\n🎉 Colivara search functionality test completed successfully!');
    console.log('\nResults summary:');
    console.log(`- Semantic search: ${semanticResults.results.length} results`);
    console.log(`- Hybrid search: ${hybridResults.results.length} results`);
    console.log(`- Specific query: ${specificResults.results.length} results`);
    
    // Display sample result if available
    if (specificResults.results.length > 0) {
      console.log('\nSample result:');
      console.log(JSON.stringify(specificResults.results[0], null, 2));
    } else {
      console.log('\nNote: No results returned. This could be because there are no documents processed by Colivara yet.');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Colivara search functionality test failed:', error instanceof Error ? error.message : String(error));
    return false;
 }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testSearchFunctionality()
    .then(success => {
      console.log(`\nTest ${success ? 'completed' : 'failed'}.`);
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unexpected error during test:', error);
      process.exit(1);
    });
}

export default testSearchFunctionality;