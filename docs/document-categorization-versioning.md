# Document Categorization and Version Management for Departmental Repositories

## Overview

This document outlines the categorization and version management system for the department-specific repositories at LSPU-SCC. The system will provide structured organization and proper version control for documents across all ten academic departments while maintaining consistency and ease of use.

## Current Categorization Analysis

### Existing Categories
- Research
- Academic
- Policy
- Extension
- Teaching

### Limitations
- Generic categories that don't reflect department-specific needs
- No version management beyond a simple version number
- No department-specific categorization

## Enhanced Categorization System

### 1. Department-Specific Categories

#### 1.1 College of Arts and Sciences (CAS)
- **Research**: Academic papers, research reports, thesis
- **Academic**: Course materials, syllabi, lecture notes
- **Policy**: Department policies, academic regulations
- **Extension**: Community outreach programs, extension activities
- **Teaching**: Teaching materials, lab reports, presentations
- **Literature**: Literary works, criticism, analysis
- **Sciences**: Laboratory reports, scientific studies
- **Social Sciences**: Social research, anthropological studies

#### 1.2 College of Business, Administration and Accountancy (CBAA)
- **Research**: Business research, market analysis, case studies
- **Academic**: Business plans, financial reports, accounting standards
- **Policy**: Business regulations, accounting standards
- **Extension**: Business consultations, entrepreneurship programs
- **Teaching**: Business simulations, case studies, accounting exercises
- **Finance**: Financial analysis, investment reports
- **Management**: Strategic plans, organizational studies
- **Accounting**: Financial statements, audit reports

#### 1.3 College of Computer Studies (CCS)
- **Research**: Technical papers, algorithm studies, software research
- **Academic**: Programming assignments, technical documentation
- **Policy**: IT policies, software licensing
- **Extension**: IT services, community tech programs
- **Teaching**: Code samples, tutorials, programming exercises
- **Software**: Applications, tools, utilities
- **Development**: Projects, source code, documentation
- **Cybersecurity**: Security reports, vulnerability assessments

#### 1.4 College of Criminal Justice Education (CCJE)
- **Research**: Criminology studies, crime analysis, legal research
- **Academic**: Case briefs, legal documents, court procedures
- **Policy**: Legal policies, criminal procedures
- **Extension**: Community safety programs, crime prevention
- **Teaching**: Training materials, case studies, legal documents
- **Law Enforcement**: Procedures, training manuals
- **Corrections**: Rehabilitation programs, facility reports
- **Criminology**: Theoretical frameworks, studies

#### 1.5 College of Engineering (COE)
- **Research**: Engineering studies, technical research, design papers
- **Academic**: Design projects, technical drawings, calculations
- **Policy**: Engineering standards, safety regulations
- **Extension**: Engineering services, community projects
- **Teaching**: Lab manuals, design exercises, technical tutorials
- **Design**: Technical drawings, CAD files, blueprints
- **Projects**: Engineering project reports, feasibility studies
- **Standards**: Technical standards, specifications

#### 1.6 College of Industrial Technology (CIT)
- **Research**: Technology studies, innovation reports, applied research
- **Academic**: Technical manuals, lab reports, project documentation
- **Policy**: Technical standards, safety protocols
- **Extension**: Technical services, skills training
- **Teaching**: Technical tutorials, lab exercises, practical guides
- **Manufacturing**: Production reports, process documentation
- **Automation**: Control systems, robotics, automation guides
- **Skills**: Training materials, certification guides

#### 1.7 College of International Hospitality and Tourism Management (CIHTM)
- **Research**: Tourism studies, hospitality research, market analysis
- **Academic**: Service standards, hospitality procedures
- **Policy**: Tourism regulations, hospitality standards
- **Extension**: Tourism promotion, hospitality services
- **Teaching**: Service training, hospitality procedures
- **Tourism**: Travel guides, destination studies, tourism reports
- **Hospitality**: Service standards, guest management
- **Events**: Event planning, management guides

