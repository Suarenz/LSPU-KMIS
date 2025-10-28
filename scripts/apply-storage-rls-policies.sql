-- Supabase Storage RLS Policies for repository-files bucket
-- Run these commands in the Supabase SQL Editor

-- Policy for SELECT (reading files) - allow authenticated users to read files
CREATE POLICY "Allow authenticated users to read files in repository-files bucket"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'repository-files');

-- Policy for INSERT (uploading files) - allow admin and faculty to upload files
CREATE POLICY "Allow admin and faculty to upload files to repository-files bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'repository-files'
  AND (EXISTS (
    SELECT 1 FROM users
    WHERE users.supabase_auth_id::text = auth.uid()::text
    AND users.role IN ('ADMIN', 'FACULTY')
  ))
);

-- Policy for UPDATE (updating files) - allow owners and admins to update files
CREATE POLICY "Allow owners and admins to update files in repository-files bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'repository-files'
  AND (
    owner_id::text = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.supabase_auth_id::text = auth.uid()::text
      AND users.role = 'ADMIN'
    )
  )
);

-- Policy for DELETE (deleting files) - allow owners and admins to delete files
CREATE POLICY "Allow owners and admins to delete files in repository-files bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'repository-files'
  AND (
    owner_id::text = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.supabase_auth_id::text = auth.uid()::text
      AND users.role = 'ADMIN'
    )
  )
);

-- If you need to update existing policies, you can drop them first:
/*
DROP POLICY IF EXISTS "Allow authenticated users to read files in repository-files bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin and faculty to upload files to repository-files bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow owners and admins to update files in repository-files bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow owners and admins to delete files in repository-files bucket" ON storage.objects;
*/