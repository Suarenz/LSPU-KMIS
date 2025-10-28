// This script provides the correct SQL commands to fix the RLS policies for Supabase storage bucket
// You need to run these commands manually in the Supabase SQL Editor

console.log('=== SUPABASE STORAGE RLS POLICIES FOR FILE UPLOAD FIX ===\n');

console.log('To fix the file upload issue, please run these SQL commands in your Supabase SQL Editor:');
console.log('1. Go to your Supabase dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Copy and paste the following commands');
console.log('4. Execute them one by one\n');

console.log('--- STEP 1: DROP EXISTING POLICIES (if they exist) ---');
console.log(`DROP POLICY IF EXISTS "Allow authenticated users to read files in repository-files bucket" ON storage.objects;`);
console.log(`DROP POLICY IF EXISTS "Allow admin and faculty to upload files to repository-files bucket" ON storage.objects;`);
console.log(`DROP POLICY IF EXISTS "Allow owners and admins to update files in repository-files bucket" ON storage.objects;`);
console.log(`DROP POLICY IF EXISTS "Allow owners and admins to delete files in repository-files bucket" ON storage.objects;\n`);

console.log('--- STEP 2: CREATE NEW POLICIES WITH PROPER ROLE CHECKS ---');
console.log(`-- Policy for SELECT (reading files) - allow authenticated users to read files`);
console.log(`CREATE POLICY "Allow authenticated users to read files in repository-files bucket"`);
console.log(`  ON storage.objects FOR SELECT`);
console.log(`  TO authenticated`);
console.log(`  USING (bucket_id = 'repository-files');\n`);

console.log(`-- Policy for INSERT (uploading files) - allow admin and faculty to upload files`);
console.log(`CREATE POLICY "Allow admin and faculty to upload files to repository-files bucket"`);
console.log(`  ON storage.objects FOR INSERT`);
console.log(` TO authenticated`);
console.log(`  WITH CHECK (`);
console.log(`    bucket_id = 'repository-files'`);
console.log(`    AND (EXISTS (`);
console.log(`      SELECT 1 FROM users`);
console.log(`      WHERE users.supabase_auth_id::text = auth.uid()::text`);
console.log(`      AND users.role IN ('ADMIN', 'FACULTY')`);
console.log(`    ))`);
console.log(`  );\n`);

console.log(`-- Policy for UPDATE (updating files) - allow owners and admins to update files`);
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
console.log(`  );\n`);

console.log(`-- Policy for DELETE (deleting files) - allow owners and admins to delete files`);
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
console.log(`  );\n`);

console.log('--- VERIFICATION ---');
console.log('After applying these policies:');
console.log('1. Log in as an admin or faculty user');
console.log('2. Navigate to the repository page');
console.log('3. Attempt to upload a document');
console.log('4. The upload should now succeed without "row-level security policy" errors\n');

console.log('Note: These policies use uppercase role values (\'ADMIN\', \'FACULTY\') to match the database enum');
console.log('and ensure that only authenticated users with the correct roles can upload files.');