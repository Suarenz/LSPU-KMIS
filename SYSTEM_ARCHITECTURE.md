# LSPU KMIS - System Architecture

## Overview
This document maps the conceptual framework to the technical system architecture of the LSPU Knowledge Management Information System.

---

## Architecture Mapping: Conceptual to Technical

### INPUT Layer → Data Ingestion Layer

#### Conceptual Components
- **Accomplished PDO Forms**
- **Institutional Files**
- **Documents**

#### Technical Implementation

```
┌─────────────────────────────────────────────────────────┐
│                   INPUT LAYER                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐    ┌──────────────┐   ┌────────────┐ │
│  │   Document   │    │    Manual    │   │    Bulk    │ │
│  │    Upload    │    │     Entry    │   │   Import   │ │
│  │              │    │              │   │            │ │
│  │  /api/       │    │  /api/       │   │  /api/     │ │
│  │  documents/  │    │  qpro/       │   │  admin/    │ │
│  │  upload      │    │  target      │   │  import    │ │
│  └──────┬───────┘    └──────┬───────┘   └──────┬─────┘ │
│         │                   │                   │       │
│         └───────────────────┴───────────────────┘       │
│                           ▼                             │
│              ┌────────────────────────┐                 │
│              │  File Storage Service  │                 │
│              │  (Supabase Storage)    │                 │
│              └────────────────────────┘                 │
└─────────────────────────────────────────────────────────┘
```

**Components:**
- **Frontend Upload Interface**: `/app/repository/page.tsx`
- **API Endpoints**: 
  - `POST /api/documents/upload` - Document ingestion
  - `POST /api/qpro/target` - KPI target data entry
  - `POST /api/documents/batch` - Bulk import
- **File Storage**: `lib/services/file-storage-service.ts`
- **Validation**: File type, size, metadata validation

---

### PROCESS Layer → Core Processing Engine

#### Conceptual Components
- **Storage/Database** (Central Hub)
- **AI Model** (KRA Classification)
- **LLM Agent** (Strategic Man Loop)
- **Semantic Search Engine** (Vector Indexing)

#### Technical Implementation

