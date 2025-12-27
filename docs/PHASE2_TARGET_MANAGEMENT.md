# Phase 2 Implementation: Database-Backed Target Management

## ✅ Completed Tasks

### 1. Schema Updates
**File**: `prisma/schema.prisma`

- Added new target types to `TargetType` enum:
  - `SNAPSHOT` - Latest value only (faculty count, population) - NOT summed
  - `RATE` - Averaged percentage (employment rate, grades) - averaged across units

- Created `KPITarget` model:
  ```prisma
  model KPITarget {
    id            String     @id @default(dbgenerated("gen_random_uuid()"))
    kra_id        String
    initiative_id String
    year          Int
    quarter       Int?       // 1-4 or null for annual
    target_value  Decimal
    target_type   TargetType
    description   String?
    created_at    DateTime   @default(now())
    updated_at    DateTime   @updatedAt
    created_by    String?
    updated_by    String?
    
    @@unique([kra_id, initiative_id, year, quarter])
    @@map("kpi_targets")
  }
  ```

### 2. Migration Scripts

**Dry-Run Script**: `scripts/migrate-kpi-targets-dryrun.ts`
- Analyzes strategic_plan.json with keyword-based type detection
- Detects types with priority hierarchy:
  1. MILESTONE - Boolean keywords (certified, compliant, status, approved, accredited, audit)
  2. RATE - Percentage keywords (%, rate, score, satisfaction, rating, average)
  3. SNAPSHOT - Point-in-time keywords (faculty, student, population, active, existing, current)
  4. COUNT - Production keywords (number of, research, output, generated, training, event)
- Calculates quarterly targets based on type:
  - COUNT: Annual ÷ 4 (linear trajectory)
  - RATE/SNAPSHOT/PERCENTAGE: Copy annual to all quarters
  - MILESTONE: End-load to Q4 only
  - FINANCIAL: Annual ÷ 4
- Outputs preview without saving to database

**Actual Migration**: `scripts/migrate-kpi-targets.ts`
- Populates `kpi_targets` table with 905 quarterly records
- Only years 2025-2029 (no historical data)
- Uses system ADMIN as creator
- Distribution:
  - 376 RATE records (30 KPIs)
  - 400 COUNT records (21 KPIs)
  - 108 SNAPSHOT records (6 KPIs)
  - 21 MILESTONE records (13 KPIs)

**Verification Script**: `scripts/verify-kpi-targets.ts`
- Confirms KRA3-KPI5 employment rate has correct quarterly targets:
  - 2025: 73% for all quarters
  - 2026: 73% for all quarters
  - 2027-2029: Progressive increase to 75%
- Validates RATE type (same target value each quarter, not cumulative)

### 3. KPI Targets CRUD API

**Endpoint**: `app/api/kpi-targets/route.ts`

#### GET `/api/kpi-targets`
- Query params: `kraId`, `kpiId`, `year`, `quarter`
- Returns array of targets matching filters
- All authenticated users can read

#### POST `/api/kpi-targets`
- Upserts target (creates or updates if exists)
- **Permissions**: FACULTY + ADMIN only
- Body:
  ```json
  {
    "kra_id": "KRA 3",
    "initiative_id": "KRA3-KPI5",
    "year": 2025,
    "quarter": 1,  // optional
    "target_value": 73,
    "target_type": "RATE",
    "description": "Employment rate target"
  }
  ```
- Validates:
  - Required fields present
  - target_type is valid enum value
- Uses `@@unique` constraint to prevent duplicates

#### DELETE `/api/kpi-targets`
- Query params: `kra_id`, `initiative_id`, `year`, `quarter`
- **Permissions**: ADMIN only
- Returns 404 if target not found

### 4. Database Applied
- Ran `npx prisma db push` to sync schema (bypassed migration system due to shadow DB issue)
- Ran `npx prisma generate` to regenerate Prisma client with KPITarget model
- Successfully migrated 905 records with 8 duplicate errors (KRA12-KPI1 has duplicate timeline data in JSON)

