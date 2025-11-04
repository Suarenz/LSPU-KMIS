# Unit Code Optional Migration

## Overview

This document outlines the required database migration to make the unit code field optional in the LSPU KMIS system.

## Changes Required

The Prisma schema has been updated to make the `code` field in the `Unit` model optional:

```prisma
model Unit {
  id          String           @id @default(cuid())
  name        String           @unique
  code        String?          @unique  // Now optional with ? 
  description String?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  documents   Document[]
  permissions UnitPermission[]
  users       User[]           @relation("UserUnit")
}
```

## Required Migration Steps

When you have access to the database, run the following command to apply the schema changes:

```bash
npx prisma migrate dev --name make-unit-code-optional
```

## Alternative Approach

If the migration approach doesn't work, you can manually execute the SQL command:

```sql
ALTER TABLE units ALTER COLUMN code DROP NOT NULL;
```

## API Changes

The API endpoints have been updated to handle optional unit codes:

1. **POST /api/units**: No longer requires the `code` field
2. **PUT /api/units/[id]**: Allows updating units without requiring a code

## Validation Changes

- Unit name remains required
- Unit code is now optional
- If provided, unit code still validates format (max 10 chars, uppercase letters/numbers/underscores/hyphens)

## Frontend Changes

- Unit form no longer requires the code field
- Visual indicators updated to reflect optional status
- Validation logic updated to only check code format when provided

## Testing the Changes

After applying the migration:

1. Test creating a unit without providing a code
2. Test creating a unit with a code
3. Verify existing units still function properly
4. Verify the unit sidebar still displays properly
5. Test document assignment to units with and without codes