```
┌────────────────────────────────────────────────────────────────┐
│                      PROCESS LAYER                             │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              STORAGE & DATABASE LAYER                    │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  ┌─────────────────┐    ┌──────────────┐              │ │
│  │  │   PostgreSQL    │    │    Redis     │              │ │
│  │  │   Database      │    │    Cache     │              │ │
│  │  │                 │    │              │              │ │
│  │  │  - Users        │    │  - Sessions  │              │ │
│  │  │  - Documents    │    │  - Search    │              │ │
│  │  │  - Units        │    │    Results   │              │ │
│  │  │  - Permissions  │    │  - Tokens    │              │ │
│  │  │  - Activities   │    └──────────────┘              │ │
│  │  │  - KPIs/Targets │                                   │ │
│  │  └────────┬────────┘                                   │ │
│  │           │                                            │ │
│  │           ▼                                            │ │
│  │  ┌─────────────────┐                                  │ │
│  │  │  Prisma ORM     │                                  │ │
│  │  │  Client Layer   │                                  │ │
│  │  └─────────────────┘                                  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              AI PROCESSING LAYER                         │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  ┌────────────────────────────────────────────────┐    │ │
│  │  │  AI Classification Engine                       │    │ │
│  │  │  (KRA/KPI Classification)                       │    │ │
│  │  ├────────────────────────────────────────────────┤    │ │
│  │  │                                                 │    │ │
│  │  │  • lib/services/qpro-analysis-service.ts       │    │ │
│  │  │  • lib/services/gemini-generation-service.ts   │    │ │
│  │  │                                                 │    │ │
│  │  │  Functions:                                     │    │ │
│  │  │  - Analyze document relevance to KPIs          │    │ │
│  │  │  - Extract KRA classifications                 │    │ │
│  │  │  - Calculate contribution scores               │    │ │
│  │  │  - Map documents to performance areas          │    │ │
│  │  └────────────────────────────────────────────────┘    │ │
│  │                                                          │ │
│  │  ┌────────────────────────────────────────────────┐    │ │
│  │  │  LLM Strategic Analysis Agent                   │    │ │
│  │  │  (GPT-4o-mini Integration)                      │    │ │
│  │  ├────────────────────────────────────────────────┤    │ │
│  │  │                                                 │    │ │
│  │  │  • lib/services/qpro-llm-service.ts            │    │ │
│  │  │  • lib/services/qwen-generation-service.ts     │    │ │
│  │  │                                                 │    │ │
│  │  │  Functions:                                     │    │ │
│  │  │  - Prescriptive recommendations                │    │ │
│  │  │  - Gap analysis                                │    │ │
│  │  │  - Strategic insights generation               │    │ │
│  │  │  - Action plan synthesis                       │    │ │
│  │  └────────────────────────────────────────────────┘    │ │
│  │                                                          │ │
│  │  ┌────────────────────────────────────────────────┐    │ │
│  │  │  Vector Search & Indexing Engine                │    │ │
│  │  │  (Colivara Integration)                         │    │ │
│  │  ├────────────────────────────────────────────────┤    │ │
│  │  │                                                 │    │ │
│  │  │  • lib/services/colivara-service.ts            │    │ │
│  │  │  • lib/services/search-cache-service.ts        │    │ │
│  │  │                                                 │    │ │
│  │  │  Functions:                                     │    │ │
│  │  │  - Document embedding generation               │    │ │
│  │  │  - Semantic similarity search                  │    │ │
│  │  │  - Page-level content extraction               │    │ │
│  │  │  - Multi-modal search (text + visual)          │    │ │
│  │  └────────────────────────────────────────────────┘    │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │           AGGREGATION & ANALYTICS ENGINE                 │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  • lib/services/aggregation-service.ts                  │ │
│  │  • lib/services/qpro-aggregation-service.ts             │ │
│  │  • lib/services/analytics-service.ts                    │ │
│  │                                                          │ │
│  │  Functions:                                              │ │
│  │  - KPI progress calculation                             │ │
│  │  - Target vs actual comparison                          │ │
│  │  - Multi-level aggregation (user → unit → institution)  │ │
│  │  - Trend analysis                                       │ │
│  │  - Performance metrics dashboard data                   │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

**Key Services:**
- **Document Service**: `lib/services/document-service.ts`
- **QPRO Analysis**: `lib/services/qpro-analysis-service.ts`
- **Colivara Integration**: `lib/services/colivara-service.ts`
- **Redis Cache**: `lib/services/redis-service.ts`
- **Aggregation Engine**: `lib/services/aggregation-service.ts`

---

### OUTPUT Layer → Presentation & Analytics Layer

#### Conceptual Components
- **Document Insights & Prescriptive Analysis**
- **Key Performance Indicator Progress Dashboard**
- **User's Query Answer**

#### Technical Implementation

```
┌─────────────────────────────────────────────────────────┐
│                    OUTPUT LAYER                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │   Document Insights & Prescriptive Analysis        │ │
│  ├────────────────────────────────────────────────────┤ │
│  │                                                    │ │
│  │  Component: /app/qpro/page.tsx                    │ │
│  │             components/qpro-analyzer.tsx          │ │
│  │                                                    │ │
│  │  API: GET /api/qpro/analysis/:documentId          │ │
│  │       GET /api/qpro/prescriptive/:documentId      │ │
│  │                                                    │ │
│  │  Features:                                         │ │
│  │  • KRA/KPI classification results                 │ │
│  │  • Contribution scores & justification            │ │
│  │  • AI-generated recommendations                   │ │
│  │  • Gap analysis visualization                     │ │
│  │  • Strategic action plans                         │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │   Key Performance Indicator Dashboard              │ │
│  ├────────────────────────────────────────────────────┤ │
│  │                                                    │ │
│  │  Component: /app/dashboard/page.tsx               │ │
│  │             components/kra-aggregation-dashboard  │ │
│  │                                                    │ │
│  │  API: GET /api/qpro/aggregation                   │ │
│  │       GET /api/analytics/kpi-progress             │ │
│  │                                                    │ │
│  │  Features:                                         │ │
│  │  • Real-time KPI progress tracking                │ │
│  │  • Target vs Actual visualization                 │ │
│  │  • Multi-level aggregation views                  │ │
│  │  • Performance trend charts                       │ │
│  │  • Unit/Department comparisons                    │ │
│  │  • Export capabilities                            │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │   Intelligent Query Interface                      │ │
│  ├────────────────────────────────────────────────────┤ │
│  │                                                    │ │
│  │  Component: /app/search/page.tsx                  │ │
│  │             components/search-toggle.tsx          │ │
│  │                                                    │ │
│  │  API: POST /api/search/semantic                   │ │
│  │       POST /api/search/query                      │ │
│  │                                                    │ │
│  │  Features:                                         │ │
│  │  • Natural language query processing              │ │
│  │  • Semantic search results                        │ │
│  │  • Relevance-ranked documents                     │ │
│  │  • Context-aware answers                          │ │
│  │  • Source citation & preview                      │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Detailed Technical Stack

