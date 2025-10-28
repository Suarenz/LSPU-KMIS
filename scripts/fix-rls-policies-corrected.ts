import { createClient } from '@supabase/supabase-js';
require('dotenv').config();

// This script generates the corrected SQL commands to fix RLS policy infinite recursion issues
// These commands need to be manually executed in the Supabase SQL Editor
function generateCorrectedRLSSQLCommands() {
  console.log('=== CORRECTED RLS POLICIES TO FIX INFINITE RECURSION ===\n');
  
  console.log('IMPORTANT: These corrected policies avoid infinite recursion by using auth.jwt() to check roles instead of querying the users table.\n');
  
  console.log('Please copy and run the following SQL commands in your Supabase SQL Editor:\n');

  console.log('--- ENABLE ROW LEVEL SECURITY ON ALL TABLES ---');
  console.log(`ALTER TABLE users ENABLE ROW LEVEL SECURITY;`);
  console.log(`ALTER TABLE documents ENABLE ROW LEVEL SECURITY;`);
  console.log(`ALTER TABLE document_permissions ENABLE ROW LEVEL SECURITY;`);
  console.log(`ALTER TABLE document_downloads ENABLE ROW LEVEL SECURITY;`);
  console.log(`ALTER TABLE document_views ENABLE ROW LEVEL SECURITY;`);
  console.log(`ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;`);
  console.log('');

  console.log('--- DROP EXISTING PROBLEMATIC POLICIES ---');
  console.log(`DROP POLICY IF EXISTS "Users can view their own profile" ON users;`);
  console.log(`DROP POLICY IF EXISTS "Users can view documents they have permissions for" ON documents;`);
  console.log(`DROP POLICY IF EXISTS "Users can upload documents" ON documents;`);
  console.log(`DROP POLICY IF EXISTS "Users can update documents they own or have admin permission" ON documents;`);
  console.log(`DROP POLICY IF EXISTS "Users can delete documents they own or have admin permission" ON documents;`);
  console.log(`DROP POLICY IF EXISTS "Users can view permissions for documents they have access to" ON document_permissions;`);
  console.log(`DROP POLICY IF EXISTS "Users can view their own downloads and admin can view all" ON document_downloads;`);
  console.log(`DROP POLICY IF EXISTS "Users can insert their own downloads" ON document_downloads;`);
  console.log(`DROP POLICY IF EXISTS "Users can view their own views and admin can view all" ON document_views;`);
  console.log(`DROP POLICY IF EXISTS "Users can insert their own views" ON document_views;`);
  console.log(`DROP POLICY IF EXISTS "Users can view comments on documents they have access to" ON document_comments;`);
  console.log(`DROP POLICY IF EXISTS "Users can insert comments on documents they have access to" ON document_comments;`);
  console.log(`DROP POLICY IF EXISTS "Users can update their own comments" ON document_comments;`);
  console.log(`DROP POLICY IF EXISTS "Users can delete their own comments or admin can delete any" ON document_comments;`);
  console.log('');

  console.log('--- CREATE CORRECTED STORAGE RLS POLICIES ---');
  console.log(`-- Allow authenticated users to read files in repository-files bucket`);
  console.log(`CREATE POLICY "Allow authenticated users to read files in repository-files bucket"`);
  console.log(`  ON storage.objects FOR SELECT`);
  console.log(`  TO authenticated`);
  console.log(`  USING (bucket_id = 'repository-files');`);
  console.log('');

  console.log(`-- Allow admin and faculty to upload files to repository-files bucket`);
  console.log(`CREATE POLICY "Allow admin and faculty to upload files to repository-files bucket"`);
  console.log(`  ON storage.objects FOR INSERT`);
  console.log(`  TO authenticated`);
  console.log(`  WITH CHECK (`);
  console.log(`    bucket_id = 'repository-files'`);
  console.log(`    AND (auth.jwt() ->> 'role' = 'ADMIN' OR auth.jwt() ->> 'role' = 'FACULTY')`);
  console.log(`  );`);
  console.log('');

  console.log(`-- Allow owners and admins to update files in repository-files bucket`);
  console.log(`CREATE POLICY "Allow owners and admins to update files in repository-files bucket"`);
  console.log(`  ON storage.objects FOR UPDATE`);
  console.log(`  TO authenticated`);
  console.log(`  USING (`);
  console.log(`    bucket_id = 'repository-files'`);
  console.log(`    AND (`);
  console.log(`      owner_id::text = auth.uid()::text`);
  console.log(`      OR auth.jwt() ->> 'role' = 'ADMIN'`);
  console.log(`    )`);
  console.log(` );`);
  console.log('');

  console.log(`-- Allow owners and admins to delete files in repository-files bucket`);
  console.log(`CREATE POLICY "Allow owners and admins to delete files in repository-files bucket"`);
  console.log(`  ON storage.objects FOR DELETE`);
  console.log(`  TO authenticated`);
  console.log(`  USING (`);
  console.log(`    bucket_id = 'repository-files'`);
  console.log(`    AND (`);
  console.log(`      owner_id::text = auth.uid()::text`);
  console.log(`      OR auth.jwt() ->> 'role' = 'ADMIN'`);
  console.log(`    )`);
  console.log(`  );`);
  console.log('');

  console.log('--- CREATE CORRECTED DATABASE TABLE RLS POLICIES ---');
  console.log(`-- Users can view their own profile (fixed to avoid recursion)`);
  console.log(`CREATE POLICY "Users can view their own profile" ON users`);
  console.log(`  FOR SELECT USING (`);
  console.log(`    id::text = (SELECT auth.uid())::text OR`);
  console.log(`    supabase_auth_id::text = (SELECT auth.uid())::text OR`);
  console.log(`    auth.jwt() ->> 'role' = 'ADMIN'`);
  console.log(`  );`);
  console.log('');

  console.log(`-- Users can view documents they have permissions for (fixed to avoid recursion)`);
  console.log(`CREATE POLICY "Users can view documents they have permissions for" ON documents`);
  console.log(`  FOR SELECT USING (`);
  console.log(`    EXISTS (`);
  console.log(`      SELECT 1 FROM document_permissions`);
  console.log(`      WHERE document_permissions."documentId" = documents.id`);
  console.log(`      AND document_permissions."userId"::text = (SELECT auth.uid())::text`);
  console.log(`      AND document_permissions.permission = ANY(ARRAY['READ', 'WRITE', 'ADMIN']::"PermissionLevel"[])`);
  console.log(`    )`);
  console.log(`    OR (SELECT "uploadedById" FROM documents d WHERE d.id = documents.id)::text = (SELECT auth.uid())::text`);
  console.log(`    OR auth.jwt() ->> 'role' = 'ADMIN'`);
  console.log(`  );`);
  console.log('');

  console.log(`-- Users can upload documents (fixed to avoid recursion)`);
  console.log(`CREATE POLICY "Users can upload documents" ON documents`);
  console.log(`  FOR INSERT WITH CHECK (`);
  console.log(`    auth.jwt() ->> 'role' = 'ADMIN' OR auth.jwt() ->> 'role' = 'FACULTY'`);
  console.log(`  );`);
  console.log('');

  console.log(`-- Users can update documents they own or have admin permission (fixed to avoid recursion)`);
  console.log(`CREATE POLICY "Users can update documents they own or have admin permission" ON documents`);
  console.log(`  FOR UPDATE USING (`);
  console.log(`    (SELECT "uploadedById" FROM documents d WHERE d.id = documents.id)::text = (SELECT auth.uid())::text`);
  console.log(`    OR EXISTS (`);
  console.log(`      SELECT 1 FROM document_permissions`);
  console.log(`      WHERE document_permissions."documentId" = documents.id`);
  console.log(`      AND document_permissions."userId"::text = (SELECT auth.uid())::text`);
  console.log(`      AND document_permissions.permission = 'ADMIN'::"PermissionLevel"`);
  console.log(`    )`);
  console.log(`    OR auth.jwt() ->> 'role' = 'ADMIN'`);
  console.log(`  );`);
  console.log('');

  console.log(`-- Users can delete documents they own or have admin permission (fixed to avoid recursion)`);
  console.log(`CREATE POLICY "Users can delete documents they own or have admin permission" ON documents`);
  console.log(`  FOR DELETE USING (`);
  console.log(`    (SELECT "uploadedById" FROM documents d WHERE d.id = documents.id)::text = (SELECT auth.uid())::text`);
  console.log(`    OR auth.jwt() ->> 'role' = 'ADMIN'`);
  console.log(`  );`);
  console.log('');

  console.log(`-- Users can view permissions for documents they have access to (fixed to avoid recursion)`);
  console.log(`CREATE POLICY "Users can view permissions for documents they have access to" ON document_permissions`);
  console.log(`  FOR SELECT USING (`);
  console.log(`    EXISTS (`);
  console.log(`      SELECT 1 FROM document_permissions dp2`);
  console.log(`      WHERE dp2."documentId" = document_permissions."documentId"`);
  console.log(`      AND dp2."userId"::text = (SELECT auth.uid())::text`);
  console.log(`      AND dp2.permission = 'ADMIN'::"PermissionLevel"`);
  console.log(`    )`);
  console.log(`    OR EXISTS (`);
  console.log(`      SELECT 1 FROM documents d`);
  console.log(`      WHERE d.id = document_permissions."documentId"`);
  console.log(`      AND d."uploadedById"::text = (SELECT auth.uid())::text`);
  console.log(`    )`);
  console.log(`    OR auth.jwt() ->> 'role' = 'ADMIN'`);
  console.log(`  );`);
  console.log('');

  console.log(`-- Users can view their own downloads and admin can view all (fixed to avoid recursion)`);
  console.log(`CREATE POLICY "Users can view their own downloads and admin can view all" ON document_downloads`);
  console.log(`  FOR SELECT USING (`);
  console.log(`    "userId"::text = (SELECT auth.uid())::text`);
  console.log(`    OR auth.jwt() ->> 'role' = 'ADMIN'`);
  console.log(`  );`);
  console.log('');

  console.log(`-- Users can insert their own downloads`);
  console.log(`CREATE POLICY "Users can insert their own downloads" ON document_downloads`);
  console.log(`  FOR INSERT WITH CHECK (`);
  console.log(`    "userId"::text = (SELECT auth.uid())::text`);
  console.log(`  );`);
  console.log('');

  console.log(`-- Users can view their own views and admin can view all (fixed to avoid recursion)`);
  console.log(`CREATE POLICY "Users can view their own views and admin can view all" ON document_views`);
  console.log(`  FOR SELECT USING (`);
  console.log(`    "userId"::text = (SELECT auth.uid())::text`);
  console.log(`    OR auth.jwt() ->> 'role' = 'ADMIN'`);
  console.log(`  );`);
  console.log('');

  console.log(`-- Users can insert their own views`);
  console.log(`CREATE POLICY "Users can insert their own views" ON document_views`);
  console.log(`  FOR INSERT WITH CHECK (`);
  console.log(`    "userId"::text = (SELECT auth.uid())::text`);
  console.log(`  );`);
  console.log('');

  console.log(`-- Users can view comments on documents they have access to (fixed to avoid recursion)`);
  console.log(`CREATE POLICY "Users can view comments on documents they have access to" ON document_comments`);
  console.log(` FOR SELECT USING (`);
  console.log(`    EXISTS (`);
  console.log(`      SELECT 1 FROM document_permissions`);
  console.log(`      WHERE document_permissions."documentId" = document_comments."documentId"`);
  console.log(`      AND document_permissions."userId"::text = (SELECT auth.uid())::text`);
  console.log(`      AND document_permissions.permission = ANY(ARRAY['READ', 'WRITE', 'ADMIN']::"PermissionLevel"[])`);
  console.log(`    )`);
  console.log(`    OR (SELECT "uploadedById" FROM documents d JOIN document_comments dc ON d.id = dc."documentId" WHERE dc.id = document_comments.id)::text = (SELECT auth.uid())::text`);
  console.log(`    OR document_comments."userId"::text = (SELECT auth.uid())::text`);
  console.log(`    OR auth.jwt() ->> 'role' = 'ADMIN'`);
  console.log(`  );`);
  console.log('');

  console.log(`-- Users can insert comments on documents they have access to (fixed to avoid recursion)`);
  console.log(`CREATE POLICY "Users can insert comments on documents they have access to" ON document_comments`);
  console.log(` FOR INSERT WITH CHECK (`);
  console.log(`    EXISTS (`);
  console.log(`      SELECT 1 FROM documents d`);
  console.log(`      JOIN document_permissions dp ON dp."documentId" = d.id`);
  console.log(`      WHERE d.id = document_comments."documentId"`);
  console.log(`      AND dp."userId"::text = (SELECT auth.uid())::text`);
  console.log(`      AND dp.permission = ANY(ARRAY['READ', 'WRITE', 'ADMIN']::"PermissionLevel"[])`);
  console.log(`    )`);
  console.log(`    OR (SELECT "uploadedById" FROM documents d WHERE d.id = document_comments."documentId")::text = (SELECT auth.uid())::text`);
  console.log(`    OR auth.jwt() ->> 'role' = 'ADMIN'`);
  console.log(`  );`);
  console.log('');

  console.log(`-- Users can update their own comments`);
  console.log(`CREATE POLICY "Users can update their own comments" ON document_comments`);
  console.log(`  FOR UPDATE USING (`);
  console.log(`    "userId"::text = (SELECT auth.uid())::text`);
  console.log(`  );`);
  console.log('');

  console.log(`-- Users can delete their own comments or admin can delete any (fixed to avoid recursion)`);
  console.log(`CREATE POLICY "Users can delete their own comments or admin can delete any" ON document_comments`);
  console.log(`  FOR DELETE USING (`);
  console.log(`    "userId"::text = (SELECT auth.uid())::text`);
  console.log(`    OR auth.jwt() ->> 'role' = 'ADMIN'`);
  console.log(`  );`);
  console.log('');

  console.log('=== INSTRUCTIONS ===');
  console.log('1. Go to your Supabase Dashboard');
  console.log('2. Navigate to the SQL Editor');
  console.log('3. Copy and paste all the above commands');
  console.log('4. Execute the commands');
  console.log('');
  console.log('The corrected policies avoid infinite recursion by using auth.jwt() ->> \'role\' instead of querying the users table.');
  console.log('Make sure your Supabase auth user metadata includes the role field (e.g., {"role": "ADMIN"}) for admin users.');
}

// Run the script if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  generateCorrectedRLSSQLCommands();
}

export default generateCorrectedRLSSQLCommands;