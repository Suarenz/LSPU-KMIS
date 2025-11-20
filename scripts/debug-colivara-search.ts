import ColivaraService from '../lib/services/colivara-service';

async function debugColivaraSearch() {
  console.log('Debugging Colivara search functionality...');
  
  try {
    // Initialize the Colivara service
    const colivaraService = new ColivaraService();
    
    // Try to initialize and test search
    await colivaraService.initialize();
    console.log('Colivara service initialized successfully');
    
    // Perform a test search
    const searchResults = await colivaraService.performSemanticSearch('test');
    console.log('Search results received:', searchResults);
    
    console.log('\nDetailed results:');
    searchResults.results.forEach((result, index) => {
      const doc = result.document as any; // Cast to any for debugging
      console.log(`Result ${index + 1}:`);
      console.log(`  documentId: ${result.documentId}`);
      console.log(`  title: ${result.title}`);
      console.log(`  score: ${result.score}`);
      console.log(`  confidenceScore: ${result.confidenceScore}`);
      console.log(`  document.id: ${result.document?.id}`);
      console.log(`  result keys:`, Object.keys(result));
      console.log(`  document keys:`, doc ? Object.keys(doc) : 'N/A');
      console.log(`  document_metadata:`, doc?.document_metadata);
      console.log(`  document_name:`, doc?.document_name);
      console.log(`  document_id:`, doc?.document_id);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error during Colivara search test:', error);
  }
}

// Run the test
debugColivaraSearch().catch(console.error);