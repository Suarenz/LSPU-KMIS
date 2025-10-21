# LSPU KMIS - Refined System Architecture

## High-Level Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        UI[Web Interface<br/>Next.js 15]
        Auth[Authentication<br/>Service]
        State[State Management<br/>Context API]
    end

    subgraph "Service Layer"
        API[API Service<br/>Base & Auth API]
        AuthServ[Authentication<br/>Service]
        Data[Data Service<br/>Planned]
    end

    subgraph "Backend Layer (Future)"
        BAPI[Backend API<br/>REST/GraphQL]
        DB[(Database<br/>PostgreSQL/MongoDB)]
        FS[(File Storage<br/>AWS S3/Cloud)]
        AI[AI Services<br/>NLP & ML]
    end

    subgraph "Integration Layer"
        LMS[University LMS]
        SIS[Student Information<br/>System]
        EXT[External Partners]
    end

    subgraph "Key Features"
        DIR[Document<br/>Repository]
        SRCH[AI-Powered<br/>Search]
        FORUM[Discussion<br/>Forums]
        ANALYTICS[Analytics &<br/>Reporting]
        SEC[Security &<br/>Compliance]
    end

    %% User interactions
    User[End User] --> UI
    
    %% Client layer flow
    UI --> State
    UI --> Auth
    
    %% Service layer flow
    Auth --> AuthServ
    State --> API
    
    %% Backend connections
    API --> BAPI
    BAPI --> DB
    BAPI --> FS
    BAPI --> AI
    
    %% Feature connections
    DIR <--> BAPI
    SRCH <--> AI
    FORUM <--> BAPI
    ANALYTICS <--> DB
    SEC <--> BAPI
    
    %% Integration connections
    BAPI <--> LMS
    BAPI <--> SIS
    BAPI <--> EXT
    
    %% Styling
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef features fill:#e8f5e8
    classDef integrations fill:#fff3e0
    
    class UI,Auth,State frontend
    class BAPI,DB,FS,AI backend
    class DIR,SRCH,FORUM,ANALYTICS,SEC features
    class LMS,SIS,EXT integrations
```

## Core Components Architecture

### 1. User Management & Authentication
```mermaid
graph LR
    A[User] --> B{Authentication}
    B --> C[Admin]
    B --> D[Faculty]
    B --> E[Student]
    B --> F[External Partner]
    
    C --> G[Full Access]
    D --> H[Content Creation & Access]
    E --> I[Content Access Only]
    F --> J[Limited Access]
    
    classDef roles fill:#e3f2fd
    class C,D,E,F roles
```

### 2. Document Management Flow
```mermaid
graph LR
    A[Document Upload] --> B[Validation & Security Check]
    B --> C[Metadata Extraction]
    C --> D[Classification & Tagging]
    D --> E[Storage in Repository]
    E --> F[Search Indexing]
    
    G[Document Request] --> H[Permission Check]
    H --> I[Document Retrieval]
    I --> J[Usage Tracking]
    
    E --> K[Analytics Processing]
    J --> K
    
    classDef process fill:#f1f8e9
    classDef storage fill:#e8f5e8
    class B,C,D,F,H,I,J process
    class E storage
```

### 3. Search & AI Services
```mermaid
graph LR
    A[Search Query<br/>English/Filipino] --> B[Natural Language<br/>Processing]
    B --> C[Multi-field<br/>Search]
    C --> D[Relevance<br/>Ranking]
    D --> E[Results<br/>Presentation]
    
    F[Document Upload] --> G[Content Analysis]
    G --> H[Automatic<br/>Tagging]
    H --> I[Classification<br/>Model]
    I --> J[Recommendation<br/>Engine]
    
    K[User Behavior] --> L[Personalization<br/>Engine]
    L --> M[Custom<br/>Recommendations]
    
    E --> M
    J --> M
    
    classDef ai fill:#fff8e1
    class B,C,D,G,H,I,L ai
```

## Key Process Flows

### 1. Document Access Process
1. User authenticates through authentication service
2. User requests document from repository
3. System checks user permissions
4. Document is retrieved and delivered
5. Access is logged for analytics

### 2. Search Process
1. User enters search query in English/Filipino
2. NLP processes the query
3. Multi-field search across documents and forums
4. Results ranked by relevance
5. Results displayed with filters

### 3. Content Creation Process
1. Authorized user uploads document
2. System validates file type and security
3. Metadata is extracted and classified
4. Document is stored securely
5. Search index is updated

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: React Context API
- **API Communication**: Custom service layer
- **Database**: PostgreSQL/MongoDB (planned)
- **File Storage**: Cloud storage (planned)
- **AI Services**: NLP and ML models (planned)
- **Security**: JWT, RA 10173 compliance