import { createClient } from '@supabase/supabase-js';

// This script checks if users exist in Supabase Auth
async function checkUsersInSupabase() {
  console.log('Checking users in Supabase Auth...');
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Service Role Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

  // Initialize Supabase client with service role key for full access
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // This needs to be set in your environment
 );

  try {
    // List all users in Supabase Auth
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error fetching users from Supabase:', error);
      return;
    }

    if (!data || !data.users) {
      console.log('No users data returned from Supabase');
      return;
    }

    console.log(`Total users in Supabase Auth: ${data.users.length}`);
    
    // Print user details
    if (data.users.length > 0) {
      data.users.forEach(user => {
        console.log(`- Email: ${user.email}, ID: ${user.id}, Created: ${user.created_at}, Status: ${user.app_metadata?.provider ? user.app_metadata.provider : 'email'}`);
      });
    } else {
      console.log('No users found in Supabase Auth');
    }

    // Check for specific default users
    const defaultEmails = ['admin@lspu.edu.ph', 'faculty@lspu.edu.ph', 'student@lspu.edu.ph', 'external@partner.com'];
    
    console.log('\nChecking for default users:');
    defaultEmails.forEach(email => {
      const foundUser = data.users.find(user => user.email === email);
      if (foundUser) {
        console.log(`✓ ${email} exists in Supabase Auth (ID: ${foundUser.id})`);
      } else {
        console.log(`✗ ${email} NOT found in Supabase Auth`);
      }
    });

  } catch (error) {
    console.error('Error checking users in Supabase:', error);
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
    checkUsersInSupabase().catch(console.error);
  }
} catch (e) {
  // If import.meta.url is not available, fallback to commonjs approach
  if (typeof module !== 'undefined' && require.main === module) {
    checkUsersInSupabase().catch(console.error);
  }
}

export default checkUsersInSupabase;