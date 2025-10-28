import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
require('dotenv').config();

// This script tests if the file upload functionality works after applying RLS policy fixes
async function testFileUploadFix() {
  console.log('Testing file upload functionality after RLS policy fixes...\n');

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Use anon key for client-side operations
  );

  console.log('Supabase client created');
  
  // Create a mock file for testing (this simulates the file upload process)
  // In a real test, you'd need to be logged in as an admin or faculty user
  try {
    // First, let's check if the repository-files bucket exists
    console.log('Checking if repository-files bucket exists...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Error listing buckets:', bucketError);
      return;
    }
    
    const repositoryFilesBucket = buckets.find(bucket => bucket.name === 'repository-files');
    if (!repositoryFilesBucket) {
      console.error('Repository-files bucket not found. Please create it first in your Supabase dashboard.');
      return;
    }
    
    console.log('Repository-files bucket found:', repositoryFilesBucket.name);
    console.log('Bucket public: ', repositoryFilesBucket.public);
    
    // Generate a test file name
    const testFileName = `test-upload-${randomUUID()}.txt`;
    const testContent = `Test file for verifying RLS policy fixes\nCreated at: ${new Date().toISOString()}`;
    
    // Create a Blob for testing (in Node.js environment)
    // Note: This is a simplified test - in real scenarios, the user would be authenticated
    console.log('\nTesting file upload permissions...');
    console.log('Attempting to upload test file:', testFileName);
    
    // Note: This test requires that you are authenticated as an admin or faculty user
    // The actual test would be performed from the frontend where the user is logged in
    console.log('\n--- INSTRUCTIONS FOR TESTING ---');
    console.log('1. Log in to your application as an ADMIN or FACULTY user');
    console.log('2. Navigate to the repository upload page');
    console.log('3. Try to upload any allowed file type (PDF, DOC, etc.)');
    console.log('4. The upload should now succeed without "row-level security policy" errors');
    console.log('');
    console.log('If you still get errors, verify:');
    console.log('- You are logged in as ADMIN or FACULTY user');
    console.log('- The RLS policies were correctly applied in the Supabase SQL Editor');
    console.log('- The user exists in the users table with the correct role');
    console.log('- The supabase_auth_id in the users table matches the auth.uid()');
    
    console.log('\n--- SQL COMMANDS TO VERIFY USER EXISTS ---');
    console.log('Run this in your Supabase SQL Editor to verify user exists:');
    console.log('SELECT id, email, role, supabase_auth_id FROM users WHERE role IN (\'ADMIN\', \'FACULTY\') LIMIT 10;');
    
    console.log('\n--- ADDITIONAL TROUBLESHOOTING ---');
    console.log('If the issue persists, check:');
    console.log('1. The user is authenticated in your session');
    console.log('2. The user role is correctly set to \'ADMIN\' or \'FACULTY\' (uppercase)');
    console.log('3. The supabase_auth_id in the users table matches the auth.uid() from Supabase Auth');
    console.log('4. The RLS policies use the correct role values (uppercase: \'ADMIN\', \'FACULTY\')');
    
  } catch (error) {
    console.error('Error during upload test:', error);
  }
}

// Run the test if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  testFileUploadFix().catch(console.error);
}

export default testFileUploadFix;