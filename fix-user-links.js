const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

// Load environment variables
require('dotenv').config({ path: './.env.local' });

async function fixUserLinks() {
  console.log('Starting user linking fix...');
  
  // Initialize Supabase client with service role key for full access
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Initialize Prisma client to access existing user data
  const prisma = new PrismaClient();

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
    
    // Define default users to check for linking
    const defaultUsers = [
      { email: 'admin@lspu.edu.ph', expectedRole: 'ADMIN' },
      { email: 'faculty@lspu.edu.ph', expectedRole: 'FACULTY' },
      { email: 'student@lspu.edu.ph', expectedRole: 'STUDENT' },
      { email: 'external@partner.com', expectedRole: 'EXTERNAL' }
    ];
    
    for (const userData of defaultUsers) {
      console.log(`\nProcessing user: ${userData.email}`);
      
      // Find user in Supabase Auth
      const supabaseUser = data.users.find(user => user.email === userData.email);
      if (!supabaseUser) {
        console.log(`  - User ${userData.email} not found in Supabase Auth`);
        continue;
      }
      
      console.log(`  - Found in Supabase Auth with ID: ${supabaseUser.id}`);
      
      // Check if user already exists in the database
      let existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        // Update existing user with the Supabase auth ID
        if (!existingUser.supabase_auth_id) {
          const updatedUser = await prisma.user.update({
            where: { email: userData.email },
            data: {
              supabase_auth_id: supabaseUser.id
            },
          });
          console.log(`  - Updated user ${userData.email} with Supabase auth ID: ${supabaseUser.id}`);
        } else {
          console.log(`  - User ${userData.email} already has Supabase auth ID: ${existingUser.supabase_auth_id}`);
        }
      } else {
        // Create user profile in our database if it doesn't exist
        const newUser = await prisma.user.create({
          data: {
            supabase_auth_id: supabaseUser.id,
            email: userData.email,
            name: userData.email.split('@')[0], // Use email prefix as name
            role: userData.expectedRole,
          }
        });
        console.log(`  - Created new user profile for ${userData.email} with Supabase auth ID: ${supabaseUser.id}`);
      }
    }
    
    console.log('\nUser linking fix completed!');
  } catch (error) {
    console.error('Error during user linking fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
fixUserLinks().catch(console.error);