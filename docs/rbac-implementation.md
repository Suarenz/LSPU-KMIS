# Role-Based Access Control (RBAC) Implementation for LSPU KMIS

## Overview

The LSPU Knowledge Management Information System implements a comprehensive Role-Based Access Control (RBAC) system to manage user permissions and access rights. The system defines four distinct user roles with different levels of access and privileges.

## User Roles

### 1. ADMIN
- **Highest privilege level**
- **Permissions:**
  - Full system access
  - Create, read, update, and delete all documents
  - Manage all users (create, update, delete)
  - Create, update, and delete academic units
  - Manage system permissions
  - Access analytics and reporting
  - Manage all document permissions

### 2. FACULTY
- **Medium-high privilege level**
- **Permissions:**
  - Create and upload documents
  - Read all documents
  - Update documents they created
  - Read user information
  - Read unit information
  - Access analytics (limited to their units)
  - Manage documents within their assigned units

### 3. STUDENT
- **Medium privilege level**
- **Permissions:**
  - Read documents they have access to
  - Read user information
  - Read unit information
  - Access documents based on permissions granted
 - Download approved documents

### 4. EXTERNAL
- **Lowest privilege level**
- **Permissions:**
  - Read documents they have explicit access to
  - Limited access based on granted permissions
 - Access only specific documents as authorized

## Role Hierarchy

The system implements a role hierarchy where higher-level roles inherit permissions from lower-level roles:

```
ADMIN (Level 4) - Full system access
  ↓
FACULTY (Level 3) - Faculty + extended permissions
  ↓
STUDENT (Level 2) - Student + basic permissions
  ↓
EXTERNAL (Level 1) - External access only
```

## Implementation Details

### 1. Authentication Middleware
- Located in `lib/middleware/auth-middleware.ts`
- Validates JWT tokens
- Checks user roles against required roles for protected routes
- Returns appropriate HTTP status codes (401 for authentication, 403 for authorization)

### 2. RBAC Utilities
- Located in `lib/utils/rbac.ts`
- Provides utility functions for role checking
- Defines role hierarchies and permissions
- Centralized role management

### 3. API Route Protection
- Role checks implemented at the route level
- Example: Document upload requires ADMIN or FACULTY role
- Example: Unit management requires ADMIN role only

### 4. Database-Level Permissions
- Prisma schema defines role-based constraints
- Unit-based access controls
- Document-specific permissions
- User-unit associations

## Permission Matrix

| Action | ADMIN | FACULTY | STUDENT | EXTERNAL |
|--------|-------|---------|---------|----------|
| Create Document | ✓ | ✓ | ✗ | ✗ |
| Read Document | ✓ | ✓ | ✓ | ✓* |
| Update Document | ✓ | ✓** | ✗ | ✗ |
| Delete Document | ✓ | ✓** | ✗ | ✗ |
| Create User | ✓ | ✗ | ✗ |
| Read User | ✓ | ✓ | ✓ | ✗ |
| Update User | ✓ | ✗ | ✗ |
| Delete User | ✓ | ✗ | ✗ | ✗ |
| Create Unit | ✓ | ✗ | ✗ | ✗ |
| Read Unit | ✓ | ✓ | ✓ | ✗ |
| Update Unit | ✓ | ✗ | ✗ | ✗ |
| Delete Unit | ✓ | ✗ | ✗ | ✗ |
| Manage Permissions | ✓ | ✗ | ✗ |
| View Analytics | ✓ | ✓ | ✗ |

*External users can only read documents with explicit permissions
**Faculty can only update documents they created or have explicit permissions for

## Security Considerations

### 1. Principle of Least Privilege
- Users are granted the minimum permissions necessary to perform their functions
- Access is restricted by default
- Permissions are granted explicitly

### 2. Defense in Depth
- Multiple layers of security checks
- Client-side and server-side validation
- Database-level constraints
- API route protection

### 3. Audit Trail
- User actions are logged where appropriate
- Document access is tracked
- Permission changes are monitored

## Testing RBAC Implementation

### 1. Role Verification
- Verify each user role has correct permissions
- Test role inheritance works as expected
- Ensure role restrictions are enforced

### 2. Edge Cases
- Test with invalid/missing roles
- Verify behavior when role data is corrupted
- Test concurrent access with different roles

### 3. Integration Testing
- End-to-end testing of role-based access
- Verify UI elements show/hide based on roles
- Test API routes with different user roles

## Maintenance and Updates

### 1. Adding New Roles
- Update the UserRole type definition
- Add role to hierarchy in RBAC utilities
- Update permission matrix
- Test all existing functionality

### 2. Modifying Permissions
- Update RBAC utility functions
- Review all affected API routes
- Update documentation
- Test thoroughly

### 3. Security Audits
- Regular review of permission assignments
- Check for privilege escalation vulnerabilities
- Verify all routes have appropriate protection
- Test for unauthorized access

## Best Practices

1. Always validate roles on the server side
2. Never rely solely on client-side role checking
3. Use the auth middleware consistently across all protected routes
4. Regularly audit user roles and permissions
5. Log security-relevant access attempts
6. Implement proper error handling for authorization failures
7. Keep role definitions clear and unambiguous
8. Document all role-based access controls