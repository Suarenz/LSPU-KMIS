# Supabase Storage Setup for Repository Files

This document provides instructions for setting up Supabase Storage for the LSPU Knowledge Management Information System repository files.

## Prerequisites

1. A Supabase project
2. The "repository-files" bucket already created in Supabase Storage
3. Service role key for admin operations

## Setting up RLS Policies

The repository-files bucket requires Row Level Security (RLS) policies to control access to files. Without these policies, users will encounter "row-level security policy" errors when trying to upload or access files.

### Method 1: Using Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the following SQL commands:

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
    WHERE users.supabase_auth_id = auth.uid()
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
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.supabase_auth_id = auth.uid()
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
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.supabase_auth_id = auth.uid()
      AND users.role = 'ADMIN'
    )
  )
);
```

### Method 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Storage > Buckets
3. Select the "repository-files" bucket
4. Go to the "Policies" tab
5. Create the policies as described in the SQL commands above

## Policy Descriptions

1. **Read Policy**: Allows any authenticated user to read/download files from the repository-files bucket
2. **Upload Policy**: Only allows admin and faculty users to upload files to the bucket
3. **Update Policy**: Only allows file owners or admin users to update files
4. **Delete Policy**: Only allows file owners or admin users to delete files

## Testing the Setup

After setting up the policies, you can test the setup by:

1. Logging in as an admin or faculty user
2. Navigating to the repository page
3. Attempting to upload a file
4. Verifying that the upload succeeds without errors

## Troubleshooting

If you still encounter issues:

1. Verify that the bucket name is exactly "repository-files"
2. Check that the RLS policies are correctly applied
3. Ensure that users have the correct roles in the users table
4. Verify that the Supabase environment variables are correctly configured

## Additional Security Considerations

1. Regularly review and audit the RLS policies
2. Monitor file access logs for suspicious activity
3. Ensure that file type restrictions are properly enforced
4. Consider implementing additional security measures such as file scanning for malware