# QPro KPI Selection - Developer Quick Reference Card

## 🎯 What Problem Does This Solve?

**Issue**: When changing KRA in QPro review modal, LLM was selecting wrong KPI → wrong target → inflated achievement (e.g., 1584.50%)

**Solution**: Let users explicitly select the correct KPI instead of relying on LLM guessing

---

## 📍 Key Files Modified

### Frontend
**File**: `components/qpro/review-modal.tsx`

```typescript
// Line ~420: State for tracking user-selected KPIs
const [editedKPIs, setEditedKPIs] = React.useState<{ [key: number]: string }>({});

// Line ~555: Handler for KPI selection
const handleKPIChange = (activityIndex: number, newKpiId: string) => {
  setEditedKPIs(prev => ({ ...prev, [activityIndex]: newKpiId }));
};

// Line ~570: Add userSelectedKPI flag to API request
const activitiesForRegen = data.activities.map((act, idx) => ({
  ...act,
  kraId: editedKRAs[idx] || act.kraId,
  initiativeId: editedKPIs[idx] || act.initiativeId,
  userSelectedKPI: !!editedKPIs[idx], // ◀️ NEW
}));

// Line ~840: Conditional KPI selector (shown when KRA changed)
{editedKRAs[index] && editedKRAs[index] !== activity.kraId && (
  <div className="mb-3 p-2 bg-indigo-50 rounded border border-indigo-200">
    {/* KPI selector UI here */}
  </div>
)}
```

### Backend
**File**: `app/api/qpro/regenerate-insights/route.ts`

```typescript
// Line ~323: Check if user explicitly selected a KPI
const userSelectedKPI = (activity as any).userSelectedKPI === true;
let newInitiativeId = activity.initiativeId;

// If user selected a KPI, use it (FAST PATH)
if (userSelectedKPI) {
  console.log(`[Regenerate] Using user-selected KPI: ${newInitiativeId}`);
  // SKIP LLM matching - use initiativeId directly
} else {
  // Fallback to LLM matching (SMART FALLBACK)
  const kpiMatch = await matchActivityToKPI(...);
  newInitiativeId = kpiMatch.initiativeId;
}
```

---

## 🔄 Data Flow

```
User selects KPI in modal
    ↓
editedKPIs[idx] = "KRA3-KPI5"
    ↓
userSelectedKPI = true (flag)
    ↓
API receives request
    ↓
Checks: userSelectedKPI === true?
    ↓
YES: Use explicit KPI, SKIP LLM ⚡
NO: Fallback to LLM matching 🤖
    ↓
Find target from strategic_plan.json
    ↓
Calculate achievement: (Reported / Target) × 100
    ↓
Save to database with correct values ✅
```

---

## 🧪 Testing

### Quick Test Scenario
1. Upload QPro with "Employment Rate" activity (wrong KRA1)
2. Open review modal → sees wrong achievement (1584.50%)
3. Change KRA to KRA3
4. **KPI selector appears** ← NEW!
5. Select KRA3-KPI5 (75% Employment Rate)
6. Regenerate insights
7. **Expected**: Achievement = 102.74%, Status = EXCEEDED ✓

### Test Commands
```bash
# Test that KPI selector appears when KRA changed
npm test -- review-modal -t "KPI selector conditional"

# Test that userSelectedKPI flag is sent
npm test -- review-modal -t "userSelectedKPI flag"

# Test API uses explicit KPI when flag is true
npm test -- regenerate-insights -t "skips LLM with userSelectedKPI"

# Test correct target is retrieved
npm test -- regenerate-insights -t "finds correct target"

# Full integration test
npm test -- regenerate-insights -t "Employment Rate scenario"
```

---

## 📊 State Management

### Frontend State
```typescript
// KRA changes tracking (existing)
const [editedKRAs, setEditedKRAs] = useState<{ [key: number]: string }>({});

// KPI changes tracking (NEW)
const [editedKPIs, setEditedKPIs] = useState<{ [key: number]: string }>({});

// Example state after user actions:
editedKRAs = { 0: "KRA3" }           // User changed activity 0 to KRA3
editedKPIs = { 0: "KRA3-KPI5" }      // User selected KPI for activity 0
changedActivityIds = Set { 0 }        // Activity 0 was changed
```

### API Request Body
```json
{
  "analysisId": "uuid-123",
  "activities": [
    {
      "name": "Employment Rate",
      "reported": 75,
      "kraId": "KRA3",
      "initiativeId": "KRA3-KPI5",
      "userSelectedKPI": true,
      ...
    }
  ]
}
```

---

## 🎨 UI Component Location

**KPI Selector** appears at: `components/qpro/review-modal.tsx` Line ~840

**Visibility Rule**:
```typescript
// Only show if:
// 1. User changed the KRA for this activity
// 2. New KRA is different from original KRA
if (editedKRAs[index] && editedKRAs[index] !== activity.kraId) {
  // Show KPI selector
}
```

