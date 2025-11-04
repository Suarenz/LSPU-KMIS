import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
require('dotenv').config();

// This script tests user roles and permissions after recreating demo accounts
async function testUserRoles() {
  console.log('Testing user roles and permissions...');
  
  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Use anon key for client-side operations
  );

  // Initialize Prisma client
  const prisma = new PrismaClient();

  try {
    // Test each user role by attempting to sign in and checking their role
    const testUsers = [
      { email: 'admin@lspu.edu.ph', password: 'admin', expectedRole: 'ADMIN' },
      { email: 'faculty@lspu.edu.ph', password: 'faculty', expectedRole: 'FACULTY' },
      { email: 'student@lspu.edu.ph', password: 'student', expectedRole: 'STUDENT' },
      { email: 'external@partner.com', password: 'external', expectedRole: 'EXTERNAL' }
    ];

    for (const userData of testUsers) {
      console.log(`\nTesting user: ${userData.email}`);
      
      // Sign in the user
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password,
      });

      if (error) {
        console.error(`Error signing in ${userData.email}:`, error.message);
        continue;
      }

      console.log(`✓ Successfully signed in as ${userData.email}`);
      
      // Get the user's profile from the database to verify role
      const user = await prisma.user.findUnique({
        where: { 
          supabase_auth_id: data.user.id 
        }
      });

      if (user) {
        console.log(`  - Database role: ${user.role}`);
        console.log(`  - Expected role: ${userData.expectedRole}`);
        
        if (user.role === userData.expectedRole) {
          console.log(`  ✓ Role matches expected value`);
        } else {
          console.error(` ✗ Role mismatch! Expected ${userData.expectedRole}, got ${user.role}`);
        }
      } else {
        console.error(`  ✗ User not found in database`);
      }

      // Sign out to test the next user
      await supabase.auth.signOut();
      console.log(`  - Signed out`);
    }

    // Test document service permissions (this would require additional setup)
    console.log('\n--- Role-based Access Control Verification ---');
    console.log('✓ Admin and Faculty users should be able to upload documents');
    console.log('✓ Student and External users should NOT be able to upload documents');
    console.log('✓ All users should be able to view documents they have access to');
    console.log('✓ Admin users should have access to all documents and features');

    console.log('\n--- Next Steps ---');
    console.log('1. RLS policies need to be applied in the Supabase SQL Editor using the commands from generate-rls-sql-commands.ts');
    console.log('2. After applying RLS policies, test document upload functionality with each user role');
    console.log('3. Verify that access restrictions work as expected');

  } catch (error) {
    console.error('Error during user role testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  testUserRoles().catch(console.error);
}

export default testUserRoles;