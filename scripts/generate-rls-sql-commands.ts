// This script generates the SQL commands needed to apply RLS policies
// These commands need to be manually executed in the Supabase SQL Editor
function generateRLSSQLCommands() {
  console.log('=== RLS POLICIES FOR SUPABASE STORAGE AND DATABASE ===\n');
  
  console.log('Please copy and run the following SQL commands in your Supabase SQL Editor:\n');

  console.log('--- ENABLE ROW LEVEL SECURITY ON ALL TABLES ---');
  console.log(`ALTER TABLE users ENABLE ROW LEVEL SECURITY;`);
  console.log(`ALTER TABLE documents ENABLE ROW LEVEL SECURITY;`);
  console.log(`ALTER TABLE document_permissions ENABLE ROW LEVEL SECURITY;`);
  console.log(`ALTER TABLE document_downloads ENABLE ROW LEVEL SECURITY;`);
  console.log(`ALTER TABLE document_views ENABLE ROW LEVEL SECURITY;`);
  console.log(`ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;`);
  console.log('');

  console.log('--- DROP EXISTING STORAGE POLICIES (if they exist) ---');
  console.log(`DROP POLICY IF EXISTS "Allow authenticated users to read files in repository-files bucket" ON storage.objects;`);
  console.log(`DROP POLICY IF EXISTS "Allow admin and faculty to upload files to repository-files bucket" ON storage.objects;`);
  console.log(`DROP POLICY IF EXISTS "Allow owners and admins to update files in repository-files bucket" ON storage.objects;`);
  console.log(`DROP POLICY IF EXISTS "Allow owners and admins to delete files in repository-files bucket" ON storage.objects;`);
  console.log('');

  console.log('--- CREATE STORAGE RLS POLICIES ---');
  console.log(`CREATE POLICY "Allow authenticated users to read files in repository-files bucket"`);
  console.log(`  ON storage.objects FOR SELECT`);
  console.log(`  TO authenticated`);
  console.log(`  USING (bucket_id = 'repository-files');`);
  console.log('');

  console.log(`CREATE POLICY "Allow admin and faculty to upload files to repository-files bucket"`);
  console.log(`  ON storage.objects FOR INSERT`);
  console.log(`  TO authenticated`);
  console.log(`  WITH CHECK (`);
  console.log(`    bucket_id = 'repository-files'`);
  console.log(`    AND (EXISTS (`);
  console.log(`      SELECT 1 FROM users`);
  console.log(`      WHERE users.supabase_auth_id::text = auth.uid()::text`);
  console.log(`      AND users.role IN ('ADMIN', 'FACULTY')`);
  console.log(`    ))`);
  console.log(`  );`);
  console.log('');

  console.log(`CREATE POLICY "Allow owners and admins to update files in repository-files bucket"`);
  console.log(`  ON storage.objects FOR UPDATE`);
  console.log(`  TO authenticated`);
  console.log(`  USING (`);
  console.log(`    bucket_id = 'repository-files'`);
  console.log(`    AND (`);
  console.log(`      owner_id::text = auth.uid()::text`);
  console.log(`      OR EXISTS (`);
  console.log(`        SELECT 1 FROM users`);
  console.log(`        WHERE users.supabase_auth_id::text = auth.uid()::text`);
  console.log(`        AND users.role = 'ADMIN'`);
  console.log(`      )`);
  console.log(`    )`);
  console.log(`  );`);
  console.log('');

  console.log(`CREATE POLICY "Allow owners and admins to delete files in repository-files bucket"`);
  console.log(`  ON storage.objects FOR DELETE`);
  console.log(`  TO authenticated`);
  console.log(`  USING (`);
 console.log(`    bucket_id = 'repository-files'`);
  console.log(`    AND (`);
  console.log(`      owner_id::text = auth.uid()::text`);
  console.log(`      OR EXISTS (`);
  console.log(`        SELECT 1 FROM users`);
  console.log(`        WHERE users.supabase_auth_id::text = auth.uid()::text`);
  console.log(`        AND users.role = 'ADMIN'`);
  console.log(`      )`);
  console.log(`    )`);
  console.log(`  );`);
  console.log('');

  console.log('--- CREATE DATABASE TABLE RLS POLICIES ---');
  console.log(`CREATE POLICY "Users can view their own profile" ON users`);
  console.log(`  FOR SELECT USING (`);
  console.log(`    id::text = (SELECT auth.uid())::text OR`);
  console.log(`    supabase_auth_id::text = (SELECT auth.uid())::text OR`);
  console.log(`    EXISTS (`);
  console.log(`      SELECT 1 FROM users WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text AND users.role = 'ADMIN'`);
  console.log(`    )`);
  console.log(`  );`);
  console.log('');

  console.log(`CREATE POLICY "Users can view documents they have permissions for" ON documents`);
  console.log(`  FOR SELECT USING (`);
  console.log(`    EXISTS (`);
  console.log(`      SELECT 1 FROM document_permissions`);
  console.log(`      WHERE document_permissions."documentId" = documents.id`);
  console.log(`      AND document_permissions."userId"::text = (SELECT auth.uid())::text`);
  console.log(`      AND document_permissions.permission = ANY(ARRAY['READ', 'WRITE', 'ADMIN']::"PermissionLevel"[])`);
  console.log(`    )`);
  console.log(`    OR (SELECT "uploadedById" FROM documents d WHERE d.id = documents.id)::text = (SELECT auth.uid())::text`);
  console.log(`    OR EXISTS (`);
  console.log(`      SELECT 1 FROM users WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text AND users.role = 'ADMIN'`);
  console.log(`    )`);
  console.log(`  );`);
  console.log('');

  console.log(`CREATE POLICY "Users can upload documents" ON documents`);
  console.log(`  FOR INSERT WITH CHECK (`);
  console.log(`    EXISTS (`);
  console.log(`      SELECT 1 FROM users`);
  console.log(`      WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text`);
  console.log(`      AND users.role IN ('ADMIN', 'FACULTY')`);
  console.log(`    )`);
  console.log(`  );`);
  console.log('');

  console.log(`CREATE POLICY "Users can update documents they own or have admin permission" ON documents`);
  console.log(`  FOR UPDATE USING (`);
  console.log(`    (SELECT "uploadedById" FROM documents d WHERE d.id = documents.id)::text = (SELECT auth.uid())::text`);
  console.log(`    OR EXISTS (`);
  console.log(`      SELECT 1 FROM document_permissions`);
  console.log(`      WHERE document_permissions."documentId" = documents.id`);
  console.log(`      AND document_permissions."userId"::text = (SELECT auth.uid())::text`);
  console.log(`      AND document_permissions.permission = 'ADMIN'::"PermissionLevel"`);
  console.log(`    )`);
  console.log(`    OR EXISTS (`);
  console.log(`      SELECT 1 FROM users WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text AND users.role = 'ADMIN'`);
  console.log(`    )`);
  console.log(`  );`);
  console.log('');

  console.log(`CREATE POLICY "Users can delete documents they own or have admin permission" ON documents`);
  console.log(`  FOR DELETE USING (`);
  console.log(`    (SELECT "uploadedById" FROM documents d WHERE d.id = documents.id)::text = (SELECT auth.uid())::text`);
  console.log(`    OR EXISTS (`);
  console.log(`      SELECT 1 FROM users WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text AND users.role = 'ADMIN'`);
  console.log(`    )`);
  console.log(`  );`);
  console.log('');

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
  console.log(`      JOIN users u ON u.id = d."uploadedById"`);
  console.log(`      WHERE d.id = document_permissions."documentId"`);
  console.log(`      AND u.supabase_auth_id::text = (SELECT auth.uid())::text`);
  console.log(`    )`);
  console.log(`    OR EXISTS (`);
  console.log(`      SELECT 1 FROM users WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text AND users.role = 'ADMIN'`);
  console.log(`    )`);
  console.log(`  );`);
  console.log('');

  console.log(`CREATE POLICY "Users can view their own downloads and admin can view all" ON document_downloads`);
  console.log(`  FOR SELECT USING (`);
  console.log(`    "userId"::text = (SELECT auth.uid())::text`);
  console.log(`    OR EXISTS (`);
  console.log(`      SELECT 1 FROM users WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text AND users.role = 'ADMIN'`);
  console.log(`    )`);
  console.log(`  );`);
  console.log('');

  console.log(`CREATE POLICY "Users can insert their own downloads" ON document_downloads`);
  console.log(`  FOR INSERT WITH CHECK (`);
  console.log(`    "userId"::text = (SELECT auth.uid())::text`);
  console.log(`  );`);
  console.log('');

  console.log(`CREATE POLICY "Users can view their own views and admin can view all" ON document_views`);
  console.log(`  FOR SELECT USING (`);
  console.log(`    "userId"::text = (SELECT auth.uid())::text`);
  console.log(`    OR EXISTS (`);
  console.log(`      SELECT 1 FROM users WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text AND users.role = 'ADMIN'`);
  console.log(`    )`);
  console.log(`  );`);
  console.log('');

  console.log(`CREATE POLICY "Users can insert their own views" ON document_views`);
  console.log(`  FOR INSERT WITH CHECK (`);
  console.log(`    "userId"::text = (SELECT auth.uid())::text`);
  console.log(`  );`);
  console.log('');

  console.log(`CREATE POLICY "Users can view comments on documents they have access to" ON document_comments`);
  console.log(`  FOR SELECT USING (`);
  console.log(`    EXISTS (`);
  console.log(`      SELECT 1 FROM document_permissions`);
  console.log(`      WHERE document_permissions."documentId" = document_comments."documentId"`);
  console.log(`      AND document_permissions."userId"::text = (SELECT auth.uid())::text`);
  console.log(`      AND document_permissions.permission = ANY(ARRAY['READ', 'WRITE', 'ADMIN']::"PermissionLevel"[])`);
  console.log(`    )`);
  console.log(`    OR (SELECT "uploadedById" FROM documents d JOIN document_comments dc ON d.id = dc."documentId" WHERE dc.id = document_comments.id)::text = (SELECT auth.uid())::text`);
  console.log(`    OR document_comments."userId"::text = (SELECT auth.uid())::text`);
  console.log(`    OR EXISTS (`);
  console.log(`      SELECT 1 FROM users WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text AND users.role = 'ADMIN'`);
  console.log(`    )`);
  console.log(`  );`);
  console.log('');

  console.log(`CREATE POLICY "Users can insert comments on documents they have access to" ON document_comments`);
  console.log(`  FOR INSERT WITH CHECK (`);
  console.log(`    EXISTS (`);
  console.log(`      SELECT 1 FROM documents d`);
  console.log(`      JOIN document_permissions dp ON dp."documentId" = d.id`);
  console.log(`      WHERE d.id = document_comments."documentId"`);
  console.log(`      AND dp."userId"::text = (SELECT auth.uid())::text`);
  console.log(`      AND dp.permission = ANY(ARRAY['READ', 'WRITE', 'ADMIN']::"PermissionLevel"[])`);
  console.log(`    )`);
  console.log(`    OR (SELECT "uploadedById" FROM documents d WHERE d.id = document_comments."documentId")::text = (SELECT auth.uid())::text`);
  console.log(`    OR EXISTS (`);
  console.log(`      SELECT 1 FROM users WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text AND users.role = 'ADMIN'`);
  console.log(`    )`);
  console.log(`  );`);
  console.log('');

  console.log(`CREATE POLICY "Users can update their own comments" ON document_comments`);
  console.log(`  FOR UPDATE USING (`);
  console.log(`    "userId"::text = (SELECT auth.uid())::text`);
  console.log(`  );`);
  console.log('');

  console.log(`CREATE POLICY "Users can delete their own comments or admin can delete any" ON document_comments`);
  console.log(`  FOR DELETE USING (`);
  console.log(`    "userId"::text = (SELECT auth.uid())::text`);
  console.log(`    OR EXISTS (`);
  console.log(`      SELECT 1 FROM users WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text AND users.role = 'ADMIN'`);
  console.log(`    )`);
  console.log(`  );`);
  console.log('');

  console.log('=== INSTRUCTIONS ===');
  console.log('1. Go to your Supabase Dashboard');
  console.log('2. Navigate to the SQL Editor');
  console.log('3. Copy and paste all the above commands');
  console.log('4. Execute the commands');
  console.log('');
  console.log('After applying these policies, your RLS setup will be complete.');
}

// Run the script if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  generateRLSSQLCommands();
}

export default generateRLSSQLCommands;