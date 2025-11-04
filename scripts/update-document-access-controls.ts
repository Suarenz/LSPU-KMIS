import { createClient } from '@supabase/supabase-js';
require('dotenv').config();

// This script updates document access controls to include department-based permissions
async function updateDocumentAccessControls() {
  console.log('Updating document access controls with department-based permissions...\n');

  // Initialize Supabase client with service role key for admin operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations
  );

  console.log('Supabase admin client created');

  try {
    // Update RLS policies for documents table to include department permissions
    console.log('\n--- Updating RLS policies for documents table ---');
    
    // Policy 1: Update SELECT policy to allow users with department READ permission
    console.log('Updating policy: Users can view documents they have access to...');
    const { error: updateSelectError } = await supabase.rpc('execute_sql', {
      sql: `DROP POLICY IF EXISTS "Users can view documents they have access to" ON documents;`
    });

    if (updateSelectError) {
      console.log('Warning: Could not drop existing select policy for documents:', updateSelectError.message);
    } else {
      console.log('✓ Dropped existing select policy for documents');
    }

    // Create new SELECT policy with department permissions
    const { error: createSelectError } = await supabase.rpc('execute_sql', {
      sql: `CREATE POLICY "Users can view documents they have access to" ON documents
             FOR SELECT TO authenticated
             USING (
               -- Document owner can always view their documents
               uploaded_by_id::text = (SELECT id FROM users WHERE users.supabase_auth_id::text = auth.uid()::text) OR
               -- Users with explicit document permissions can view
               EXISTS (
                 SELECT 1 FROM document_permissions dp
                 WHERE dp.document_id = documents.id
                 AND dp.user_id = (SELECT id FROM users WHERE users.supabase_auth_id::text = auth.uid()::text)
                 AND dp.permission IN ('READ', 'WRITE', 'ADMIN')
               ) OR
               -- Admin users can view all documents
               EXISTS (
                 SELECT 1 FROM users u
                 WHERE u.supabase_auth_id::text = auth.uid()::text
                 AND u.role = 'ADMIN'
               ) OR
               -- Users with department READ permission can view department documents
               EXISTS (
                 SELECT 1 FROM department_permissions dep
                 WHERE dep.department_id = documents.department_id
                 AND dep.user_id = (SELECT id FROM users WHERE users.supabase_auth_id::text = auth.uid()::text)
                 AND dep.permission IN ('READ', 'WRITE', 'ADMIN')
               ) OR
               -- Documents without departments are publicly accessible (but still require authentication)
               documents.department_id IS NULL
             );`
    });

    if (createSelectError) {
      console.log('Warning: Could not create new select policy for documents:', createSelectError.message);
    } else {
      console.log('✓ Created new select policy for documents with department permissions');
    }

    // Policy 2: Update INSERT policy to check department permissions
    console.log('Updating policy: Users can upload documents to departments they have access to...');
    const { error: updateInsertError } = await supabase.rpc('execute_sql', {
      sql: `DROP POLICY IF EXISTS "Users can upload documents" ON documents;`
    });

    if (updateInsertError) {
      console.log('Warning: Could not drop existing insert policy for documents:', updateInsertError.message);
    } else {
      console.log('✓ Dropped existing insert policy for documents');
    }

    // Create new INSERT policy with department permissions
    const { error: createInsertError } = await supabase.rpc('execute_sql', {
      sql: `CREATE POLICY "Users can upload documents to departments they have access to" ON documents
             FOR INSERT TO authenticated
             WITH CHECK (
               -- Admins can upload to any department
               EXISTS (
                 SELECT 1 FROM users u
                 WHERE u.supabase_auth_id::text = auth.uid()::text
                 AND u.role = 'ADMIN'
               ) OR
               -- Faculty can upload to their own department or departments they have WRITE/ADMIN permission for
               (
                 EXISTS (
                   SELECT 1 FROM users u
                   WHERE u.supabase_auth_id::text = auth.uid()::text
                   AND u.role = 'FACULTY'
                 ) AND (
                   -- Check if user belongs to the document's department
                   documents.department_id IN (
                     SELECT d.id FROM departments d
                     JOIN users u ON d.id = u.department_id
                     WHERE u.supabase_auth_id::text = auth.uid()::text
                   ) OR
                   -- Check if user has WRITE/ADMIN permission for the document's department
                   EXISTS (
                     SELECT 1 FROM department_permissions dep
                     WHERE dep.department_id = documents.department_id
                     AND dep.user_id = (SELECT id FROM users WHERE users.supabase_auth_id::text = auth.uid()::text)
                     AND dep.permission IN ('WRITE', 'ADMIN')
                   ) OR
                   -- If no department is specified, faculty can upload (backward compatibility)
                   documents.department_id IS NULL
                 )
               )
             );`
    });

    if (createInsertError) {
      console.log('Warning: Could not create new insert policy for documents:', createInsertError.message);
    } else {
      console.log('✓ Created new insert policy for documents with department permissions');
    }

    // Policy 3: Update UPDATE policy to check department permissions
    console.log('Updating policy: Users can update documents they have access to...');
    const { error: updateUpdateError } = await supabase.rpc('execute_sql', {
      sql: `DROP POLICY IF EXISTS "Users can update their own documents" ON documents;`
    });

    if (updateUpdateError) {
      console.log('Warning: Could not drop existing update policy for documents:', updateUpdateError.message);
    } else {
      console.log('✓ Dropped existing update policy for documents');
    }

    // Create new UPDATE policy with department permissions
    const { error: createUpdateError } = await supabase.rpc('execute_sql', {
      sql: `CREATE POLICY "Users can update documents they have access to" ON documents
             FOR UPDATE TO authenticated
             USING (
               -- Document owner can update their documents
               uploaded_by_id::text = (SELECT id FROM users WHERE users.supabase_auth_id::text = auth.uid()::text) OR
               -- Users with explicit ADMIN document permissions can update
               EXISTS (
                 SELECT 1 FROM document_permissions dp
                 WHERE dp.document_id = documents.id
                 AND dp.user_id = (SELECT id FROM users WHERE users.supabase_auth_id::text = auth.uid()::text)
                 AND dp.permission = 'ADMIN'
               ) OR
               -- Admin users can update all documents
               EXISTS (
                 SELECT 1 FROM users u
                 WHERE u.supabase_auth_id::text = auth.uid()::text
                 AND u.role = 'ADMIN'
               ) OR
               -- Users with department ADMIN permission can update department documents
               EXISTS (
                 SELECT 1 FROM department_permissions dep
                 WHERE dep.department_id = documents.department_id
                 AND dep.user_id = (SELECT id FROM users WHERE users.supabase_auth_id::text = auth.uid()::text)
                 AND dep.permission = 'ADMIN'
               )
             );`
    });

    if (createUpdateError) {
      console.log('Warning: Could not create new update policy for documents:', createUpdateError.message);
    } else {
      console.log('✓ Created new update policy for documents with department permissions');
    }

    // Policy 4: Update DELETE policy to check department permissions
    console.log('Updating policy: Users can delete documents they have access to...');
    const { error: updateDeleteError } = await supabase.rpc('execute_sql', {
      sql: `DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;`
    });

    if (updateDeleteError) {
      console.log('Warning: Could not drop existing delete policy for documents:', updateDeleteError.message);
    } else {
      console.log('✓ Dropped existing delete policy for documents');
    }

    // Create new DELETE policy with department permissions
    const { error: createDeleteError } = await supabase.rpc('execute_sql', {
      sql: `CREATE POLICY "Users can delete documents they have access to" ON documents
             FOR DELETE TO authenticated
             USING (
               -- Document owner can delete their documents
               uploaded_by_id::text = (SELECT id FROM users WHERE users.supabase_auth_id::text = auth.uid()::text) OR
               -- Users with explicit ADMIN document permissions can delete
               EXISTS (
                 SELECT 1 FROM document_permissions dp
                 WHERE dp.document_id = documents.id
                 AND dp.user_id = (SELECT id FROM users WHERE users.supabase_auth_id::text = auth.uid()::text)
                 AND dp.permission = 'ADMIN'
               ) OR
               -- Admin users can delete all documents
               EXISTS (
                 SELECT 1 FROM users u
                 WHERE u.supabase_auth_id::text = auth.uid()::text
                 AND u.role = 'ADMIN'
               ) OR
               -- Users with department ADMIN permission can delete department documents
               EXISTS (
                 SELECT 1 FROM department_permissions dep
                 WHERE dep.department_id = documents.department_id
                 AND dep.user_id = (SELECT id FROM users WHERE users.supabase_auth_id::text = auth.uid()::text)
                 AND dep.permission = 'ADMIN'
               )
             );`
    });

    if (createDeleteError) {
      console.log('Warning: Could not create new delete policy for documents:', createDeleteError.message);
    } else {
      console.log('✓ Created new delete policy for documents with department permissions');
    }

    console.log('\nDocument access control update completed!');
    console.log('\nNote: If any RPC calls failed, you will need to manually run these commands in the Supabase SQL Editor.');
  } catch (error) {
    console.error('Error updating document access controls:', error);
  }
}

// Run the script if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  updateDocumentAccessControls().catch(console.error);
}

export default updateDocumentAccessControls;