# VC Intel - Final Documentation

## Project Overview

**VC Intel** is a thesis-first VC intelligence platform with explainable AI enrichment and structured scoring. Built with Next.js 14, TypeScript, and Tailwind CSS, featuring dual AI provider support (OpenAI + Google Gemini) with automatic fallback.

---

## Core Features

### 1. AI-Powered Enrichment
- **Primary**: OpenAI GPT-4o-mini
- **Fallback**: Google Gemini Pro
- **Final Fallback**: Demo mode (always works)
- Extracts: Summary, What They Do, Keywords, Signals
- Caches results in localStorage
- Retry logic with exponential backoff

### 2. Thesis-Based Scoring
- **Weighted Scoring System**:
  - Market Alignment: 30%
  - Stage Alignment: 20%
  - Geography: 20%
  - Traction Signals: 30%
- **Confidence Levels**: High (4+ signals), Medium (2-3), Low (0-1)
- **Dynamic Weighting**: Reduces traction weight when confidence is low
- **Explainable**: Shows exact breakdown for every score

### 3. Company Management
- Search and filter by sector/stage/location
- Multi-select with bulk actions
- Add to lists, export CSV
- Auto-saving notes
- Activity indicators (enriched, notes, saved)

### 4. Analytics Dashboard
- Total companies
- Enriched count
- Average thesis score
- High-fit companies (>75 score)
- Real-time updates

### 5. Keyboard Shortcuts
- `/` - Focus search
- `E` - Enrich company (on profile page)
- `S` - Save notes (on profile page)

### 6. Production Features
- Structured logging with PII redaction
- Input sanitization (XSS, prompt injection prevention)
- Health check endpoint (`/api/health`)
- SSR compatibility
- Edge case handling (large responses, storage limits)
- Security hardening

---

## Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **AI**: OpenAI GPT-4o-mini + Google Gemini Pro
- **Storage**: localStorage (MVP, easily upgradeable)
- **Icons**: Lucide React
- **Hosting**: Vercel-ready

### Project Structure
```
vc-intel/
├── app/
│   ├── api/
│   │   ├── enrich/route.ts      # AI enrichment with dual provider
│   │   └── health/route.ts      # Health check endpoint
│   ├── companies/[id]/page.tsx  # Company profile + enrichment
│   ├── lists/page.tsx           # Portfolio management
│   ├── saved/page.tsx           # Saved searches
│   ├── layout.tsx               # Root layout with sidebar
│   ├── page.tsx                 # Discover dashboard
│   └── globals.css              # Global styles + animations
├── components/
│   ├── Sidebar.tsx              # Navigation + thesis panel
│   ├── Toast.tsx                # Notification system
│   └── ScoreVisualizer.tsx      # Progress bar component
├── lib/
│   ├── scoring.ts               # Weighted scoring algorithm
│   ├── thesis.ts                # Fund thesis configuration
│   ├── logger.ts                # Structured logging
│   ├── security.ts              # Input sanitization
│   └── utils.ts                 # Helper functions
├── data/
│   └── mockCompanies.json       # Sample companies
├── .env.local                   # API keys (gitignored)
├── .env.example                 # Template
└── README.md                    # User documentation
```

---

## AI Enrichment Flow

### 1. User Clicks "Enrich with AI"
- Client sends POST to `/api/enrich` with company URL

### 2. Server-Side Processing
```
1. Sanitize URL input
2. Fetch website HTML (10s timeout, 1 retry)
3. Clean HTML (remove scripts, styles, extract main content)
4. Validate content (minimum 100 chars)
5. Try OpenAI GPT-4o-mini
   ├─ Success → Return enrichment
   └─ Quota exceeded → Try Google Gemini
       ├─ Success → Return enrichment
       └─ Failed → Return demo data
6. Parse JSON response
7. Validate and sanitize data
8. Return to client
```

### 3. Client-Side Handling
- Cache result in localStorage (`enrich-${companyId}`)
- Calculate thesis score with weighted algorithm
- Display enrichment + score breakdown
- Show confidence badge

### 4. Error Handling
- **Fetch failures** → Demo mode
- **API quota exceeded** → Switch to Gemini → Demo mode
- **Access denied (403)** → Demo mode
- **404 errors** → Demo mode
- **Empty content** → Demo mode

