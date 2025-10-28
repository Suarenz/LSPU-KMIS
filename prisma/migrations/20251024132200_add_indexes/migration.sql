-- CreateTable for migration lock
-- This migration adds indexes to improve query performance

-- Indexes for Document table
CREATE INDEX IF NOT EXISTS "documents_category_idx" ON "documents" ("category");
CREATE INDEX IF NOT EXISTS "documents_uploadedAt_idx" ON "documents" ("uploadedAt");
CREATE INDEX IF NOT EXISTS "documents_uploadedById_idx" ON "documents" ("uploadedById");
CREATE INDEX IF NOT EXISTS "documents_status_idx" ON "documents" ("status");
CREATE INDEX IF NOT EXISTS "documents_category_status_idx" ON "documents" ("category", "status");
CREATE INDEX IF NOT EXISTS "documents_uploadedById_status_idx" ON "documents" ("uploadedById", "status");
CREATE INDEX IF NOT EXISTS "documents_uploadedAt_status_idx" ON "documents" ("uploadedAt", "status");

-- Indexes for User table
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "users_department_idx" ON "users" ("department");
CREATE INDEX IF NOT EXISTS "users_supabase_auth_id_idx" ON "users" ("supabase_auth_id");
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users" ("role");

-- Indexes for DocumentPermission table
CREATE INDEX IF NOT EXISTS "document_permissions_documentId_idx" ON "document_permissions" ("documentId");
CREATE INDEX IF NOT EXISTS "document_permissions_userId_idx" ON "document_permissions" ("userId");
CREATE INDEX IF NOT EXISTS "document_permissions_userId_permission_idx" ON "document_permissions" ("userId", "permission");