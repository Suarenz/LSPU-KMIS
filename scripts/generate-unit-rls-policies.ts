import { createClient } from '@supabase/supabase-js';
require('dotenv').config();

// This script generates RLS policies for the new unit-related tables
async function generateUnitRLSPolicies() {
  console.log('Generating RLS policies for unit-related tables...\n');

  // Initialize Supabase client with service role key for admin operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations
 );

  console.log('Supabase admin client created');

  try {
    // Enable RLS on all unit-related tables
    const tables = [
      'units',
      'unit_permissions'
    ];

    for (const table of tables) {
      console.log(`\nEnabling RLS on ${table}...`);
      const { error: rlsError } = await supabase.rpc('execute_sql', {
        sql: `ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`
      });

      if (rlsError) {
        console.log(`Warning: Could not enable RLS on ${table}:`, rlsError.message);
      } else {
        console.log(`RLS enabled on ${table}`);
      }
    }

    // Create RLS policies for units table
    console.log('\n--- Creating RLS policies for units table ---');
    
    // Policy 1: Allow authenticated users to view units
    console.log('Creating policy: Authenticated users can view units...');
    const { error: viewError } = await supabase.rpc('execute_sql', {
      sql: `CREATE POLICY "Allow authenticated users to view units" ON units
             FOR SELECT TO authenticated
             USING (true);`
    });

    if (viewError) {
      console.log('Warning: Could not create view policy for units:', viewError.message);
    } else {
      console.log('✓ Created view policy for units');
    }

    // Policy 2: Allow admins to create units
    console.log('Creating policy: Admins can create units...');
    const { error: createError } = await supabase.rpc('execute_sql', {
      sql: `CREATE POLICY "Allow admins to create units" ON units
             FOR INSERT TO authenticated
             WITH CHECK (
               EXISTS (
                 SELECT 1 FROM users 
                 WHERE users.supabase_auth_id::text = auth.uid()::text 
                 AND users.role = 'ADMIN'
               )
             );`
    });

    if (createError) {
      console.log('Warning: Could not create create policy for units:', createError.message);
    } else {
      console.log('✓ Created create policy for units');
    }

    // Policy 3: Allow admins to update units
    console.log('Creating policy: Admins can update units...');
    const { error: updateError } = await supabase.rpc('execute_sql', {
      sql: `CREATE POLICY "Allow admins to update units" ON units
             FOR UPDATE TO authenticated
             USING (
               EXISTS (
                 SELECT 1 FROM users 
                 WHERE users.supabase_auth_id::text = auth.uid()::text 
                 AND users.role = 'ADMIN'
               )
             );`
    });

    if (updateError) {
      console.log('Warning: Could not create update policy for units:', updateError.message);
    } else {
      console.log('✓ Created update policy for units');
    }

    // Policy 4: Allow admins to delete units
    console.log('Creating policy: Admins can delete units...');
    const { error: deleteError } = await supabase.rpc('execute_sql', {
      sql: `CREATE POLICY "Allow admins to delete units" ON units
             FOR DELETE TO authenticated
             USING (
               EXISTS (
                 SELECT 1 FROM users 
                 WHERE users.supabase_auth_id::text = auth.uid()::text 
                 AND users.role = 'ADMIN'
               )
             );`
    });

    if (deleteError) {
      console.log('Warning: Could not create delete policy for units:', deleteError.message);
    } else {
      console.log('✓ Created delete policy for units');
    }

    // Create RLS policies for unit_permissions table
    console.log('\n--- Creating RLS policies for unit_permissions table ---');
    
    // Policy 1: Allow authenticated users to view unit permissions
    console.log('Creating policy: Authenticated users can view unit permissions...');
    const { error: viewPermError } = await supabase.rpc('execute_sql', {
      sql: `CREATE POLICY "Allow authenticated users to view unit permissions" ON unit_permissions
             FOR SELECT TO authenticated
             USING (true);`
    });

    if (viewPermError) {
      console.log('Warning: Could not create view policy for unit_permissions:', viewPermError.message);
    } else {
      console.log('✓ Created view policy for unit_permissions');
    }

    // Policy 2: Allow admins and unit admins to create unit permissions
    console.log('Creating policy: Admins and unit admins can create unit permissions...');
    const { error: createPermError } = await supabase.rpc('execute_sql', {
      sql: `CREATE POLICY "Allow admins and unit admins to create unit permissions" ON unit_permissions
             FOR INSERT TO authenticated
             WITH CHECK (
               EXISTS (
                 SELECT 1 FROM users 
                 WHERE users.supabase_auth_id::text = auth.uid()::text 
                 AND (users.role = 'ADMIN' OR users.role = 'FACULTY')
               ) OR EXISTS (
                 SELECT 1 FROM unit_permissions up
                 WHERE up.unit_id = unit_id
                 AND up.user_id = (
                   SELECT id FROM users WHERE users.supabase_auth_id::text = auth.uid()::text
                 )
                 AND up.permission = 'ADMIN'
               )
             );`
    });

    if (createPermError) {
      console.log('Warning: Could not create create policy for unit_permissions:', createPermError.message);
    } else {
      console.log('✓ Created create policy for unit_permissions');
    }

    // Policy 3: Allow admins and unit admins to update unit permissions
    console.log('Creating policy: Admins and unit admins can update unit permissions...');
    const { error: updatePermError } = await supabase.rpc('execute_sql', {
      sql: `CREATE POLICY "Allow admins and unit admins to update unit permissions" ON unit_permissions
             FOR UPDATE TO authenticated
             USING (
               EXISTS (
                 SELECT 1 FROM users 
                 WHERE users.supabase_auth_id::text = auth.uid()::text 
                 AND (users.role = 'ADMIN' OR users.role = 'FACULTY')
               ) OR EXISTS (
                 SELECT 1 FROM unit_permissions up
                 WHERE up.unit_id = unit_id
                 AND up.user_id = (
                   SELECT id FROM users WHERE users.supabase_auth_id::text = auth.uid()::text
                 )
                 AND up.permission = 'ADMIN'
               )
             );`
    });

    if (updatePermError) {
      console.log('Warning: Could not create update policy for unit_permissions:', updatePermError.message);
    } else {
      console.log('✓ Created update policy for unit_permissions');
    }

    // Policy 4: Allow admins and unit admins to delete unit permissions
    console.log('Creating policy: Admins and unit admins can delete unit permissions...');
    const { error: deletePermError } = await supabase.rpc('execute_sql', {
      sql: `CREATE POLICY "Allow admins and unit admins to delete unit permissions" ON unit_permissions
             FOR DELETE TO authenticated
             USING (
               EXISTS (
                 SELECT 1 FROM users 
                 WHERE users.supabase_auth_id::text = auth.uid()::text 
                 AND (users.role = 'ADMIN' OR users.role = 'FACULTY')
               ) OR EXISTS (
                 SELECT 1 FROM unit_permissions up
                 WHERE up.unit_id = unit_id
                 AND up.user_id = (
                   SELECT id FROM users WHERE users.supabase_auth_id::text = auth.uid()::text
                 )
                 AND up.permission = 'ADMIN'
               )
             );`
    });

    if (deletePermError) {
      console.log('Warning: Could not create delete policy for unit_permissions:', deletePermError.message);
    } else {
      console.log('✓ Created delete policy for unit_permissions');
    }

    console.log('\nUnit RLS policy generation completed!');
    console.log('\nNote: If any RPC calls failed, you will need to manually run these commands in the Supabase SQL Editor.');
  } catch (error) {
    console.error('Error generating unit RLS policies:', error);
  }
}

// Run the script if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  generateUnitRLSPolicies().catch(console.error);
}

export default generateUnitRLSPolicies;