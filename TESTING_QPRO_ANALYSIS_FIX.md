# QPRO Analysis Display - Quick Testing Guide

## Pre-requisites
- Dev server running: `npm run dev` (should be at http://localhost:3000)
- Logged in as ADMIN or FACULTY user

## Test Steps

### Step 1: Navigate to Repository
1. Click on "Repository" in the navigation menu
2. You should see the document list page

### Step 2: Upload a Test Document
1. Click "Upload Document" button
2. Select a QPRO document (PDF or DOCX format)
   - Could be a training report, research document, or any QPRO document
3. Fill in:
   - Title: "Test QPRO Report - Training Activities"
   - Description: "Test document for QPRO analysis"
   - Unit: Select a unit (e.g., "College of Computer Studies")
4. Click "Upload"
5. Wait for upload confirmation

### Step 3: View Document Preview
1. From the document list, click on the newly uploaded document
2. This should open the preview page showing:
   - Document title and metadata
   - File preview (PDF or document content)

### Step 4: Check for QPRO Analysis
**IMPORTANT**: Analysis may take 10-30 seconds to complete in background

1. **Scroll down** on the preview page below the file preview
2. You should see a section titled **"Loading Analysis..."** or analysis results
3. The component will automatically:
   - Try to fetch existing analysis (initial GET request)
   - If none exists, trigger analysis (POST request)
   - Display results once complete

### Step 5: Verify All Analysis Outputs

You should see the following sections (if analysis completes successfully):

#### ✅ Overall Achievement
- Shows a percentage (0-100%)
- Green progress bar showing achievement level
- Example: "85.5%"

#### ✅ Strategic Alignment  
- Text describing how the document aligns with strategic plan
- Multiple paragraphs of analysis

#### ✅ KRA Classification Review
- List of matched KRAs (e.g., "KRA 11: Judicious Management of Human Resources")
- Achievement percentage for each KRA
- Strategic alignment text for each

#### ✅ Structured Data Organization
- Table/list of extracted activities
- For each activity shows:
  - Activity name/description
  - Target value
  - Reported value
  - Achievement percentage
  - Status badge (MET/MISSED)
- Can scroll through if many activities

#### ✅ Strategic Opportunities
- Bullet-point list of identified opportunities

#### ✅ Identified Gaps
- Text describing any gaps or conflicts

#### ✅ Prescriptive Analysis
- Comprehensive analysis text
- Recommendations based on achievement status
- Focus areas for improvement

#### ✅ Recommendations
- Actionable recommendations
- Priority-ordered list

## What Changed

### Before (Without Fix)
- Upload document → No analysis results shown
- Document preview only showed file content
- No KRA classifications displayed
- No achievement metrics shown

### After (With Fix)
- Upload document → Background QPRO analysis starts automatically
- Document preview shows:
  - File content (same as before)
  - **NEW**: Complete QPRO analysis with all outputs below
  - All extracted sections and classifications
  - Achievement metrics and status
  - Prescriptive recommendations

## Troubleshooting

### If Analysis Shows "Loading Analysis..." for >30 seconds
- This is normal - analysis can take time for large documents
- Check browser console (F12) for any errors
- Refresh the page after 30 seconds

### If Analysis Shows Error Message
1. Try clicking "Try Again" button if available
2. Check server logs in terminal running `npm run dev`
3. Look for "[Document Analysis]" or "[QPROAnalysisService]" log messages

### If No Analysis Section Appears
1. Make sure you've scrolled down on the page
2. Refresh the page (F5)
3. Check browser console for JavaScript errors
4. Verify document file type is supported (PDF/DOCX)

## API Endpoints Being Used

The fix uses these new/modified endpoints:

1. **GET `/api/documents/{id}/analyze`**
   - Fetches existing analyses for a document
   - Called automatically by the component

2. **POST `/api/documents/{id}/analyze`**
   - Triggers new QPRO analysis for a document
   - Called if no existing analysis found

3. **Auto-trigger in document upload**
   - `POST /api/documents` (existing)
   - Now automatically triggers analysis in background

## Expected Timeline

1. **Document Upload**: 2-5 seconds
2. **Analysis Trigger**: Immediate (auto-triggered in background)
3. **Analysis Completion**: 10-30 seconds depending on document size
4. **Display in Preview**: Immediate once analysis completes

## Success Criteria

✅ Document uploads successfully
✅ Preview page loads with file content
✅ QPRO Analysis section appears below file content
✅ All analysis outputs are displayed (see Step 5)
✅ Achievement percentage is shown with progress bar
✅ KRA classifications are visible
✅ Extracted activities are listed
✅ Prescriptive analysis and recommendations are shown

---

**Test Duration**: ~5-10 minutes per document
**Recommended**: Test with 2-3 different document types to ensure variety
