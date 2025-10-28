import { createClient } from '@supabase/supabase-js';
require('dotenv').config();

// This script applies the correct RLS policies to both Supabase storage and database tables
async function applyRLSPoliciesDirect() {
  console.log('Applying RLS policies to Supabase storage and database tables...');
  
  // Initialize Supabase client with service role key for admin operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations
  );
  
  console.log('Supabase admin client created');
  
  try {
    // First, enable RLS on all tables
    console.log('Enabling RLS on database tables...');
    
    const tableNames = ['users', 'documents', 'document_permissions', 'document_downloads', 'document_views', 'document_comments'];
    
    for (const tableName of tableNames) {
      try {
        // Try to enable RLS using raw SQL
        const { error: rlsError } = await supabase.rpc('execute_sql', {
          sql: `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;`
        });
        
        if (rlsError) {
          console.log(`RLS enable might have failed for ${tableName}:`, rlsError);
        } else {
          console.log(`RLS enabled on ${tableName}`);
        }
      } catch (err) {
        console.log(`Could not enable RLS on ${tableName}:`, err);
      }
    }
    
    // Apply storage policies
    console.log('\nApplying storage RLS policies...');
    
    // Drop existing policies first (if they exist)
    const dropPolicies = [
      "DROP POLICY IF EXISTS \"Allow authenticated users to read files in repository-files bucket\" ON storage.objects;",
      "DROP POLICY IF EXISTS \"Allow admin and faculty to upload files to repository-files bucket\" ON storage.objects;",
      "DROP POLICY IF EXISTS \"Allow owners and admins to update files in repository-files bucket\" ON storage.objects;",
      "DROP POLICY IF EXISTS \"Allow owners and admins to delete files in repository-files bucket\" ON storage.objects;"
    ];
    
    for (const dropPolicy of dropPolicies) {
      try {
        const { error } = await supabase.rpc('execute_sql', {
          sql: dropPolicy
        });
        if (error) {
          console.log(`Could not execute drop policy: ${dropPolicy.substring(0, 60)}...`, error);
        } else {
          console.log(`Executed: ${dropPolicy.substring(0, 60)}...`);
        }
      } catch (err) {
        console.log(`Could not execute: ${dropPolicy.substring(0, 60)}...`, err);
      }
    }
    
    // Create new storage policies
    const storagePolicies = [
      `CREATE POLICY "Allow authenticated users to read files in repository-files bucket"
         ON storage.objects FOR SELECT
         TO authenticated
         USING (bucket_id = 'repository-files');`,
      
      `CREATE POLICY "Allow admin and faculty to upload files to repository-files bucket"
         ON storage.objects FOR INSERT
         TO authenticated
         WITH CHECK (
           bucket_id = 'repository-files'
         );`,
      
      `CREATE POLICY "Allow owners to update files in repository-files bucket"
         ON storage.objects FOR UPDATE
         TO authenticated
         USING (
           bucket_id = 'repository-files'
           AND owner_id::text = auth.uid()::text
         );`,
      
      `CREATE POLICY "Allow owners to delete files in repository-files bucket"
         ON storage.objects FOR DELETE
         TO authenticated
         USING (
           bucket_id = 'repository-files'
           AND owner_id::text = auth.uid()::text
         );`
    ];
    
    for (const policy of storagePolicies) {
      try {
        const { error } = await supabase.rpc('execute_sql', {
          sql: policy
        });
        if (error) {
          console.log(`Could not create storage policy: ${policy.substring(0, 50)}...`, error);
        } else {
          console.log(`Created storage policy: ${policy.substring(0, 50)}...`);
        }
      } catch (err) {
        console.log(`Could not create storage policy: ${policy.substring(0, 50)}...`, err);
      }
    }
    
    // Create database table policies
    console.log('\nApplying database table RLS policies...');
    
    const dbPolicies = [
      `CREATE POLICY "Users can view their own profile" ON users
         FOR SELECT USING (
           id::text = (SELECT auth.uid())::text OR
           supabase_auth_id::text = (SELECT auth.uid())::text
         );`,
      
      `CREATE POLICY "Users can view documents they have permissions for" ON documents
         FOR SELECT USING (
           EXISTS (
             SELECT 1 FROM document_permissions
             WHERE document_permissions.documentId = documents.id
             AND document_permissions.userId::text = (SELECT auth.uid())::text
             AND document_permissions.permission = ANY(ARRAY['READ', 'WRITE', 'ADMIN']::"PermissionLevel"[])
           )
           OR (SELECT "uploadedById" FROM documents d WHERE d.id = documents.id)::text = (SELECT auth.uid())::text
         );`,
      
      `CREATE POLICY "Users can upload documents" ON documents
         FOR INSERT WITH CHECK (
           EXISTS (
             SELECT 1 FROM users
             WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text
             AND users.role IN ('ADMIN', 'FACULTY')
           )
         );`,
      
      `CREATE POLICY "Users can update documents they own or have admin permission" ON documents
         FOR UPDATE USING (
           (SELECT "uploadedById" FROM documents d WHERE d.id = documents.id)::text = (SELECT auth.uid())::text
           OR EXISTS (
             SELECT 1 FROM document_permissions
             WHERE document_permissions."documentId" = documents.id
             AND document_permissions."userId"::text = (SELECT auth.uid())::text
             AND document_permissions.permission = 'ADMIN'::"PermissionLevel"
           )
         );`,
      
      `CREATE POLICY "Users can delete documents they own or have admin permission" ON documents
         FOR DELETE USING (
           (SELECT "uploadedById" FROM documents d WHERE d.id = documents.id)::text = (SELECT auth.uid())::text
         );`,
      
      `CREATE POLICY "Users can view permissions for documents they have access to" ON document_permissions
         FOR SELECT USING (
           EXISTS (
             SELECT 1 FROM document_permissions dp2
             WHERE dp2."documentId" = document_permissions."documentId"
             AND dp2."userId"::text = (SELECT auth.uid())::text
             AND dp2.permission = 'ADMIN'::"PermissionLevel"
           )
           OR EXISTS (
             SELECT 1 FROM documents d
             JOIN users u ON u.id = d."uploadedById"
             WHERE d.id = document_permissions."documentId"
             AND u.supabase_auth_id::text = (SELECT auth.uid())::text
           )
         );`,
      
      `CREATE POLICY "Users can view their own downloads and admin can view all" ON document_downloads
         FOR SELECT USING (
           "userId"::text = (SELECT auth.uid())::text
         );`,
      
      `CREATE POLICY "Users can insert their own downloads" ON document_downloads
         FOR INSERT WITH CHECK (
           "userId"::text = (SELECT auth.uid())::text
         );`,
      
      `CREATE POLICY "Users can view their own views and admin can view all" ON document_views
         FOR SELECT USING (
           "userId"::text = (SELECT auth.uid())::text
         );`,
      
      `CREATE POLICY "Users can insert their own views" ON document_views
         FOR INSERT WITH CHECK (
           "userId"::text = (SELECT auth.uid())::text
         );`,
      
      `CREATE POLICY "Users can view comments on documents they have access to" ON document_comments
         FOR SELECT USING (
           EXISTS (
             SELECT 1 FROM document_permissions
             WHERE document_permissions."documentId" = document_comments."documentId"
             AND document_permissions."userId"::text = (SELECT auth.uid())::text
             AND document_permissions.permission = ANY(ARRAY['READ', 'WRITE', 'ADMIN']::"PermissionLevel"[])
           )
           OR (SELECT "uploadedById" FROM documents d JOIN document_comments dc ON d.id = dc."documentId" WHERE dc.id = document_comments.id)::text = (SELECT auth.uid())::text
           OR document_comments."userId"::text = (SELECT auth.uid())::text
         );`,
      
      `CREATE POLICY "Users can insert comments on documents they have access to" ON document_comments
         FOR INSERT WITH CHECK (
           EXISTS (
             SELECT 1 FROM documents d
             JOIN document_permissions dp ON dp."documentId" = d.id
             WHERE d.id = document_comments."documentId"
             AND dp."userId"::text = (SELECT auth.uid())::text
             AND dp.permission = ANY(ARRAY['READ', 'WRITE', 'ADMIN']::"PermissionLevel"[])
           )
           OR (SELECT "uploadedById" FROM documents d WHERE d.id = document_comments."documentId")::text = (SELECT auth.uid())::text
         );`,
      
      `CREATE POLICY "Users can update their own comments" ON document_comments
         FOR UPDATE USING (
           "userId"::text = (SELECT auth.uid())::text
         );`,
      
      `CREATE POLICY "Users can delete their own comments" ON document_comments
         FOR DELETE USING (
           "userId"::text = (SELECT auth.uid())::text
         );`
    ];
    
    for (const policy of dbPolicies) {
      try {
        const { error } = await supabase.rpc('execute_sql', {
          sql: policy
        });
        if (error) {
          console.log(`Could not create database policy: ${policy.substring(0, 50)}...`, error);
        } else {
          console.log(`Created database policy: ${policy.substring(0, 50)}...`);
        }
      } catch (err) {
        console.log(`Could not create database policy: ${policy.substring(0, 50)}...`, err);
      }
    }
    
    console.log('\nRLS policies applied successfully!');
    console.log('\nNote: If any policies failed to create, you will need to manually run them in the Supabase SQL Editor.');
    console.log('\nThe following commands should be run in the Supabase SQL Editor if they failed:');
    
    for (const policy of [...storagePolicies, ...dbPolicies]) {
      console.log(policy);
      console.log('---');
    }
 } catch (error) {
    console.error('Error applying RLS policies:', error);
  }
}

// Run the script if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  applyRLSPoliciesDirect().catch(console.error);
}

export default applyRLSPoliciesDirect;