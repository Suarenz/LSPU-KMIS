/**
 * Test script for Colivara search functionality
 * This script tests both semantic and hybrid search capabilities
 */

import ColivaraService from '@/lib/services/colivara-service';

async function testColivaraSearch() {
  console.log('Testing Colivara search functionality...\n');
  
  try {
    // Initialize Colivara service
    const colivaraService = new ColivaraService();
    await colivaraService.initialize();
    console.log('✅ Colivara service initialized\n');
    
    // Test semantic search with a sample query
    console.log('1. Testing semantic search...');
    const semanticResults = await colivaraService.performSemanticSearch('sample document query');
    console.log(`   Semantic search returned ${semanticResults.results.length} results`);
    console.log('   ✅ Semantic search completed\n');
    
    // Test hybrid search with a sample query
    console.log('2. Testing hybrid search...');
    const hybridResults = await colivaraService.performHybridSearch('sample document query');
    console.log(`   Hybrid search returned ${hybridResults.results.length} results`);
    console.log('   ✅ Hybrid search completed\n');
    
    // Test search with filters
    console.log('3. Testing search with filters...');
    const filteredResults = await colivaraService.performSemanticSearch(
      'sample document query', 
      { category: 'Uncategorized' } // Using a common category
    );
    console.log(`   Filtered search returned ${filteredResults.results.length} results`);
    console.log('   ✅ Filtered search completed\n');
    
    console.log('🎉 Colivara search functionality test completed successfully!');
    console.log('\nSearch capabilities are now available in the application:');
    console.log('- Semantic search using Colivara AI processing');
    console.log('- Hybrid search combining traditional and semantic results');
    console.log('- Filtered search with unit, category, and other constraints');
    
    return true;
 } catch (error) {
    console.error('❌ Colivara search test failed:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testColivaraSearch()
    .then(success => {
      console.log(`\nSearch test ${success ? 'completed' : 'failed'}.`);
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unexpected error during search test:', error);
      process.exit(1);
    });
}

export default testColivaraSearch;