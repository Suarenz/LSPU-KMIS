# QPRO in Repository - Quick Reference

## What Changed?

Documents with QPRO analyses now display the complete analysis **directly below the document preview** in the Repository section.

## Where to Find It

| Location | Path |
|----------|------|
| Repository Section | Navigate → Repository → Click Document Preview |
| Document Preview | Now includes QPRO Analysis section below content |
| Full Analysis | Click "View Full Analysis" button |

## What You'll See

When previewing a document with QPRO analysis:

```
Document Content (PDF/DOCX)
↓
─── QPRO ANALYSIS SECTION ───
├─ Achievement Score
├─ Period Info
├─ KRA Count
├─ Strategic Alignment
├─ Opportunities
├─ Gaps
├─ Recommendations
└─ [View Full Analysis] Button
```

## Key Features

| Feature | What It Shows |
|---------|---------------|
| **Achievement Metrics** | Overall score, period, KRA count |
| **Strategic Alignment** | How document aligns with strategy |
| **Opportunities** | Strategic opportunities identified |
| **Gaps** | Performance gaps to address |
| **Recommendations** | AI-generated action items |
| **Status Badge** | DRAFT or APPROVED status |

## Navigation Options

### From Repository Preview:
1. **Stay on Preview**: Read analysis below document
2. **View Full Analysis**: Click button to go to detailed view
3. **Download Document**: Use download button at top
4. **Return to Repository**: Click close button

### From Full Analysis View:
- All features of the original QPRO analysis page
- Detailed KRA breakdowns
- Individual activity analysis
- Performance recommendations
- Can regenerate insights if KRAs changed

## Use Cases

### Scenario 1: Quick Review
```
User: "Let me check the analysis for this document"
→ Goes to Repository
→ Previews document
→ Reads analysis summary below
→ Done - all info in one place
```

### Scenario 2: Detailed Analysis
```
User: "I need to review this in detail"
→ Goes to Repository
→ Previews document
→ Clicks "View Full Analysis"
→ Reviews complete breakdown
→ Can regenerate if needed
```

### Scenario 3: Document + Context
```
User: "I need to see the actual document AND the analysis"
→ Goes to Repository
→ Document shown at top
→ QPRO analysis shown below
→ Can scroll through both in one session
```

## API Details

### Endpoint
```
GET /api/qpro/by-document/{documentId}
```

### Authentication
Required (Bearer token in Authorization header)

### Response
```json
{
  "analysis": {
    "id": "...",
    "achievementScore": 75.5,
    "status": "APPROVED",
    "alignment": "...",
    "opportunities": "...",
    "gaps": "...",
    "recommendations": "...",
    "kras": [...],
    "activities": [...],
    ...
  }
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No QPRO section visible | Document may not have analysis created yet |
| Can't click buttons | May not have permission - check with admin |
| Analysis looks blank | Try refreshing the page |
| Want to update analysis | Go to QPRO section and regenerate |

## Key Improvements

✨ **Before**: Navigate to QPRO → Find analysis → View  
✨ **Now**: Repository → Preview document → Analysis visible below

✨ **Before**: Lose access when leaving QPRO section  
✨ **Now**: Access analysis anytime while in Repository

✨ **Before**: No context between document and analysis  
✨ **Now**: See both together seamlessly

## Performance Notes

- QPRO analysis loads in background (doesn't block document preview)
- Graceful handling if no analysis exists
- Efficient permission checking
- Cached for repeated access

## Future Enhancements Coming

Potential future additions:
- [ ] Export analysis as PDF
- [ ] Compare document versions with analysis
- [ ] Share analysis directly from preview
- [ ] Analysis comments/notes
- [ ] Real-time analysis updates
