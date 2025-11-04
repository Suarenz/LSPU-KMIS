// Load environment variables
require('dotenv').config({ path: './.env.local' });

const { createClient } = require('@supabase/supabase-js');

async function testAuthFlow() {
  console.log('Testing authentication flow...');
  
  // Initialize Supabase client for authentication
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Test login with default user credentials
  const testCredentials = [
    { email: 'admin@lspu.edu.ph', password: 'admin123' },
    { email: 'faculty@lspu.edu.ph', password: 'faculty123' },
    { email: 'student@lspu.edu.ph', password: 'student123' },
    { email: 'external@partner.com', password: 'external123' }
  ];

  for (const creds of testCredentials) {
    console.log(`\nTesting login for ${creds.email}...`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: creds.email,
        password: creds.password
      });

      if (error) {
        console.log(`  ✗ Login failed for ${creds.email}:`, error.message);
      } else {
        console.log(`  ✓ Login successful for ${creds.email}`);
        console.log(`    User ID: ${data.user.id}`);
        
        // Now test getting user profile from database
        // This simulates what happens in the auth service
        const supabaseWithServiceRole = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        const { data: profileData, error: profileError } = await supabaseWithServiceRole
          .from('users')
          .select('id, email, name, role, unitId')
          .eq('supabase_auth_id', data.user.id)
          .single();
          
        if (profileError) {
          console.log(`  ✗ Profile fetch failed:`, profileError.message);
        } else {
          console.log(`  ✓ Profile fetch successful for ${creds.email}`);
          console.log(`    DB User ID: ${profileData.id}, Role: ${profileData.role}`);
        }
      }
    } catch (err) {
      console.log(`  ✗ Error during login for ${creds.email}:`, err.message);
    }
  }
  
  console.log('\nAuthentication flow test completed!');
}

// Run the function
testAuthFlow().catch(console.error);