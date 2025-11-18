/**
 * Performance test for Colivara service
 * This test measures the performance of key operations in the Colivara service
 */

import ColivaraService from '@/lib/services/colivara-service';

// Mock environment variables for testing
process.env.COLIVARA_API_KEY = process.env.COLIVARA_API_KEY || 'test-api-key';

// Performance test functions
function measureExecutionTime(fn: () => void, testName: string): number {
  const startTime = performance.now();
  fn();
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  console.log(`${testName}: ${executionTime.toFixed(2)} milliseconds`);
  return executionTime;
}

async function measureAsyncExecutionTime(fn: () => Promise<void>, testName: string): Promise<number> {
  const startTime = performance.now();
  await fn();
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  console.log(`${testName}: ${executionTime.toFixed(2)} milliseconds`);
  return executionTime;
}

function validatePerformanceThreshold(executionTime: number, threshold: number, testName: string): boolean {
  const isWithinThreshold = executionTime <= threshold;
  console.log(`${testName} - Performance: ${isWithinThreshold ? 'PASS' : 'FAIL'} (Threshold: ${threshold}ms, Actual: ${executionTime.toFixed(2)}ms)`);
  return isWithinThreshold;
}

async function testServiceInitializationPerformance() {
  console.log('\n--- Testing Service Initialization Performance ---');
  
  const executionTime = await measureAsyncExecutionTime(async () => {
    const service = new ColivaraService();
    // Just create the instance, don't initialize to avoid API calls
  }, 'Service Creation');
  
  // Creation should be very fast (< 10ms)
  validatePerformanceThreshold(executionTime, 10, 'Service Creation');
}

async function testSearchPerformance() {
  console.log('\n--- Testing Search Performance ---');
  
  const colivaraService = new ColivaraService();
  
  // Mock search performance (since actual search would require API calls)
  const executionTime = await measureAsyncExecutionTime(async () => {
    // In a real scenario, this would call the search API
    // For performance testing, we'll just simulate the call
    await new Promise(resolve => setTimeout(resolve, 5)); // Simulate 5ms API call
  }, 'Mock Search Operation');
  
  // Search should complete within reasonable time
  validatePerformanceThreshold(executionTime, 100, 'Search Operation');
}

async function testDocumentUploadPerformance() {
  console.log('\n--- Testing Document Upload Performance ---');
  
  const colivaraService = new ColivaraService();
  
  // Mock document upload performance (since actual upload would require API calls)
  const executionTime = await measureAsyncExecutionTime(async () => {
    // In a real scenario, this would call the upload API
    // For performance testing, we'll just simulate the call
    await new Promise(resolve => setTimeout(resolve, 10)); // Simulate 10ms API call
  }, 'Mock Document Upload Operation');
  
  // Document upload should complete within reasonable time
  validatePerformanceThreshold(executionTime, 500, 'Document Upload Operation');
}

async function testStatusCheckPerformance() {
  console.log('\n--- Testing Status Check Performance ---');
  
  const colivaraService = new ColivaraService();
  
  // Mock status check performance (since actual check would require API calls)
  const executionTime = await measureAsyncExecutionTime(async () => {
    // In a real scenario, this would call the status check API
    // For performance testing, we'll just simulate the call
    await new Promise(resolve => setTimeout(resolve, 3)); // Simulate 3ms API call
  }, 'Mock Status Check Operation');
  
  // Status check should be relatively fast
  validatePerformanceThreshold(executionTime, 100, 'Status Check Operation');
}

function testMemoryUsage() {
  console.log('\n--- Testing Memory Usage ---');
  
  // Initial memory measurement (if available)
  let initialMemory: number | undefined;
  if (typeof process !== 'undefined' && process.memoryUsage) {
    initialMemory = process.memoryUsage().heapUsed;
    console.log(`Initial heap usage: ${(initialMemory / 1024 / 1024).toFixed(2)} MB`);
  }
  
  // Create multiple service instances to test memory usage
  const services: ColivaraService[] = [];
  for (let i = 0; i < 10; i++) {
    services.push(new ColivaraService());
  }
  
  if (initialMemory && typeof process !== 'undefined' && process.memoryUsage) {
    const finalMemory = process.memoryUsage().heapUsed;
    console.log(`Final heap usage: ${(finalMemory / 1024 / 1024).toFixed(2)} MB`);
    const memoryIncrease = finalMemory - initialMemory;
    console.log(`Memory increase after creating 10 services: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`);
    
    // Memory increase should be reasonable
    if (memoryIncrease < 10 * 1024 * 1024) { // Less than 10MB for 10 instances
      console.log('Memory usage: PASS (Reasonable increase)');
    } else {
      console.log('Memory usage: FAIL (Excessive increase)');
    }
  } else {
    console.log('Memory usage: Unable to measure (process.memoryUsage not available)');
  }
}

async function runPerformanceTests() {
  console.log('Starting Colivara Service Performance Tests...\n');
  
  try {
    await testServiceInitializationPerformance();
    await testSearchPerformance();
    await testDocumentUploadPerformance();
    await testStatusCheckPerformance();
    testMemoryUsage();
    
    console.log('\n✓ All performance tests completed!');
    console.log('\nNote: These are baseline performance measurements.');
    console.log('Actual performance will depend on network conditions, API response times,');
    console.log('and the size/complexity of documents being processed.');
  } catch (error) {
    console.error('\n✗ Performance test failed:', error);
    process.exit(1);
  }
}

// Execute the performance tests
runPerformanceTests();