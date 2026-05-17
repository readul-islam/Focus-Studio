# Daily Brief Feature - Testing Guide

## Overview

The Daily Brief feature is **frontend-complete** and ready for testing with mock data while the backend API endpoints are being implemented.

## Quick Start: Enable Mock Data Mode

### 1. Set Environment Variable

Add to your `.env.local` file:

```bash
NEXT_PUBLIC_AI_USE_MOCK=true
```

### 2. Restart Development Server

```bash
npm run dev
```

### 3. Visit the Pages

- **Main page**: [http://localhost:3000/ai/daily-brief](http://localhost:3000/ai/daily-brief)
- **Test page**: [http://localhost:3000/ai/daily-brief/test](http://localhost:3000/ai/daily-brief/test)

## Testing Checklist

### Visual Testing

Visit the **test page** (`/ai/daily-brief/test`) to verify:

- ✅ **Compact card** displays correctly (for dashboard integration)
- ✅ **Full card** displays all content properly formatted
- ✅ **Loading states** show skeleton animations
- ✅ **Empty brief** ("calm day") displays without errors
- ✅ **Long brief** (multiple items) is readable and well-formatted
- ✅ **British English** formatting is correct
- ✅ **No em dashes** (—) appear in content
- ✅ **Flowing narrative** style (not bullet points)
- ✅ **Date formatting** uses British locale (dd MMM, HH:mm)

### Functional Testing

Visit the **main page** (`/ai/daily-brief`) to verify:

1. **Initial Load**
   - Page loads without errors
   - Brief displays after ~800ms simulated delay
   - Loading spinner appears during fetch

2. **Regenerate Button**
   - Click "Regenerate" button
   - Button shows loading state (disabled, spinner)
   - New brief generates after ~1.5s delay
   - Success toast appears
   - Content updates with new timestamp

3. **Empty State**
   - If no brief exists, empty state shows
   - "Generate Now" button works
   - After generation, brief displays

4. **Console Checks**
   - No errors in browser console
   - No React warnings
   - Mock action tracking logs appear when enabled

## Mock Data Available

Located in `/lib/ai/mock-data.ts`:

- **`mockDailyBrief`** - Standard brief with 3 items
- **`mockEmptyBrief`** - Calm day with no urgent items
- **`mockLongBrief`** - Busy day with 7 items
- **`mockEmailAnalysis`** - Example email categorization
- **`mockAIActions`** - Example AI activity log entries

## Switching to Real Backend

Once the backend team implements the API endpoints specified in `/AI_BACKEND_REQUIREMENTS.md`:

### 1. Update Environment Variable

```bash
NEXT_PUBLIC_AI_USE_MOCK=false
```

### 2. Verify Backend Endpoints

Ensure these are implemented and accessible:

- `POST /api/ai/daily-brief/generate` - Generate new brief
- `GET /api/ai/daily-brief/latest` - Get latest brief
- `POST /api/ai/daily-brief/track-action` - Track user actions

### 3. Test Backend Integration

```bash
# Test generate endpoint
curl -X POST https://be-stg.focuspilot.io/api/ai/daily-brief/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Test latest endpoint
curl https://be-stg.focuspilot.io/api/ai/daily-brief/latest \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Verify British English Output

Check backend-generated briefs contain:
- ✅ British spellings: "organise", "behaviour", "colour"
- ✅ British phrases: "whilst", "amongst"
- ❌ NO American spellings: "organize", "behavior", "color"
- ❌ NO em dashes (—)
- ✅ Flowing narrative paragraphs (not bullet points)

## Files Created

```
app/ai/daily-brief/
├── page.tsx              # Main brief display page
├── actions.ts            # Server actions (with mock support)
├── test/
│   └── page.tsx          # Component testing page
└── README.md             # This file

components/ai/
└── DailyBriefCard.tsx    # Reusable brief card component

lib/ai/
├── types.ts              # TypeScript type definitions
├── prompts.ts            # AI prompts (British English)
├── mock-data.ts          # Mock data for testing
└── config.ts             # Configuration (mock mode toggle)
```

## Next Steps

1. **Frontend team**: Test with mock data, verify UI/UX
2. **Backend team**: Implement endpoints from `/AI_BACKEND_REQUIREMENTS.md`
3. **Integration**: Switch `NEXT_PUBLIC_AI_USE_MOCK=false` and test
4. **Dashboard integration**: Add `<DailyBriefCard brief={brief} compact />` to main dashboard
5. **Deploy**: Merge `feature/ai-phase-1` branch when ready

## British English Compliance

All mock data uses **British English** as specified:

### Correct Usage (in mock data)
- "I've organised everything by priority"
- "whilst you've been focusing"
- "behaviour is excellent"

### Incorrect Usage (NEVER use)
- ❌ "I've organized everything"
- ❌ "while you've been focusing"
- ❌ "behavior is excellent"
- ❌ Em dashes: "—"

## Known Limitations (Mock Mode Only)

- Brief content doesn't change (uses static mock data)
- User actions aren't persisted
- No real AI generation (uses pre-written content)
- No user context integration

These limitations **only apply in mock mode**. Production mode with real backend will have full functionality.
