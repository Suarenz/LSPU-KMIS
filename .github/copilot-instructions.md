# LSPU KMIS - AI Coding Agent Instructions

## System Architecture Overview

**LSPU Knowledge Management Information System** is a Next.js 15 full-stack university knowledge platform with PostgreSQL backend, featuring document management, role-based access control (RBAC), and AI-powered search via Colivara integration.

### Key Components
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: API routes (`/app/api/**`), Prisma ORM
- **Database**: PostgreSQL with Prisma client
- **Authentication**: JWT tokens + localStorage (not Supabase)
- **Search/Indexing**: Colivara (vector embeddings) + Redis caching
- **File Storage**: Supabase storage (configurable)

## Critical Architecture Patterns

### 1. Authentication & Token Management
- **Flow**: Login → JWT access token stored in localStorage + refresh token
- **Key Files**: `lib/services/auth-service.ts`, `lib/services/jwt-service.ts`, `middleware.ts`
- **Important**: Tokens are verified without DB in middleware (edge runtime compatible)
- **Token Refresh**: Auto-refresh when expired via `/api/auth/refresh`
- **Hydration**: AuthProvider uses default context values to prevent SSR errors - always check `typeof window` in client hooks

**Pattern**: Always use `AuthService.getAccessToken()` before API calls (handles refresh automatically)

### 2. Database User ID System
- **Critical**: Users have database IDs (UUID from `gen_random_uuid()`) distinct from Supabase IDs
- **Use Case**: When accepting userId params, they're database IDs, not auth IDs
- **Queries**: Use `user.id` (database) not auth ID - Prisma lookups with `findUnique({ where: { id: userId } })`
- **Permission Checks**: Document/unit permissions store database user IDs

### 3. Role-Based Access Control (RBAC)
- **Roles**: ADMIN (4) > FACULTY (3) > STUDENT (2) > EXTERNAL (1)
- **Implementation**: `lib/utils/rbac.ts` with hierarchy helpers
- **Access Patterns**:
  - ADMIN: all units + documents
  - FACULTY: assigned unit + write permissions
  - STUDENT/EXTERNAL: read-only with explicit permissions
- **Check**: Use `hasRole()`, `isFaculty()`, `hasRoleHierarchy()` utilities

### 4. Unit-Document Permission Model
- **Units**: Organizational containers (departments/colleges)
- **Document Assignment**: Documents belong to units via `unitId` field
- **Permission Layers**:
  1. **Document Permissions**: `DocumentPermission` table (READ/WRITE/ADMIN per user)
  2. **Unit Permissions**: `UnitPermission` table (implicit via unit assignment)
- **Query Pattern**: Check `user.role` first, then explicit permissions for non-admin/faculty
- **Service**: `lib/services/unit-document-service.ts` handles unit-aware queries

### 5. API Middleware Authentication
- **Location**: `lib/middleware/auth-middleware.ts` → exported `requireAuth()` function
- **Usage in Routes**: 
  ```typescript
  const authResult = await requireAuth(request);
  if ('status' in authResult) return authResult; // error response
  const { user } = authResult;
  ```
- **Token Sources**: Authorization header OR `access_token` cookie

## Critical Developer Workflows

### Running the Application
```bash
npm run dev                    # Start Next.js dev server (port 3000)
npm run db:push               # Sync schema changes without migrations
npm run db:migrate            # Create migration + apply
npm run db:studio             # Open Prisma Studio (visual DB explorer)
npm test                      # Run Jest tests (__tests__/*.test.ts)
```

### Database Changes
1. **Update** `prisma/schema.prisma` (model definitions)
2. **Run** `npm run db:push` for rapid prototyping OR `npm run db:migrate` for production
3. **Regenerate** Prisma client automatically with `npm run db:generate` if needed
4. **Note**: Some fields need raw SQL updates (e.g., `unitId` uses `executeRaw` in services)

### Adding API Routes
1. Create file in `/app/api/{feature}/{method}/route.ts`
2. Use `requireAuth(request)` if protected
3. Return `NextResponse.json(data, { status })` for responses
4. Import services: `import documentService from '@/lib/services/document-service'`

### Building Authenticated Components
1. Use `useAuth()` hook from `lib/auth-context` (client-only)
2. Check `isLoading` before rendering (prevents hydration errors)
3. Verify `isAuthenticated` before API calls
4. Get token via `await AuthService.getAccessToken()` for fetch requests
5. Wrap in `<ClientOnly>` if using `useAuth` directly to avoid SSR

## Project-Specific Conventions

### Service Layer Pattern
- **Location**: `lib/services/*.ts`
- **Naming**: `{entity}Service` class as default export
- **Database**: Always use `prisma.{model}.*` queries
- **Errors**: Catch and log, return null or throw descriptive Error
- **Example**: `lib/services/document-service.ts` for document CRUD

