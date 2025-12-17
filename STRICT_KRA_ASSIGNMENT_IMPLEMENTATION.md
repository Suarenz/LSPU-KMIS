# Strict Manual KRA Assignment Implementation

## Overview
Implemented strict manual KRA assignment in the Review Modal to prevent KRA misclassifications (like assigning employment metrics to international activity KRA).

## Changes Made to `components/qpro/review-qpro-modal.tsx`

### 1. **KRA Keyword Detection System**
Added `KRA_KEYWORDS` mapping that associates each KRA with relevant keywords:
```typescript
const KRA_KEYWORDS: { [key: string]: string[] } = {
  'KRA 3': ['instruction', 'teaching', 'learning', 'quality', 'student', 'employment', 'graduate'],
  'KRA 4': ['international', 'mou', 'moa', 'global', 'linkage'],
  // ... other KRAs
};
```

This allows the system to detect when an activity name doesn't match the assigned KRA (e.g., activity mentions "employment" but assigned to "international activities" KRA 4).

### 2. **Mismatch Detection Helper**
Added `detectKRAMismatch()` function that:
- Extracts keywords from the activity name
- Checks if they match the selected KRA's keywords
- Returns `true` if no matching keywords are found (mismatch detected)

### 3. **State Management for Validation**
Added two new state variables:
```typescript
const [kraValidationErrors, setKraValidationErrors] = useState<{ [key: number]: string }>({});
const [mismatches, setMismatches] = useState<{ [key: number]: boolean }>({});
```

### 4. **Enhanced KRA Selection Handler**
Updated `handleKRAChange()` to:
- Detect potential mismatches when KRA is changed
- Clear validation errors when a KRA is selected
- Update mismatch state for UI feedback

### 5. **Pre-Approval Validation**
Added `validateKRAAssignments()` function that:
- Checks that ALL activities have a KRA assigned
- Returns `false` if any activity is missing KRA
- Shows error message if validation fails
- **Blocks approval until all KRAs are assigned**

### 6. **Enhanced UI/UX**

#### KRA Selector Improvements:
- **Full-width dropdown** for better visibility
- **Required indicator**: "KRA Assignment *" with red asterisk
- **Error state**: Red border and background when KRA is missing
- **Mismatch warning**: Amber border and "Possible Mismatch" badge when keywords don't align
- **Full KRA titles in dropdown**: Shows complete KRA definition on selection
- **Selected KRA display**: Shows full title below dropdown when selected

#### Visual Feedback:
- **Error messages**: Red text below dropdown if KRA not assigned
- **Mismatch warnings**: Amber badge with AlertTriangle icon
- **Color-coded states**:
  - Red: Validation error (missing KRA)
  - Amber: Possible mismatch detected
  - Normal: Valid assignment

### 7. **Reorganized Form Layout**
- **KRA selector**: Moved to full-width, takes entire row (col-span-3)
- **Data fields**: Reported, Target, Achievement grouped below in 3-column grid
- Better visual hierarchy and clarity

## Features

### ✅ Strict Assignment Enforcement
- KRA assignment is **mandatory** - cannot approve without assigning all KRAs
- Clear error messages guide reviewers

### ✅ Intelligent Mismatch Detection
- Keyword-based system catches common mismatches
- Examples that trigger warnings:
  - "Employment rate" assigned to KRA 4 (International) → **Mismatch detected**
  - "Research publication" assigned to KRA 8 (Community Service) → **Mismatch detected**
  - "BSIT employment" assigned to KRA 3 (Quality of Instruction) → **Match** (employment keyword in KRA 3)

### ✅ Reviewer Guidance
- Full KRA titles visible in dropdown and below selector
- Mismatches highlighted but **still allowed** (reviewer can confirm intentional assignment)
- Prevents accidental wrong KRA selection through UI affordances

### ✅ Data Integrity
- All KRAs must be assigned before approval
- Validation happens at approval time
- Clear error feedback to fix issues

## Workflow

1. **Reviewer opens Review Modal** with activities
2. **For each activity**:
   - Sees activity name clearly
   - Selects KRA from dropdown showing full titles
   - If keywords don't match: amber "Possible Mismatch" badge appears
   - Can confirm intentional mismatch or change KRA
3. **At approval**:
   - System validates all activities have KRA assigned
   - If missing: error message blocks approval
   - Reviewer fixes missing assignments
4. **Approved with confidence**: All KRA assignments explicitly confirmed

## Example Scenarios

### Scenario 1: Employment Rate Misclassification (FIXED)
**Before**: Employment rate auto-assigned to KRA 4 (International) → Undetected error

**After**: 
- Activity: "BSIT employment or entrepreneurial engagement rate"
- Assigned to: KRA 4 (International Activities)
- **Result**: Amber "Possible Mismatch" badge appears
- **Reviewer**: Sees warning and can reassign to KRA 3 (Quality of Instruction)

### Scenario 2: Correct Assignment with Confidence
**Activity**: "Number of MOUs with international universities"
**Assigned to**: KRA 4 (International Activities)
**Result**: No warning (keywords match) ✓

## Implementation Files
- **Modified**: `components/qpro/review-qpro-modal.tsx`
  - Added keyword detection system
  - Added validation logic
  - Enhanced UI/UX for KRA selection
  - Added mismatch detection and warnings

## Future Enhancements
1. **Database-driven KRA Keywords**: Move keyword mappings to database
2. **Auto-suggestion**: Suggest most likely KRA based on activity name
3. **Bulk Re-assignment**: Allow bulk fix of mismatches
4. **Audit Trail**: Log all KRA assignments and changes
5. **Customizable Thresholds**: Admin can adjust keyword matching sensitivity

---

**Status**: ✅ Implemented and tested
**Component**: Review QPro Modal
**Impact**: Prevents KRA misclassifications while maintaining flexibility for intentional assignments
