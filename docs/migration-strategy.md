# Migration Strategy for Unit-Based Repository System

## Overview

This document outlines the comprehensive migration strategy for transitioning existing documents and users to the new unit-specific repository system at LSPU-SCC. The strategy ensures minimal disruption while maintaining data integrity and proper unit-based organization.

## Current State Assessment

### 1. Existing Data Inventory
- **Documents**: ~X documents currently in the system
- **Users**: ~X users with various roles (admin, faculty, student, external)
- **Current Categories**: Research, Academic, Policy, Extension, Teaching
- **File Storage**: Supabase Storage with current file organization
- **Permissions**: Document-level permissions only

### 2. Data Structure Analysis
- Documents stored in "documents" table with basic metadata
- Users stored in "users" table with optional department field
- No unit-level organization currently exists
- All documents accessible based on document-level permissions only

## Migration Objectives

### 1. Primary Goals
- Migrate all existing documents to appropriate units
- Preserve all document metadata and file content
- Maintain user access permissions during transition
- Organize documents according to unit-specific categories
- Establish unit-level access controls

### 2. Success Criteria
- Zero data loss during migration
- All documents properly assigned to units
- User access preserved throughout migration
- System operational during migration process
- Minimal disruption to end users

## Migration Strategy

### 1. Phased Migration Approach

#### Phase 1: Unit Setup and User Migration (Week 1)
- Create unit records in the database
- Migrate user unit assignments
- Set up unit permissions
- Prepare migration tools and scripts

#### Phase 2: Document Metadata Migration (Week 2)
- Assign existing documents to appropriate units
- Update document categories to unit-specific categories
- Create initial version records for all documents
- Establish unit-based access controls

#### Phase 3: Data Validation and Cleanup (Week 3)
- Validate document assignments
- Verify access controls
- Clean up any inconsistencies
- Prepare for full system transition

#### Phase 4: System Cutover (Week 4)
- Complete system transition to new unit-based structure
- Update all frontend and backend components
- Final validation and testing
- User notification and training

### 2. Unit Assignment Strategy

#### 2.1 Automatic Assignment Rules
1. **By User Unit**: Documents uploaded by users with unit assignments go to that unit
2. **By Document Category**: Use document category to infer unit
   - Documents with "Engineering" in title → COE
   - Documents with "Business" in title → CBAA
   - Documents with "Computer" or "IT" in title → CCS
   - etc.
3. **By Course Code**: If course code exists in document metadata
4. **By Author Affiliation**: Faculty/staff unit affiliation

#### 2.2 Manual Assignment Process
- Unit admins review documents assigned to their unit
- Manual reassignment for incorrectly assigned documents
- Special handling for general/university-wide documents

### 3. Migration Scripts and Tools

#### 3.1 Unit Seeding Script
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
```

#### 3.2 User Unit Assignment Script
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

migrateUserUnits()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

#### 3.3 Document Migration Script
```typescript
// scripts/migrate-document-units.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Unit mapping based on document characteristics
const unitKeywords = {
  'COE': ['engineering', 'mechanical', 'electrical', 'civil', 'chemical', 'industrial', 'computer engineering'],
  'CCS': ['computer', 'software', 'programming', 'it', 'information technology', 'cybersecurity', 'algorithm', 'data structure'],
  'CBAA': ['business', 'management', 'accounting', 'finance', 'economics', 'marketing', 'entrepreneurship'],
  'CAS': ['literature', 'philosophy', 'psychology', 'sociology', 'history', 'mathematics', 'physics', 'chemistry', 'biology'],
  'CCJE': ['law', 'criminology', 'justice', 'police', 'criminal', 'forensic', 'legal'],
  'CIT': ['technology', 'industrial', 'manufacturing', 'automation', 'electronics', 'welding', 'machinist'],
  'CIHTM': ['tourism', 'hospitality', 'hotel', 'travel', 'event management', 'culinary', 'restaurant'],
  'COL': ['law', 'legal', 'constitution', 'jurisprudence', 'court', 'advocacy', 'bar'],
  'CONAH': ['nursing', 'medical', 'health', 'clinical', 'pharmacy', 'allied health', 'patient'],
};

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
  
  // First, assign documents based on uploader's unit
  for (const [userId, unitId] of userUnitMap) {
    await prisma.document.updateMany({
      where: { uploadedById: userId },
      data: { departmentId: unitId },
    });
    console.log(`Assigned documents for user ${userId} to unit ${unitId}`);
  }
  
  // Then, assign remaining documents based on content analysis
  const unassignedDocuments = await prisma.document.findMany({
    where: { departmentId: null },
    select: { id: true, title: true, description: true, category: true, uploadedById: true },
  });
  
  for (const doc of unassignedDocuments) {
    let assignedUnitId = null;
    
    // Check unit keywords in title and description
    for (const [unitCode, keywords] of Object.entries(unitKeywords)) {
      const docText = `${doc.title} ${doc.description}`.toLowerCase();
      const hasKeyword = keywords.some(keyword => docText.includes(keyword.toLowerCase()));
      
      if (hasKeyword) {
        const unit = await prisma.unit.findUnique({
          where: { code: unitCode },
        });
        
        if (unit) {
          assignedUnitId = unit.id;
          break;
        }
      }
    }
    
    // If no keyword match, assign to general/university unit or leave unassigned
    if (assignedUnitId) {
      await prisma.document.update({
        where: { id: doc.id },
        data: { departmentId: assignedUnitId },
      });
      console.log(`Assigned document "${doc.title}" to unit based on content`);
    } else {
      // Leave unassigned for manual review
      console.log(`Document "${doc.title}" requires manual unit assignment`);
    }
  }
  
  console.log('Document unit migration completed.');
}

