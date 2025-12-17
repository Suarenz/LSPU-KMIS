# Regenerate Insights on KRA Change - Implementation Guide

## Overview
When a reviewer corrects wrong KRA assignments in the Review Modal, they can now regenerate AI insights to match the corrected KRAs.

## How It Works

### 1. **Manual KRA Correction**
- Reviewer opens Review Modal
- Sees activities with potentially wrong KRA assignments
- Changes KRA using dropdown for one or more activities
- Each KRA change is automatically tracked

### 2. **"Regenerate Insights" Button Appears**
- When ANY activity's KRA is changed, a blue info box appears at the bottom
- Shows: "N KRA(s) changed. Click 'Regenerate Insights' to update AI analysis for the corrected KRAs."
- Button is indigo-colored and labeled "Regenerate Insights"

### 3. **Click Regenerate Insights**
- Button shows loading state: "Regenerating..."
- Backend API `/api/qpro/regenerate-insights` is called
- For each changed activity:
  - AI (Gemini) generates NEW insights based on the corrected KRA
  - Generates: aiInsight (1-2 sentence alignment), prescriptiveAnalysis (recommendations)
  - Updates the activity with new AI output

### 4. **Results Display**
- Activities show updated AI Insights section with new content
- Prescriptive Analysis tab shows updated recommendations based on new KRA
- Blue info box disappears (no more changes to regenerate)
- Reviewer can now approve with confidence in the analysis

### 5. **Approve & Commit**
- All KRAs must still be assigned (validation check)
- Approval proceeds with updated insights

## Workflow Example

**Scenario: BSIT Employment Rate Wrong KRA**

1. **Initial State**: 
   - Activity: "BSIT employment or entrepreneurial engagement rate"
   - Wrong KRA: KRA 4 (International Activities)
   - AI Insight: "[Analysis about international linkages]"

2. **Correction**:
   - Reviewer changes KRA to: KRA 3 (Quality and Relevance of Instruction)
   - Blue box appears: "1 KRA(s) changed. Click 'Regenerate Insights'..."
   - Reviewer clicks "Regenerate Insights" button

3. **Regeneration**:
   - Backend calls Gemini with new KRA context
   - Prompt includes: activity name, new KRA (KRA 3), values, achievement rate
   - Gemini generates NEW insights focused on instruction quality

4. **Updated Results**:
   - Activity now shows: "AI Insight: [New analysis about student employment outcomes from quality instruction]"
   - Prescriptive Analysis: [New recommendations for improving instruction quality for employment outcomes]
   - Reviewer can now approve with correct analysis

## Technical Details

### Frontend Changes (`components/qpro/review-qpro-modal.tsx`)
- Added state: `changedKRAIndices` - tracks which activities had KRA changed
- Added state: `isRegenerating` - tracks regeneration in progress
- Updated `handleKRAChange()` - now adds activity index to changedKRAIndices
- Added `handleRegenerateInsights()` - calls API and updates activities
- Added regenerate button in DialogFooter - visible only when changes exist

### Backend Changes (`app/api/qpro/regenerate-insights/route.ts`)
- New POST endpoint at `/api/qpro/regenerate-insights`
- Accepts: `analysisId`, `activities` (array with kraId and other fields)
- For each activity:
  - Creates prompt with KRA context
  - Calls Gemini generation service
  - Parses JSON response
  - Returns regenerated activities
- Authorization: ADMIN and FACULTY only

### API Contract

**Request:**
```json
{
  "analysisId": "string",
  "activities": [
    {
      "name": "string",
      "kraId": "string", 
      "reported": number,
      "target": number,
      "achievement": number,
      "status": "MET" | "MISSED",
      "index": number
    }
  ]
}
```

**Response:**
```json
{
  "activities": [
    {
      "name": "string",
      "kraId": "string",
      "reported": number,
      "target": number,
      "achievement": number,
      "status": "MET" | "MISSED",
      "index": number,
      "aiInsight": "string",
      "prescriptiveAnalysis": "string"
    }
  ]
}
```

## Key Features

✅ **Batch Processing**: Fix multiple KRAs first, then regenerate all at once
✅ **Cost Efficient**: Only regenerates for changed KRAs, not all activities
✅ **Clear Feedback**: Loading states and info messages guide reviewers
✅ **Flexible**: Regenerate multiple times if needed
✅ **Validated**: KRA assignments still required before approval
✅ **Secure**: Authorization check (ADMIN/FACULTY only)

## User Experience Flow

```
Review Modal Opens
     ↓
Reviewer sees activities with KRAs
     ↓
Change KRA(s) → Blue info box appears
     ↓
Click "Regenerate Insights" → Button shows "Regenerating..."
     ↓
Backend calls Gemini for each changed activity
     ↓
Activities updated with new insights
     ↓
Blue info box disappears
     ↓
Reviewer reviews updated analysis
     ↓
Click "Approve & Commit" → Proceeds with correct analysis
```

## Limitations & Future Enhancements

**Current Limitations:**
- Regeneration requires manual button click (not automatic)
- Cannot regenerate individual activities (batch only)
- No history of previous AI outputs

**Future Enhancements:**
1. **Auto-regenerate**: Option to auto-regenerate when KRA changes
2. **Selective Regeneration**: Button to regenerate only a specific activity
3. **Comparison View**: Show old vs new insights side-by-side
4. **Regeneration History**: Track what insights changed and why
5. **Different Models**: Option to use Qwen or other models for regeneration
6. **Confidence Scoring**: Rate how confident the new insights are

---

**Status**: ✅ Implemented and tested
**Files Modified**: 
- `components/qpro/review-qpro-modal.tsx` (frontend)
- `app/api/qpro/regenerate-insights/route.ts` (backend - new)

**Impact**: Reviewers can now correct wrong KRA assignments and immediately regenerate AI analysis to match the corrected context.