### Frontend Architecture
```
Next.js 15 Application
├── App Router (/app)
├── React Server Components
├── Client Components ("use client")
├── Tailwind CSS + shadcn/ui
└── TypeScript (strict mode)

UI Components:
├── components/navbar.tsx          → Navigation
├── components/qpro-analyzer.tsx   → Analysis Interface
├── components/kra-aggregation-dashboard.tsx → KPI Dashboard
└── components/ui/*                → Reusable UI elements
```

### Backend Architecture
```
Next.js API Routes (/app/api)
├── /auth               → Authentication (JWT)
├── /documents          → Document CRUD
├── /qpro              → KPI Analysis & Targets
├── /search            → Semantic Search
├── /analytics         → Performance Metrics
└── /units             → Organization Units

Service Layer (lib/services)
├── auth-service.ts           → Session management
├── document-service.ts       → Document operations
├── qpro-analysis-service.ts  → AI classification
├── colivara-service.ts       → Vector search
├── aggregation-service.ts    → KPI aggregation
└── gemini-generation-service.ts → LLM integration
```

### Database Schema
```
PostgreSQL (Prisma ORM)

Core Tables:
├── User                 → Authentication & roles
├── Unit                 → Departments/Colleges
├── Document             → File metadata
├── DocumentPermission   → Access control
├── Activity             → Audit logs
├── Target               → KPI targets
├── ContributingKPI      → Document-KPI mapping
└── QProAnalysis         → AI analysis results

Relationships:
User ─┬─ Document (uploaded_by)
      ├─ UnitPermission (assigned to units)
      └─ Activity (actions)

Document ─┬─ ContributingKPI (KRA classification)
          ├─ QProAnalysis (AI insights)
          └─ Unit (belongs to)
```

### External Services Integration
```
┌─────────────────────────────────────┐
│      External Services              │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────┐                  │
│  │   Colivara   │ → Vector embeddings
│  │   API        │   Semantic search │
│  └──────────────┘                  │
│                                     │
│  ┌──────────────┐                  │
│  │   Supabase   │ → File storage   │
│  │   Storage    │   CDN delivery   │
│  └──────────────┘                  │
│                                     │
│  ┌──────────────┐                  │
│  │   Gemini     │ → Text generation│
│  │   AI         │   Classification │
│  └──────────────┘                  │
│                                     │
│  ┌──────────────┐                  │
│  │   Redis      │ → Session cache  │
│  │   Cloud      │   Search cache   │
│  └──────────────┘                  │
└─────────────────────────────────────┘
```

---

## Security & Access Control

### Authentication Flow
```
User Login
    ↓
POST /api/auth/login
    ↓
JWT Token Generation (lib/services/jwt-service.ts)
    ↓
Access Token + Refresh Token
    ↓
Store in localStorage + Redis
    ↓
Middleware Verification (middleware.ts)
    ↓
Protected Route Access
```

### Role-Based Access Control (RBAC)
```
Hierarchy: ADMIN (4) > FACULTY (3) > STUDENT (2) > EXTERNAL (1)

Permissions:
ADMIN:
  ✓ All documents & units
  ✓ User management
  ✓ System configuration
  ✓ Analytics access

FACULTY:
  ✓ Assigned unit documents
  ✓ Write permissions
  ✓ KPI target management
  ✓ Unit-level analytics

STUDENT/EXTERNAL:
  ✓ Read-only access
  ✓ Explicit document permissions
  ✓ Personal dashboard
  ✓ Search capabilities
```

---

## Data Flow Diagrams

### Document Upload & Processing Flow
```
User Upload (Frontend)
        ↓
    Validation
        ↓
POST /api/documents/upload
        ↓
    File Storage (Supabase)
        ↓
    Database Record (Prisma)
        ↓
    Colivara Indexing (Async)
        ↓
    AI Classification (Background)
        ↓
    Status: COMPLETED
        ↓
    Available for Search/Analysis
```

### KPI Analysis Request Flow
```
User Request (Dashboard/QPRO)
        ↓
GET /api/qpro/analysis
        ↓
    Check Cache (Redis)
        ↓
    [Cache Miss]
        ↓
    Query Database (Prisma)
        ↓
    AI Analysis (Gemini/Qwen)
        ↓
    Calculate Aggregations
        ↓
    Store Results
        ↓
    Update Cache
        ↓
    Return to Frontend
```

### Semantic Search Flow
```
User Query
        ↓
POST /api/search/semantic
        ↓
    Query Preprocessing
        ↓
    Colivara Vector Search
        ↓
    Permission Filtering (RBAC)
        ↓
    Result Ranking
        ↓
    Cache Results (Redis)
        ↓
    Return with Context
```

---

## Deployment Architecture