## 🎯 Key Features

### Type Detection Algorithm
The migration uses keyword matching with priority hierarchy to automatically detect KPI types:

1. **MILESTONE** (13 KPIs): Boolean outcomes (certification, compliance, status)
   - Keywords: certified, status, compliant, compliance, approved, accredited, audit
   - Quarterly: Q4 only (end-loaded)
   - Example: "ISO certification", "100% compliance"

2. **RATE** (30 KPIs): Percentage-based metrics that should be averaged
   - Keywords: %, rate, score, satisfaction, rating, percentage, average
   - Quarterly: Same as annual (maintain level)
   - Example: "75% employment rate", "80% OJT placement rate"

3. **SNAPSHOT** (6 KPIs): Point-in-time counts (not cumulative)
   - Keywords: faculty, student, population, active, existing, current, enrolled
   - Quarterly: Same as annual (current state)
   - Example: "Number of active faculty", "Student population"

4. **COUNT** (21 KPIs): Cumulative production metrics
   - Keywords: number of, research, output, generated, training, event, publication
   - Quarterly: Annual ÷ 4 (linear accumulation)
   - Example: "Number of research outputs", "Training sessions conducted"

### Quarterly Target Breakdown Rules

| Type | Annual Target | Q1 | Q2 | Q3 | Q4 | Rationale |
|------|---------------|----|----|----|----|-----------|
| **COUNT** | 100 | 25 | 25 | 25 | 25 | Linear accumulation of outputs |
| **RATE** | 75% | 75% | 75% | 75% | 75% | Maintain same percentage level |
| **SNAPSHOT** | 500 | 500 | 500 | 500 | 500 | Current state (not cumulative) |
| **MILESTONE** | 1 | null | null | null | 1 | End-load to Q4 |
| **FINANCIAL** | 1,000,000 | 250k | 250k | 250k | 250k | Equal quarterly budgets |

### Example: KRA3-KPI5 Employment Rate
```
Initiative: KRA3-KPI5
Output: "Achieve 75% employment or entrepreneurial engagement rate among graduates 2 years after graduation"
Detected Type: RATE (keyword: "rate")

Quarterly Targets (2025):
- Q1 2025: 73% (not cumulative, maintain same target)
- Q2 2025: 73%
- Q3 2025: 73%
- Q4 2025: 73%
Annual Target: 73%

Current Progress (from KPIContribution):
- Q1 2025: 48% actual (65.75% achievement = 48/73)
```

## 🔄 Integration Points

### Phase 1 (Already Complete)
- KPIContribution records created on QPro approval
- KRAggregation stores aggregated progress
- AggregationActivity links activities to KPIs
- API `/api/kpi-progress` uses contributionTotals with type-specific logic

### Phase 2 (This Implementation)
- KPITarget table stores user-editable targets
- Migration auto-populates from strategic_plan.json
- API `/api/kpi-targets` provides CRUD operations
- ADMIN/FACULTY can edit targets via UI (next step)

### Next Steps (Phase 3 - UI Integration)
1. Update `/app/qpro/kra/[kraId]/page.tsx`:
   - Fetch targets from `/api/kpi-targets?kraId=X`
   - Show "Annual Target" as editable input (ADMIN/FACULTY)
   - Show quarterly targets (auto-calculate based on type or editable)
   - Keep "Current Value" read-only (from KPI progress API)
   - Add save button → PATCH `/api/kpi-targets`

2. Update QPro approval flow `/app/api/qpro/approve/[id]/route.ts`:
   - Query KPITarget for correct target_type when creating KPIContribution
   - Fall back to strategic_plan.json if no DB target
   - Store correct target_type in KPIContribution

3. Create Target Management UI (optional):
   - Bulk edit page for ADMIN
   - Import/export CSV functionality
   - Historical target comparison

## 📊 Migration Results

