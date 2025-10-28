# Supabase Authentication Migration Guide

This document provides a comprehensive guide to the migration from the custom JWT-based authentication system to Supabase Auth.

## Overview

The LSPU KMIS application has been migrated from a custom JWT-based authentication system to Supabase Auth. This migration provides enhanced security, scalability, and built-in features like password reset, email verification, and social authentication.

## Key Changes

### 1. Authentication Service
- Replaced custom `AuthService` with `SupabaseAuthService`
- Now uses Supabase's built-in authentication methods
- Maintains compatibility with existing user roles and profile data

### 2. Authentication Context
- Updated `AuthContext` to work with Supabase session management
- Maintains the same interface for components using the context
- Automatically refreshes sessions

### 3. Middleware
- Replaced JWT token validation with Supabase session validation
- Updated to use Supabase's SSR utilities for session management
- Improved security with automatic session handling

### 4. API Routes
- Updated to use Supabase session validation instead of custom JWT validation
- Added role-based access control utilities

## Database Changes

### Schema Updates
- Added `supabase_auth_id` field to the `users` table
- This field links Supabase Auth user IDs to application user profiles
- Maintains all existing user data and roles

### Migration Script
A migration script is provided at `scripts/migrate-users-to-supabase.ts` to migrate existing users to Supabase Auth.

## Environment Configuration

The following environment variables need to be configured:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY"

# Database (for Prisma - use connection pooling string for serverless)
DATABASE_URL="postgresql://[DB-USER].[PROJECT-REF]:[PRISMA-PASSWORD]@[DB-REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://[DB-USER].[PROJECT-REF]:[PRISMA-PASSWORD]@[DB-REGION].pooler.supabase.com:5432/postgres"
```

## Supabase Client Utilities

Three utility files were created to handle Supabase client initialization:

1. `lib/supabase/client.ts` - For client-side operations
2. `lib/supabase/server.ts` - For server-side operations
3. `lib/supabase/middleware.ts` - For middleware session management

## Role-Based Access Control

The role-based access control system has been updated to work with Supabase. The `lib/supabase/rbac.ts` file provides utilities for checking user roles in server-side code.

## API Routes Updates

The auth callback route was created at `app/auth/callback/route.ts` to handle Supabase authentication callbacks.

## Migration Steps

1. Install Supabase dependencies: `npm install @supabase/supabase-js @supabase/ssr`
2. Update environment variables with Supabase credentials
3. Run database migration to add `supabase_auth_id` field
4. Execute user migration script to migrate existing users
5. Deploy updated application code
6. Test authentication flows

## Testing the Migration

After completing the migration:

1. Test user registration and login
2. Verify role-based access control
3. Check password reset functionality
4. Ensure all protected routes work correctly
5. Test document upload/download permissions

## Rollback Plan

If issues arise after migration:

1. Revert the application code changes
2. Restore the previous environment variables
3. Rollback the database schema changes if needed
4. Restart the previous authentication system

## Security Considerations

- Supabase provides built-in security features like Row Level Security (RLS)
- Sessions are automatically managed and refreshed
- Passwords are securely hashed by Supabase
- Email verification is handled automatically