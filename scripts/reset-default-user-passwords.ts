import { createClient } from '@supabase/supabase-js';

// This script resets default user passwords to their original values
// It should be run after the user migration is complete

async function resetDefaultUserPasswords() {
  console.log('Resetting default user passwords...');

  // Initialize Supabase client with service role key for full access
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // This needs to be set in your environment
  );

  // Define default users and their original passwords
  const defaultUsers = [
    { email: 'admin@lspu.edu.ph', password: 'admin123' },
    { email: 'faculty@lspu.edu.ph', password: 'faculty123' },
    { email: 'student@lspu.edu.ph', password: 'student123' },
    { email: 'external@partner.com', password: 'external123' }
  ];

  try {
    // For Supabase, we need to list all users first
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    // Process each default user
    for (const user of defaultUsers) {
      // Find the user by email
      const targetUser = data?.users?.find(u => u.email === user.email);
      
      if (!targetUser) {
        console.log(`User not found: ${user.email}`);
        continue;
      }

      // Update the user's password using their ID
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        targetUser.id,
        {
          password: user.password
        }
      );

      if (updateError) {
        console.error(`Error resetting password for ${user.email}:`, updateError);
      } else {
        console.log(`Password reset successfully for ${user.email}`);
      }
    }

    console.log('Default user password reset process completed!');
    console.log('IMPORTANT: Change these passwords immediately after first login for security!');
  } catch (error) {
    console.error('Error during default user password reset:', error);
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
    resetDefaultUserPasswords().catch(console.error);
  }
} catch (e) {
  // If import.meta.url is not available, fallback to commonjs approach
  if (typeof module !== 'undefined' && require.main === module) {
    resetDefaultUserPasswords().catch(console.error);
  }
}

export default resetDefaultUserPasswords;