**Styling**:
- Background: `bg-indigo-50` (light indigo background)
- Border: `border-indigo-200` (indigo border)
- Text: `text-indigo-700` (dark indigo text)
- Purpose: Visual distinction from KRA selector (slate colors)

---

## 🔐 Error Handling

### Frontend
```typescript
// If strategic plan fails to load:
try {
  const strategicPlan = require('@/src/data/strategic_plan.json');
  // Use data
} catch (error) {
  console.error('Failed to load strategic plan:', error);
  // Show error to user, disable KPI selector
}
```

### Backend
```typescript
// If user didn't select KPI, fallback to LLM:
if (!userSelectedKPI) {
  const kpiMatch = await matchActivityToKPI(...);
  if (!kpiMatch) {
    // Use first KPI in KRA as last resort
    newInitiativeId = kra.initiatives[0].id;
  }
}

// If target not found, log and continue:
const { target } = findTargetFromStrategicPlan(...);
if (target === null) {
  console.log('Target not found, using original:', activity.target);
  finalTarget = activity.target;
}
```

---

## 🚀 Performance Notes

| Scenario | Time | Cost | Accuracy |
|----------|------|------|----------|
| **User selects KPI** | 0ms | $0.00 | 100% |
| **LLM matches KPI** | 1-2s | $0.0015 | ~70% |

### Optimization Tips
- Cache strategic_plan.json in React context to avoid repeated require()
- Debounce KPI selector changes if needed
- Pre-select best LLM match as suggestion for user to accept/override

---

## 🐛 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| KPI selector not showing | `editedKRAs[idx]` not set or equals `activity.kraId` | Check `handleKRAChange()` implementation |
| LLM still matching when user selected | API not checking `userSelectedKPI` flag | Verify flag is being sent and received |
| Wrong target still retrieved | `findTargetFromStrategicPlan()` failing | Check strategic_plan.json structure |
| Old achievement showing in modal | Modal not updating after API | Verify `setAnalysis()` called with new data |
| Strategic plan not loading | Incorrect path or JSON syntax | Check `/src/data/strategic_plan.json` exists |

---

## 📝 Logging for Debugging

### Frontend Logs
```typescript
// In review-modal.tsx
console.log('editedKRAs:', editedKRAs);
console.log('editedKPIs:', editedKPIs);
console.log('Sending activities:', activitiesForRegen);
```

### Backend Logs
```typescript
// In regenerate-insights/route.ts
console.log(`[Regenerate] userSelectedKPI: ${userSelectedKPI}`);
console.log(`[Regenerate] Using user-selected KPI: ${newInitiativeId}`);
console.log(`[Regenerate] Matched to KPI: ${newInitiativeId}`);
console.log(`[Regenerate] Found target: ${target}`);
console.log(`[Regenerate] Achievement: ${achievement.toFixed(2)}%`);
```

---

## 🔍 Code Review Checklist

- [ ] `editedKPIs` state properly initialized
- [ ] `handleKPIChange()` correctly updates state
- [ ] Conditional rendering checks `editedKRAs[index] !== activity.kraId`
- [ ] Strategic_plan.json path is correct
- [ ] KPI dropdown populated from strategic plan
- [ ] `userSelectedKPI: true` only when user selected
- [ ] API checks `userSelectedKPI === true` (not just truthy)
- [ ] LLM fallback still works when flag is false
- [ ] Target lookup uses correct KPI
- [ ] Achievement calculation uses new target
- [ ] No console errors or TypeScript type issues
- [ ] No markdown artifacts in regenerated insights

---

## 📚 Related Files

- **Complete Solution**: `KPI_SELECTION_SOLUTION.md`
- **Test Guide**: `TEST_KPI_SELECTION_FLOW.md`
- **Architecture Diagrams**: `ARCHITECTURE_DIAGRAM_KPI_SELECTION.md`
- **Implementation Status**: `IMPLEMENTATION_STATUS_KPI_SELECTION.md`
- **Strategic Plan**: `src/data/strategic_plan.json` or `strategic_plan.json`

---

## ✅ Success Criteria

✅ KPI selector appears when KRA is changed  
✅ User can select KPI from dropdown  
✅ Selected KPI sent to API with `userSelectedKPI: true`  
✅ API skips LLM when flag is true  
✅ Correct target retrieved for selected KPI  
✅ Achievement calculated correctly  
✅ Status shows EXCEEDED (not inflated 1584%)  
✅ No markdown artifacts in output  
✅ All changes persisted to database  

---

## 🎓 Key Learning: LLM + User Control

**Old Approach**: AI guesses KPI → Error  
**New Approach**: AI suggests + User confirms → Accuracy

This combines the best of both worlds:
- **AI**: Provides fallback matching when needed
- **User**: Makes final decision with domain expertise
- **System**: Respects both intelligence sources

The future of robust AI systems combines algorithmic assistance with explicit human control, rather than fully automated decision-making.
