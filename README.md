# VC Intel

A thesis-first VC intelligence platform with explainable AI enrichment and structured scoring.

---

## What It Does

VC Intel automates startup research by:
- Extracting structured intelligence from company websites
- Scoring companies against your fund thesis (0-100)
- Explaining every score with clear reasoning
- Organizing companies into lists and saved searches

---

## Try It Out

1. Open the Discover page
2. Click "Stripe" or "Vercel"
3. Click "Enrich with AI"
4. View thesis match score and extracted intelligence
5. Add notes, save to list, export CSV

---

## How It Works

The workflow is simple:

1. **Discover** - Search and filter companies
2. **Enrich** - AI extracts intelligence from website
3. **Score** - Automatic thesis matching with explainable breakdown
4. **Organize** - Save to lists, export CSV, save searches

---

## Scoring System

Companies are scored on weighted criteria:

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
- **High**: 4+ signals detected
- **Medium**: 2-3 signals
- **Low**: 0-1 signals

Every score shows its breakdown - no black box.

---

## Tech Stack

- Next.js 14, TypeScript, Tailwind CSS
- OpenAI GPT-4o-mini
- localStorage (MVP)
- Vercel-ready

---

## Setup

```bash
npm install
cp .env.example .env.local
# Add your OpenAI API key to .env.local
npm run dev
```

## Deploy to Vercel

```bash
vercel
```

Add `OPENAI_API_KEY` in Vercel environment variables.

---

## Features

- AI-powered enrichment with caching
- Explainable thesis-based scoring
- Search and filter companies
- Auto-saving notes
- List management and CSV export
- Saved search configurations
- Keyboard shortcuts (`/`, `E`, `S`)
- Dark mode UI

---

## Limitations

- localStorage only (no multi-device sync)
- Mock data (no real database)
- No authentication
- JavaScript-heavy sites may have limited extraction

---

## What's Next

- Database integration (PostgreSQL)
- User authentication
- Real-time enrichment queue
- Multi-source enrichment (LinkedIn, Crunchbase)
- Team collaboration