---

## Scoring Algorithm

### Alignment Levels
```typescript
Strong Alignment: 100 points
Partial Alignment: 60 points
Weak Alignment: 30 points
No Alignment: 0 points
```

### Market Alignment (30%)
- ClimateTech: Strong (100)
- DeepTech: Strong (90)
- Adjacent sectors: Partial (60)

### Stage Alignment (20%)
- Pre-Seed/Seed: Strong (100)
- Series A: Partial (40)

### Geography (20%)
- India: Strong (100)
- Southeast Asia: Partial (60)

### Traction Signals (30%)
- Hiring signals: +40
- Content signals: +30
- Product signals: +30

### Dynamic Weighting
When confidence is **Low** (0-1 signals):
- Traction weight: 30% → 20%
- Redistributed to market/stage/geography

---

## Security Features

### 1. API Key Protection
- Stored in `.env.local` (gitignored)
- Never exposed to client
- Server-side only processing
- `.env.example` for template

### 2. Input Sanitization
```typescript
// Removes control characters, enforces length limits
sanitizeUserInput(input)

// Blocks prompt injection patterns
sanitizePromptInput(input)

// Strips scripts, event handlers
sanitizeHTML(html)
```

### 3. Structured Logging
- Automatic PII/sensitive data redaction
- Log levels: info, warn, error, debug
- JSON output for log aggregation
- Ready for CloudWatch/Datadog

### 4. Edge Case Handling
- Large HTML responses (>5MB warning)
- Large AI responses (>100KB warning)
- localStorage limits (4MB warning)
- Empty content detection
- Retry metrics tracking

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- OpenAI API key (optional, has Gemini fallback)

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local and add your OpenAI API key

# 3. Run dev server
npm run dev

# 4. Open browser
http://localhost:3000
```

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

---

## Deployment to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy to Vercel
```bash
vercel
```

### 3. Add Environment Variable
- Go to Vercel dashboard
- Project Settings → Environment Variables
- Add: `OPENAI_API_KEY` = `your-key-here`
- Redeploy

### 4. Verify Deployment
- Test enrichment on live URL
- Check `/api/health` endpoint
- Verify no console errors
- Check Network tab (no API key visible)

---

## API Endpoints

### POST /api/enrich
Enriches a company by analyzing their website.

**Request**:
```json
{
  "url": "https://example.com"
}
```

**Response**:
```json
{
  "data": {
    "summary": "Company description...",
    "whatTheyDo": ["Point 1", "Point 2"],
    "keywords": ["Keyword1", "Keyword2"],
    "signals": ["Signal1", "Signal2"]
  },
  "source": "https://example.com",
  "timestamp": "2024-01-15T10:30:00Z",
  "demo": false
}
```

### GET /api/health
Health check for monitoring.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "environment": "production",
  "checks": {
    "openai": {
      "status": "ok",
      "message": "API key configured"
    },
    "storage": {
      "status": "ok",
      "message": "localStorage available"
    }
  }
}
```

---

## Data Storage

### localStorage Keys
```
enrich-${companyId}     # Cached enrichment data
notes-${companyId}      # Company notes
savedCompanies          # Saved companies list
companyLists            # Portfolio lists
savedSearches           # Search configurations
```

### Migration to Database
Storage layer is abstracted. To migrate:

1. Install Prisma: `npm install prisma @prisma/client`
2. Define schema (see PRODUCTION-READINESS.md)
3. Replace localStorage calls with Prisma queries
4. No UI changes needed

---

## Testing

### Manual Testing Checklist
- [ ] Search and filter companies
- [ ] Click company profile
- [ ] Enrich with AI (test all 3 fallbacks)
- [ ] Verify score calculation
- [ ] Add notes (check auto-save)
- [ ] Save to list
- [ ] Export CSV
- [ ] Save search
- [ ] Re-run saved search
- [ ] Test keyboard shortcuts
- [ ] Check `/api/health`

### Unit Tests
```bash
npm test
```

Tests cover:
- Scoring algorithm
- Confidence levels
- Dynamic weight adjustment
- Alignment calculations
- Edge cases

