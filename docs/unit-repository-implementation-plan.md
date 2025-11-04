# Unit Repository System Implementation Plan for LSPU-SCC

## Overview

This document outlines the implementation plan for creating a comprehensive repository system with dedicated sections for each academic unit at LSPU-SCC. The system will feature separate, organized repositories for ten colleges with proper categorization, search functionality, access controls, and version management.

## Current System Analysis

### Existing Architecture
- **Frontend**: Next.js 15 application with TypeScript
- **Backend**: API routes using Prisma ORM with PostgreSQL
- **Authentication**: Supabase Auth with role-based access control
- **File Storage**: Supabase Storage
- **UI Components**: Shadcn/ui library with Tailwind CSS

### Current Document Management Features
- Role-based access control (admin, faculty, student, external)
- Document upload with metadata (title, description, category, tags)
- Basic search and filtering
- Version management
- Download and view tracking
- Commenting system
- Permission management

### Current Unit Support
- Unit field exists in User model (nullable)
- No unit-specific document organization
- No unit-based access controls

## Implementation Plan

### Phase 1: Database Schema Enhancement

#### 1.1 Unit Model
```prisma
model Unit {
  id          String     @id @default(cuid())
  name        String     @unique // e.g., "College of Arts and Sciences"
  code        String     @unique // e.g., "CAS", "CBAA", "CCS", etc.
  description String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  users       User[]
  documents   Document[]
  
  @@map("units")
}
```

#### 1.2 Update Document Model
```prisma
model Document {
  // ... existing fields
 unitId  String?
  unit    Unit? @relation(fields: [unitId], references: [id])
  
  // ... rest of existing fields
}
```

#### 1.3 Update User Model
```prisma
model User {
  // ... existing fields
 unitId String?
  unit   Unit? @relation(fields: [unitId], references: [id])
  
  // ... rest of existing fields
}
```

#### 1.4 Unit Access Control Model
```prisma
model UnitPermission {
  id           String              @id @default(cuid())
 unitId       String
  userId       String
 permission   PermissionLevel     // READ, WRITE, ADMIN
  createdAt    DateTime            @default(now())
  
  unit         Unit                @relation(fields: [unitId], references: [id], onDelete: Cascade)
  user         User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([unitId, userId])
  @@map("unit_permissions")
}
```

### Phase 2: Unit Data Setup

#### 2.1 Unit Definitions
The following units will be created:

1. **College of Arts and Sciences (CAS)** - CAS
2. **College of Business, Administration and Accountancy (CBAA)** - CBAA
3. **College of Computer Studies (CCS)** - CCS
4. **College of Criminal Justice Education (CCJJ)** - CCJE
5. **College of Engineering (COE)** - COE
6. **College of Industrial Technology (CIT)** - CIT
7. **College of International Hospitality and Tourism Management (CIHTM)** - CIHTM
8. **College of Law (COL)** - COL
9. **College of Nursing and Allied Health (CONAH)** - CONAH

#### 2.2 Unit Seeding Script
Create a script to populate the units table with the above information.

### Phase 3: API Enhancements

#### 3.1 Unit-Specific Document Endpoints
- `GET /api/units` - List all units
- `GET /api/units/[id]` - Get specific unit details
- `GET /api/units/[id]/documents` - Get documents for specific unit
- `POST /api/documents` - Updated to include unit assignment

#### 3.2 Enhanced Document Service
- Add unit filtering to document retrieval methods
- Implement unit-based access control
- Update document creation to include unit assignment

### Phase 4: UI/UX Enhancements

#### 4.1 Repository Page Redesign
- Unit navigation sidebar
- Unit-specific document views
- Cross-unit search functionality
- Unit-based filtering options

#### 4.2 Upload Form Enhancement
- Unit selection during document upload
- Unit-specific categorization
- Unit-based permission controls

#### 4.3 Unit Management Interface
- Unit dashboard for unit admins
- Unit statistics and analytics
- Unit-specific user management

### Phase 5: Access Control Implementation

#### 5.1 Unit-Based Permissions
- Unit members can access their unit's documents
- Unit admins can manage all unit documents
- Faculty can upload to their assigned units
- Cross-unit access via explicit permissions

