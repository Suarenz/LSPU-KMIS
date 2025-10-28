# Supabase Integration Plan for LSPU KMIS

## Overview
This document outlines the plan for connecting your existing LSPU Knowledge Management Information System to Supabase. The system currently uses Prisma ORM with a local PostgreSQL database and has a custom JWT-based authentication system.

## Current System Architecture
- **Frontend**: Next.js 15 application with TypeScript
- **Backend**: API routes using Prisma ORM
- **Database**: PostgreSQL with Prisma schema
- **Authentication**: Custom JWT-based system with role-based access control
- **File Storage**: Local file system (placeholder for cloud storage)
- **UI Components**: Shadcn/ui library with Tailwind CSS

## Migration Strategy

### Phase 1: Database Migration

#### 1.1 Supabase Project Setup
- Create a new Supabase project in the Supabase Dashboard
- Note down the Project URL and API keys (anon and service_role)
- Set up a custom database user for Prisma with appropriate permissions

#### 1.2 Update Prisma Configuration
- Modify the Prisma schema to be compatible with Supabase PostgreSQL
- Update connection strings to use Supabase connection format
- Add configuration for connection pooling if needed for production

#### 1.3 Database Schema Migration
- Use Prisma migrate to push the current schema to Supabase
- Ensure all custom functions, triggers, and RLS policies are properly set up
- Test the schema with existing data patterns

### Phase 2: Environment Configuration

#### 2.1 Update Environment Variables
- Replace current `DATABASE_URL` with Supabase connection string
- Add Supabase project URL and API keys
- Set up connection pooling configuration if needed

#### 2.2 Supabase Client Setup
- Install `@supabase/supabase-js` and `@supabase/ssr` packages
- Create utility functions for server-side and client-side Supabase clients
- Update the middleware to work with Supabase session management

### Phase 3: Authentication Integration

#### 3.1 Supabase Auth Setup
- Configure email/password authentication in Supabase
- Set up custom email templates for confirmation emails
- Create RLS policies to protect user data
- Map existing user roles (admin, faculty, student, external) to Supabase auth

#### 3.2 Migration from Custom JWT to Supabase Auth
- Create a migration path to transition users from custom JWT to Supabase Auth
- Update authentication service to use Supabase Auth methods
- Update middleware to use Supabase session validation
- Maintain role-based access control with Supabase RLS

### Phase 4: File Storage Migration

#### 4.1 Supabase Storage Setup
- Create appropriate buckets for document storage
- Set up RLS policies for document access control
- Configure file size and type restrictions
- Set up CDN for optimized delivery

#### 4.2 Update File Storage Service
- Replace local file storage implementation with Supabase Storage API
- Update file upload/download methods
- Implement proper permission checks for document access
- Maintain file validation logic

### Phase 5: Application Integration

#### 5.1 API Route Updates
- Update document service to use Supabase client for database operations
- Ensure all database queries work with Supabase PostgreSQL
- Update any raw SQL queries to be compatible with Supabase

#### 5.2 Frontend Integration
- Update authentication context to use Supabase Auth
- Update file upload components to use Supabase Storage
- Ensure all UI components work with new authentication system
- Test all user flows with Supabase integration

## Implementation Steps

### Step 1: Setup and Dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Step 2: Environment Variables
Update `.env` with:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- Update `DATABASE_URL` to use Supabase connection string

### Step 3: Supabase Client Utilities
Create `lib/supabase/client.ts` and `lib/supabase/server.ts` with appropriate client configurations.

### Step 4: Update Prisma Schema
Modify `prisma/schema.prisma` to be compatible with Supabase, particularly:
- Ensure all relations and constraints work with Supabase PostgreSQL
- Add any Supabase-specific features if needed

### Step 5: Update Database Connection
Modify `lib/prisma.ts` to work with Supabase connection string.

### Step 6: Authentication Migration
- [COMPLETED] Updated `lib/services/auth-service.ts` to use Supabase Auth
- [COMPLETED] Updated `lib/auth-context.tsx` to use Supabase session management
- [COMPLETED] Updated `middleware.ts` to validate Supabase sessions
- [COMPLETED] Created Supabase client utilities in `lib/supabase/` directory
- [COMPLETED] Created auth callback route at `app/auth/callback/route.ts`
- [COMPLETED] Updated Prisma schema to include `supabase_auth_id` field in users table
- [COMPLETED] Created role-based access control utilities in `lib/supabase/rbac.ts`
- [COMPLETED] Created user migration script at `scripts/migrate-users-to-supabase.ts`
- [COMPLETED] Updated environment variables for Supabase configuration
- [COMPLETED] Created comprehensive documentation and testing guides

## Next Steps for Completion

The authentication migration implementation is mostly complete, but there's an issue with the user migration. Here's what has been accomplished and what needs to be done next:

### ✅ Completed Implementation:
1. **Database Migration**: ✅ Completed - The Prisma migration has been run and your database schema now includes the `supabase_auth_id` field in the users table.

2. **Code Implementation**: ✅ Completed - All necessary code changes have been implemented including:
   - Supabase client utilities
   - Updated authentication service
   - Updated authentication context
   - Middleware for session validation
   - Auth callback route
   - Role-based access control utilities

### ✅ User Migration Issue Resolved:
3. **User Migration**: ✅ Completed - The user migration issue has been resolved. The script to create default users in Supabase Auth has been successfully run, creating all default user accounts (admin, faculty, student, external) in Supabase Auth and linking them to your application database. The role values were corrected to match the database enum (ADMIN, FACULTY, STUDENT, EXTERNAL).

4. **Password Reset**: ✅ Completed - Default user passwords have been reset to their original values using the password reset script.

## Login Credentials After Migration

The following credentials are now available for login:
- Admin: admin@lspu.edu.ph / admin123
- Faculty: faculty@lspu.edu.ph / faculty123
- Student: student@lspu.edu.ph / student123
- External: external@partner.com / external123

IMPORTANT: Change these default passwords immediately after first login for security!

### Step 7: File Storage Migration
- Update `lib/services/file-storage-service.ts` to use Supabase Storage
- Update document upload/download API routes

### Step 8: Testing
- Test all user authentication flows
- Test document upload, download, and permission management
- Verify role-based access control
- Ensure all existing functionality works with Supabase

## Data Migration Strategy

### Option 1: Direct Migration
- Export current database data
- Import into Supabase database
- Update user authentication credentials to work with Supabase Auth

### Option 2: Gradual Migration
- Run both systems in parallel
- Gradually migrate users and data
- Switch over once all data is migrated

## Security Considerations

### Row Level Security (RLS)
- Implement RLS policies for all tables to ensure proper access control
- Document permissions should follow the existing permission model
- User data should be properly isolated

### API Security
- Use `anon` key for public access patterns
- Use `service_role` key only in server-side code for admin operations
- Implement proper input validation and sanitization

## File Storage Implementation

### Supabase Storage Buckets
- Create a `documents` bucket for document storage
- Set up RLS policies to control document access based on user permissions
- Configure appropriate file size and type restrictions

### Migration Path
- Keep existing file validation logic in the application
- Replace local file system operations with Supabase Storage API calls
- Ensure all document URLs are updated to use Supabase Storage URLs

## Testing Checklist

### Database
- [ ] All CRUD operations work correctly
- [ ] Relations between tables are maintained
- [ ] Database performance is acceptable
- [ ] RLS policies work as expected

### Authentication
- [ ] User login/logout works
- [ ] Role-based access control functions properly
- [ ] JWT validation works correctly
- [ ] Session management is handled properly

### File Storage
- [ ] Document upload works
- [ ] Document download works
- [ ] Document permissions are enforced
- [ ] File validation works as expected

### UI/UX
- [ ] All pages load correctly
- [ ] User flows work as expected
- [ ] Error handling is appropriate
- [ ] Performance is acceptable

## Rollback Plan

If issues arise during migration:
- Keep the original database as backup
- Maintain the ability to switch back to the original system
- Document all changes made for easy reversal if needed

## Timeline Estimate

- **Phase 1 (Database)**: 2-3 days
- **Phase 2 (Environment)**: 1 day
- **Phase 3 (Auth)**: 3-4 days
- **Phase 4 (Storage)**: 2 days
- **Phase 5 (Integration)**: 2-3 days
- **Testing**: 2-3 days

**Total Estimated Time**: 12-16 days
## Environment Variables Configuration

### Current Environment Variables (.env)
The application currently uses these environment variables:

```
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/lspu_kmis"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"

# File Upload
MAX_FILE_SIZE=52428800 # 50MB in bytes
ALLOWED_FILE_TYPES=pdf,doc,docx,ppt,pptx,xls,xlsx,txt,jpg,jpeg,png

# Next.js
NEXTAUTH_URL="http://localhost:3000"
```

### Required Supabase Environment Variables
When migrating to Supabase, you'll need to update your `.env.local` file with these variables:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Database (for Prisma - use connection pooling string for serverless)
DATABASE_URL="postgresql://[DB-USER].[PROJECT-REF]:[PRISMA-PASSWORD]@[DB-REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://[DB-USER].[PROJECT-REF]:[PRISMA-PASSWORD]@[DB-REGION].pooler.supabase.com:5432/postgres"

# JWT (will be managed by Supabase, but keep for migration period)
JWT_SECRET="your-super-secret-jwt-key"  # Can be removed after full migration
JWT_EXPIRES_IN="24h"  # Supabase manages this automatically

# File Upload (keep existing values)
MAX_FILE_SIZE=52428800 # 50MB in bytes
ALLOWED_FILE_TYPES=pdf,doc,docx,ppt,pptx,xls,xlsx,txt,jpg,jpeg,png

# Next.js
NEXTAUTH_URL="http://localhost:3000"
## Required Supabase Libraries and Dependencies

### Core Supabase Packages
The following packages need to be installed for Supabase integration:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Package Details

1. **@supabase/supabase-js** (v2.x)
   - The official Supabase client library for JavaScript/TypeScript
   - Provides access to database, authentication, and storage APIs
   - Used for both client-side and server-side operations

2. **@supabase/ssr** (v0.4.x or later)
   - Provides utilities for server-side rendering with Supabase
   - Handles session management in Next.js applications
   - Provides cookie-based authentication for server components

### Additional Dependencies (if needed)
```bash
# For type safety with generated types
npm install @types/node

# If using form handling with Supabase
npm install zod react-hook-form
```

### Update package.json Scripts
Consider adding these scripts to your package.json for database management:

```json
{
  "scripts": {
    // ... existing scripts
## Prisma Schema Updates for Supabase Compatibility

### Current Prisma Schema Analysis
Your current Prisma schema (prisma/schema.prisma) is well-structured for PostgreSQL and should work with Supabase with minimal changes. However, there are several considerations for Supabase compatibility.

### Required Changes to schema.prisma

#### 1. Update the datasource block
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // Required for migrations in serverless environments
}
```

#### 2. Supabase-specific configurations to consider
- Ensure all table names use the `@@map()` directive to maintain current names
- Consider adding `@@schema("public")` if using multiple schemas
- Add comments for documentation if needed

#### 3. Updated schema.prisma for Supabase
```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String
 role        UserRole @default(STUDENT)
  department  String?
  avatar      String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  documents   Document[]
  downloads   DocumentDownload[]
  views       DocumentView[]
  comments    DocumentComment[]
  permissions DocumentPermission[] // Opposite relation for DocumentPermission.user
  
  @@map("users")
}

enum UserRole {
  ADMIN
  FACULTY
  STUDENT
  EXTERNAL
}

model Document {
  id               String             @id @default(cuid())
  title            String
  description      String
  category         String
  tags             String[]
  uploadedBy       String
 uploadedAt       DateTime           @default(now())
  fileUrl          String
  fileName         String
 fileType         String
  fileSize         Int
  version          Int                @default(1)
  versionNotes     String?
  parentDocument   Document?          @relation("DocumentVersions", fields: [parentDocumentId], references: [id])
  parentDocumentId String?
  documents        Document[]         @relation("DocumentVersions")
  downloadsCount   Int                @default(0)
  viewsCount       Int                @default(0)
  status           DocumentStatus     @default(ACTIVE)
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt
  permissions      DocumentPermission[]
  downloads        DocumentDownload[]
  views            DocumentView[]
  comments         DocumentComment[]
  uploadedByUser   User               @relation(fields: [uploadedById], references: [id])
  uploadedById     String             // Foreign key reference to User
  
  @@map("documents")
}

enum DocumentStatus {
  ACTIVE
  ARCHIVED
  PENDING_REVIEW
}

model DocumentPermission {
  id           String   @id @default(cuid())
  documentId   String
  userId       String
  permission   PermissionLevel
  createdAt    DateTime @default(now())
  
  document     Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([documentId, userId])
  @@map("document_permissions")
}

enum PermissionLevel {
  READ
  WRITE
  ADMIN
}

model DocumentDownload {
  id         String   @id @default(cuid())
  documentId String
  userId     String
  downloadedAt DateTime @default(now())
  
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("document_downloads")
}

model DocumentView {
  id       String   @id @default(cuid())
  documentId String
  userId   String
  viewedAt DateTime @default(now())
  
  document Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("document_views")
}

## Data Migration Strategy

### Overview
This section outlines the strategy for migrating your existing data from the local PostgreSQL database to Supabase. The migration should be done carefully to ensure data integrity and minimal downtime.

### Migration Approaches

#### Option 1: Direct Migration (Recommended for development)
This approach is suitable for development environments where some downtime is acceptable.

1. **Export Current Data**
   ```bash
   # Export data from local database
   pg_dump "postgresql://username:password@localhost:5432/lspu_kmis" > backup.sql
   ```

2. **Prepare Supabase Database**
   ```bash
   # Apply Prisma schema to Supabase
   npx prisma migrate deploy --schema prisma/schema.prisma
   ```

3. **Import Data to Supabase**
   - Use the Supabase Dashboard SQL Editor or psql client
   - Import the exported data, being careful about sequence values and IDs

#### Option 2: Gradual Migration with Dual Write (Recommended for production)
This approach allows for zero-downtime migration by writing to both systems during a transition period.

1. **Setup Dual Write System**
   - Modify services to write to both local and Supabase databases
   - Read from Supabase database
   - Allow for data comparison between systems

2. **Data Synchronization**
   - Write a synchronization script to ensure data consistency
   - Run comparison checks to validate data integrity

3. **Cutover Process**
   - Switch off writes to the old system
   - Run final synchronization
   - Validate all data
   - Complete cutover

#### Option 3: Prisma-based Migration
Use Prisma's built-in capabilities for schema and data migration.

1. **Schema Migration**
   ```bash
   # Generate migration files based on your schema
   npx prisma migrate dev --name supabase-migration --schema prisma/schema.prisma
   ```

2. **Data Transfer with Prisma Client**
   ```typescript
   // Example script to transfer data
   import { PrismaClient } from '@prisma/client'
   import { createClient } from '@supabase/supabase-js'
   
   const localPrisma = new PrismaClient()
   const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
   
   async function migrateUsers() {
     const users = await localPrisma.user.findMany()
     
     for (const user of users) {
       // Insert into Supabase
       const { data, error } = await supabase
         .from('users')
         .insert([{
           id: user.id,
           email: user.email,
           name: user.name,
           role: user.role,
           department: user.department,
           avatar: user.avatar,
           created_at: user.createdAt,
           updated_at: user.updatedAt
         }])
     }
   }
   ```

### Recommended Migration Process

#### Phase 1: Preparation
1. **Create a backup of your current database**
   ```bash
   pg_dump "postgresql://username:password@localhost:5432/lspu_kmis" > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Set up Supabase project and database**
   - Create new Supabase project
   - Configure database with appropriate extensions
   - Set up authentication providers
   - Create storage buckets

3. **Update application configuration**
   - Add Supabase environment variables
   - Update Prisma schema for Supabase
   - Install required dependencies

#### Phase 2: Schema Migration
1. **Apply Prisma schema to Supabase**
   ```bash
   npx prisma migrate deploy --schema prisma/schema.prisma
   ```

2. **Verify schema creation**
   - Check that all tables are created correctly
   - Verify relationships and constraints
   - Test basic operations

#### Phase 3: Data Migration
1. **Migrate Users Table First**
   - Users are the foundation of your system
   - Ensure all user records are transferred
   - Handle any password hash incompatibilities

2. **Migrate Supporting Tables**
   - Documents
   - Document permissions
   - Document downloads/views
   - Document comments

3. **Validate Data Integrity**
   - Check row counts match between old and new systems
   - Verify foreign key relationships
   - Test sample queries

#### Phase 4: File Storage Migration
1. **Transfer existing files to Supabase Storage**
   - Upload all existing documents to appropriate buckets
   - Update file URLs in the database to point to Supabase Storage
   - Ensure proper access permissions are set

2. **Update file paths in database**
   - Replace local file paths with Supabase Storage URLs
   - Ensure all document links work correctly

#### Phase 5: Testing
1. **Comprehensive testing of all features**
   - User authentication
   - Document upload/download
   - Permission management
   - Search functionality
   - All user roles and access controls

2. **Performance testing**
   - Check query performance
   - Verify file upload/download speeds
   - Test concurrent user access

### Data Migration Script Example

Create a migration script at `scripts/migrate-to-supabase.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for full access during migration
);

async function migrateUsers() {
  console.log('Starting user migration...');
  
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users to migrate`);
  
  for (const user of users) {
    const { error } = await supabase
      .from('users')
      .insert([{
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
        created_at: user.createdAt,
        updated_at: user.updatedAt
      }]);
    
    if (error) {
      console.error('Error migrating user:', user.id, error);
    } else {
      console.log(`Migrated user: ${user.email}`);
    }
  }
  
  console.log('User migration completed');
}

async function migrateDocuments() {
## Authentication Integration with Supabase Auth

### Current Authentication System Analysis
Your current system uses a custom JWT-based authentication with role-based access control (RBAC) for four user types: admin, faculty, student, and external. The system includes:
- Custom JWT service for token generation and validation
- Auth service for user management
- Auth context for state management
- Middleware for route protection
- Role-based access control throughout the application

### Supabase Auth Migration Strategy

#### 1. Supabase Auth Setup
1. **Enable email authentication** in your Supabase project
2. **Configure email templates** for confirmation, recovery, and invitation emails
3. **Set up Row Level Security (RLS)** policies for user data protection
4. **Create a mapping** between your current roles and Supabase user metadata

#### 2. User Migration Approach
Since Supabase Auth manages users separately from your application database, you'll need to:

1. **Create a migration path** for existing users:
   ```sql
   -- Add Supabase auth user IDs to your existing users table
   ALTER TABLE users ADD COLUMN supabase_auth_id UUID UNIQUE;
   ```

2. **Map existing users to Supabase Auth**:
   ```typescript
   // Example migration script
   async function migrateUserToSupabase(email: string, password: string, userData: any) {
     // Create user in Supabase Auth
     const { data, error } = await supabase.auth.admin.createUser({
       email,
       password,
       email_confirm: true, // Since these are existing users
       user_metadata: {
         name: userData.name,
         role: userData.role,
         department: userData.department
       }
     });
     
     if (error) throw error;
     
     // Update your local users table with the Supabase auth ID
     await prisma.user.update({
       where: { email },
       data: {
         supabase_auth_id: data.user.id,
         // Update other fields as needed
       }
     });
   }
   ```

#### 3. Supabase Auth Configuration

##### A. Create Supabase Client Utilities
Create `lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

Create `lib/supabase/server.ts`:
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
```

##### B. Update Middleware
Replace your current middleware with Supabase-compatible middleware in `middleware.ts`:
```typescript
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

Create `lib/supabase/middleware.ts`:
```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => 
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // This ensures the session is refreshed
  await supabase.auth.getUser();

  return supabaseResponse;
}
```

#### 4. Update Authentication Service
Replace your current `lib/services/auth-service.ts` with Supabase-based authentication:

```typescript
import { createClient } from '@/lib/supabase/client';
import { AuthResponse, User } from '@supabase/supabase-js';

class SupabaseAuthService {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  async signup(email: string, password: string, name: string): Promise<AuthResponse> {
    return await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'STUDENT', // Default role
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  async logout(): Promise<{ error: any }> {
    return await this.supabase.auth.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  async getSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session;
  }

  async updatePassword(newPassword: string) {
    return await this.supabase.auth.updateUser({
      password: newPassword,
    });
  }

  async resetPassword(email: string) {
    return await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
  }

  async refreshToken() {
    // Supabase handles token refresh automatically
    return await this.supabase.auth.refreshSession();
  }
}

export default new SupabaseAuthService();
```

#### 5. Update Auth Context
Update `lib/auth-context.tsx` to work with Supabase:

```tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  userDetails: any; // Extend this with proper type
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, name: string) => Promise<any>;
  logout: () => Promise<void>;
  updateUserDetails: (details: any) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (session?.user) {
        // Fetch additional user details from your database
        await fetchUserDetails(session.user.id);
      }
      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          await fetchUserDetails(session.user.id);
        } else {
          setUserDetails(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserDetails = async (authId: string) => {
    // Fetch user details from your database using the auth ID
    // This assumes you've linked auth IDs to your user records
    try {
      const response = await fetch(`/api/users/${authId}`);
      if (response.ok) {
        const userData = await response.json();
        setUserDetails(userData);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signup = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { name }
      } 
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateUserDetails = async (details: any) => {
    // Update user details in your database
    // Also update user metadata in Supabase Auth if needed
    const { error } = await supabase.auth.updateUser({
      data: details
    });
    
    if (!error) {
      setUserDetails({ ...userDetails, ...details });
    }
  };

  const value = {
    user,
    userDetails,
    loading,
    login,
    signup,
    logout,
    updateUserDetails,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

#### 6. Update API Routes for Auth
Create a new auth callback route at `app/auth/callback/route.ts`:
```typescript
import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/dashboard';

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete('token_hash');
  redirectTo.searchParams.delete('type');
  redirectTo.searchParams.delete('next');

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      return NextResponse.redirect(redirectTo);
    }
  }

  // return the user to an error page with some instructions
  redirectTo.pathname = '/error';
  return NextResponse.redirect(redirectTo);
}
```

#### 7. Update Role-Based Access Control
Since Supabase Auth doesn't directly manage your application roles, you'll need to maintain the role system in your database. Update your middleware and authorization checks to work with Supabase:

```typescript
// In your server-side utilities
import { createClient } from '@/lib/supabase/server';

export async function getUserWithRole() {
  const supabase = await createClient();
  
  const { 
    data: { user },
    error 
  } = await supabase.auth.getUser();
  
  if (error || !user) {
    return { user: null, role: null };
  }

  // Fetch user details from your database to get the role
  const { data: userDetails } = await supabase
    .from('users')
    .select('role')
    .eq('supabase_auth_id', user.id)
    .single();

  return { 
    user, 
    role: userDetails?.role || null 
  };
}
```

#### 8. Update JWT Service
You can remove the custom JWT service since Supabase handles authentication tokens. However, if you need JWTs for other purposes, you can get the Supabase token:

```typescript
// To get the access token when needed
const {
  data: { session }
} = await supabase.auth.getSession();

const accessToken = session?.access_token;
```

#### 9. Update Protected Routes
Update your middleware to use Supabase authentication:

```typescript
// Example of protecting routes based on roles
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // Update session
  let response = NextResponse.next({ request });
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect certain routes
  if (request.nextUrl.pathname.startsWith('/admin') && user) {
    // Check if user has admin role in your database
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('supabase_auth_id', user.id)
      .single();
      
    if (userData?.role !== 'ADMIN') {
      return NextResponse.rewrite(new URL('/unauthorized', request.url));
    }
  }

  return response;
}
```

### Migration Steps

#### Phase 1: Setup Supabase Auth
1. Enable email authentication in Supabase dashboard
2. Configure email templates
3. Create the supabase client utilities
4. Update environment variables

#### Phase 2: Update Authentication Services
1. Replace custom auth service with Supabase-based service
2. Update auth context to use Supabase
3. Update middleware to use Supabase session management

#### Phase 3: User Migration
1. Run the user migration script to create Supabase Auth accounts
2. Link existing user records to Supabase auth IDs
3. Test authentication flow with migrated users

#### Phase 4: Testing
1. Test login/logout functionality
## Summary and Next Steps

### Migration Overview
This plan outlines a comprehensive approach to migrate your LSPU Knowledge Management Information System from a local PostgreSQL setup to Supabase. The migration includes:

1. **Database Migration**: Moving from local PostgreSQL with Prisma to Supabase PostgreSQL
2. **Authentication Migration**: Replacing custom JWT authentication with Supabase Auth
3. **File Storage Migration**: Moving from local file storage to Supabase Storage
4. **Application Integration**: Updating all application components to work with Supabase services

### Key Benefits of Supabase Integration
- **Scalability**: Supabase automatically scales with your application needs
- **Security**: Built-in Row Level Security (RLS) for fine-grained access control
- **Real-time**: Built-in real-time subscriptions for live data updates
- **Authentication**: Robust authentication system with multiple providers
- **Storage**: Managed file storage with CDN capabilities
- **API**: Auto-generated REST and GraphQL APIs
- **Dashboard**: Comprehensive database management interface

### Implementation Order Recommendation
1. **Setup and Configuration** (Days 1-2)
   - Create Supabase project
   - Install dependencies
   - Configure environment variables

2. **Database Migration** (Days 3-5)
   - Update Prisma schema for Supabase compatibility
   - Migrate database schema
   - Migrate existing data

3. **Authentication Migration** (Days 6-9)
   - Implement Supabase Auth
   - Migrate existing users
   - Update all authentication flows

4. **File Storage Migration** (Days 10-11)
   - Set up Supabase Storage
   - Migrate existing files
   - Update file handling logic

5. **Integration and Testing** (Days 12-15)
   - Update all application components
   - Comprehensive testing
   - Performance optimization

### Risk Mitigation
- **Backup Strategy**: Always maintain backups before migration
- **Staged Rollout**: Consider a phased approach to minimize risk
- **Monitoring**: Implement comprehensive logging and monitoring
- **Rollback Plan**: Maintain ability to revert to original system if needed
- **Testing**: Thorough testing at each migration stage

### Post-Migration Considerations
- **Performance Monitoring**: Monitor query performance and optimize as needed
- **Security Auditing**: Regularly review RLS policies and access controls
- **Backup and Recovery**: Set up automated backup procedures
- **Scaling**: Monitor usage and scale resources as needed
- **Maintenance**: Regular updates and security patches

### Success Metrics
- Application continues to function as expected
- All user authentication flows work correctly
- Document upload/download works properly
- Role-based access control functions as before
- Performance is maintained or improved
- Security is enhanced through RLS

This migration plan provides a structured approach to transition your application to Supabase while maintaining functionality and security. The phased approach minimizes risk and allows for thorough testing at each stage.
2. Verify role-based access control still works
3. Ensure all protected routes function correctly
4. Test password reset and account recovery

### Security Considerations
- Use Row Level Security (RLS) policies in Supabase for additional data protection
- Implement proper session management
- Secure API routes using Supabase auth validation
- Consider implementing MFA for admin users
- Regularly audit auth configurations
  console.log('Starting document migration...');
  
  // Get documents with related data
  const documents = await prisma.document.findMany({
    include: {
      uploadedByUser: true
    }
  });
  
  console.log(`Found ${documents.length} documents to migrate`);
  
  for (const doc of documents) {
    const { error } = await supabase
      .from('documents')
      .insert([{
        id: doc.id,
        title: doc.title,
        description: doc.description,
        category: doc.category,
        tags: doc.tags,
        uploaded_by: doc.uploadedBy,
        uploaded_at: doc.uploadedAt,
        file_url: doc.fileUrl,
        file_name: doc.fileName,
        file_type: doc.fileType,
        file_size: doc.fileSize,
        version: doc.version,
        version_notes: doc.versionNotes,
        parent_document_id: doc.parentDocumentId,
        downloads_count: doc.downloadsCount,
        views_count: doc.viewsCount,
        status: doc.status,
        created_at: doc.createdAt,
        updated_at: doc.updatedAt,
        uploaded_by_id: doc.uploadedById
      }]);
    
    if (error) {
      console.error('Error migrating document:', doc.id, error);
    } else {
      console.log(`Migrated document: ${doc.title}`);
    }
  }
  
  console.log('Document migration completed');
}

async function migrateAll() {
  try {
    await migrateUsers();
    await migrateDocuments();
    
    // Add other tables as needed
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
if (require.main === module) {
  migrateAll();
}
```

### Rollback Plan
In case of issues during migration:

1. **Maintain backup of original database**
2. **Document all changes made**
3. **Have scripts ready to revert changes if needed**
4. **Test rollback procedures before starting migration**

### Post-Migration Tasks
1. **Update any hardcoded references to local file paths**
2. **Verify all functionality works with Supabase**
3. **Update documentation with new architecture details**
4. **Set up monitoring for the new Supabase-based system**
5. **Clean up temporary migration scripts and configurations**
model DocumentComment {
  id              String            @id @default(cuid())
  documentId      String
  userId          String
  parentCommentId String?
  content         String
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  document        Document          @relation(fields: [documentId], references: [id], onDelete: Cascade)
  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  parentComment   DocumentComment?  @relation("CommentReplies", fields: [parentCommentId], references: [id])
  replies         DocumentComment[] @relation("CommentReplies")
  
  @@map("document_comments")
}
```

### Supabase-Specific Considerations

#### 1. Row Level Security (RLS)
For enhanced security with Supabase, consider implementing RLS policies in your database:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for documents table
CREATE POLICY "Users can view documents they have permissions for" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM document_permissions 
      WHERE document_permissions.documentId = documents.id 
      AND document_permissions.userId = auth.uid()
      AND document_permissions.permission = ANY(ARRAY['READ', 'WRITE', 'ADMIN'])
    )
    OR auth.uid() = (SELECT uploadedById FROM documents d WHERE d.id = documents.id)
  );

CREATE POLICY "Users can upload documents" ON documents
 FOR INSERT WITH CHECK (auth.uid() = (SELECT id FROM users WHERE users.id = auth.uid()));

CREATE POLICY "Users can update documents they own or have admin permission" ON documents
 FOR UPDATE USING (
    auth.uid() = (SELECT uploadedById FROM documents d WHERE d.id = documents.id)
    OR EXISTS (
      SELECT 1 FROM document_permissions 
      WHERE document_permissions.documentId = documents.id 
      AND document_permissions.userId = auth.uid()
      AND document_permissions.permission = 'ADMIN'
    )
  );

CREATE POLICY "Users can delete documents they own or have admin permission" ON documents
  FOR DELETE USING (
    auth.uid() = (SELECT uploadedById FROM documents d WHERE d.id = documents.id)
    OR EXISTS (
      SELECT 1 FROM document_permissions 
      WHERE document_permissions.documentId = documents.id 
      AND document_permissions.userId = auth.uid()
      AND document_permissions.permission = 'ADMIN'
    )
  );
```

#### 2. Database Functions and Triggers
If you have any custom PostgreSQL functions or triggers, ensure they're compatible with Supabase. Supabase supports most PostgreSQL features.

#### 3. Migration Strategy
1. First, test the updated schema locally:
   ```bash
   npx prisma db pull  # Get current database structure
   npx prisma migrate dev --name supabase-compatibility # Create migration
   ```

2. Then push to Supabase:
   ```bash
   npx prisma migrate deploy --schema prisma/schema.prisma
   ```

### Prisma Client Usage with Supabase
When using Prisma with Supabase, remember:
- Prisma handles database operations
- Supabase Auth handles authentication
- Supabase Storage handles file storage
- You can combine both in your application logic
    "db:pull": "npx supabase db pull",
    "db:generate": "npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > types/supabase.ts"
  }
}
```

### Supabase CLI (Optional but Recommended)
For advanced database operations and local development:

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to your Supabase account
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF
```
```

### Environment Variables Setup Process
1. Create a new `.env.local` file for your local development
2. Replace placeholder values with your actual Supabase project credentials
3. For production, set these as environment variables in your deployment platform
4. The `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` will be used by the Supabase client
5. The `DATABASE_URL` and `DIRECT_URL` will be used by Prisma for database operations