### Type System
- **API Types**: `lib/api/types.ts` for public interfaces
- **Internal Types**: `lib/types.ts` (User, Document, Activity, etc.)
- **Enums**: UserRole, DocumentStatus, PermissionLevel defined in Prisma schema
- **Document Interface**: Has `unitId?`, `versionNotes?`, not all Prisma fields

### Component File Organization
- **Pages**: `app/{feature}/page.tsx` (client components with "use client")
- **Components**: `components/{feature}.tsx` in shadcn/ui style
- **Shared**: `components/ui/*` for shadcn/ui components
- **Suspense**: Use lazy loading + Suspense for non-critical sections (see `dashboard/page.tsx`)

### Error Handling Patterns
- **API Responses**: Return 401 for auth, 403 for permissions, 404 for not found, 500 for server errors
- **Client-Side**: Check `response.status === 401` → logout user, `403` → permission denied
- **Logging**: Use `console.error()` with context (file/function name included)
- **User Feedback**: Toast notifications for errors (via `useToast()` hook)

### Page Visibility & Session Management
- **Pattern**: Listen to `visibilitychange` event to refresh session when user returns from minimized
- **Check Interval**: Only re-validate every 5-10 minutes to avoid excessive requests
- **Implementation**: See `repository/page.tsx` and `units/[id]/page.tsx` for examples
- **Cache**: Session data cached in localStorage with TTL (5 min default)

## Integration Points

### Colivara Vector Search
- **Service**: `lib/services/colivara-service.ts`
- **Usage**: Document indexing, semantic search, page-level extraction
- **Config**: `COLIVARA_API_KEY`, defaults, collections in `lib/services/config-service.ts`
- **Processing**: Async with status tracking (PENDING → COMPLETED/FAILED)
- **Cache**: Redis cache for search results via `lib/services/search-cache-service.ts`

### File Storage (Supabase)
- **Service**: `lib/services/file-storage-service.ts`
- **Config**: Remote patterns in `next.config.mjs` allow Supabase domain
- **Upload**: `POST /api/documents/upload` creates document + uploads file
- **Download**: Direct file URL or token-based download via `/api/documents/[id]/download-direct`

### External Services
- **Gemini**: `lib/services/gemini-generation-service.ts` (text generation)
- **Qwen**: `lib/services/qwen-generation-service.ts` (alternative generation)
- **Redis**: `lib/services/redis-service.ts` (caching, session tokens)

## Testing & Debugging

### Test Structure
- **Location**: `__tests__/` directory
- **Pattern**: `[feature].test.ts` matching source files
- **Config**: `jest.config.js` uses ts-jest, tests node environment
- **Run**: `npm test` or `npm run test:watch` for TDD
- **Coverage**: Configured in jest.config.js

### Common Debugging Points
1. **Auth Issues**: Check token in localStorage, verify JWT signature in `jwt-service.ts`
2. **API 401**: Token expired → refresh via `/api/auth/refresh`
3. **API 403**: Check user role/permissions in `requireAuth()` result
4. **Hydration Errors**: Ensure client components use `useEffect` for data, not SSR
5. **DB Queries**: Test in Prisma Studio (`npm run db:studio`) before using in code

## Repository Structure

```
app/
├── api/                    # Backend routes (Next.js API handlers)
│   ├── auth/              # Login, refresh, logout, me
│   ├── documents/         # CRUD, upload, download
│   ├── search/            # Colivara search
│   ├── units/             # Unit management
│   └── analytics/         # Stats, activity
├── dashboard/             # User dashboard (protected)
├── repository/            # Document browser
├── layout.tsx             # Root layout with providers
└── page.tsx               # Login page (public)

lib/
├── services/              # Business logic layer
│   ├── auth-service.ts    # Token + session management
│   ├── document-service.ts # CRUD operations
│   ├── colivara-service.ts # Search indexing
│   └── jwt-service.ts     # Token generation/verification
├── middleware/auth-middleware.ts # requireAuth() function
├── utils/rbac.ts          # Role hierarchy checks
├── auth-context.tsx       # React Context (useAuth hook)
└── prisma.ts              # Prisma client singleton

prisma/
├── schema.prisma          # Data models
└── migrations/            # Migration history

components/
├── auth-provider.tsx      # Provider wrapper
├── navbar.tsx             # Navigation (auth-aware)
└── ui/                    # shadcn/ui components
```

## Common Patterns to Follow

1. **Protected Routes**: Use `useAuth()` hook + redirect if `!isAuthenticated && !isLoading`
2. **Loading States**: Show spinner while `isLoading`, then render content
3. **API Calls**: Extract token → fetch with Bearer → handle 401/403
4. **Pagination**: Pass `?page=X&limit=Y` params, return `{ documents, total }`
5. **Filtering**: Build `whereClause` dynamically, apply in single Prisma query
6. **Permissions**: Check role first (faster), then DB permissions for edge cases

---

**Last Updated**: December 2025 | **Stack**: Next.js 15 + PostgreSQL + Prisma + JWT
