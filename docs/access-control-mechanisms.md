# Access Control Mechanisms for Unit-Based Repository System

## Overview

This document outlines the access control mechanisms required for the unit-specific repository system at LSPU-SCC. The system will implement a multi-layered approach combining role-based access control (RBAC), unit-based permissions, and document-level permissions to ensure proper document access and security.

## Current Access Control Analysis

### Existing Permissions
- **User Roles**: ADMIN, FACULTY, STUDENT, EXTERNAL
- **Document Permissions**: READ, WRITE, ADMIN (applied at document level)
- **Current Access Logic**:
  - Admins have full access to all documents
  - Faculty can upload and manage documents
  - Students can access documents they have explicit permissions for or those they uploaded
  - External users have limited access

### Limitations of Current System
- No unit-level access controls
- No way to restrict document access by unit
- No way to grant unit-wide permissions

## Enhanced Access Control Architecture

### 1. Multi-Level Permission Hierarchy

```
System Level
├── Global Roles (ADMIN, FACULTY, STUDENT, EXTERNAL)
├── Unit Roles (Unit Admin, Unit Faculty, Unit Student)
└── Document Permissions (READ, WRITE, ADMIN)

Unit Level
├── Unit Membership
├── Unit Permissions
└── Unit-Wide Policies

Document Level
├── Document Ownership
├── Document-Specific Permissions
└── Document Visibility
```

### 2. Role Definitions

#### 2.1 Global Roles
- **ADMIN**: Full system access, can manage all units and documents
- **FACULTY**: Can upload documents, manage their own documents, access unit documents based on permissions
- **STUDENT**: Can access documents based on permissions, download approved documents
- **EXTERNAL**: Limited access based on explicit permissions

#### 2.2 Unit Roles
- **UNIT_ADMIN**: Full control over unit documents, can manage unit members and permissions
- **UNIT_FACULTY**: Can upload documents to unit, manage own documents in unit
- **UNIT_STUDENT**: Can access unit documents based on unit policies

### 3. Permission Matrix

| Role | View Own Docs | View Dept Docs | Upload to Dept | Manage Dept Docs | Manage Dept Users | Create Dept Docs |
|------|---------------|----------------|----------------|------------------|-------------------|------------------|
| ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ |
| DEPARTMENT_ADMIN | ✅ | ✅ | ✅ | ✅ |
| FACULTY | ✅ | ✅* | ❌ | ✅* |
| DEPARTMENT_FACULTY | ✅ | ✅ | Own Only | ❌ | ✅ |
| STUDENT | ✅ | ✅** | ❌ | ❌ | ❌ |
| DEPARTMENT_STUDENT | ✅ | ✅** | ❌ | ❌ | ❌ |
| EXTERNAL | ❌ | ❌ | ❌ | ❌ | ❌ |

*Based on unit assignment and document permissions
**Based on document permissions and unit policies

### 4. Unit Permission Model

#### 4.1 Unit Permission Schema
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

#### 4.2 Permission Inheritance
- Unit permissions provide baseline access to all documents within the unit
- Document-level permissions can override unit permissions for specific documents
- User-specific document permissions take precedence over both unit and document default permissions

### 5. Access Control Implementation

#### 5.1 Backend Access Control