#### 1.8 College of Law (COL)
- **Research**: Legal research, jurisprudence, case analysis
- **Academic**: Case briefs, legal documents, moot court materials
- **Policy**: Legal frameworks, constitutional provisions
- **Extension**: Legal aid, community legal education
- **Teaching**: Legal materials, case studies, legal procedures
- **Cases**: Court decisions, case files, legal briefs
- **Constitutional**: Constitutional law, amendments
- **International**: International law, treaties

#### 1.9 College of Nursing and Allied Health (CONAH)
- **Research**: Medical research, clinical studies, health reports
- **Academic**: Medical documentation, health procedures
- **Policy**: Health regulations, medical protocols
- **Extension**: Health services, community health programs
- **Teaching**: Medical training, clinical procedures
- **Clinical**: Patient reports, clinical guidelines
- **Health**: Health education, wellness programs
- **Pharmacy**: Drug information, pharmaceutical studies

### 2. Hierarchical Categorization System

#### 2.1 Category Structure
```
Department Level
├── General Categories (Research, Academic, Policy, Extension, Teaching)
├── Department-Specific Categories
└── Sub-Categories (optional)

Document Level
├── Primary Category
├── Secondary Category (optional)
├── Tags (multiple, for detailed classification)
└── Document Type (PDF, DOC, PPT, etc.)
```

#### 2.2 Flexible Category Assignment
- Documents can belong to multiple categories
- Department admins can create custom subcategories
- Standard categories ensure consistency across departments

### 3. Enhanced Document Metadata

#### 3.1 Extended Metadata Schema
```prisma
model Document {
  // ... existing fields
  primaryCategory   String          // Main category
  secondaryCategory String?         // Optional secondary category
  documentType      String?         // Document type (research paper, report, etc.)
  academicYear      String?         // Academic year (e.g., "2024-2025")
  semester          String?         // Semester (e.g., "1st", "2nd")
 courseCode        String?         // Course code (e.g., "CAS 101")
  authorType        String?         // Author type (faculty, student, admin)
  approvalStatus    ApprovalStatus // PENDING, APPROVED, REJECTED
  isPublic          Boolean         // Whether document is publicly accessible
  expirationDate    DateTime?       // When document access expires
  // ... rest of existing fields
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}
```

## Version Management System

### 1. Version Control Architecture

#### 1.1 Document Version Model
```prisma
model DocumentVersion {
  id            String    @id @default(cuid())
  documentId    String    // References the main document
  versionNumber Int       // Version number (1, 2, 3, etc.)
  title         String    // Title for this version
  description   String    // Description for this version
  fileUrl       String    // URL to the file for this version
  fileName      String    // Original filename
  fileType      String    // File type (PDF, DOC, etc.)
  fileSize      Int       // File size in bytes
  versionNotes  String?   // Notes about changes in this version
  uploadedById  String    // Who uploaded this version
 uploadedAt    DateTime @default(now()) // When this version was uploaded
  isCurrent     Boolean   @default(false) // Whether this is the current version
  
  // Relationships
  document      Document  @relation(fields: [documentId], references: [id], onDelete: Cascade)
  uploadedBy    User      @relation(fields: [uploadedById], references: [id])
  
  @@unique([documentId, versionNumber])
  @@map("document_versions")
}
```

#### 1.2 Version Relationships
- Each document has one or more versions
- Only one version is marked as "current"
- Previous versions are preserved for audit and reference
- Version history is maintained for each document

### 2. Version Management Workflow

#### 2.1 Document Version Lifecycle
```
1. Document Creation
   - Initial version (v1) created
   - Marked as current version
   - Full metadata recorded

2. Document Update
   - New version created with incremented version number
   - Previous version marked as non-current
   - New version marked as current
   - Change notes recorded

3. Version Access
   - Users see the current version by default
   - Previous versions accessible via version history
   - Department admins can restore previous versions

4. Version Approval
   - New versions may require approval before becoming current
   - Approval workflow configurable per department
   - Draft versions exist before approval
```

#### 2.2 Version Permissions
- Document owner can create new versions
- Department admins can approve/reject versions
- Department admins can restore previous versions
- Regular users can only view current version

### 3. Version Control Features

