import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
require('dotenv').config();

// This script checks if the admin user exists with the correct role in both Supabase Auth and the application database
async function checkAdminUser() {
  console.log('Checking admin user in Supabase Auth and application database...');
  
  // Initialize Supabase client with service role key for full access
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // This needs to be set in your environment
  );

  // Initialize Prisma client to access user data
 const prisma = new PrismaClient();

  try {
    // Check if admin user exists in Supabase Auth
    console.log('Checking if admin user exists in Supabase Auth...');
    const { data: supabaseUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error fetching users from Supabase:', listError);
      return;
    }

    const adminUser = supabaseUsers.users.find(user => user.email === 'admin@lspu.edu.ph');
    
    if (adminUser) {
      console.log(`✓ Admin user found in Supabase Auth: ${adminUser.email} (ID: ${adminUser.id})`);
    } else {
      console.log('✗ Admin user NOT found in Supabase Auth');
    }

    // Check if admin user exists in application database
    console.log('\nChecking if admin user exists in application database...');
    const dbAdminUser = await prisma.user.findUnique({
      where: { email: 'admin@lspu.edu.ph' }
    });

    if (dbAdminUser) {
      console.log(`✓ Admin user found in application database:`);
      console.log(`  - ID: ${dbAdminUser.id} (CUID format: ${dbAdminUser.id.startsWith('ck') ? 'Yes' : 'No'})`);
      console.log(`  - Email: ${dbAdminUser.email}`);
      console.log(`  - Name: ${dbAdminUser.name}`);
      console.log(`  - Role: ${dbAdminUser.role}`);
      console.log(`  - Supabase Auth ID: ${dbAdminUser.supabase_auth_id || 'Not set'}`);
      
      // Check if the role is in the correct format
      if (dbAdminUser.role !== 'ADMIN') {
        console.log(`⚠️  Warning: Admin user role is '${dbAdminUser.role}' but should be 'ADMIN'`);
      }
      
      // Check if the ID is in CUID format
      if (!dbAdminUser.id.startsWith('ck')) {
        console.log(`⚠️  Warning: Admin user ID '${dbAdminUser.id}' is not in CUID format`);
      }
    } else {
      console.log('✗ Admin user NOT found in application database');
    }

    // Check for any inconsistencies
    if (adminUser && dbAdminUser) {
      if (adminUser.id !== dbAdminUser.supabase_auth_id) {
        console.log('\n⚠️  Inconsistency: Supabase Auth ID and database supabase_auth_id do not match');
        console.log(`  - Supabase Auth ID: ${adminUser.id}`);
        console.log(`  - Database supabase_auth_id: ${dbAdminUser.supabase_auth_id}`);
      } else {
        console.log('\n✓ Supabase Auth ID and database supabase_auth_id are properly linked');
      }
    } else if (adminUser && !dbAdminUser) {
      console.log('\n⚠️  Inconsistency: Admin user exists in Supabase Auth but not in application database');
    } else if (!adminUser && dbAdminUser) {
      console.log('\n⚠️  Inconsistency: Admin user exists in application database but not in Supabase Auth');
    } else {
      console.log('\n⚠️  Inconsistency: Admin user does not exist in either Supabase Auth or application database');
    }

    // Check all users to see the current state
    console.log('\nChecking all users in application database...');
    const allUsers = await prisma.user.findMany();
    console.log(`Found ${allUsers.length} users in application database:`);
    allUsers.forEach((user: any) => {
      console.log(`  - ${user.email} | Role: ${user.role} | ID: ${user.id} | CUID: ${user.id.startsWith('ck') ? 'Yes' : 'No'} | Auth ID: ${user.supabase_auth_id || 'Not set'}`);
    });

  } catch (error) {
    console.error('Error checking admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  checkAdminUser().catch(console.error);
}

export default checkAdminUser;