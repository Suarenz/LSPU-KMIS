import { createClient } from '@supabase/supabase-js';
require('dotenv').config();

// This script fixes the RLS policy infinite recursion issue
async function fixRLSPolicies() {
  console.log('Fixing RLS policy infinite recursion issue...');

  // Initialize Supabase client with service role key for admin operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations
 );

  console.log('Supabase admin client created');

  try {
    // First, drop the problematic policy
    console.log('Dropping problematic users policy...');
    const { error: dropError } = await supabase.rpc('execute_sql', {
      sql: `DROP POLICY IF EXISTS "Users can view their own profile" ON users;`
    });

    if (dropError) {
      console.log('Could not drop policy via RPC, you may need to run manually:', dropError);
    } else {
      console.log('Dropped problematic policy');
    }

    // Create a corrected policy that allows admin access without recursion
    // We use auth.jwt() to check the role from user metadata instead of querying the users table
    console.log('Creating corrected users policy...');
    const { error: createError } = await supabase.rpc('execute_sql', {
      sql: `CREATE POLICY "Users can view their own profile" ON users
             FOR SELECT USING (
               id::text = (SELECT auth.uid())::text OR
               supabase_auth_id::text = (SELECT auth.uid())::text OR
               -- Check if current user is admin using JWT claims from user metadata
               (auth.jwt() ->> 'role' = 'ADMIN')
             );`
    });

    if (createError) {
      console.log('Could not create corrected policy via RPC, you may need to run manually:', createError);
      console.log('\nPlease run this command manually in the Supabase SQL Editor:');
      console.log(`CREATE POLICY "Users can view their own profile" ON users
       FOR SELECT USING (
         id::text = (SELECT auth.uid())::text OR
         supabase_auth_id::text = (SELECT auth.uid())::text OR
         (auth.jwt() ->> 'role' = 'ADMIN')
       );`);
    } else {
      console.log('Created corrected policy');
    }

    console.log('\nRLS policy fix attempted!');
    console.log('Note: If the RPC calls failed, you will need to manually run these commands in the Supabase SQL Editor.');
    console.log('\nAdditionally, make sure that admin users have their role properly set in auth user metadata.');
  } catch (error) {
    console.error('Error fixing RLS policies:', error);
  }
}

// Run the script if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  fixRLSPolicies().catch(console.error);
}

export default fixRLSPolicies;