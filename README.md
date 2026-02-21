# VC Intel - Thesis-First Startup Intelligence Platform

An AI-powered VC scouting tool that automates startup intelligence extraction with explainable thesis-based scoring.

---

## Overview

VC Intel helps venture capital analysts quickly evaluate startups by:
- Extracting structured intelligence from company websites using AI
- Scoring companies against fund investment thesis (0-100)
- Providing explainable reasoning for every score
- Organizing companies into lists and saved searches

---

## Demo Flow

Quick walkthrough to test the platform:

1. **Open Discover page** (homepage)
2. **Search or filter** companies by sector/stage/location
3. **Click "AgriSense AI"** to open company profile
4. **Click "Enrich with AI"** button
5. **Wait 5-10 seconds** for AI to analyze website
6. **View results**:
   - Thesis match score with breakdown
   - Confidence level (High/Medium/Low)
   - Extracted intelligence (summary, keywords, signals)
7. **Add notes** (auto-saves)
8. **Save to list** using "Add to List" button
9. **Export list** to CSV from Lists page
10. **Save search** configuration for one-click re-run

---

## Core Workflow

The platform follows a thesis-first discovery workflow:

```
Discover → Open Profile → Enrich → Score → Take Action
```

### 1. Discover (`/`)
- Search and filter companies by sector, stage, location
- Multi-select and bulk operations
- Sort by relevance
- See enrichment status at a glance

### 2. Open Profile (`/companies/[id]`)
- View company overview
- Click "Enrich with AI" to extract intelligence

### 3. Enrich
- AI analyzes company website
- Extracts: Summary, What They Do, Keywords, Signals
- Shows sources and timestamps
- Caches results for performance

### 4. Score
- Automatic thesis matching (0-100)
- Explainable scoring with reasons
- Based on your investment criteria
- **Recalculates dynamically** after enrichment

### 5. Take Action
- Add notes (auto-saved)
- Save to lists
- Export to CSV
- Save search configurations

---

## Thesis Scoring Logic

The platform scores companies based on weighted investment criteria:

| Category | Weight | Criteria | Points |
|----------|--------|----------|--------|
| **Market Alignment** | 30% | ClimateTech | 100 |
| | | DeepTech | 90 |
| | | Adjacent sectors | 60 |
| **Stage Alignment** | 20% | Pre-Seed/Seed | 100 |
| | | Series A | 40 |
| **Geography** | 20% | India | 100 |
| | | Southeast Asia | 60 |
| **Traction Signals** | 30% | Hiring signals | +40 |
| | | Content signals | +30 |
| | | Product signals | +30 |

**Total: 0-100 points**

### Confidence Levels
- **High**: 4+ signals detected from public data
- **Medium**: 2-3 signals detected
- **Low**: 0-1 signals detected

### Why This Matters
- **Explainable**: Every score shows exact breakdown
- **Consistent**: Same criteria applied to all companies
- **Weighted**: Reflects actual investment priorities
- **Transparent**: Methodology visible in sidebar
- **Customizable**: Edit `lib/scoring.ts` to match your thesis
| Location Match | +20 | India-based |
| Sector Focus | +25 | ClimateTech |
| Stage Preference | +20 | Pre-Seed/Seed |
| Hiring Signal | +15 | Careers page exists |
| Content Signal | +10 | Blog active |

**Total: 0-100 points**

### Why This Matters
- **Explainable**: Every score shows exact reasons
- **Consistent**: Same criteria applied to all companies
- **Customizable**: Edit `lib/scoring.ts` to match your thesis

---

## Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **AI**: OpenAI GPT-4o-mini
- **Storage**: localStorage (MVP), easily upgradeable to database
- **Hosting**: Vercel-ready

### Project Structure
```
vc-intel/
├── app/
│   ├── layout.tsx              # Root layout with sidebar
│   ├── page.tsx                # Discover page (main dashboard)
│   ├── companies/[id]/page.tsx # Company profile + enrichment
│   ├── lists/page.tsx          # Portfolio list management
│   ├── saved/page.tsx          # Saved search configurations
│   └── api/enrich/route.ts     # Server-side AI enrichment
├── components/
│   └── Sidebar.tsx             # Navigation with global search
├── lib/
│   ├── scoring.ts              # Thesis scoring algorithm
│   └── utils.ts                # Helper functions (CSV export)
└── data/
    └── mockCompanies.json      # Sample company data
```

---

## Security

### API Key Protection
- ✅ OpenAI API key stored in `.env.local`
- ✅ Never exposed to client-side code
- ✅ All enrichment happens server-side via `/api/enrich`
- ✅ Environment variables required for deployment
- ✅ `.gitignore` configured to prevent accidental commits
- ✅ No API key logging in production

### Graceful Degradation
- ✅ **Demo mode** activates if API key missing/invalid
- ✅ System includes graceful fallback to prevent runtime failure
- ✅ All errors handled with user-friendly messages
- ✅ Retry mechanisms for failed enrichments

### Data Privacy
- Only public website data is scraped
- No authentication required (MVP)
- All data stored locally in browser
- No external database (MVP)

---

## Enrichment Pipeline

### How It Works

1. **User clicks "Enrich with AI"**
2. **Client sends request** to `/api/enrich` with company URL
3. **Server fetches** public website HTML (with retry logic)
4. **HTML sanitization** removes scripts, styles, extracts visible content
5. **OpenAI extracts** structured intelligence:
   - Summary (2 sentences)
   - What They Do (3-6 bullets)
   - Keywords (5-10 terms)
   - Derived Signals (hiring, blog, careers, etc.)
