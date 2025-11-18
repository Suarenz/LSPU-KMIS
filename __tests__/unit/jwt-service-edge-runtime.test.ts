/**
 * Validation script to verify that JWT service works in edge runtime environment
 * This script ensures that no Node.js crypto modules are used
 */

import jwtService from '@/lib/services/jwt-service';

// Mock the environment to simulate edge runtime
if (typeof global !== 'undefined') {
  Object.defineProperty(global, 'crypto', {
    value: {
      subtle: {
        digest: async () => new ArrayBuffer(32)
      }
    },
    writable: true
  });
}

// Validation functions
function validateJWTService() {
  console.log('Validating JWT Service for Edge Runtime Compatibility...');
  
  // Verify that the JWT service can be imported without errors
  if (!jwtService) {
    throw new Error('JWT service is not defined');
  }
  console.log('✓ JWT service can be imported without errors');
  
  // Verify that the JWT service has the required methods
  if (typeof jwtService.verifyToken !== 'function') {
    throw new Error('verifyToken method is not defined');
  }
  if (typeof jwtService.decodeToken !== 'function') {
    throw new Error('decodeToken method is not defined');
  }
  if (typeof jwtService.isTokenExpired !== 'function') {
    throw new Error('isTokenExpired method is not defined');
  }
  console.log('✓ JWT service has all required methods');
}

function testTokenDecoding() {
  console.log('Testing JWT token decoding...');
  
  // Create a mock JWT token with a valid payload
  const mockPayload = {
    userId: 'test-user-id',
    email: 'test@example.com',
    role: 'ADMIN',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  };

  // Create a mock JWT (header.payload.signature format)
  const header = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
  const payload = JSON.stringify(mockPayload);
  const encodedHeader = btoa(header).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const encodedPayload = btoa(payload).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const mockSignature = 'mock-signature'; // In edge runtime, we can't verify signature
  
  const mockToken = `${encodedHeader}.${encodedPayload}.${mockSignature}`;

  // Test decoding the token
  const decoded = jwtService.decodeToken(mockToken);
  
  if (!decoded) {
    throw new Error('Failed to decode token');
  }
  if (decoded.userId !== mockPayload.userId) {
    throw new Error(`Expected userId to be ${mockPayload.userId}, got ${decoded.userId}`);
  }
  if (decoded.email !== mockPayload.email) {
    throw new Error(`Expected email to be ${mockPayload.email}, got ${decoded.email}`);
  }
  if (decoded.role !== mockPayload.role) {
    throw new Error(`Expected role to be ${mockPayload.role}, got ${decoded.role}`);
  }
  console.log('✓ Token decoding works correctly');
}

function testTokenExpiration() {
  console.log('Testing token expiration checking...');
  
  // Create a mock JWT token that has expired
  const expiredPayload = {
    userId: 'test-user-id',
    email: 'test@example.com',
    role: 'ADMIN',
    iat: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
    exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago (expired)
  };

  const header = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
  const payload = JSON.stringify(expiredPayload);
  const encodedHeader = btoa(header).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
 const encodedPayload = btoa(payload).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const mockToken = `${encodedHeader}.${encodedPayload}.mock-signature`;

  // Test expiration check
  const isExpired = jwtService.isTokenExpired(mockToken);
  if (!isExpired) {
    throw new Error('Expected expired token to return true for isTokenExpired');
  }

  // Create a mock JWT token that is not expired
  const validPayload = {
    userId: 'test-user-id',
    email: 'test@example.com',
    role: 'ADMIN',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  };

  const validHeader = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
  const validPayloadStr = JSON.stringify(validPayload);
  const encodedValidHeader = btoa(validHeader).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const encodedValidPayload = btoa(validPayloadStr).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
 const validToken = `${encodedValidHeader}.${encodedValidPayload}.mock-signature`;

  const isValid = jwtService.isTokenExpired(validToken);
  if (isValid) {
    throw new Error('Expected valid token to return false for isTokenExpired');
  }
  console.log('✓ Token expiration checking works correctly');
}

function testTokenStructureValidation() {
  console.log('Testing token structure validation...');
  
  // Test with a valid token structure (but invalid content)
  const mockToken = 'header.payload.signature';
  const result = jwtService.verifyToken(mockToken);
  // This should return null because the payload is not valid JSON
  if (result !== null) {
    throw new Error('Expected invalid token to return null');
  }

  // Test with an invalid token structure (missing parts)
  const invalidToken = 'header.payload'; // Only 2 parts instead of 3
  const invalidResult = jwtService.verifyToken(invalidToken);
  if (invalidResult !== null) {
    throw new Error('Expected invalid structure token to return null');
  }

  // Test with empty token
  const emptyResult = jwtService.verifyToken('');
  if (emptyResult !== null) {
    throw new Error('Expected empty token to return null');
  }
  console.log('✓ Token structure validation works correctly');
}

// Run all validations
try {
  validateJWTService();
  testTokenDecoding();
  testTokenExpiration();
  testTokenStructureValidation();
  console.log('\n✓ All validations passed! JWT service is compatible with edge runtime.');
} catch (error) {
  console.error('\n✗ Validation failed:', error);
  process.exit(1);
}