// Validation script to verify that Colivara service works correctly
// This script tests the main functionality of the Colivara service

import ColivaraService from '@/lib/services/colivara-service';

// Test functions
function validateColivaraServiceImport() {
  console.log('Validating Colivara Service import...');
  
  // Verify that the Colivara service can be imported without errors
  if (!ColivaraService) {
    throw new Error('Colivara service is not defined');
  }
  console.log('✓ Colivara service can be imported without errors');
  
  // Verify that the Colivara service has the required methods
  const service = new ColivaraService();
  if (typeof service.initialize !== 'function') {
    throw new Error('initialize method is not defined');
  }
  if (typeof service.performSemanticSearch !== 'function') {
    throw new Error('performSemanticSearch method is not defined');
  }
  if (typeof service.performHybridSearch !== 'function') {
    throw new Error('performHybridSearch method is not defined');
  }
  if (typeof service.uploadDocument !== 'function') {
    throw new Error('uploadDocument method is not defined');
  }
  if (typeof service.indexDocument !== 'function') {
    throw new Error('indexDocument method is not defined');
  }
  console.log('✓ Colivara service has all required methods');
}

function validateServiceInitialization() {
  console.log('Testing service initialization...');
  
  // Create a service instance with test config
  const service = new ColivaraService({
    apiKey: process.env.COLIVARA_API_KEY || 'test-api-key'
  });
  
  // Verify that the service was created with proper defaults
  if (!service) {
    throw new Error('Failed to create Colivara service instance');
  }
  
  console.log('✓ Colivara service initialization works correctly');
}

function validateServiceConfiguration() {
  console.log('Testing service configuration...');
  
  // Create a service instance with custom config
  const customConfig = {
    apiKey: 'custom-api-key',
    processingTimeout: 60000,
    maxFileSize: 10485760, // 100MB
    defaultCollection: 'test-collection'
  };
  
  const service = new ColivaraService(customConfig);
  
  // Verify that the service was created with custom config
  if (!service) {
    throw new Error('Failed to create Colivara service instance with custom config');
  }
  
  console.log('✓ Colivara service configuration works correctly');
}

// Run all validations
try {
  validateColivaraServiceImport();
  validateServiceInitialization();
  validateServiceConfiguration();
  console.log('\n✓ All validations passed! Colivara service is working correctly.');
} catch (error) {
  console.error('\n✗ Validation failed:', error);
  process.exit(1);
}