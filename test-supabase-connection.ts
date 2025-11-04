import { createClient } from '@supabase/supabase-js';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

console.log('Starting Supabase connection test...');
console.log('Supabase URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Service Role Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testConnection() {
  try {
    console.log('Attempting to list users...');
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error fetching users:', error);
      return;
    }
    
    console.log(`Total users in Supabase Auth: ${data?.users?.length || 0}`);
    
    if (data?.users) {
      // Check for specific default users
      const defaultEmails = ['admin@lspu.edu.ph', 'faculty@lspu.edu.ph', 'student@lspu.edu.ph', 'external@partner.com'];
      
      console.log('\nChecking for default users:');
      defaultEmails.forEach(email => {
        const foundUser = data.users.find((user: any) => user.email === email);
        if (foundUser) {
          console.log(`✓ ${email} exists in Supabase Auth (ID: ${foundUser.id})`);
        } else {
          console.log(`✗ ${email} NOT found in Supabase Auth`);
        }
      });
    }
  } catch (err) {
    console.error('Caught error:', err);
 }
}

testConnection();