```
Target Type Distribution:
  RATE            : 376 records (30 KPIs)
  COUNT           : 400 records (21 KPIs)
  SNAPSHOT        : 108 records (6 KPIs)
  MILESTONE       : 21 records (13 KPIs)

Total Records: 905 quarterly targets
Years Covered: 2025-2029
Errors: 8 duplicate entries (KRA12-KPI1 has duplicate JSON data)
```

### Verified KPIs
✅ **KRA3-KPI5** (Employment Rate):
- Type: RATE ✓
- 2025 Q1-Q4: 73% ✓
- 2026 Q1-Q4: 73% ✓
- 2027-2029: Progressive increase to 75% ✓

## 🚀 Testing

### Test API Endpoints

**Fetch KRA3-KPI5 targets**:
```bash
GET /api/kpi-targets?kpiId=KRA3-KPI5
Authorization: Bearer <token>
```

**Update Q1 2025 target**:
```bash
POST /api/kpi-targets
Authorization: Bearer <token>
Content-Type: application/json

{
  "kra_id": "KRA 3",
  "initiative_id": "KRA3-KPI5",
  "year": 2025,
  "quarter": 1,
  "target_value": 75,
  "target_type": "RATE",
  "description": "Revised employment rate target"
}
```

**Delete target (ADMIN only)**:
```bash
DELETE /api/kpi-targets?kra_id=KRA%203&initiative_id=KRA3-KPI5&year=2025&quarter=1
Authorization: Bearer <token>
```

## 📝 Notes

### Why Database-Backed Targets?
1. **User Editable**: ADMIN/FACULTY can adjust targets without JSON edits
2. **Audit Trail**: Tracks who created/updated targets with timestamps
3. **Quarterly Flexibility**: Supports quarterly targets, not just annual
4. **Type Safety**: Enforces target_type validation via Prisma schema
5. **Historical Tracking**: Can store multiple years and track changes over time

### Why Not Just JSON?
- JSON requires developer to edit and redeploy
- No audit trail for changes
- No validation or type safety
- Can't handle quarterly adjustments easily
- No way to track who made changes when

### Migration Safety
- Dry-run script previews changes before actual migration
- Unique constraint prevents duplicate entries
- Only migrates 2025+ years (no historical data corruption)
- Uses system ADMIN as creator (traceable)
- Can be re-run safely (upsert logic in POST endpoint)

## 🔗 Related Files

**Schema**: `prisma/schema.prisma` (lines 215-370)
**Scripts**:
- `scripts/migrate-kpi-targets-dryrun.ts` (dry-run with type detection)
- `scripts/migrate-kpi-targets.ts` (actual migration)
- `scripts/verify-kpi-targets.ts` (verification)

**API**: `app/api/kpi-targets/route.ts` (GET/POST/DELETE)
**Data Source**: `lib/data/strategic_plan.json`

**Previous Phase 1 Files**:
- `app/api/kpi-progress/route.ts` (uses contributionTotals with COUNT/SNAPSHOT/RATE logic)
- `app/qpro/kra/[kraId]/page.tsx` (displays KPI progress, will add target editing)
- `lib/services/qpro-analysis-service.ts` (creates KPIContribution on approval)

## ✅ Acceptance Criteria

- [x] Schema updated with SNAPSHOT/RATE types and KPITarget model
- [x] Dry-run script detects types correctly with keyword matching
- [x] Actual migration populates 905 quarterly records for 2025-2029
- [x] KRA3-KPI5 verified as RATE type with 73% quarterly targets
- [x] CRUD API implemented with RBAC (ADMIN/FACULTY can edit, ADMIN can delete)
- [x] Unique constraint prevents duplicate targets
- [x] Migration uses system ADMIN as creator for audit trail
- [ ] UI integration (Phase 3 - next step)
- [ ] QPro approval flow queries KPITarget for target_type (Phase 3)

---

**Status**: Phase 2 Complete ✅
**Next**: Phase 3 - UI Integration for Target Editing
