# QPro Aggregation - Quick Reference

## 🔒 Three-Layer Defense System

### Layer 1: Entry Validation (Approval API)
**Location**: `app/api/qpro/approve/[id]/route.ts:335-362`

```typescript
// ALWAYS validates target_type before creating KPIContribution
✓ Type check (must be string)
✓ Normalization (lowercase + trim)
✓ Whitelist validation
✓ Logging for audit trail
✓ Throws error if invalid
```

### Layer 2: Processing Validation (KPI Progress API)
**Location**: `app/api/kpi-progress/route.ts:174-202`

```typescript
// Validates EACH contribution during aggregation
✓ Skip corrupted records (graceful degradation)
✓ Warn on target_type mismatch
✓ Detect anomalies (COUNT behaving like SNAPSHOT)
✓ Continue processing despite errors
```

### Layer 3: Anomaly Detection (Summary Logging)
**Location**: `app/api/kpi-progress/route.ts:214-230`

```typescript
// Statistical analysis after aggregation
✓ Count aggregation types
✓ Detect suspicious patterns
✓ Log warnings for manual review
✓ Support proactive monitoring
```

---

## 🧪 Quick Tests

### Run Integrity Test
```bash
npx tsx scripts/test-aggregation-integrity.ts
```

**Expected Output**:
```
✅ Target Type Validation: X total contributions
✅ Target Type Consistency: Y unique KPI/period combinations
✅ COUNT Type Aggregation: Z COUNT-type KPIs
✅ Orphaned Contributions Check: 0 orphaned records
✅ Multi-Unit KPIs: Found N KPIs with multiple unit contributions
📈 Summary: 8/8 tests passed
```

### Quick Database Check
```sql
SELECT initiative_id, target_type, COUNT(*) as count, SUM(value) as total
FROM "KPIContribution"
WHERE year = 2025 AND quarter = 1
GROUP BY initiative_id, target_type
ORDER BY count DESC;
```

---

## 📊 Aggregation Types Reference

| Type | Behavior | Example Use Case |
|------|----------|------------------|
| **COUNT** | Sum all values | Research outputs, trainings, events |
| **SNAPSHOT** | Latest value only | Faculty count, student population |
| **RATE** | Average values | Employment rate, satisfaction scores |
| **PERCENTAGE** | Average values | Completion rates, success rates |
| **MILESTONE** | Latest status | Project completion flags |
| **BOOLEAN** | Latest status | Yes/No achievements |
| **FINANCIAL** | Sum all values | Budget allocations, expenditures |

---

## 🚨 Warning Signs

### ⚠️ Validation Error
```
[Approve API] ⚠️  CRITICAL: Invalid target_type for KRA5-KPI9
```
**Action**: Check strategic_plan.json and KPITarget table

### ⚠️ Type Mismatch
```
[KPI Progress] ⚠️  Target type mismatch: existing="count", current="snapshot"
```
**Action**: Database corruption - run fix script

### ⚠️ Aggregation Anomaly
```
[KPI Progress] ⚠️  COUNT type with 2 contributions but total=5 equals latest=5
```
**Action**: The original bug is back - restart server, check hot-reload

---

## 🔧 Troubleshooting Steps

### Problem: Multi-unit contributions not summing

1. **Check Terminal Logs**:
   ```
   [Approve API] ✓ Validated target_type: "count"
   [KPI Progress] Aggregation types: COUNT=5
   ```

2. **Run Integrity Test**:
   ```bash
   npx tsx scripts/test-aggregation-integrity.ts
   ```

3. **Query Database**:
   ```sql
   SELECT * FROM "KPIContribution"
   WHERE initiative_id = 'KRA5-KPI9' AND year = 2025 AND quarter = 1;
   ```

4. **Check for Warnings**:
   - Search logs for `⚠️`
   - Look for "anomaly", "mismatch", "CRITICAL"

5. **Restart Dev Server** (clears hot-reload state):
   ```bash
   npm run dev
   ```

---

## ✅ Verification Checklist

### After Upload
- [ ] Check approval log for `✓ Validated target_type`
- [ ] Check KPIContribution creation log shows correct target_type
- [ ] Verify dashboard shows expected value

### After Multiple Units Upload
- [ ] Confirm each unit creates separate KPIContribution record
- [ ] Verify sum matches expected total
- [ ] Check no anomaly warnings in logs

### Weekly Health Check
- [ ] Run integrity test script
- [ ] Review last 7 days of logs for warnings
- [ ] Spot-check 2-3 multi-unit KPIs manually

---

## 📚 Related Documentation

- **Full Guide**: [docs/QPRO_AGGREGATION_PREVENTION.md](./QPRO_AGGREGATION_PREVENTION.md)
- **Integration Workflow**: [docs/QPRO_AGGREGATION_WORKFLOW.md](./QPRO_AGGREGATION_WORKFLOW.md)
- **Aggregation Engine**: [docs/AGGREGATION_ENGINE_GUIDE.md](./AGGREGATION_ENGINE_GUIDE.md)

---

## 🎯 Key Principle

> **Always validate target_type at THREE points:**
> 1. When WRITING to database (approval)
> 2. When READING from database (aggregation)
> 3. After PROCESSING (anomaly detection)
>
> This triple-validation ensures corrupted data can never propagate silently.

---

**Emergency Contact**: Check terminal logs → Run test script → Review this guide → Check database directly
