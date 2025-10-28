import { createClient } from '@supabase/supabase-js';

// This script resets the admin user password to a known value
// It should be run after the user migration is complete

async function resetAdminPassword() {
 console.log('Resetting admin user password...');

  // Initialize Supabase client with service role key for full access
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // This needs to be set in your environment
 );

  try {
    // For Supabase, we need to list all users and find the admin user
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    // Find the admin user
    const adminUser = data?.users?.find(user => user.email === 'admin@lspu.edu.ph');
    
    if (!adminUser) {
      console.error('Admin user not found');
      return;
    }

    // Update the admin user's password using their ID
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      {
        password: 'admin123' // Default password - change this after first login!
      }
    );

    if (updateError) {
      console.error('Error resetting admin password:', updateError);
      return;
    }

    console.log('Admin password reset successfully!');
    console.log('New password: admin123');
    console.log('IMPORTANT: Change this password immediately after first login for security!');
  } catch (error) {
    console.error('Error during admin password reset:', error);
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
    resetAdminPassword().catch(console.error);
  }
} catch (e) {
  // If import.meta.url is not available, fallback to commonjs approach
  if (typeof module !== 'undefined' && require.main === module) {
    resetAdminPassword().catch(console.error);
  }
}

export default resetAdminPassword;