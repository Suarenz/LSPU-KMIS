import { config } from 'dotenv';
config(); // Load environment variables from .env file

import ColivaraService from './lib/services/colivara-service';

async function testColivaraService() {
  console.log('Testing Colivara Service Initialization...');
  
  try {
    const colivaraService = new ColivaraService();
    
    console.log('Colivara service instance created');
    console.log('API Key set:', process.env.COLIVARA_API_KEY ? 'YES' : 'NO');
    console.log('API Endpoint:', process.env.COLIVARA_API_ENDPOINT);
    
    // Try to initialize the service
    await colivaraService.initialize();
    console.log('✅ Colivara service initialized successfully!');
    
    // Test API key validation
    const isValid = await colivaraService.validateApiKey();
    console.log('✅ API key validation result:', isValid);
    
 } catch (error) {
    console.error('❌ Error initializing Colivara service:', error);
  }
}

testColivaraService();