#### 5.2 Role Integration
- Unit-specific roles (Unit Admin, Unit Faculty, Unit Student)
- Integration with existing global roles
- Hierarchical permission system

### Phase 6: Search and Filtering

#### 6.1 Enhanced Search
- Search within specific units
- Cross-unit search for authorized users
- Unit-aware search results

#### 6.2 Filtering Options
- Unit filter
- Unit + category filter
- Unit + date range filter
- Unit + user role filter

### Phase 7: Version Management

#### 7.1 Unit-Specific Versioning
- Maintain version history within unit context
- Unit-specific version approval workflow
- Version comparison tools

### Phase 8: Migration Strategy

#### 8.1 Existing Document Migration
- Assign existing documents to appropriate units based on uploader's unit
- Create default unit assignments where missing
- Preserve all existing metadata and permissions

#### 8.2 User Unit Assignment
- Assign users to units based on existing unit field
- Create unit assignments for users without unit info
- Update user permissions based on unit roles

## Technical Implementation Details

### Database Migration Plan

1. Create Unit model and table
2. Update User and Document models to include unit relations
3. Create UnitPermission model and table
4. Populate units table with LSPU-SCC units
5. Migrate existing unit data from user.unit field
6. Assign existing documents to appropriate units

### API Implementation

#### Unit Controller
```typescript
// GET /api/units
// GET /api/units/[id]
// GET /api/units/[id]/documents
// POST /api/units (admin only)
// PUT /api/units/[id] (admin only)
// DELETE /api/units/[id] (admin only)
```

#### Enhanced Document Controller
```typescript
// POST /api/documents (with unit assignment)
// GET /api/documents (with unit filtering)
// PUT /api/documents/[id] (unit permission check)
// DELETE /api/documents/[id] (unit permission check)
```

### Frontend Implementation

#### New Components
- UnitSelector
- UnitSidebar
- UnitDocumentsGrid
- UnitStatsCard
- UnitPermissionManager

#### Updated Components
- RepositoryPage with unit navigation
- DocumentUploadForm with unit selection
- DocumentCard with unit indicator
- SearchPage with unit filters

### Security Considerations

#### Row Level Security (RLS)
- Implement RLS policies for unit-based access control
- Ensure users can only access documents from their units
- Implement proper permission checks for document operations

#### Data Privacy
- Ensure unit-specific documents are properly isolated
- Implement proper data access logging
- Maintain compliance with data protection regulations

## Implementation Timeline

### Week 1: Database Schema and API Development
- Create Unit model and update existing models
- Implement unit seeding script
- Develop unit API endpoints
- Update document API endpoints for unit support

### Week 2: Access Control and Permissions
- Implement unit-based access control
- Create unit permission system
- Update document service with unit logic
- Test security implementations

### Week 3: Frontend Development
- Create unit navigation components
- Update repository page with unit views
- Enhance document upload with unit selection
- Implement unit-specific UI elements

### Week 4: Search and Filtering, Testing
- Implement unit-aware search
- Create advanced filtering options
- Test cross-unit functionality
- Conduct security and access control testing

### Week 5: Migration and Deployment
- Migrate existing data to new unit structure
- Test with sample data from each unit
- Deploy to staging environment
- User acceptance testing

## Success Metrics

### Functional Metrics
- All 10 units properly configured in system
- Users can access only their assigned unit documents
- Cross-unit search works for authorized users
- Document upload includes unit assignment
- Unit-specific permissions work correctly

### Performance Metrics
- Document retrieval maintains current performance levels
- Search functionality remains responsive with unit filters
- Page load times do not significantly increase

### User Experience Metrics
- Users can easily navigate to their unit repository
- Unit switching is intuitive
- Document organization is clear and logical
- Upload process clearly indicates unit assignment

## Risk Assessment

### Technical Risks
- Database migration complexity
- Performance impact of additional joins and filters
- Potential security vulnerabilities in access control

### Mitigation Strategies
- Thorough testing of migration scripts
- Performance optimization after implementation
- Security audit of access control mechanisms

### User Adoption Risks
- Users may be confused by new unit structure
- Faculty may not assign documents to correct units

### Mitigation Strategies
- Comprehensive user training materials
- Clear documentation and tooltips
- Intuitive unit assignment during upload