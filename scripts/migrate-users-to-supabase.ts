import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

// This script migrates existing users from the old authentication system to Supabase Auth
// It should be run after the database schema has been updated to include supabase_auth_id

async function migrateUsersToSupabase() {
  console.log('Starting user migration to Supabase...');
  
  // Initialize Supabase client with service role key for full access during migration
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // This needs to be set in your environment
 );
  
  // Initialize Prisma client to access existing user data
  const prisma = new PrismaClient();
  
  try {
    // Get all existing users from the database
    const existingUsers = await prisma.user.findMany();
    console.log(`Found ${existingUsers.length} users to migrate`);
    
    for (const user of existingUsers) {
      console.log(`Migrating user: ${user.email}`);
      
      // Create user in Supabase Auth
      // For this migration, we'll need to set temporary passwords for existing users
      // In a real scenario, you'd want to send password reset emails
      const tempPassword = `TempPassword123!`; // In practice, generate unique temporary passwords
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: tempPassword,
        email_confirm: true, // Mark as confirmed since these are existing users
        user_metadata: {
          name: user.name,
          role: user.role,
          department: user.department,
        },
      });
      
      if (error) {
        console.error(`Error creating user ${user.email}:`, error);
        continue;
      }
      
      console.log(`Created Supabase user for ${user.email} with ID: ${data.user.id}`);
      
      // Update the existing user record with the Supabase auth ID
      await prisma.user.update({
        where: { id: user.id },
        data: {
          supabase_auth_id: data.user.id,
        },
      });
      
      console.log(`Updated user ${user.email} with Supabase auth ID`);
    }
    
    console.log('User migration completed successfully!');
  } catch (error) {
    console.error('Error during user migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// For ES modules, we'll run the migration directly when the script is executed
// We can check if this file is being run directly using a try-catch for import.meta.url
try {
  // Get the current file path
  const currentFile = import.meta.url;
  const scriptPath = currentFile.split('/').pop()?.split('.')[0]; // Get the script name without extension
  
  // Get the executed script name from process arguments
  const executedScript = process.argv[1] ? process.argv[1].split('/').pop()?.split('.')[0] : '';
  
  // If this script was executed directly, run the migration
  if (scriptPath === executedScript) {
    migrateUsersToSupabase().catch(console.error);
  }
} catch (e) {
  // If import.meta.url is not available, fallback to commonjs approach
  if (typeof module !== 'undefined' && require.main === module) {
    migrateUsersToSupabase().catch(console.error);
  }
}

export default migrateUsersToSupabase;
export { migrateUsersToSupabase };