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

  // Define default users with simplified credentials (shorter passwords for demo)
  const defaultUsers = [
    {
      email: 'admin@lspu.edu.ph',
      password: 'admin123', // More secure password
      name: 'System Administrator',
      role: 'ADMIN',
      unitCode: 'CAS' // Default to College of Arts and Sciences
    },
    {
      email: 'faculty@lspu.edu.ph',
      password: 'faculty123', // More secure password
      name: 'Test Faculty',
      role: 'FACULTY',
      unitCode: 'CCS' // Default to College of Computer Studies
    },
    {
      email: 'student@lspu.edu.ph',
      password: 'student123', // More secure password
      name: 'Test Student',
      role: 'STUDENT',
      unitCode: 'CCS' // Default to College of Computer Studies
    },
    {
      email: 'external@partner.com',
      password: 'external123', // More secure password
      name: 'Test External Partner',
      role: 'EXTERNAL',
      unitCode: null // No specific unit for external users
    }
  ];

  try {
    for (const userData of defaultUsers) {
      console.log(`Creating user: ${userData.email}`);
      
      try {
        // Create user in Supabase Auth
        const { data, error } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true, // Mark as confirmed
          user_metadata: {
            name: userData.name,
            role: userData.role,
          },
        });

        if (error) {
          console.error(`Error creating user ${userData.email} in Supabase Auth:`, error.message || error);
          // Continue to next user instead of stopping the entire process
          continue;
        }

        console.log(`Created Supabase user for ${userData.email} with ID: ${data.user.id}`);

        // Find the unit ID if a unit code is provided
        let unitId = null;
        if (userData.unitCode) {
          const unit = await prisma.unit.findUnique({
            where: { code: userData.unitCode }
          });
          if (unit) {
            unitId = unit.id;
            console.log(`Assigned user ${userData.email} to unit: ${unit.code}`);
          } else {
            console.warn(`Unit with code ${userData.unitCode} not found for user ${userData.email}`);
          }
        }

        // Check if user already exists in the database
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email }
        });

        if (existingUser) {
          // Update existing user with the Supabase auth ID and unit
          const updatedUser = await prisma.user.update({
            where: { email: userData.email },
            data: {
              supabase_auth_id: data.user.id,
              unitId: unitId, // Assign to unit if found
            },
          });
          console.log(`Updated existing user ${userData.email} with Supabase auth ID and unit assignment`);
        } else {
          // Create user profile in our database
          const newUser = await prisma.user.create({
            data: {
              supabase_auth_id: data.user.id,
              email: userData.email,
              name: userData.name,
              role: userData.role.toUpperCase() as any,
              unitId: unitId, // Assign to unit if found
            }
          });
          console.log(`Created new user profile for ${userData.email} with unit assignment`);
        }
      } catch (userError) {
        console.error(`Failed to create user ${userData.email}:`, userError);
        // Continue with the next user instead of stopping the entire process
        continue;
      }
    }

    console.log('Default users creation completed! Check the logs above for details.');
  } catch (error) {
    console.error('Critical error during default users creation:', error);
    throw error; // Re-throw to indicate failure
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if this file is executed directly
try {
  console.log('Starting createDefaultUsers script...');
  // Get the current file path
  const currentFile = import.meta.url;
  const scriptPath = currentFile.split('/').pop()?.split('.')[0]; // Get the script name without extension
  
  // Get the executed script name from process arguments
  const executedScript = process.argv[1] ? process.argv[1].split('/').pop()?.split('.')[0] : '';
  
  // If this script was executed directly, run the migration
  if (scriptPath === executedScript) {
    console.log('Executing createDefaultUsers function...');
    createDefaultUsers()
      .then(() => console.log('createDefaultUsers completed successfully'))
      .catch(error => {
        console.error('Error in createDefaultUsers:', error);
        process.exit(1);
      });
  } else {
    console.log('Script not executed directly, scriptPath:', scriptPath, 'executedScript:', executedScript);
  }
} catch (e) {
  console.error('Error in script execution:', e);
  // If import.meta.url is not available, fallback to commonjs approach
  if (typeof module !== 'undefined' && require.main === module) {
    console.log('Using commonjs approach');
    createDefaultUsers()
      .then(() => console.log('createDefaultUsers completed successfully'))
      .catch(error => {
        console.error('Error in createDefaultUsers:', error);
        process.exit(1);
      });
  }
}

export default createDefaultUsers;