##### 5.1.1 Document Access Logic
```typescript
// lib/services/document-service.ts (enhanced)
async getDocuments(
  page: number = 1,
  limit: number = 10,
  category?: string,
  search?: string,
  userId?: string,
  sort?: string,
  order: 'asc' | 'desc' = 'desc',
  departmentId?: string // NEW: Filter by department
): Promise<{ documents: Document[]; total: number }> {
  const skip = (page - 1) * limit;
  
  // Build where clause based on permissions and filters
  const whereClause: any = {
    status: 'ACTIVE', // Only show active documents
  };

  // Add department filter if provided
  if (departmentId) {
    whereClause.departmentId = departmentId;
  }

  // Add category filter if provided
  if (category && category !== 'all') {
    whereClause.category = category;
 }

  // Add search filter if provided
 if (search) {
    const searchCondition = {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ]
    };
    
    // If we already have conditions (like category), wrap everything in AND
    if (Object.keys(whereClause).length > 1) { // More than just status
      whereClause.AND = whereClause.AND || [];
      whereClause.AND.push(searchCondition);
    } else {
      // If no other conditions exist, just add the search condition
      Object.assign(whereClause, searchCondition);
    }
  }

  // If user is not admin, only show documents they have access to
  if (userId) {
    // First, try to find the user by the provided userId (which might be the database ID)
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // In the new system, we only use the database ID
    // If not found by database ID, we just continue with the assumption that the user doesn't have access
    // The permission checks later will handle access control

    if (user && user.role !== 'ADMIN') {
      // For non-admin users, we need to check department permissions and document permissions
      const permissionCondition = {
        OR: [
          { uploadedById: user.id }, // Allow access to user's own documents
          // Documents where user has explicit permissions
          { permissions: { some: { userId: user.id, permission: { in: ['READ', 'WRITE', 'ADMIN'] } } } },
          // Documents from departments where user has READ or higher permission
          { 
            department: { 
              permissions: { 
                some: { 
                  userId: user.id, 
                  permission: { in: ['READ', 'WRITE', 'ADMIN'] } 
                } 
              } 
            } 
          }
        ]
      };

      // If we already have conditions in whereClause, wrap everything in AND
      if (Object.keys(whereClause).length > 1) { // More than just status
        whereClause.AND = whereClause.AND || [];
        whereClause.AND.push(permissionCondition);
      } else {
        // If no other conditions exist, just add the permission condition
        Object.assign(whereClause, permissionCondition);
      }
    }
 }

  try {
    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          department: true,  // Include department information
          uploadedByUser: true, // Include uploader information
        },
        orderBy: sort ? { [sort]: order } : { uploadedAt: 'desc' },
      }),
      prisma.document.count({ where: whereClause }),
    ]);

    return {
      documents: documents.map((doc: any) => ({
        ...doc,
        versionNotes: doc.versionNotes ?? undefined, // Convert null to undefined
        uploadedAt: new Date(doc.uploadedAt),
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      })),
      total,
    };
  } catch (error) {
    console.error('Database connection error in getDocuments:', error);
    throw error; // Re-throw to be handled by the calling function
  }
}
```

##### 5.1.2 Document Creation Access Control
```typescript
// lib/services/document-service.ts (enhanced)
async createDocument(
  title: string,
  description: string,
  category: string,
  tags: string[],
  uploadedBy: string,
  fileUrl: string,
  fileName: string,
  fileType: string,
  fileSize: number,
  userId: string,
  departmentId?: string  // NEW: Department assignment
): Promise<Document> {
  try {
    console.log('Creating document in database...', {
      title,
      description,
      category,
      tags,
      uploadedBy,
      fileUrl,
      fileName,
      fileType,
      fileSize,
      userId,
      departmentId
    });
    
    // First, try to find user by the provided userId (which might be the database ID)
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // In the new system, we only use the database ID
    // If not found by database ID, we just continue with the assumption that the user doesn't have access
    // The permission checks later will handle access control
    
    console.log('User lookup result:', { user: !!user, role: user?.role });

    if (!user || !['ADMIN', 'FACULTY'].includes(user.role)) {
      throw new Error('Only admins and faculty can upload documents');
    }

    // Check department permissions if department is specified
    if (departmentId) {
      // Verify user has permission to upload to this department
      const deptPermission = await prisma.departmentPermission.findFirst({
        where: {
          departmentId,
          userId: user.id,
          permission: { in: ['WRITE', 'ADMIN'] }
        }
      });

      // Also check if user belongs to the department
      const userDept = await prisma.department.findFirst({
        where: {
          id: departmentId,
          users: {
            some: {
              id: user.id
            }
          }
        }
      });

      if (!deptPermission && !userDept && user.role !== 'ADMIN') {
        throw new Error('User does not have permission to upload to this department');
      }
    }

    const document = await prisma.document.create({
      data: {
        title,
        description,
        category,
        tags,
        uploadedBy: user.name,
        uploadedById: user.id, // Use the database user ID, not the Supabase auth ID
        fileUrl,
        fileName,
        fileType,
        fileSize,
        status: 'ACTIVE',
        departmentId, // NEW: Assign to department
      },
    });
    
    console.log('Document created:', document.id);

    // Grant the uploader full permissions
    await prisma.documentPermission.create({
      data: {
        documentId: document.id,
        userId: user.id, // Use the database user ID for permissions
        permission: 'ADMIN',
      },
    });
    
    console.log('Document permissions granted');

    return {
      ...document,
      versionNotes: document.versionNotes ?? undefined, // Convert null to undefined
      uploadedAt: new Date(document.uploadedAt),
      createdAt: new Date(document.createdAt),
      updatedAt: new Date(document.updatedAt),
    };
  } catch (error) {
    console.error('Database connection error in createDocument:', error);
    throw error; // Re-throw to be handled by the calling function
  }
}
```

