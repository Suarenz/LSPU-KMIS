# RBAC System Preservation During Azure Database Migration

## Overview

The LSPU KMIS system implements a comprehensive Role-Based Access Control (RBAC) system that must be preserved during the migration to Azure Database. This document details how the RBAC system will be maintained without disruption during the migration process.

## Current RBAC Implementation

### Database Schema Components

The RBAC system consists of the following database elements:

#### 1. User Roles (Enum: UserRole)
- **ADMIN**: Full system access and management capabilities
- **FACULTY**: Academic staff with extended document management rights
- **STUDENT**: Regular users with basic access rights
- **EXTERNAL**: External users with limited access rights

#### 2. Permission Levels (Enum: PermissionLevel)
- **READ**: View-only access to documents/units
- **WRITE**: Read and modify access to documents/units
- **ADMIN**: Full administrative access to documents/units

#### 3. Core RBAC Tables

**users table**:
- Stores user role assignments in the `role` column
- Links users to units via `unitId` foreign key
- Maintains user-specific permissions and access rights

**document_permissions table**:
- Manages granular document access permissions
- Links users to specific documents with permission levels
- Uses composite unique constraint on (documentId, userId)

**unit_permissions table**:
- Manages unit-level access permissions
- Links users to specific academic units with permission levels
- Uses composite unique constraint on (unitId, userId)

### Application Logic Components

#### 1. Middleware Protection
- `lib/middleware/auth-middleware.ts` implements access control checks
- Verifies user authentication and authorization for protected routes
- Enforces role-based access restrictions

#### 2. Service Layer Permissions
- `lib/services/unit-permission-service.ts` handles unit permission logic
- Manages document access control checks
- Validates user permissions before allowing operations

#### 3. API Route Protection
- Individual API routes implement permission checks
- Document access is validated against user permissions
- Unit-based restrictions are enforced

## Migration Strategy for RBAC Preservation

### Phase 1: Schema Migration

#### 1.1 Enum Types Preservation
The following enum types will be preserved exactly as they exist:

```sql
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'FACULTY', 'STUDENT', 'EXTERNAL');
CREATE TYPE "PermissionLevel" AS ENUM ('READ', 'WRITE', 'ADMIN');
CREATE TYPE "DocumentStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'PENDING_REVIEW');
```

#### 1.2 Table Structure Preservation
All RBAC-related tables will maintain identical structure:
- Primary keys, foreign keys, and constraints remain unchanged
- Unique indexes are preserved to maintain data integrity
- All relationships between tables are maintained

#### 1.3 Foreign Key Constraints
All foreign key relationships will be preserved:
- `document_permissions.documentId` → `documents.id`
- `document_permissions.userId` → `users.id`
- `unit_permissions.unitId` → `units.id`
- `unit_permissions.userId` → `users.id`
- `documents.uploadedById` → `users.id`
- `documents.unitId` → `units.id`
- `users.unitId` → `units.id`

### Phase 2: Data Migration

#### 2.1 User Role Preservation
- All existing user roles in the `users.role` column will be migrated without change
- User role assignments remain exactly as they were in the source database
- No role conversions or modifications during migration

#### 2.2 Permission Data Preservation
- All document permissions in `document_permissions` table remain unchanged
- All unit permissions in `unit_permissions` table remain unchanged
- Permission inheritance and cascading rules are preserved

#### 2.3 Unit Associations
- User-unit associations via `users.unitId` foreign key are preserved
- Document-unit associations via `documents.unitId` foreign key are preserved
- All unit-specific access controls remain intact

### Phase 3: Application Logic Preservation

#### 3.1 Middleware Continuity
- Authentication middleware continues to function without changes
- Authorization checks remain identical to pre-migration behavior
- Role verification logic is unchanged

#### 3.2 Service Layer Preservation
- All permission checking logic remains the same
- Unit permission service continues to function identically
- Document access control logic is preserved

#### 3.3 API Route Protection
- All existing permission checks on API routes remain unchanged
- Document access validation continues to work as before
- Unit-based access restrictions are maintained

## Verification Steps for RBAC Preservation

### Pre-Migration Verification
1. **Schema Validation**
   - Verify all RBAC-related tables exist with correct structure
   - Confirm enum types are properly defined
   - Validate foreign key constraints are in place

2. **Data Validation**
   - Count records in RBAC tables before migration
   - Verify role assignments are correct
   - Confirm permission relationships are intact

### Post-Migration Verification
1. **Schema Verification**
   ```sql
   -- Verify enum types exist
   SELECT enumlabel FROM pg_enum WHERE enumtypid = 'UserRole'::regtype;
   
   -- Verify table structures
   \d users;
   \d document_permissions;
   \d unit_permissions;
   ```

2. **Data Integrity Checks**
   ```sql
   -- Verify user role counts match pre-migration
   SELECT role, COUNT(*) FROM users GROUP BY role;
   
   -- Verify permission counts match pre-migration
   SELECT COUNT(*) FROM document_permissions;
   SELECT COUNT(*) FROM unit_permissions;
   ```

3. **Functional Testing**
   - Test user authentication with all role types
   - Verify document access permissions work correctly
   - Confirm unit-based access controls function properly
   - Test permission inheritance and cascading

## Risk Mitigation for RBAC Preservation

### Data Integrity Risks
- **Risk**: Foreign key constraint violations during migration
- **Mitigation**: Validate referential integrity before and after migration
- **Verification**: Run integrity checks post-migration

### Access Control Risks
- **Risk**: Loss of granular permissions during migration
- **Mitigation**: Maintain exact table structure and data
- **Verification**: Test all permission levels with sample users

### Application Logic Risks
- **Risk**: Permission checking logic fails with new database
- **Mitigation**: Keep application code unchanged during migration
- **Verification**: Comprehensive functional testing of all access controls

## Testing Checklist for RBAC Preservation

### User Role Testing
- [ ] ADMIN users can access all system functions
- [ ] FACULTY users have appropriate document management rights
- [ ] STUDENT users have basic access rights only
- [ ] EXTERNAL users have limited access as configured

### Document Permission Testing
- [ ] READ permissions allow viewing but not modifying documents
- [ ] WRITE permissions allow viewing and modifying documents
- [ ] ADMIN permissions allow full document management
- [ ] Users without permissions cannot access restricted documents

### Unit Permission Testing
- [ ] Users can access units they have permissions for
- [ ] Unit-based document filtering works correctly
- [ ] Unit administrators have appropriate access rights
- [ ] Cross-unit access restrictions are enforced

### System Integration Testing
- [ ] User authentication flow works correctly
- [ ] Session management maintains user roles
- [ ] Permission-based UI elements display appropriately
- [ ] API endpoints enforce proper access controls

## Rollback Considerations

If rollback becomes necessary, the RBAC system will be restored to its pre-migration state with all role assignments, permissions, and access controls intact. The rollback process will maintain the same RBAC structure and functionality as before the migration attempt.