// Simple Colivara service test
require('dotenv').config();

// Test environment variables
console.log('Testing Colivara environment configuration...\n');

const apiKey = process.env.COLIVARA_API_KEY;
const apiEndpoint = process.env.COLIVARA_API_ENDPOINT;
const processingTimeout = process.env.COLIVARA_PROCESSING_TIMEOUT;

console.log('Environment Variables Check:');
console.log(`✅ COLIVARA_API_KEY is ${apiKey ? 'SET' : 'NOT SET'}`);
console.log(`✅ COLIVARA_API_ENDPOINT is ${apiEndpoint ? 'SET' : 'NOT SET'}`);
console.log(`✅ COLIVARA_PROCESSING_TIMEOUT is ${processingTimeout ? 'SET' : 'NOT SET'}`);

if (apiKey && apiEndpoint) {
    console.log('\n🎉 Environment variables are properly configured!');
    console.log('The Colivara service has the required environment configuration.');
} else {
    console.log('\n❌ Environment variables are missing!');
    console.log('Please ensure COLIVARA_API_KEY and COLIVARA_API_ENDPOINT are set in your .env file.');
}

console.log('\nNote: To fully test the Colivara service, you would need to run:');
console.log('npm run test:colivara (or similar command) after fixing npm issues');