#### 5.2 Frontend Access Control

##### 5.2.1 Enhanced Auth Context
```typescript
// lib/auth-context.tsx (enhanced)
interface AuthUser extends User {
  departmentId?: string;
  departmentPermissions: DepartmentPermission[];
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasDepartmentPermission: (departmentId: string, permission: PermissionLevel) => boolean;
  canAccessDocument: (document: Document) => boolean;
}

export function useAuth() {
  // ... existing implementation
  
  const hasDepartmentPermission = (departmentId: string, permission: PermissionLevel): boolean => {
    if (!user) return false;
    
    // Admins have all permissions
    if (user.role === 'ADMIN') return true;
    
    // Check department permissions
    const deptPerm = user.departmentPermissions.find(
      perm => perm.departmentId === departmentId && 
              perm.permission === permission
    );
    
    // Check if user belongs to the department
    if (user.departmentId === departmentId) {
      // Department members have read access by default
      if (permission === 'READ') return true;
    }
    
    return !!deptPerm;
  };
  
  const canAccessDocument = (document: Document): boolean => {
    if (!user) return false;
    
    // Admins can access all documents
    if (user.role === 'ADMIN') return true;
    
    // Document owner can access their own documents
    if (document.uploadedById === user.id) return true;
    
    // Check document-specific permissions
    const docPerm = document.permissions?.find(perm => perm.userId === user.id);
    if (docPerm) return true; // Any document permission grants access
    
    // Check department permissions if document has a department
    if (document.departmentId) {
      // Users with department READ or higher can access department documents
      return hasDepartmentPermission(document.departmentId, 'READ');
    }
    
    // For documents without departments, only owner or users with explicit permissions can access
    return false;
  };
  
  return {
    // ... existing return values
    hasDepartmentPermission,
    canAccessDocument,
  };
}
```

### 6. Unit-Specific Access Controls

#### 6.1 Unit Management Interface
- Unit admins can manage unit members
- Unit admins can set unit-wide policies
- Unit admins can manage unit document permissions

#### 6.2 Unit Membership Verification
- Users can belong to one or more units
- Unit membership determines default access rights
- Unit admins can add/remove members

#### 6.3 Cross-Unit Access
- System admins can access all units
- Users can be granted explicit permissions to access other units
- Unit admins can grant permissions to other unit members

### 7. Security Considerations