migrateDocumentUnits()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

#### 3.4 Version Migration Script
```typescript
// scripts/migrate-document-versions.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateDocumentVersions() {
  console.log('Creating version records for existing documents...');
  
  // Get all documents
  const documents = await prisma.document.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      fileUrl: true,
      fileName: true,
      fileType: true,
      fileSize: true,
      version: true,
      versionNotes: true,
      uploadedById: true,
      uploadedAt: true,
    }
  });
  
  for (const doc of documents) {
    // Create a version record for the current document state
    await prisma.documentVersion.create({
      data: {
        documentId: doc.id,
        versionNumber: doc.version,
        title: doc.title,
        description: doc.description,
        fileUrl: doc.fileUrl,
        fileName: doc.fileName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        versionNotes: doc.versionNotes || `Initial version migrated from legacy system`,
        uploadedById: doc.uploadedById,
        uploadedAt: doc.uploadedAt,
        isCurrent: true, // All existing documents become current versions
      }
    });
    
    console.log(`Created version record for document ${doc.id}`);
  }
  
  console.log('Document version migration completed.');
}

migrateDocumentVersions()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

### 4. Migration Process

#### 4.1 Pre-Migration Preparation
1. **Backup**: Create full database and file storage backup
2. **Schema Updates**: Apply new database schema with unit models
3. **Testing Environment**: Prepare staging environment for migration testing
4. **User Communication**: Notify users about scheduled maintenance windows

#### 4.2 Migration Execution
1. **Off-Peak Execution**: Perform migration during low-usage periods
2. **Batch Processing**: Process documents in batches to avoid system overload
3. **Real-time Monitoring**: Monitor migration progress and system performance
4. **Rollback Plan**: Maintain ability to rollback if critical issues arise

#### 4.3 Post-Migration Validation
1. **Data Integrity Checks**: Verify all documents properly migrated
2. **Access Control Verification**: Confirm proper unit access
3. **User Acceptance Testing**: Validate functionality with unit admins
4. **Performance Testing**: Ensure system performance meets requirements

### 5. Handling Special Cases

#### 5.1 Cross-Unit Documents
- Documents relevant to multiple units
- Solution: Assign to primary unit, create references in other units
- Implement cross-unit sharing permissions

#### 5.2 Orphaned Documents
- Documents with no clear unit assignment
- Solution: Create "General" or "University" unit for these
- Manual review process for proper assignment

#### 5.3 User Access Preservation
- Maintain existing document permissions during migration
- Ensure unit members retain access to relevant documents
- Preserve user-specific document permissions

### 6. Risk Mitigation

#### 6.1 Data Loss Prevention
- Comprehensive backup before migration
- Transaction-based operations to ensure atomicity
- Validation checks at each migration step

#### 6.2 System Downtime Minimization
- Staged migration to maintain partial system availability
- Off-peak execution to minimize user impact
- Quick rollback procedures for critical issues

#### 6.3 User Disruption Management
- Clear communication about migration timeline
- Temporary access procedures during migration
- Comprehensive post-migration support

### 7. Validation and Testing

#### 7.1 Automated Validation Scripts
```typescript
// scripts/validate-migration.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validateMigration() {
  console.log('Validating migration...');
  
  // Check that all users have unit assignments where expected
  const usersWithoutUnits = await prisma.user.count({
    where: {
      unitId: null,
      role: { in: ['FACULTY', 'STUDENT'] }, // Only check faculty and students
    }
  });
  
  console.log(`Users without units: ${usersWithoutUnits}`);
  
  // Check that all documents have unit assignments
  const docsWithoutUnits = await prisma.document.count({
    where: { departmentId: null }
  });
  
  console.log(`Documents without units: ${docsWithoutUnits}`);
  
  // Check version records
  const docs = await prisma.document.findMany({
    include: { versions: true }
  });
  
  let docsMissingVersions = 0;
  for (const doc of docs) {
    if (doc.versions.length === 0) {
      docsMissingVersions++;
      console.log(`Document ${doc.id} has no version records`);
    }
  }
  
  console.log(`Documents missing version records: ${docsMissingVersions}`);
  
  // Check unit permissions
  const unitPerms = await prisma.unitPermission.count();
  console.log(`Unit permissions created: ${unitPerms}`);
  
  console.log('Migration validation completed.');
}

validateMigration()
 .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

#### 7.2 Manual Validation Process
- Unit admin review of assigned documents
- Faculty verification of document access
- Student access testing for relevant documents
- Administrative review of system functionality

This comprehensive migration strategy ensures a smooth transition from the current system to the new unit-based repository structure while maintaining data integrity and minimizing disruption to users.