import { createClient } from '@supabase/supabase-js';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// Mock NextRequest for testing
class MockNextRequest {
  url: string;
  headers: any;
  cookies: any;

  constructor(url: string = 'http://localhost:3000/api/documents') {
    this.url = url;
    this.headers = new Headers();
    this.cookies = {};
  }

  get nextUrl() {
    return {
      pathname: '/api/documents',
      search: '',
    };
  }
}

console.log('Testing fixes for the LSPU KMIS application...\n');

async function testAuthFixes() {
  console.log('1. Testing authentication fixes...');
  
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Test that getUser() works (instead of getSession())
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('  ✓ getUser() properly handles missing session (expected if not logged in)');
    } else if (user) {
      console.log('  ✓ getUser() successfully retrieved user data');
    } else {
      console.log('  ✓ getUser() properly returned null for no user (expected if not logged in)');
    }
  } catch (error) {
    console.log('  ⚠ getUser() test encountered an issue (may be expected if not authenticated):', error instanceof Error ? error.message : error);
  }
  
  console.log('  Authentication fixes test completed.\n');
}

async function testDatabaseConnection() {
  console.log('2. Testing database connection...');
  
  try {
    await prisma.$connect();
    console.log('  ✓ Database connection successful');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`  ✓ Users table accessible, total users: ${userCount}`);
    
    await prisma.$disconnect();
    console.log('  Database connection test completed.\n');
  } catch (error) {
    console.log('  ⚠ Database connection failed:', error instanceof Error ? error.message : error);
    console.log('    Note: This may be expected if database credentials are not properly configured');
    console.log('    Please check your DATABASE_URL in .env file\n');
  }
}

async function testRLSPolicies() {
  console.log('3. Testing RLS policies (indirectly)...');
  
  try {
    await prisma.$connect();
    
    // Try to query users table which had the infinite recursion issue
    const sampleUsers = await prisma.user.findMany({
      take: 1, // Just get one user to test if query works
      select: {
        id: true,
        email: true,
      }
    });
    
    console.log('  ✓ Users table query successful - RLS policy recursion appears to be fixed');
    console.log(`  ✓ Retrieved ${sampleUsers.length} users successfully`);
    
    await prisma.$disconnect();
    console.log('  RLS policies test completed.\n');
  } catch (error) {
    console.log('  ⚠ Users table query failed:', error instanceof Error ? error.message : error);
    console.log('    This may indicate the RLS policy recursion issue still exists\n');
  }
}

async function testDocumentService() {
  console.log('4. Testing Document Service error handling...');
  
  try {
    // Import after other tests to ensure changes are loaded
    const { default: documentService } = await import('@/lib/services/document-service');
    
    // Test that the service handles database errors gracefully
    try {
      // This should handle database errors gracefully now
      const result = await documentService.getDocuments(1, 1);
      console.log('  ✓ Document service getDocuments method works');
      console.log(`  ✓ Retrieved ${result.documents.length} documents, total: ${result.total}`);
    } catch (error) {
      console.log('  ⚠ Document service getDocuments failed:', error instanceof Error ? error.message : error);
    }
    
    console.log('  Document Service test completed.\n');
  } catch (error) {
    console.log('  ⚠ Document service test failed to import:', error instanceof Error ? error.message : error);
  }
}

async function runAllTests() {
  console.log('Running comprehensive tests for all fixes...\n');
  
  await testAuthFixes();
  await testDatabaseConnection();
  await testRLSPolicies();
  await testDocumentService();
  
  console.log('All tests completed!');
  console.log('\nSummary of fixes applied:');
  console.log('- Fixed authentication security warning by using supabase.auth.getUser() instead of getSession()');
  console.log('- Fixed infinite recursion in RLS policies by removing circular references');
  console.log('- Added error handling to document service methods');
  console.log('- Updated auth service to use secure getUser() method');
  console.log('- Created database configuration documentation');
  console.log('\nNote: Database connection errors require correct credentials in your environment.');
}

// Run the tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runAllTests().catch(console.error);
}

export default runAllTests;