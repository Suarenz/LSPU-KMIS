# Applying RLS Policies to Supabase Storage

This document provides instructions for applying the correct Row Level Security (RLS) policies to the Supabase storage bucket to fix document upload issues.

## Background

The issue was that admin and faculty users couldn't upload documents due to incorrect RLS policies in the Supabase storage bucket. The policies were checking for lowercase role values ('admin', 'faculty') instead of the correct uppercase values ('ADMIN', 'FACULTY') that match the database enum.

## Required RLS Policies

Run the following SQL commands in your Supabase SQL Editor to apply the correct RLS policies:

### 1. Drop Existing Policies (if they exist)

```sql
DROP POLICY IF EXISTS "Allow authenticated users to read files in repository-files bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin and faculty to upload files to repository-files bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow owners and admins to update files in repository-files bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow owners and admins to delete files in repository-files bucket" ON storage.objects;
```

### 2. Create New Policies with Correct Role Values

```sql
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
```

## How to Apply

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the SQL commands above
4. Execute the commands

## Verification

After applying the policies:

1. Log in as an admin or faculty user
2. Navigate to the repository page
3. Attempt to upload a document
4. The upload should now succeed without "row-level security policy" errors

## Additional Notes

- The policies use uppercase role values ('ADMIN', 'FACULTY') to match the database enum
- These policies ensure that only authenticated users with the correct roles can upload files
- The admin user (admin@lspu.edu.ph) has been verified to exist with the correct role in both Supabase Auth and the application database

## Database Table RLS Policies

In addition to the storage policies, you may also need to enable RLS on your database tables if they're not already enabled. If you're experiencing access errors when fetching documents, you may need to run these additional commands:

### Enable RLS on all tables:
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own profile" ON users
 FOR SELECT USING (
    id::text = (SELECT auth.uid())::text OR
    supabase_auth_id::text = (SELECT auth.uid())::text OR
    EXISTS (
      SELECT 1 FROM users WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text AND users.role = 'ADMIN'
    )
 );

-- Create policies for documents table
CREATE POLICY "Users can view documents they have permissions for" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM document_permissions
      WHERE document_permissions."documentId" = documents.id
      AND document_permissions."userId"::text = (SELECT auth.uid())::text
      AND document_permissions.permission = ANY(ARRAY['READ', 'WRITE', 'ADMIN']::"PermissionLevel"[])
    )
    OR (SELECT "uploadedById" FROM documents d WHERE d.id = documents.id)::text = (SELECT auth.uid())::text
    OR EXISTS (
      SELECT 1 FROM users WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text AND users.role = 'ADMIN'
    )
  );

CREATE POLICY "Users can upload documents" ON documents
 FOR INSERT WITH CHECK (
   EXISTS (
     SELECT 1 FROM users
     WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text
     AND users.role IN ('ADMIN', 'FACULTY')
   )
 );

CREATE POLICY "Users can update documents they own or have admin permission" ON documents
 FOR UPDATE USING (
    (SELECT "uploadedById" FROM documents d WHERE d.id = documents.id)::text = (SELECT auth.uid())::text
    OR EXISTS (
      SELECT 1 FROM document_permissions
      WHERE document_permissions."documentId" = documents.id
      AND document_permissions."userId"::text = (SELECT auth.uid())::text
      AND document_permissions.permission = 'ADMIN'::"PermissionLevel"
    )
    OR EXISTS (
      SELECT 1 FROM users WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text AND users.role = 'ADMIN'
    )
  );

CREATE POLICY "Users can delete documents they own or have admin permission" ON documents
 FOR DELETE USING (
    (SELECT "uploadedById" FROM documents d WHERE d.id = documents.id)::text = (SELECT auth.uid())::text
    OR EXISTS (
      SELECT 1 FROM users WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text AND users.role = 'ADMIN'
    )
  );

-- Create policies for document_permissions table
CREATE POLICY "Users can view permissions for documents they have access to" ON document_permissions
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
    OR EXISTS (
      SELECT 1 FROM users WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text AND users.role = 'ADMIN'
    )
  );

-- Create policies for document_downloads table
CREATE POLICY "Users can view their own downloads and admin can view all" ON document_downloads
  FOR SELECT USING (
    "userId"::text = (SELECT auth.uid())::text
    OR EXISTS (
      SELECT 1 FROM users WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text AND users.role = 'ADMIN'
    )
  );

CREATE POLICY "Users can insert their own downloads" ON document_downloads
  FOR INSERT WITH CHECK (
    "userId"::text = (SELECT auth.uid())::text
  );

-- Create policies for document_views table
CREATE POLICY "Users can view their own views and admin can view all" ON document_views
 FOR SELECT USING (
   "userId"::text = (SELECT auth.uid())::text
    OR EXISTS (
      SELECT 1 FROM users WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text AND users.role = 'ADMIN'
    )
  );

CREATE POLICY "Users can insert their own views" ON document_views
  FOR INSERT WITH CHECK (
    "userId"::text = (SELECT auth.uid())::text
  );

-- Create policies for document_comments table
CREATE POLICY "Users can view comments on documents they have access to" ON document_comments
 FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM document_permissions
      WHERE document_permissions."documentId" = document_comments."documentId"
      AND document_permissions."userId"::text = (SELECT auth.uid())::text
      AND document_permissions.permission = ANY(ARRAY['READ', 'WRITE', 'ADMIN']::"PermissionLevel"[])
    )
    OR (SELECT "uploadedById" FROM documents d JOIN document_comments dc ON d.id = dc."documentId" WHERE dc.id = document_comments.id)::text = (SELECT auth.uid())::text
    OR document_comments."userId"::text = (SELECT auth.uid())::text
    OR EXISTS (
      SELECT 1 FROM users WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text AND users.role = 'ADMIN'
    )
  );

CREATE POLICY "Users can insert comments on documents they have access to" ON document_comments
 FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN document_permissions dp ON dp."documentId" = d.id
      WHERE d.id = document_comments."documentId"
      AND dp."userId"::text = (SELECT auth.uid())::text
      AND dp.permission = ANY(ARRAY['READ', 'WRITE', 'ADMIN']::"PermissionLevel"[])
    )
    OR (SELECT "uploadedById" FROM documents d WHERE d.id = document_comments."documentId")::text = (SELECT auth.uid())::text
    OR EXISTS (
      SELECT 1 FROM users WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text AND users.role = 'ADMIN'
    )
  );

CREATE POLICY "Users can update their own comments" ON document_comments
 FOR UPDATE USING (
    "userId"::text = (SELECT auth.uid())::text
  );

CREATE POLICY "Users can delete their own comments or admin can delete any" ON document_comments
  FOR DELETE USING (
    "userId"::text = (SELECT auth.uid())::text
    OR EXISTS (
      SELECT 1 FROM users WHERE users.supabase_auth_id::text = (SELECT auth.uid())::text AND users.role = 'ADMIN'
    )
  );

-- Add other necessary policies for related tables...