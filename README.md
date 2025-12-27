# LSPU Knowledge Management Information System (KMIS)

## Overview

The LSPU Knowledge Management Information System is a web-based platform designed for Laguna State Polytechnic University to manage, share, and access institutional knowledge resources. This system provides a centralized repository for research, policies, teaching materials, and collaboration tools.

## System Architecture

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API
- **UI Components**: Lucide React icons, Recharts for data visualization

### Authentication
- Custom authentication service with token-based simulation
- Role-based access control (Admin, Faculty, Student, External)
- Session management with loading states

## Project Structure

```
app/
├── page.tsx              # Login page
├── landing/              # Public landing page with marketing content
├── dashboard/           # User dashboard
├── repository/           # Document repository
├── search/              # Search functionality
├── analytics/           # Analytics dashboard
├── layout.tsx           # Root layout with AuthProvider
components/
├── navbar.tsx           # Navigation bar component
├── ui/                  # Reusable UI components
lib/
├── auth-context.tsx     # Authentication context
├── services/            # Business logic services
├── api/                 # API service layer
├── mock-data.ts         # Mock data for development
├── types.ts             # TypeScript type definitions
```

## Recent Changes

### Problem Identified
Previously, the login page (`/`) was showing marketing/feature content that should only appear on the dashboard or a separate landing page. This caused confusion as users would see:
- Centralized Repository features
- Collaboration Tools information
- Secure & Compliant messaging
- Analytics & Insights details

These are the same features described on the actual dashboard, making it unclear what content was available before login.

### RBAC Role Assignment Issue
Additionally, there was an issue where default admin users were being assigned the STUDENT role instead of the ADMIN role, which caused access control problems throughout the system. The role-based access control wasn't functioning properly due to incorrect role assignments in the database.

### Solution Implemented

1. **Simplified Login Page** (`app/page.tsx`)
   - Removed all marketing/feature content
   - Now only shows essential login functionality
   - Maintains demo account information for testing
 
2. **Fixed Role Assignment Issue** (`scripts/fix-user-roles.ts`)
   - Created a script to fix incorrect user roles in the database
   - Ensured admin users have ADMIN role, faculty users have FACULTY role, etc.
   - Added proper role verification and assignment for default users
 
3. **Enhanced RBAC System** (`lib/utils/rbac.ts`)
   - Created comprehensive RBAC utilities for role checking
   - Implemented role hierarchy and permission management
   - Updated auth middleware to use the new RBAC system
 
4. **Routing**
   - `/` leads to the login page
   - Authenticated users are automatically redirected to `/dashboard`

## System Cleanup (December 2025)

Removed unused files to optimize the codebase:
- **Removed**: `app/demo/` - Demo pages for testing UI components
- **Removed**: `app/landing/` - Unused landing page (redundant with login page)
- **Removed**: `references/synalink.md` - External reference documentation (11K lines)
- **Removed**: `lib/mock-data.ts` - Mock data not used in production
- **Removed**: `hooks/use-isomorphic-layout-effect.ts` - Unused hook file

All core functionality remains intact and fully operational.

## How to Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The application will be available at `http://localhost:3000`.

## Prisma Database Setup

This project uses Prisma ORM for database management. After making changes to the database schema or if you encounter TypeScript errors related to Prisma models, you may need to regenerate the Prisma client.

```bash
# Generate Prisma client (after schema changes)
npm run db:generate

# Push schema changes to database
npm run db:push

# Create and apply migration
npm run db:migrate

# Open Prisma Studio to view database content
npm run db:studio
```

If you encounter TypeScript errors like `Property 'forumPost' does not exist on type 'PrismaClient'`, run `npm run db:generate` to regenerate the client based on the current schema.

## Demo Accounts

- **Admin**: admin@lspu.edu.ph / admin
- **Faculty**: faculty@lspu.edu.ph / faculty
- **Student**: student@lspu.edu.ph / student
- **External**: external@partner.com / external

## Key Features

### Authentication & Authorization
- Role-based access control
- Secure login with session management
- Protected routes for authenticated users only

### Knowledge Repository
- Centralized document storage
- Search and filtering capabilities
- Download tracking and analytics

### Collaboration Tools
- Reply and like functionality
- Category-based organization

### Analytics & Reporting
- Usage statistics
- Document popularity tracking
- User engagement metrics

### Responsive Design
- Mobile-first approach
- Works on all device sizes
- Touch-friendly interface

## Compliance

The system is designed with compliance in mind:
- RA 10173 Data Privacy Act compliant
- Secure authentication and session management
- Role-based access control for sensitive information

## Future Enhancements

Planned improvements include:
- Integration with university systems (LMS, SIS)
- Advanced AI-powered search capabilities
- Real backend API integration
- Enhanced analytics and reporting features
- Mobile application development

## Contributing

This project is maintained by the LSPU IT Department. For issues or feature requests, please contact the development team.

## License

This project is proprietary to Laguna State Polytechnic University.