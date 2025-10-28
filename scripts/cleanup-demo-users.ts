import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
require('dotenv').config();

// This script cleans up demo users from both Supabase Auth and the application database
async function cleanupDemoUsers() {
  console.log('Cleaning up demo users from Supabase Auth and application database...');
  
  // Initialize Supabase client with service role key for full access
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // This needs to be set in your environment
  );

  // Initialize Prisma client to access user data
 const prisma = new PrismaClient();

  const demoUserEmails = [
    'admin@lspu.edu.ph',
    'faculty@lspu.edu.ph', 
    'student@lspu.edu.ph',
    'external@partner.com'
  ];

  try {
    // First, delete users from Supabase Auth
    console.log('Deleting users from Supabase Auth...');
    for (const email of demoUserEmails) {
      const { data: supabaseUsers, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        console.error('Error fetching users from Supabase:', listError);
        continue;
      }

      const userToDelete = supabaseUsers.users.find(user => user.email === email);
      
      if (userToDelete) {
        console.log(`Deleting user from Supabase Auth: ${email} (ID: ${userToDelete.id})`);
        const { error: deleteError } = await supabase.auth.admin.deleteUser(userToDelete.id);
        
        if (deleteError) {
          console.error(`Error deleting user ${email} from Supabase Auth:`, deleteError);
        } else {
          console.log(`Successfully deleted user from Supabase Auth: ${email}`);
        }
      } else {
        console.log(`User not found in Supabase Auth: ${email}`);
      }
    }

    // Then, delete users from application database
    console.log('\nDeleting users from application database...');
    for (const email of demoUserEmails) {
      try {
        const result = await prisma.user.delete({
          where: { email }
        });
        console.log(`Successfully deleted user from database: ${email}`);
      } catch (error) {
        console.error(`Error deleting user ${email} from database:`, error);
      }
    }

    console.log('\nDemo users cleanup completed successfully!');
  } catch (error) {
    console.error('Error during demo users cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  cleanupDemoUsers().catch(console.error);
}

export default cleanupDemoUsers;