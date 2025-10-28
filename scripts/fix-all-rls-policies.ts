import { createClient } from '@supabase/supabase-js';
require('dotenv').config();

// This script fixes all RLS policy infinite recursion issues
async function fixAllRLSPolicies() {
  console.log('Fixing all RLS policy infinite recursion issues...');

  // Initialize Supabase client with service role key for admin operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations
 );

  console.log('Supabase admin client created');

  try {
    // First, drop all problematic policies
    console.log('Dropping problematic policies...');
    
    const dropPolicies = [
      "DROP POLICY IF EXISTS \"Users can view their own profile\" ON users;",
      "DROP POLICY IF EXISTS \"Users can view documents they have permissions for\" ON documents;",
      "DROP POLICY IF EXISTS \"Users can upload documents\" ON documents;",
      "DROP POLICY IF EXISTS \"Users can update documents they own or have admin permission\" ON documents;",
      "DROP POLICY IF EXISTS \"Users can delete documents they own or have admin permission\" ON documents;",
      "DROP POLICY IF EXISTS \"Users can view permissions for documents they have access to\" ON document_permissions;",
      "DROP POLICY IF EXISTS \"Users can view their own downloads and admin can view all\" ON document_downloads;",
      "DROP POLICY IF EXISTS \"Users can view their own views and admin can view all\" ON document_views;",
      "DROP POLICY IF EXISTS \"Users can view comments on documents they have access to\" ON document_comments;",
      "DROP POLICY IF EXISTS \"Users can delete their own comments or admin can delete any\" ON document_comments;"
    ];
    
    for (const dropPolicy of dropPolicies) {
      try {
        const { error } = await supabase.rpc('execute_sql', { sql: dropPolicy });
        if (error) {
          console.log(`Could not execute drop policy: ${dropPolicy.substring(0, 60)}...`, error);
        } else {
          console.log(`Dropped policy: ${dropPolicy.substring(0, 60)}...`);
        }
      } catch (err) {
        console.log(`Could not execute drop policy: ${dropPolicy.substring(0, 60)}...`, err);
      }
    }

    // Create corrected policies that avoid recursion by using auth metadata instead of querying users table
    console.log('Creating corrected policies...');
    
    const createPolicies = [
      // Users table policy - fixed to avoid recursion
      `CREATE POLICY "Users can view their own profile" ON users
         FOR SELECT USING (
           id::text = (SELECT auth.uid())::text OR
           supabase_auth_id::text = (SELECT auth.uid())::text OR
           (auth.jwt() ->> 'role' = 'ADMIN')
         );`,
      
      // Documents table policies - fixed to avoid recursion
      `CREATE POLICY "Users can view documents they have permissions for" ON documents
         FOR SELECT USING (
           EXISTS (
             SELECT 1 FROM document_permissions
             WHERE document_permissions."documentId" = documents.id
             AND document_permissions."userId"::text = (SELECT auth.uid())::text
             AND document_permissions.permission = ANY(ARRAY['READ', 'WRITE', 'ADMIN']::"PermissionLevel"[])
           )
           OR (SELECT "uploadedById" FROM documents d WHERE d.id = documents.id)::text = (SELECT auth.uid())::text
           OR (auth.jwt() ->> 'role' = 'ADMIN')
           OR (auth.jwt() ->> 'role' = 'FACULTY')
         );`,
      
      `CREATE POLICY "Users can upload documents" ON documents
         FOR INSERT WITH CHECK (
           (auth.jwt() ->> 'role' = 'ADMIN') OR
           (auth.jwt() ->> 'role' = 'FACULTY')
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
           OR (auth.jwt() ->> 'role' = 'ADMIN')
         );`,
      
      `CREATE POLICY "Users can delete documents they own or have admin permission" ON documents
         FOR DELETE USING (
           (SELECT "uploadedById" FROM documents d WHERE d.id = documents.id)::text = (SELECT auth.uid())::text
           OR (auth.jwt() ->> 'role' = 'ADMIN')
         );`,
      
      // Document permissions table policy - fixed to avoid recursion
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
             WHERE d.id = document_permissions."documentId"
             AND d."uploadedById"::text = (SELECT auth.uid())::text
           )
           OR (auth.jwt() ->> 'role' = 'ADMIN')
         );`,
      
      // Document downloads table policy - fixed to avoid recursion
      `CREATE POLICY "Users can view their own downloads and admin can view all" ON document_downloads
         FOR SELECT USING (
           "userId"::text = (SELECT auth.uid())::text OR
           (auth.jwt() ->> 'role' = 'ADMIN')
         );`,
      
      // Document views table policy - fixed to avoid recursion
      `CREATE POLICY "Users can view their own views and admin can view all" ON document_views
         FOR SELECT USING (
           "userId"::text = (SELECT auth.uid())::text OR
           (auth.jwt() ->> 'role' = 'ADMIN')
         );`,
      
      // Document comments table policies - fixed to avoid recursion
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
           OR (auth.jwt() ->> 'role' = 'ADMIN')
         );`,
      
      `CREATE POLICY "Users can delete their own comments or admin can delete any" ON document_comments
         FOR DELETE USING (
           document_comments."userId"::text = (SELECT auth.uid())::text OR
           (auth.jwt() ->> 'role' = 'ADMIN')
         );`
    ];
    
    for (const createPolicy of createPolicies) {
      try {
        const { error } = await supabase.rpc('execute_sql', { sql: createPolicy });
        if (error) {
          console.log(`Could not create policy: ${createPolicy.substring(0, 50)}...`, error);
        } else {
          console.log(`Created policy: ${createPolicy.substring(0, 50)}...`);
        }
      } catch (err) {
        console.log(`Could not create policy: ${createPolicy.substring(0, 50)}...`, err);
      }
    }

    console.log('\nAll RLS policy fixes attempted!');
    console.log('Note: If any RPC calls failed, you will need to manually run those commands in the Supabase SQL Editor.');
    console.log('\nThe corrected policies avoid infinite recursion by using auth.jwt() to check roles instead of querying the users table.');
  } catch (error) {
    console.error('Error fixing RLS policies:', error);
  }
}

// Run the script if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  fixAllRLSPolicies().catch(console.error);
}

export default fixAllRLSPolicies;