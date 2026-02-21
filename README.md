# VC Intel

A thesis-first VC intelligence platform with secure server-side AI enrichment and explainable scoring.

---

## Demo

https://github.com/user-attachments/assets/your-video-id

---

## What It Does

- Discover startups
- Enrich via server-side AI
- Score against fund thesis
- Organize into lists
- Export CSV

---

## Workflow

Discover → Enrich → Score → Organize

---

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Google Gemini 2.5 Flash
- Server-side API route
- localStorage (MVP)
- Vercel-ready

Enrichment runs through a secure server-side API route. API keys are never exposed to the client.

---

## Setup

```bash
npm install
cp .env.example .env.local
# Add GEMINI_API_KEY
npm run dev
```

---

## Deploy

```bash
vercel
```

Add `GEMINI_API_KEY` in Vercel environment variables.

---

## Limitations

- localStorage only
- Mock data
- No authentication
