import ColivaraService from '../lib/services/colivara-service';

async function testColivaraSearch() {
  try {
    console.log('Testing Colivara search...\n');

    const colivaraService = new ColivaraService();
    
    const query = 'what is the total number of graduates in bs information technology';
    console.log(`Query: "${query}"\n`);
    
    const results = await colivaraService.performSemanticSearch(query);
    
    console.log(`Found ${results.total} results\n`);
    
    if (results.results.length > 0) {
      console.log('First result details:');
      console.log('─'.repeat(80));
      const firstResult = results.results[0];
      console.log('Document ID:', firstResult.documentId);
      console.log('Title:', firstResult.title);
      console.log('Score:', firstResult.score);
      console.log('Confidence Score:', firstResult.confidenceScore);
      console.log('Page Numbers:', firstResult.pageNumbers);
      console.log('Content length:', firstResult.content?.length || 0);
      console.log('Extracted Text length:', firstResult.extractedText?.length || 0);
      console.log('Snippet length:', firstResult.snippet?.length || 0);
      console.log('\n─── Content Preview (first 500 chars) ───');
      console.log(firstResult.content?.substring(0, 500) || 'No content');
      console.log('\n─── Extracted Text Preview (first 500 chars) ───');
      console.log(firstResult.extractedText?.substring(0, 500) || 'No extracted text');
      console.log('\n─── Snippet Preview ───');
      console.log(firstResult.snippet || 'No snippet');
      console.log('─'.repeat(80));
    } else {
      console.log('No results found. This could mean:');
      console.log('1. The document is not indexed in Colivara collection');
      console.log('2. The search query doesn\'t match any indexed content');
      console.log('3. Colivara API connection issue');
    }

  } catch (error) {
    console.error('Error testing Colivara search:', error);
  }
}

testColivaraSearch();
