import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// This script provides the RLS policies for Supabase storage bucket specifically for the file upload issue
// NOTE: You need to manually run these SQL commands in the Supabase SQL Editor
async function fixStorageRLSPolicies() {
  console.log('RLS policies for Supabase storage bucket (repository-files):');
  console.log('\n1. Copy the following SQL commands:');
  console.log('\n-- Policy for SELECT (reading files) - allow authenticated users to read files');
  console.log("CREATE POLICY \"Allow authenticated users to read files in repository-files bucket\"");
  console.log("ON storage.objects FOR SELECT");
  console.log("TO authenticated");
  console.log("USING (bucket_id = 'repository-files');");
  console.log('\n-- Policy for INSERT (uploading files) - allow admin and faculty to upload files');
  console.log("CREATE POLICY \"Allow admin and faculty to upload files to repository-files bucket\"");
  console.log("ON storage.objects FOR INSERT");
  console.log("TO authenticated");
  console.log("WITH CHECK (");
  console.log("  bucket_id = 'repository-files'");
  console.log("  AND (EXISTS (");
  console.log("    SELECT 1 FROM users");
  console.log("    WHERE users.supabase_auth_id::text = auth.uid()::text");
  console.log("    AND users.role IN ('ADMIN', 'FACULTY')");
  console.log("  ))");
  console.log(");");
  console.log('\n-- Policy for UPDATE (updating files) - allow owners and admins to update files');
  console.log("CREATE POLICY \"Allow owners and admins to update files in repository-files bucket\"");
  console.log("ON storage.objects FOR UPDATE");
  console.log("TO authenticated");
  console.log("USING (");
  console.log("  bucket_id = 'repository-files'");
  console.log("  AND (");
  console.log("    owner_id::text = auth.uid()::text");
  console.log("    OR EXISTS (");
  console.log("      SELECT 1 FROM users");
  console.log("      WHERE users.supabase_auth_id::text = auth.uid()::text");
  console.log("      AND users.role = 'ADMIN'");
  console.log("    )");
  console.log("  )");
  console.log(");");
  console.log('\n-- Policy for DELETE (deleting files) - allow owners and admins to delete files');
  console.log("CREATE POLICY \"Allow owners and admins to delete files in repository-files bucket\"");
 console.log("ON storage.objects FOR DELETE");
  console.log("TO authenticated");
  console.log("USING (");
  console.log("  bucket_id = 'repository-files'");
  console.log("  AND (");
  console.log("    owner_id::text = auth.uid()::text");
  console.log("    OR EXISTS (");
  console.log("      SELECT 1 FROM users");
  console.log("      WHERE users.supabase_auth_id::text = auth.uid()::text");
  console.log("      AND users.role = 'ADMIN'");
  console.log("    )");
  console.log("  )");
  console.log(");");

  console.log('\n2. Go to your Supabase dashboard');
  console.log('3. Navigate to SQL Editor');
  console.log('4. Paste and run these commands');
  console.log('\nAlternatively, you can run these commands from the file: scripts/apply-storage-rls-policies.sql');
}

// Run the script if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixStorageRLSPolicies().catch(console.error);
}

export default fixStorageRLSPolicies;