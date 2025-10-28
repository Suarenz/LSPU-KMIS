import { createClient } from '@supabase/supabase-js';
require('dotenv').config();

// This script checks the current RLS policies on the documents table
async function checkRLSPolicies() {
  console.log('Checking current RLS policies on the documents table...');

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Query to check existing policies on the documents table
    const { data, error } = await supabase
      .from('information_schema.table_privileges')
      .select('*')
      .eq('table_name', 'documents');
    
    if (error) {
      console.error('Error querying table privileges:', error);
    } else {
      console.log('Table privileges:', data);
    }

    // Query to check RLS policies specifically
    const { data: policies, error: policyError } = await supabase
      .rpc('execute_sql', { sql: `
        SELECT 
          policyname, 
          permissive, 
          roles, 
          cmd, 
          qual, 
          with_check 
        FROM pg_policies 
        WHERE tablename = 'documents';
      ` });
    
    if (policyError) {
      console.log('Could not query policies via RPC. This is expected if the execute_sql function is not available.');
      console.log('Current policies would need to be checked in the Supabase dashboard directly.');
    } else {
      console.log('Current RLS policies on documents table:', policies);
    }
    
    // Alternative approach: Check if RLS is enabled on the documents table
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('execute_sql', { sql: `
        SELECT schemaname, tablename, rowsecurity 
        FROM pg_tables 
        WHERE tablename = 'documents';
      ` });
    
    if (rlsError) {
      console.log('Could not check RLS status via RPC.');
    } else {
      console.log('RLS status for documents table:', rlsStatus);
    }
    
  } catch (error) {
    console.error('Error checking RLS policies:', error);
    console.log('You may need to check the current policies directly in the Supabase dashboard.');
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  checkRLSPolicies().catch(console.error);
}

export default checkRLSPolicies;