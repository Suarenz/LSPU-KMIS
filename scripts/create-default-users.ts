import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

// This script creates default users in Supabase Auth and links them to the database
async function createDefaultUsers() {
  console.log('Creating default users in Supabase Auth...');

  // Initialize Supabase client with service role key for full access
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // This needs to be set in your environment
  );

  // Initialize Prisma client to access existing user data
  const prisma = new PrismaClient();

  // Define default users
  const defaultUsers = [
    {
      email: 'admin@lspu.edu.ph',
      password: 'admin123',
      name: 'Admin User',
      role: 'ADMIN',
      department: 'IT Department'
    },
    {
      email: 'faculty@lspu.edu.ph',
      password: 'faculty123',
      name: 'Dr. Maria Santos',
      role: 'FACULTY',
      department: 'Computer Science'
    },
    {
      email: 'student@lspu.edu.ph',
      password: 'student123',
      name: 'Juan Dela Cruz',
      role: 'STUDENT',
      department: 'Computer Science'
    },
    {
      email: 'external@partner.com',
      password: 'external123',
      name: 'External Partner',
      role: 'EXTERNAL',
      department: 'Research Collaboration'
    }
  ];

  try {
    for (const userData of defaultUsers) {
      console.log(`Creating user: ${userData.email}`);
      
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Mark as confirmed
        user_metadata: {
          name: userData.name,
          role: userData.role,
          department: userData.department,
        },
      });

      if (error) {
        console.error(`Error creating user ${userData.email}:`, error);
        continue;
      }

      console.log(`Created Supabase user for ${userData.email} with ID: ${data.user.id}`);

      // Check if user already exists in the database
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        // Update existing user with the Supabase auth ID
        await prisma.user.update({
          where: { email: userData.email },
          data: {
            supabase_auth_id: data.user.id,
          },
        });
        console.log(`Updated existing user ${userData.email} with Supabase auth ID`);
      } else {
        // Create user profile in our database
        await prisma.user.create({
          data: {
            supabase_auth_id: data.user.id,
            email: userData.email,
            name: userData.name,
            role: userData.role.toUpperCase() as any,
            department: userData.department,
          }
        });
        console.log(`Created new user profile for ${userData.email}`);
      }
    }

    console.log('Default users creation completed successfully!');
  } catch (error) {
    console.error('Error during default users creation:', error);
  } finally {
    await prisma.$disconnect();
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
    createDefaultUsers().catch(console.error);
  }
} catch (e) {
  // If import.meta.url is not available, fallback to commonjs approach
  if (typeof module !== 'undefined' && require.main === module) {
    createDefaultUsers().catch(console.error);
  }
}

export default createDefaultUsers;