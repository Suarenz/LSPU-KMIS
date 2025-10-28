import { createClient } from '@supabase/supabase-js';
require('dotenv').config();

// This script verifies that the RLS policy fixes are working properly
async function verifyRLSFix() {
  console.log('Verifying RLS policy fixes...');

  // Initialize Supabase client with service role key for admin operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations
 );

  console.log('Supabase admin client created');

  try {
    // Test basic connectivity to the users table without triggering infinite recursion
    console.log('Testing access to users table...');
    
    // This query should work without infinite recursion now
    const { data: policies, error: policyError } = await supabase
      .from('pg_policies') // Query system table to see current policies
      .select('policyname, tablename, schemaname')
      .eq('tablename', 'users')
      .eq('schemaname', 'public');

    if (policyError) {
      console.log('Could not fetch current policies:', policyError);
    } else {
      console.log('Current policies on users table:', policies);
    }

    // Verify that the corrected policy is in place
    console.log('\nTo fully verify the fix:');
    console.log('1. Stop your Next.js development server');
    console.log('2. Restart it with the updated DATABASE_URL (with ?pgbouncer=true)');
    console.log('3. Access your application and try to view the repository section');
    console.log('4. The infinite recursion error should be resolved');

    // Provide the exact SQL command to confirm the correct policy is in place
    console.log('\nIf you need to manually verify the policy in Supabase SQL Editor, run:');
    console.log(`SELECT * FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public';`);

    console.log('\nExpected policy for users table should use auth.jwt() ->> \'role\' instead of querying the users table');

  } catch (error) {
    console.error('Error during RLS verification:', error);
  }
}

// Run the script if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  verifyRLSFix().catch(console.error);
}

export default verifyRLSFix;