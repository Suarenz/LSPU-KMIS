# Quick Start: QPRO + Aggregation Integration

## What Changed

The system now calculates achievement metrics **while** generating insights, and displays everything together.

## The Old Way ❌
```
Upload → QPRO Analysis → Store → (Metrics calculated separately, not shown)
```

## The New Way ✅
```
Upload → QPRO Analysis + Aggregation → Store → Display Dashboard with Metrics
```

---

## 3 Steps to Use It

### Step 1: Replace Upload Endpoint

**Change from**:
```typescript
fetch('/api/analyze-qpro', { method: 'POST', body: formData })
```

**Change to**:
```typescript
fetch('/api/qpro-with-aggregation', { method: 'POST', body: formData })
```

### Step 2: Import Results Component

```typescript
import { QPROResultsWithAggregation } from '@/components/qpro-results-with-aggregation';
```

### Step 3: Display Results

```typescript
{results && <QPROResultsWithAggregation results={results} />}
```

---

## What You'll See

### Dashboard Cards (Automatic Calculation)
- **Total KRAs**: 22
- **Met** (green): 15
- **On Track** (blue): 4  
- **Missed** (red): 3
- **Overall**: 82.5%

### 3 Tabs of Information
1. **Strategic Analysis** - AI insights + recommendations
2. **Calculated Metrics** - Achievement % per KRA with progress bars
3. **KRA Details** - Detailed breakdown of each KRA

### Per-KRA Breakdown
```
KRA 3: Research Output
✓ MET - 106.25% Achievement
Reported: 85 | Target: 80 | Achieved: 85
```

---

## Database Gets Updated

When you upload, these tables are populated:
- `qpro_analyses` - Full analysis + insights
- `kra_aggregations` - Calculated metrics
- `aggregation_activities` - Activity links

---

## Example: Training Document

**You upload**: PDF mentioning 12 training sessions  
**System extracts**: Matches to KRA 13 (HR Development)  
**System looks up**: Target = 10 from strategic plan  
**System calculates**: (12/10) × 100 = 120%  
**Dashboard shows**:
- Progress bar at 120%
- Status: ✅ MET (green)
- Message: "Exceeded target by 2 sessions"
- Insight: "Training program successfully completed..."

---

## Files to Update

You only need to update these files in YOUR codebase:

1. **app/qpro/page.tsx** (or wherever QPRO upload happens)
   - Change endpoint to `/api/qpro-with-aggregation`
   - Add component import
   - Display `<QPROResultsWithAggregation results={results} />`

2. Everything else is already created:
   - ✅ API endpoint: `/api/qpro-with-aggregation/route.ts`
   - ✅ Component: `components/qpro-results-with-aggregation.tsx`
   - ✅ Database: Tables already created
   - ✅ Services: Aggregation already integrated

---

## Troubleshooting

### "No metrics showing"
→ Check browser console for errors  
→ Verify response includes `aggregation` object

### "Achievement % looks wrong"
→ Check target type (count, percentage, etc.)  
→ Verify target value in strategic plan for 2025

### "Target not found"
→ Verify KRA ID is exact (e.g., "KRA 3" not "KRA3")  
→ Check initiative ID format (e.g., "KRA3-KPI5")

---

## Testing

Upload a test document with these:
- **Document**: PDF/DOCX mentioning activities
- **Year**: 2025
- **Quarter**: 1

Expected response includes:
```json
{
  "analysis": { /* AI insights */ },
  "aggregation": {
    "metrics": { /* dashboard summary */ },
    "byKra": [ /* detailed per-KRA */ ]
  }
}
```

---

## Done! 

Your QPRO system now automatically:
- ✅ Analyzes documents
- ✅ Calculates achievement metrics
- ✅ Displays both on dashboard
- ✅ Shows targets vs actual comparison
- ✅ Provides AI insights with metrics context

No more separate forms or manual calculations needed!