#### 3.1 Version Comparison
- Visual comparison between document versions
- Highlight changes in text-based documents
- Side-by-side view for PDF documents

#### 3.2 Version Approval Workflow
- Configurable approval requirements per department
- Multi-level approval for sensitive documents
- Automatic version promotion after approval

#### 3.3 Version History
- Complete history of all document versions
- Change logs with timestamps and user information
- Access to previous versions for audit purposes

## Department-Specific Version Policies

### 1. CAS Version Policies
- Research papers: Require peer review before version approval
- Academic materials: Faculty approval required
- Extension documents: Community impact review

### 2. CBAA Version Policies
- Financial reports: Require accounting verification
- Business plans: Multi-level approval process
- Policy documents: Department head approval

### 3. CCS Version Policies
- Software code: Technical review required
- Research papers: Peer review process
- Technical documentation: Expert validation

### 4. CCJE Version Policies
- Legal documents: Faculty legal review
- Case studies: Confidentiality review
- Policy documents: Compliance verification

### 5. COE Version Policies
- Technical drawings: Engineering review
- Safety documents: Safety compliance check
- Research papers: Technical validation

### 6. CIT Version Policies
- Technical manuals: Practical validation
- Safety protocols: Safety review required
- Training materials: Skills verification

### 7. CIHTM Version Policies
- Tourism reports: Industry relevance check
- Service standards: Quality assurance
- Event documents: Planning validation

### 8. COL Version Policies
- Legal documents: Legal accuracy review
- Case briefs: Faculty legal review
- Research papers: Academic validation

### 9. CONAH Version Policies
- Clinical documents: Medical review required
- Health reports: Medical accuracy validation
- Training materials: Clinical validation

## Implementation Approach

### 1. Database Schema Updates
- Create DocumentVersion model
- Add version-related fields to Document model
- Update document service methods to handle versioning

### 2. API Endpoints for Version Management
```typescript
// New API endpoints for version management
GET /api/documents/[id]/versions - Get all versions of a document
POST /api/documents/[id]/versions - Create a new version
GET /api/documents/[id]/versions/[version] - Get specific version
PUT /api/documents/[id]/versions/[version]/approve - Approve a version
PUT /api/documents/[id]/versions/[version]/restore - Restore a version
```

### 3. Frontend Components for Version Management
- Version history panel
- Version comparison tool
- Version approval interface
- Version upload with change notes

### 4. Version Management UI
```tsx
// components/document-version-history.tsx
interface DocumentVersionHistoryProps {
  documentId: string;
  currentVersion: number;
  versions: DocumentVersion[];
  onVersionSelect: (version: DocumentVersion) => void;
  onRestoreVersion?: (versionId: string) => void;
  canManageVersions: boolean;
}

// components/version-upload.tsx
interface VersionUploadProps {
  documentId: string;
  onUploadComplete: (newVersion: DocumentVersion) => void;
 documentType: string;
  departmentId: string;
}
```

## Search and Filtering with Categories

### 1. Enhanced Search Capabilities
- Search by category within departments
- Filter by version status (current, archived)
- Search across version history
- Department-specific search scope

### 2. Advanced Filtering Options
- Category-based filtering
- Version-based filtering
- Date range filtering
- Author type filtering
- Approval status filtering

## Migration Strategy

### 1. Existing Document Migration
- Assign existing documents to appropriate departments
- Map existing categories to new department-specific categories
- Create initial version records for all existing documents
- Preserve document history and metadata

### 2. Version History Creation
- For existing documents, create version 1 records
- Preserve original upload information
- Set all existing documents as current version
- Create version history trail

## Security and Access Control

### 1. Category-Based Access
- Department members can access documents in their categories
- Department admins can manage all categories in their department
- Cross-department access based on permissions

### 2. Version-Based Access
- Users can view current versions based on document permissions
- Previous versions accessible based on document permissions
- Department admins can access all versions
- Document owners can access all versions of their documents

This comprehensive categorization and version management system will provide structured organization and proper version control for documents across all LSPU-SCC departments while maintaining consistency and ease of use.