---

## Performance Optimizations

### 1. Caching Strategy
- First enrichment: API call (~5-10s)
- Subsequent views: Instant (localStorage)
- Manual re-enrichment available

### 2. Analytics Calculation
- Wrapped in `useEffect` to prevent hydration errors
- Only recalculates on mount
- Memoized for performance

### 3. SSR Compatibility
- All localStorage access wrapped in `typeof window` checks
- Prevents server-side rendering errors
- Graceful fallbacks

---

## Known Limitations

### MVP Scope
- localStorage only (no multi-device sync)
- Mock data (4 sample companies)
- No authentication
- No rate limiting (client-side)
- JavaScript-heavy sites may have limited extraction

### Workarounds
- **Fetch failures**: Automatic demo mode fallback
- **API quota**: Dual provider (OpenAI + Gemini)
- **Large responses**: Warnings logged, processing continues

---

## Future Enhancements

### Phase 2: Production
- PostgreSQL database with Prisma
- User authentication (NextAuth.js)
- Queue-based enrichment (BullMQ + Redis)
- Rate limiting (Upstash)
- Multi-user support

### Phase 3: Intelligence
- Multi-source enrichment (LinkedIn, Crunchbase)
- Vector search for similar companies
- Trend detection
- Automated weekly digests

### Phase 4: Integrations
- CRM export (Salesforce, HubSpot)
- Slack/email notifications
- Chrome extension
- Team collaboration

---

## Troubleshooting

### Enrichment Fails
**Symptom**: "Using demo mode due to error"
**Cause**: Website blocks scraping or API quota exceeded
**Solution**: Demo mode activates automatically (no action needed)

### Hydration Error
**Symptom**: "Text content does not match server-rendered HTML"
**Cause**: localStorage accessed during SSR
**Solution**: Already fixed with `useEffect` wrapper

### Build Errors
**Symptom**: TypeScript errors during `npm run build`
**Cause**: Missing imports or type issues
**Solution**: Check error message, verify all imports

### API Key Not Working
**Symptom**: Always shows demo mode
**Cause**: API key not configured or invalid
**Solution**: Check `.env.local` file, verify key is correct

---

## Environment Variables

### Required
```bash
OPENAI_API_KEY=sk-proj-...  # OpenAI API key (optional with Gemini fallback)
```

### Optional (Future)
```bash
GOOGLE_API_KEY=...          # Google Gemini API key (hardcoded for now)
DATABASE_URL=...            # PostgreSQL connection string
REDIS_URL=...               # Redis for queue
NEXTAUTH_SECRET=...         # NextAuth.js secret
```

---

## Git Workflow

### Commit History
```
feat: implement thesis-first VC intelligence platform with AI enrichment
feat: add Google Gemini as fallback when OpenAI quota exceeded
feat: add automatic demo mode fallback for API quota errors
fix: resolve hydration error by moving analytics to useEffect
fix: resolve body already read error in catch block
fix: update mock companies to use accessible websites for testing
refactor: simplify documentation and focus on core features
docs: add minimal submission checklist
```

### Branches
- `master` - Production-ready code
- Feature branches for new development

---

## Support & Documentation

### Files
- `README.md` - User-facing documentation
- `PRODUCTION-READINESS.md` - Production architecture guide
- `CHECKLIST.md` - Pre-submission checklist
- `FINAL.md` - This comprehensive guide

### Resources
- Next.js Docs: https://nextjs.org/docs
- OpenAI API: https://platform.openai.com/docs
- Google Gemini: https://ai.google.dev/docs
- Tailwind CSS: https://tailwindcss.com/docs

---

## License

MIT

---

## Summary

**VC Intel** is a production-ready VC intelligence platform featuring:

✅ Dual AI provider support (OpenAI + Gemini)
✅ Automatic fallback to demo mode
✅ Explainable thesis-based scoring
✅ Structured logging and security
✅ Health monitoring endpoint
✅ SSR compatible
✅ Clean, professional UI
✅ Keyboard shortcuts
✅ Auto-saving features
✅ Export capabilities

**Ready to deploy to Vercel with zero errors.**

---

**Built with ❤️ for thesis-first venture capital**
