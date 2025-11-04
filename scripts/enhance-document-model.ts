import { createClient } from '@supabase/supabase-js';
require('dotenv').config();

// This script enhances the document model with categorization and versioning features
async function enhanceDocumentModel() {
  console.log('Enhancing document model with categorization and versioning features...\n');

  // Initialize Supabase client with service role key for admin operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations
  );

  console.log('Supabase admin client created');

  try {
    // Add new columns to documents table for enhanced categorization
    console.log('\n--- Adding new columns to documents table ---');
    
    // Add department_id column if it doesn't exist
    console.log('Adding department_id column to documents table...');
    const { error: deptIdError } = await supabase.rpc('execute_sql', {
      sql: `ALTER TABLE documents ADD COLUMN IF NOT EXISTS department_id TEXT REFERENCES departments(id) ON DELETE SET NULL;`
    });

    if (deptIdError) {
      console.log('Warning: Could not add department_id column to documents table:', deptIdError.message);
    } else {
      console.log('✓ Added department_id column to documents table');
    }

    // Add version_notes column if it doesn't exist
    console.log('Adding version_notes column to documents table...');
    const { error: versionNotesError } = await supabase.rpc('execute_sql', {
      sql: `ALTER TABLE documents ADD COLUMN IF NOT EXISTS version_notes TEXT;`
    });

    if (versionNotesError) {
      console.log('Warning: Could not add version_notes column to documents table:', versionNotesError.message);
    } else {
      console.log('✓ Added version_notes column to documents table');
    }

    // Add parent_document_id column if it doesn't exist (for versioning)
    console.log('Adding parent_document_id column to documents table...');
    const { error: parentDocError } = await supabase.rpc('execute_sql', {
      sql: `ALTER TABLE documents ADD COLUMN IF NOT EXISTS parent_document_id TEXT REFERENCES documents(id) ON DELETE CASCADE;`
    });

    if (parentDocError) {
      console.log('Warning: Could not add parent_document_id column to documents table:', parentDocError.message);
    } else {
      console.log('✓ Added parent_document_id column to documents table');
    }

    // Create indexes for improved performance
    console.log('\n--- Creating indexes for improved performance ---');
    
    // Create index on department_id
    console.log('Creating index on department_id...');
    const { error: deptIndexError } = await supabase.rpc('execute_sql', {
      sql: `CREATE INDEX IF NOT EXISTS idx_documents_department_id ON documents(department_id);`
    });

    if (deptIndexError) {
      console.log('Warning: Could not create index on department_id:', deptIndexError.message);
    } else {
      console.log('✓ Created index on department_id');
    }

    // Create index on parent_document_id
    console.log('Creating index on parent_document_id...');
    const { error: parentDocIndexError } = await supabase.rpc('execute_sql', {
      sql: `CREATE INDEX IF NOT EXISTS idx_documents_parent_document_id ON documents(parent_document_id);`
    });

    if (parentDocIndexError) {
      console.log('Warning: Could not create index on parent_document_id:', parentDocIndexError.message);
    } else {
      console.log('✓ Created index on parent_document_id');
    }

    // Create composite index on department_id and status
    console.log('Creating composite index on department_id and status...');
    const { error: deptStatusIndexError } = await supabase.rpc('execute_sql', {
      sql: `CREATE INDEX IF NOT EXISTS idx_documents_department_status ON documents(department_id, status);`
    });

    if (deptStatusIndexError) {
      console.log('Warning: Could not create composite index on department_id and status:', deptStatusIndexError.message);
    } else {
      console.log('✓ Created composite index on department_id and status');
    }

    // Create indexes for versioning
    console.log('Creating indexes for versioning...');
    const { error: versionIndexError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_documents_version ON documents(version);
        CREATE INDEX IF NOT EXISTS idx_documents_parent_document_id_version ON documents(parent_document_id, version);
      `
    });

    if (versionIndexError) {
      console.log('Warning: Could not create indexes for versioning:', versionIndexError.message);
    } else {
      console.log('✓ Created indexes for versioning');
    }

    // Update RLS policies to include department and versioning features
    console.log('\n--- Updating RLS policies for enhanced document features ---');
    
    // Update SELECT policy to include department-based access
    console.log('Updating SELECT policy for department-based access...');
    const { error: selectPolicyError } = await supabase.rpc('execute_sql', {
      sql: `
        DROP POLICY IF EXISTS "Users can view documents they have access to" ON documents;
        CREATE POLICY "Users can view documents they have access to" ON documents
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
        );
      `
    });

    if (selectPolicyError) {
      console.log('Warning: Could not update SELECT policy for documents:', selectPolicyError.message);
    } else {
      console.log('✓ Updated SELECT policy for documents with department access');
    }

    // Update INSERT policy to include department-based upload permissions
    console.log('Updating INSERT policy for department-based upload permissions...');
    const { error: insertPolicyError } = await supabase.rpc('execute_sql', {
      sql: `
        DROP POLICY IF EXISTS "Users can upload documents" ON documents;
        CREATE POLICY "Users can upload documents to departments they have access to" ON documents
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
        );
      `
    });

    if (insertPolicyError) {
      console.log('Warning: Could not update INSERT policy for documents:', insertPolicyError.message);
    } else {
      console.log('✓ Updated INSERT policy for documents with department permissions');
    }

    // Update UPDATE policy to include department-based update permissions
    console.log('Updating UPDATE policy for department-based update permissions...');
    const { error: updatePolicyError } = await supabase.rpc('execute_sql', {
      sql: `
        DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
        CREATE POLICY "Users can update documents they have access to" ON documents
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
        );
      `
    });

    if (updatePolicyError) {
      console.log('Warning: Could not update UPDATE policy for documents:', updatePolicyError.message);
    } else {
      console.log('✓ Updated UPDATE policy for documents with department permissions');
    }

    // Update DELETE policy to include department-based delete permissions
    console.log('Updating DELETE policy for department-based delete permissions...');
    const { error: deletePolicyError } = await supabase.rpc('execute_sql', {
      sql: `
        DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;
        CREATE POLICY "Users can delete documents they have access to" ON documents
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
        );
      `
    });

    if (deletePolicyError) {
      console.log('Warning: Could not update DELETE policy for documents:', deletePolicyError.message);
    } else {
      console.log('✓ Updated DELETE policy for documents with department permissions');
    }

    console.log('\nDocument model enhancement completed!');
    console.log('\nNote: If any RPC calls failed, you will need to manually run these commands in the Supabase SQL Editor.');
  } catch (error) {
    console.error('Error enhancing document model:', error);
  }
}

// Run the script if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  enhanceDocumentModel().catch(console.error);
}

export default enhanceDocumentModel;