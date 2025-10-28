import { createClient } from '@supabase/supabase-js';

// This script tests the Supabase connection
async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  console.log('NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing required environment variables for Supabase connection');
    return;
 }

  // Initialize Supabase client with service role key for full access
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Try to list users as a test
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      console.error('Error details:', error.message, error.code, error.status);
      return;
    }

    if (!data || !data.users) {
      console.log('No users data returned from Supabase');
      return;
    }

    console.log('Successfully connected to Supabase!');
    console.log(`Total users in Supabase Auth: ${data.users.length}`);
    
    // Print user details
    if (data.users.length > 0) {
      data.users.forEach(user => {
        console.log(`- Email: ${user.email}, ID: ${user.id}, Created: ${user.created_at}`);
      });
    } else {
      console.log('No users found in Supabase Auth');
    }
  } catch (error) {
    console.error('Exception during Supabase connection test:', error);
  }
}

// Run the script if this file is executed directly
try {
  // Get the current file path
  const currentFile = import.meta.url;
  const scriptPath = currentFile.split('/').pop()?.split('.')[0]; // Get the script name without extension
  
  // Get the executed script name from process arguments
  const executedScript = process.argv[1] ? process.argv[1].split('/').pop()?.split('.')[0] : '';
  
  // If this script was executed directly, run the migration
 if (scriptPath === executedScript) {
    testSupabaseConnection().catch(console.error);
  }
} catch (e) {
  // If import.meta.url is not available, fallback to commonjs approach
  if (typeof module !== 'undefined' && require.main === module) {
    testSupabaseConnection().catch(console.error);
  }
}

export default testSupabaseConnection;