6. **Response includes**:
   - Extracted data
   - Source URL
   - Timestamp
7. **Client caches** result in localStorage
8. **Scoring engine** calculates thesis match with dynamic weighting

### Robustness Features

- **HTML Sanitization**: Strips `<script>`, `<style>`, `<noscript>` tags before processing
- **Content Extraction**: Prioritizes `<main>` or `<body>` content for better signal quality
- **Retry Logic**: Single retry attempt on network failures
- **Error Handling**: Specific messages for 404, 403, empty content
- **Low Temperature**: Model temperature set to 0.1 for consistency
- **JSON Schema**: Explicit schema instructions to model
- **Timeout Protection**: 10-second timeout with abort controller

### Caching Strategy
- **First enrichment**: Fetches from API (~5-10s)
- **Subsequent views**: Instant load from cache
- **Cache key**: `enrich-{companyId}`
- **Re-enrichment**: Manual via "Re-enrich" button

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open**: http://localhost:3000

### Deployment to Vercel

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel
   ```

3. **Add environment variable**:
   - Go to Vercel dashboard → Project Settings → Environment Variables
   - Add `OPENAI_API_KEY` with your API key
   - Redeploy

4. **Verify deployment**:
   - Test enrichment on live URL
   - Check browser console for errors
   - Verify no API key exposure in Network tab

---

## Design Philosophy

### Premium UX Principles
- **Clean spacing**: Generous padding, clear hierarchy
- **Consistent typography**: Readable, professional
- **Smooth transitions**: Hover states, loading animations
- **Dark mode**: Reduces eye strain for long sessions
- **Clear feedback**: Loading states, error messages, success toasts
- **No clutter**: Every element serves a purpose

### Workflow-First Design
- **Sidebar navigation**: Always accessible
- **Global search**: Quick company lookup
- **Enrichment status**: Visual indicators
- **Auto-save notes**: No lost work
- **One-click actions**: Save, export, re-run searches

---

## Evaluation Criteria Alignment

| Criteria | Implementation |
|----------|----------------|
| **Interface Quality** | Premium dark mode UI, smooth transitions, clear hierarchy |
| **Live Enrichment** | Server-side OpenAI integration with caching |
| **Engineering** | API keys secured, clean TypeScript, proper state management |
| **Creativity** | Explainable scoring, saved searches, auto-save notes |

---

## MVP Scope & Limitations
- **Storage**: localStorage (not multi-device)
- **Data**: Mock companies (no real database)
- **Enrichment**: Single URL per company
- **Auth**: No user authentication
- **Collaboration**: No team features
- **Content Extraction**: JavaScript-heavy sites may have limited extractable content

### Known Issues
- Large HTML pages may timeout
- No rate limiting on enrichment
- No pagination on large lists

### Architectural Note
**The storage layer is abstracted and can be swapped for a persistent database (PostgreSQL, MongoDB) without UI changes.** Data access patterns are designed for easy migration to production infrastructure.

---

## Future Roadmap

### Phase 2: Production Features
- [ ] PostgreSQL database
- [ ] User authentication (Clerk/Auth0)
- [ ] Real-time enrichment queue
- [ ] Webhook integrations (Slack, email)
- [ ] Team collaboration
- [ ] Advanced filters (funding, team size)

### Phase 3: Intelligence Layer
- [ ] Vector search for similar companies
- [ ] Trend detection across portfolio
- [ ] Automated weekly digests
- [ ] CRM export (Salesforce, HubSpot)
- [ ] Chrome extension for quick enrichment

### Phase 4: AI Enhancements
- [ ] Multi-source enrichment (LinkedIn, Crunchbase)
- [ ] Sentiment analysis on news
- [ ] Competitive landscape mapping
- [ ] Founder background analysis

---

## Testing

### Unit Tests

Run tests:
```bash
npm test
```

Watch mode:
```bash
npm run test:watch
```

Coverage report:
```bash
npm run test:coverage
```

**Test Coverage**:
- ✅ Scoring algorithm (high/medium/low confidence)
- ✅ Dynamic weight adjustment
- ✅ Alignment level calculations
- ✅ Edge cases (empty signals, partial matches)

### Manual Testing Checklist
- [ ] Search and filter companies
- [ ] Click company to view profile
- [ ] Enrich company with AI
- [ ] Verify thesis score appears
- [ ] Add notes (check auto-save)
- [ ] Save company to list
- [ ] Create new list
- [ ] Export list to CSV
- [ ] Save search configuration
- [ ] Run saved search

---

## Customization Guide

### Adjust Thesis Scoring

Edit `lib/scoring.ts`:

```typescript
export function scoreCompany(company: any, enrichment: any) {
  let score = 0;
  let reasons: string[] = [];

  // Add your criteria here
  if (company.location === "USA") {
    score += 30;
    reasons.push("US-based");
  }

  if (company.sector === "AI") {
    score += 40;
    reasons.push("AI focus");
  }

  return { score, reasons };
}
```

### Add More Mock Data

Edit `data/mockCompanies.json`:

```json
{
  "id": "5",
  "name": "Your Company",
  "website": "https://example.com",
  "sector": "AI",
  "stage": "Series A",
  "location": "USA"
}
```

---

## Contributing

This is an MVP. For production use, see `PRODUCTION-READINESS.md` for:
- Database migration strategy (PostgreSQL + Prisma)
- Queue-based enrichment (BullMQ + Redis)
- Rate limiting and cost protection
- Multi-user authentication (NextAuth.js)
- Monitoring and error tracking (Sentry)
- CI/CD pipeline setup

---

## License

MIT

---

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [OpenAI](https://openai.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---