#### 7.1 Row Level Security (RLS) for Supabase
```sql
-- Documents table RLS policies
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
  uploadedById = (SELECT id FROM users WHERE id = auth.uid())
  OR
  id IN (
    SELECT document_id
    FROM document_permissions
    WHERE user_id = (SELECT id FROM users WHERE id = auth.uid())
  )
);

-- Policy for INSERT: Only unit admins and faculty can upload to their unit
CREATE POLICY "Allow unit admins and faculty to upload documents" ON documents
FOR INSERT TO authenticated
WITH CHECK (
  -- User has admin permission for the unit
 (EXISTS (
    SELECT 1 FROM department_permissions dp
    WHERE dp.department_id = NEW.department_id
    AND dp.user_id = (SELECT id FROM users WHERE id = auth.uid())
    AND dp.permission = 'ADMIN'
  ))
  OR
  -- User has write permission for the unit
  (EXISTS (
    SELECT 1 FROM department_permissions dp
    WHERE dp.department_id = NEW.department_id
    AND dp.user_id = (SELECT id FROM users WHERE id = auth.uid())
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
  OR
 -- User is system admin
  (EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'ADMIN'
  ))
);

-- Policy for UPDATE: Only document owner, unit admins, or users with write permissions can update
CREATE POLICY "Allow document updates by owner or unit admins" ON documents
FOR UPDATE TO authenticated
USING (
  uploadedById = (SELECT id FROM users WHERE id = auth.uid())  -- Document owner
  OR
  department_id IN (
    SELECT dp.department_id
    FROM department_permissions dp
    WHERE dp.user_id = (SELECT id FROM users WHERE id = auth.uid())
    AND dp.permission = 'ADMIN'
  )
  OR
  department_id IN (
    SELECT dp.department_id
    FROM department_permissions dp
    WHERE dp.user_id = (SELECT id FROM users WHERE id = auth.uid())
    AND dp.permission = 'WRITE'
  )
  OR
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'ADMIN'
  )
);

-- Policy for DELETE: Only document owner, unit admins, or system admins can delete
CREATE POLICY "Allow document deletion by owner or unit admins" ON documents
FOR DELETE TO authenticated
USING (
  uploadedById = (SELECT id FROM users WHERE id = auth.uid())  -- Document owner
  OR
  department_id IN (
    SELECT dp.department_id
    FROM department_permissions dp
    WHERE dp.user_id = (SELECT id FROM users WHERE id = auth.uid())
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

#### 7.2 Unit Permissions RLS
```sql
-- Policy for SELECT: Users can view permissions for units they admin
CREATE POLICY "Allow unit admins to view permissions" ON department_permissions
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM department_permissions dp2
    WHERE dp2.department_id = department_permissions.department_id
    AND dp2.user_id = (SELECT id FROM users WHERE id = auth.uid())
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
    AND dp2.user_id = (SELECT id FROM users WHERE id = auth.uid())
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
    AND dp2.user_id = (SELECT id FROM users WHERE id = auth.uid())
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
    AND dp2.user_id = (SELECT id FROM users WHERE supabase_auth_id = auth.uid())
    AND dp2.permission = 'ADMIN'
  )
  OR
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.supabase_auth_id = auth.uid()
    AND u.role = 'ADMIN'
  )
);
```

### 8. Permission Inheritance and Override Rules

#### 8.1 Permission Hierarchy (Highest to Lowest)
1. **Explicit Document Permission** (User has specific permission for document)
2. **Unit Permission** (User has permission for entire unit)
3. **Default Unit Access** (User belongs to unit)
4. **Document Ownership** (User uploaded the document)
5. **System Admin** (Admin has access to everything)

#### 8.2 Permission Resolution Algorithm
```
For any document access request:
1. If user is system admin → ALLOW
2. If document belongs to user → ALLOW
3. If user has explicit document permission → ALLOW based on permission level
4. If document has unit:
   a. If user has unit permission → ALLOW based on unit permission level
   b. If user belongs to unit → ALLOW with READ access
5. Otherwise → DENY
```

### 9. Implementation Strategy

#### 9.1 Phase 1: Basic Unit Permissions
- Implement unit model and permissions
- Add unit assignment to documents
- Implement basic access control logic

#### 9.2 Phase 2: Advanced Permissions
- Implement unit management interface
- Add cross-unit access controls
- Implement permission inheritance

#### 9.3 Phase 3: Fine-Grained Controls
- Document-level permission overrides
- Unit policy management
- Advanced permission reporting

This access control system will provide secure, scalable, and flexible unit-specific document access for the LSPU-SCC Knowledge Management Information System.