import { PrismaClient } from '@prisma/client';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

const prisma = new PrismaClient();

async function testDatabaseUsers() {
  try {
    console.log('Checking users in database...');
    
    // Get all users from the database
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        supabase_auth_id: true
      }
    });
    
    console.log(`Total users in database: ${users.length}`);
    
    // Check for specific default users
    const defaultEmails = ['admin@lspu.edu.ph', 'faculty@lspu.edu.ph', 'student@lspu.edu.ph', 'external@partner.com'];
    
    console.log('\nChecking for default users:');
    defaultEmails.forEach(email => {
      const foundUser = users.find(user => user.email === email);
      if (foundUser) {
        console.log(`✓ ${email} exists in database (DB ID: ${foundUser.id}, Supabase Auth ID: ${foundUser.supabase_auth_id || 'NOT SET'})`);
      } else {
        console.log(`✗ ${email} NOT found in database`);
      }
    });
    
    console.log('\nDetailed user information:');
    users.forEach(user => {
      console.log(`- Email: ${user.email}, DB ID: ${user.id}, Supabase Auth ID: ${user.supabase_auth_id || 'NOT SET'}`);
    });
    
    // Check if any users have missing supabase_auth_id
    const usersWithoutAuthId = users.filter(user => !user.supabase_auth_id);
    if (usersWithoutAuthId.length > 0) {
      console.log(`\nWarning: ${usersWithoutAuthId.length} users have no supabase_auth_id (not linked to Supabase Auth):`);
      usersWithoutAuthId.forEach(user => {
        console.log(`- ${user.email} (${user.id})`);
      });
    } else {
      console.log('\n✓ All users are properly linked to Supabase Auth');
    }
    
  } catch (err) {
    console.error('Error checking database users:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseUsers();