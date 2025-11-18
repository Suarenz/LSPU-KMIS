# Database Schema Enhancement for Unit-Based Repository System

## Overview

This document outlines the necessary database schema modifications to support unit-specific repositories in the LSPU-SCC Knowledge Management Information System. The enhancements will provide dedicated sections for each academic unit while maintaining proper categorization, access controls, and version management.

## Current Schema Analysis

### Existing Document Model
```prisma
model Document {
  id               String               @id @default(cuid())
  title            String
  description      String
  category         String
  tags             String[]
  uploadedBy       String
 uploadedAt       DateTime             @default(now())
  fileUrl          String
  fileName         String
 fileType         String
 fileSize         Int
  version          Int                  @default(1)
  versionNotes     String?
  parentDocumentId String?
  downloadsCount   Int                  @default(0)
  viewsCount       Int                  @default(0)
  createdAt        DateTime             @default(now())
  updatedAt        DateTime             @updatedAt
  uploadedById     String
  status           DocumentStatus       @default(ACTIVE)
  comments         DocumentComment[]
  downloads        DocumentDownload[]
  permissions      DocumentPermission[]
  views            DocumentView[]
  parentDocument   Document?            @relation("DocumentVersions", fields: [parentDocumentId], references: [id])
  documents        Document[]           @relation("DocumentVersions")
  uploadedByUser   User                 @relation(fields: [uploadedById], references: [id])
}
```

### Existing User Model
```prisma
model User {
  id               String               @id @default(cuid())
  email            String               @unique
  name             String
  department       String?
  avatar           String?
  createdAt        DateTime             @default(now())
  updatedAt        DateTime             @updatedAt
  role             UserRole             @default(STUDENT)
  comments         DocumentComment[]
  downloads        DocumentDownload[]
  permissions      DocumentPermission[]
  views            DocumentView[]
  documents        Document[]
}
```

## Enhanced Schema Design

### 1. Department Model

```prisma
model Unit {
  id          String     @id @default(cuid())
  name        String     @unique // Full unit name: "College of Arts and Sciences"
  code        String     @unique // Unit code: "CAS", "CBAA", "CCS", etc.
  description String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  // Relationships
  users       User[]
  documents   Document[]
  
  @@map("departments")
}
```

### 2. Updated Document Model

```prisma
model Document {
  id               String               @id @default(cuid())
  title            String
  description      String
  category         String
  tags             String[]
  uploadedBy       String
  uploadedAt       DateTime             @default(now())
  fileUrl          String
  fileName         String
  fileType         String
  fileSize         Int
 version          Int                  @default(1)
  versionNotes     String?
  parentDocumentId String?
  downloadsCount   Int                  @default(0)
  viewsCount       Int                  @default(0)
  createdAt        DateTime             @default(now())
  updatedAt        DateTime             @updatedAt
  uploadedById     String
  departmentId     String?              // Reference to the unit this document belongs to
  status           DocumentStatus       @default(ACTIVE)
  
  // Relationships
  comments         DocumentComment[]
  downloads        DocumentDownload[]
  permissions      DocumentPermission[]
  views            DocumentView[]
  parentDocument   Document?            @relation("DocumentVersions", fields: [parentDocumentId], references: [id])
  documents        Document[]           @relation("DocumentVersions")
  uploadedByUser   User                 @relation(fields: [uploadedById], references: [id])
   department       Department?          @relation(fields: [departmentId], references: [id], onDelete: SetNull) // If unit is deleted, set to null rather than deleting document
  
  @@map("documents")
}
```

### 3. Updated User Model

```prisma
model User {
  id               String               @id @default(cuid())
  email            String               @unique
  name             String
  departmentId     String?              // Reference to the user's primary unit
  avatar           String?
  createdAt        DateTime             @default(now())
  updatedAt        DateTime             @updatedAt
  role             UserRole             @default(STUDENT)
  
  // Relationships
  comments         DocumentComment[]
  downloads        DocumentDownload[]
  permissions      DocumentPermission[]
  views            DocumentView[]
  documents        Document[]
   department       Department?          @relation(fields: [departmentId], references: [id], onDelete: SetNull) // If unit is deleted, set to null rather than deleting user
   departmentPermissions DepartmentPermission[] // Permissions for accessing units
  
  @@map("users")
}
```

### 4. Unit Permission Model

```prisma
model UnitPermission {
  id           String              @id @default(cuid())
  departmentId String
  userId       String
 permission   PermissionLevel     // READ, WRITE, ADMIN
  createdAt    DateTime            @default(now())
  updatedAt    DateTime            @updatedAt
  
  // Relationships
  department   Department          @relation(fields: [departmentId], references: [id], onDelete: Cascade)
  user         User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([departmentId, userId])
  @@map("department_permissions")
}

enum PermissionLevel {
  READ
  WRITE
  ADMIN
}
```

## Unit Definitions

The following units will be created with their respective codes:

| Unit Name | Unit Code |
|-----------------|-----------------|
| College of Arts and Sciences | CAS |
| College of Business, Administration and Accountancy | CBAA |
| College of Computer Studies | CCS |
| College of Criminal Justice Education | CCJE |
| College of Engineering | COE |
| College of Industrial Technology | CIT |
| College of International Hospitality and Tourism Management | CIHTM |
| College of Law | COL |
| College of Nursing and Allied Health | CONAH |

## Migration Strategy

### Step 1: Create New Models
1. Create the `Unit` model
2. Create the `UnitPermission` model
3. Update the `Document` model to include `departmentId`
4. Update the `User` model to include `departmentId`

### Step 2: Populate Units
Run a seed script to populate the units table with the 9 academic units.

### Step 3: Update Existing Records
1. Migrate existing department data from the `User.department` string field to the new `Unit` model
2. Assign existing documents to appropriate units based on uploader's department
3. Create default unit permissions for existing users

### Step 4: Create Indexes
Add appropriate indexes for performance:

```sql
-- Indexes for performance
CREATE INDEX idx_documents_department_id ON documents(department_id);
CREATE INDEX idx_documents_department_status ON documents(department_id, status);
CREATE INDEX idx_users_department_id ON users(department_id);
CREATE INDEX idx_department_permissions_user_id ON department_permissions(user_id);
CREATE INDEX idx_department_permissions_department_id ON department_permissions(department_id);
```

## Access Control Implementation

### Row Level Security (RLS) Policies for Supabase

#### Documents Table RLS Policies
```sql
-- Policy for SELECT: Users can view documents from their unit or documents they have explicit permissions for
CREATE POLICY "Allow users to view documents from their unit" ON documents
FOR SELECT TO authenticated
USING (
  department_id IN (
    SELECT dp.department_id
    FROM department_permissions dp
    WHERE dp.user_id = auth.uid()
    AND dp.permission IN ('READ', 'WRITE', 'ADMIN')
  )
  OR
  department_id IS NULL  -- Allow access to documents without units for now
);

-- Policy for INSERT: Only unit admins and faculty can upload to their unit
CREATE POLICY "Allow unit admins and faculty to upload documents" ON documents
FOR INSERT TO authenticated
WITH CHECK (
  -- User has admin permission for the unit
  (EXISTS (
    SELECT 1 FROM department_permissions dp
    WHERE dp.department_id = NEW.department_id
    AND dp.user_id = auth.uid()
    AND dp.permission = 'ADMIN'
  ))
  OR
  -- User has write permission for the unit
  (EXISTS (
    SELECT 1 FROM department_permissions dp
    WHERE dp.department_id = NEW.department_id
    AND dp.user_id = auth.uid()
    AND dp.permission = 'WRITE'
  ))
  OR
  -- User is faculty and belongs to the unit
  (EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'FACULTY'
    AND u.department_id = NEW.department_id
  ))
);

-- Policy for UPDATE: Only document owner, unit admins, or users with write permissions can update
CREATE POLICY "Allow document updates by owner or unit admins" ON documents
FOR UPDATE TO authenticated
USING (
  uploadedById = auth.uid()  -- Document owner
  OR
  department_id IN (
    SELECT dp.department_id
    FROM department_permissions dp
    WHERE dp.user_id = auth.uid()
    AND dp.permission = 'ADMIN'
  )
  OR
  department_id IN (
    SELECT dp.department_id
    FROM department_permissions dp
    WHERE dp.user_id = auth.uid()
    AND dp.permission = 'WRITE'
  )
);

-- Policy for DELETE: Only document owner, unit admins, or system admins can delete
CREATE POLICY "Allow document deletion by owner or unit admins" ON documents
FOR DELETE TO authenticated
USING (
  uploadedById = auth.uid() -- Document owner
  OR
  department_id IN (
    SELECT dp.department_id
    FROM department_permissions dp
    WHERE dp.user_id = auth.uid()
    AND dp.permission = 'ADMIN'
  )
  OR
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'ADMIN'
  )
);
```

#### Unit Permissions RLS Policies
```sql
-- Policy for SELECT: Users can view permissions for units they admin
CREATE POLICY "Allow unit admins to view permissions" ON department_permissions
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM department_permissions dp2
    WHERE dp2.department_id = department_permissions.department_id
    AND dp2.user_id = auth.uid()
    AND dp2.permission = 'ADMIN'
  )
  OR
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'ADMIN'
  )
);

-- Policy for INSERT: Only unit admins or system admins can grant permissions
CREATE POLICY "Allow unit admins to grant permissions" ON department_permissions
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM department_permissions dp2
    WHERE dp2.department_id = NEW.department_id
    AND dp2.user_id = auth.uid()
    AND dp2.permission = 'ADMIN'
  )
  OR
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'ADMIN'
  )
);

-- Policy for UPDATE: Only unit admins or system admins can update permissions
CREATE POLICY "Allow unit admins to update permissions" ON department_permissions
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM department_permissions dp2
    WHERE dp2.department_id = department_permissions.department_id
    AND dp2.user_id = auth.uid()
    AND dp2.permission = 'ADMIN'
  )
  OR
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'ADMIN'
  )
);

-- Policy for DELETE: Only unit admins or system admins can revoke permissions
CREATE POLICY "Allow unit admins to revoke permissions" ON department_permissions
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM department_permissions dp2
    WHERE dp2.department_id = department_permissions.department_id
    AND dp2.user_id = auth.uid()
    AND dp2.permission = 'ADMIN'
  )
  OR
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'ADMIN'
  )
);
```

## Prisma Migration Script

```prisma
// prisma/migrations/xxxxxx_add_departmental_structure/migration.sql

-- Create Department table
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- Add departmentId to users table
ALTER TABLE "users" ADD COLUMN "departmentId" TEXT;

-- Add departmentId to documents table
ALTER TABLE "documents" ADD COLUMN "departmentId" TEXT;

-- Create DepartmentPermission table
CREATE TABLE "department_permissions" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_permissions_pkey" PRIMARY KEY ("id")
);

-- Create unique index for department permissions
CREATE UNIQUE INDEX "department_permissions_departmentId_userId_key" ON "department_permissions"("departmentId", "userId");

-- Add foreign key constraints
ALTER TABLE "users" ADD CONSTRAINT "users_departmentId_fkey" 
    FOREIGN KEY ("departmentId") REFERENCES "departments"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "documents" ADD CONSTRAINT "documents_departmentId_fkey" 
    FOREIGN KEY ("departmentId") REFERENCES "departments"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "department_permissions" ADD CONSTRAINT "department_permissions_departmentId_fkey" 
    FOREIGN KEY ("departmentId") REFERENCES "departments"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "department_permissions" ADD CONSTRAINT "department_permissions_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes for performance
CREATE INDEX "documents_departmentId_idx" ON "documents"("departmentId");
CREATE INDEX "documents_departmentId_status_idx" ON "documents"("departmentId", "status");
CREATE INDEX "users_departmentId_idx" ON "users"("departmentId");
CREATE INDEX "department_permissions_userId_idx" ON "department_permissions"("userId");
CREATE INDEX "department_permissions_departmentId_idx" ON "department_permissions"("departmentId");
```

## Unit Seeding Script

```typescript
// scripts/seed-units.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const units = [
  { name: 'College of Arts and Sciences', code: 'CAS', description: 'College of Arts and Sciences' },
  { name: 'College of Business, Administration and Accountancy', code: 'CBAA', description: 'College of Business, Administration and Accountancy' },
  { name: 'College of Computer Studies', code: 'CCS', description: 'College of Computer Studies' },
  { name: 'College of Criminal Justice Education', code: 'CCJE', description: 'College of Criminal Justice Education' },
  { name: 'College of Engineering', code: 'COE', description: 'College of Engineering' },
  { name: 'College of Industrial Technology', code: 'CIT', description: 'College of Industrial Technology' },
  { name: 'College of International Hospitality and Tourism Management', code: 'CIHTM', description: 'College of International Hospitality and Tourism Management' },
  { name: 'College of Law', code: 'COL', description: 'College of Law' },
  { name: 'College of Nursing and Allied Health', code: 'CONAH', description: 'College of Nursing and Allied Health' },
];

async function seedUnits() {
  console.log('Seeding units...');
  
  for (const unit of units) {
    const existingUnit = await prisma.unit.findUnique({
      where: { code: unit.code },
    });
    
    if (!existingUnit) {
      await prisma.unit.create({
        data: unit,
      });
      console.log(`Created unit: ${unit.name}`);
    } else {
      console.log(`Unit already exists: ${unit.name}`);
    }
  }
  
  console.log('Unit seeding completed.');
}

seedUnits()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

## Data Migration Script

```typescript
// scripts/migrate-user-units.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateUserUnits() {
  console.log('Migrating user units...');
  
  // Get all units to map unit names to IDs
  const units = await prisma.unit.findMany();
  const unitMap = new Map(
    units.map(unit => [unit.name.toLowerCase(), unit.id])
  );
  
  // Process users with unit names
  const users = await prisma.user.findMany({
    where: {
      department: { not: null },
    },
  });
  
  for (const user of users) {
    if (user.department) {
      // Try to find matching unit by name
      let unitId = unitMap.get(user.department.toLowerCase());
      
      // If not found by name, try to match by code
      if (!unitId) {
        const unitByCode = await prisma.unit.findUnique({
          where: { code: user.department.toUpperCase() },
        });
        if (unitByCode) {
          unitId = unitByCode.id;
        }
      }
      
      if (unitId) {
        await prisma.user.update({
          where: { id: user.id },
          data: { departmentId: unitId },
        });
        console.log(`Assigned user ${user.name} to unit ${user.department}`);
      } else {
        console.log(`Could not find unit for user ${user.name}: ${user.department}`);
      }
    }
  }
  
  console.log('User unit migration completed.');
}

async function migrateDocumentUnits() {
  console.log('Migrating document units...');
  
  // Get all users with unit assignments
  const usersWithUnits = await prisma.user.findMany({
    where: { departmentId: { not: null } },
    select: { id: true, departmentId: true },
  });
  
  const userUnitMap = new Map(
    usersWithUnits.map(user => [user.id, user.departmentId])
  );
  
  // Assign documents to units based on uploader's unit
  for (const [userId, unitId] of userUnitMap) {
    await prisma.document.updateMany({
      where: { uploadedById: userId },
      data: { departmentId: unitId },
    });
    console.log(`Assigned documents for user ${userId} to unit ${unitId}`);
  }
  
  console.log('Document unit migration completed.');
}

async function runMigrations() {
  try {
    await migrateUserUnits();
    await migrateDocumentUnits();
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runMigrations();
```

This enhanced schema will provide the foundation for a unit-specific repository system with proper categorization, access controls, and version management for each of the ten academic units at LSPU-SCC.