### Development Environment
```
Local Machine
├── Next.js Dev Server (port 3000)
├── PostgreSQL (local/Docker)
├── Redis (local/Docker)
└── Environment Variables (.env.local)
```

### Production Environment (Docker)
```
Docker Compose Stack
├── app (Next.js container)
│   ├── Port: 3000
│   ├── Environment: production
│   └── Health checks enabled
│
├── postgres (PostgreSQL 15)
│   ├── Port: 5432
│   ├── Persistent volume
│   └── Auto-backup
│
└── redis (Redis 7)
    ├── Port: 6379
    ├── Persistent volume
    └── Cache policies

External Services:
├── Colivara Cloud API
├── Supabase Storage
└── Gemini AI API
```

---

## Performance Optimization

### Caching Strategy
```
Multi-Layer Cache:
1. Browser Cache (localStorage)
   - Auth tokens (5 min TTL)
   - User session data

2. Redis Cache
   - Search results (15 min TTL)
   - KPI aggregations (10 min TTL)
   - API responses (5 min TTL)

3. Database Query Cache
   - Prisma result caching
   - Connection pooling
```

### Lazy Loading & Code Splitting
```
React.lazy() Components:
├── Dashboard widgets
├── QPRO analyzer
├── Chart libraries
└── PDF viewers

API Route Optimization:
├── Pagination (default: 20 items)
├── Selective field loading
├── Eager loading relationships
└── Index optimization
```

---

## Monitoring & Analytics

### System Metrics
```
Tracked Metrics:
├── API response times
├── Document upload success rate
├── Search query performance
├── AI classification accuracy
├── User activity patterns
└── Error rates

Implementation:
└── lib/services/analytics-service.ts
```

### Logging Strategy
```
Levels:
├── ERROR: System failures, exceptions
├── WARN: Performance issues, deprecations
├── INFO: User actions, API calls
└── DEBUG: Development-only details

Storage:
├── Console (development)
├── File logs (production)
└── Error tracking service (optional)
```

---

## API Documentation Summary

### Authentication Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - Session termination
- `POST /api/auth/refresh` - Token refresh
- `GET /api/auth/me` - Current user info

### Document Management
- `POST /api/documents/upload` - File upload
- `GET /api/documents` - List documents (paginated)
- `GET /api/documents/:id` - Get document details
- `PATCH /api/documents/:id` - Update metadata
- `DELETE /api/documents/:id` - Remove document
- `GET /api/documents/:id/download` - Download file

### QPRO Analysis
- `POST /api/qpro/analyze` - Trigger AI analysis
- `GET /api/qpro/analysis/:id` - Get analysis results
- `POST /api/qpro/target` - Create KPI target
- `GET /api/qpro/aggregation` - Get aggregated KPI data
- `GET /api/qpro/prescriptive/:id` - Get recommendations

### Search
- `POST /api/search/semantic` - Semantic search
- `POST /api/search/query` - Traditional search
- `GET /api/search/suggestions` - Query autocomplete

### Analytics
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/kpi-progress` - KPI tracking
- `GET /api/analytics/activity` - User activity logs

---

## Development Workflow

### Setup
```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Database setup
npm run db:push
npm run db:migrate

# Start development
npm run dev
```

### Testing
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Database browser
npm run db:studio
```

### Deployment
```bash
# Build production
npm run build

# Docker deployment
docker-compose up -d

# Database migration
npm run db:migrate:prod
```

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 | React framework |
| **UI** | Tailwind CSS + shadcn/ui | Styling & components |
| **Backend** | Next.js API Routes | RESTful API |
| **Database** | PostgreSQL 15 | Relational data |
| **ORM** | Prisma | Database access |
| **Cache** | Redis | Session & query cache |
| **Search** | Colivara | Vector embeddings |
| **AI** | Gemini/Qwen | LLM analysis |
| **Storage** | Supabase | File hosting |
| **Auth** | JWT | Token-based auth |
| **Language** | TypeScript | Type safety |
| **Testing** | Jest | Unit tests |
| **Deployment** | Docker | Containerization |

---

## Conclusion

This architecture implements the conceptual framework with:

1. **Scalable Input Processing**: Multi-format document ingestion with validation
2. **Intelligent Processing**: AI-powered classification, semantic search, and strategic analysis
3. **Actionable Outputs**: Real-time dashboards, prescriptive insights, and intelligent query responses

The system is designed for:
- **Performance**: Caching, lazy loading, optimized queries
- **Security**: RBAC, JWT authentication, permission layers
- **Maintainability**: Service-oriented architecture, TypeScript, comprehensive testing
- **Extensibility**: Modular design, external service integration, pluggable AI models

**Last Updated**: January 2026
**Version**: 1.0.0
