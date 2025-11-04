# Unit Creation Functionality Documentation

## Overview

This document outlines the implementation of the "+ New Unit" functionality that enables administrators to dynamically add new units to the repository with custom naming capabilities. The system ensures that all newly created units seamlessly integrate with existing units, maintaining consistent behavior, properties, and adaptability across the entire repository structure.

## Features

### 1. Administrator-Only Access
- Only users with the `ADMIN` role can create new units
- Access is restricted through role-based authentication checks
- Non-admin users are redirected when attempting to access the creation page

### 2. Comprehensive Form Validation
- **Unit Name**: Required field with no specific character restrictions
- **Unit Code**:
  - Optional field
  - Maximum 10 characters (if provided)
 - Only uppercase letters, numbers, spaces, underscores, and hyphens allowed (if provided)
 - Automatically converted to uppercase and normalized (extra spaces removed) (if provided)
- **Description**: Optional field, maximum 500 characters

### 3. Integration with Existing System
- New units are automatically added to the unit sidebar
- Units are available for document categorization immediately after creation
- All existing unit-based filtering and access controls work with new units
- Units are properly integrated with the Prisma schema and database

### 4. Optional Unit Code Support
- Unit code field is now optional (previously required)
- When provided, unit codes must still follow the validation rules (max 10 characters, uppercase letters/numbers/underscores/hyphens)
- Units without codes can still be created and function normally in the system

### 5. User Experience Enhancements
- Toast notifications for success and error feedback
- Loading states during form submission
- Responsive design with mobile support
- Consistent UI with existing unit pages
- Sidebar navigation integration

## Implementation Details

### API Endpoints Used
- `POST /api/units` - Create new unit (admin only)
- `GET /api/units` - Fetch all units for sidebar

### Components Created
1. **UnitForm Component** (`components/unit-form.tsx`)
   - Handles form rendering and validation
   - Manages form state and submission
   - Provides error handling and feedback
   - Supports both creation and editing modes

2. **New Unit Page** (`app/units/new/page.tsx`)
   - Provides the UI for creating new units
   - Implements authentication checks
   - Integrates with sidebar navigation
   - Handles form submission and navigation

### Database Integration
The new units are stored in the `units` table as defined in the Prisma schema:

```prisma
model Unit {
  id          String           @id @default(cuid())
  name        String           @unique
  code        String           @unique
  description String?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  documents   Document[]
  permissions UnitPermission[]
 users       User[]           @relation("UserUnit")
}
```

## Security Considerations

1. **Authentication**: All unit creation operations require valid authentication
2. **Authorization**: Only users with `ADMIN` role can create units
3. **Input Validation**: All form inputs are validated both client-side and server-side
4. **Unique Constraints**: Unit names and codes must be unique in the database

## Error Handling

The system provides comprehensive error handling:

1. **Form Validation Errors**: Displayed directly on the form
2. **API Errors**: Shown as toast notifications
3. **Authentication Errors**: Redirect users to login or repository
4. **Network Errors**: Handled gracefully with user feedback

## Testing Considerations

When testing the new unit functionality:

1. Verify that only admin users can access the creation page
2. Test form validation with various inputs
3. Confirm that new units appear in the sidebar
4. Check that documents can be assigned to new units
5. Verify that unit codes are properly formatted
6. Test the success and error flows

## Future Enhancements

Potential future improvements to the unit creation functionality:

1. Bulk unit creation capability
2. Unit import from CSV files
3. Unit templates with predefined settings
4. Enhanced unit management interface
5. Unit assignment workflows for users