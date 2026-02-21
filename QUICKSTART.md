# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Add Your OpenAI API Key

Edit `.env.local` and add your key:
```
OPENAI_API_KEY=sk-your-actual-key-here
```

Get a key at: https://platform.openai.com/api-keys

### 2. Run the App

```bash
npm run dev
```

### 3. Open in Browser

Visit: http://localhost:3000

---

## 🎯 Test the Workflow

1. **Discover**: Browse companies on the home page
2. **Filter**: Try filtering by sector or stage
3. **Open Profile**: Click on "AgriSense AI"
4. **Enrich**: Click "Enrich with AI" button
5. **View Score**: See the thesis match score (0-100)
6. **Add Notes**: Write notes (auto-saves)
7. **Save**: Click "Save to List"
8. **Create List**: Go to Lists page and create a portfolio
9. **Save Search**: Go to Saved Searches and save filter criteria

---

## 🎨 Key Features to Showcase

### Discover Page (/)
- ✅ Search by company name
- ✅ Filter by sector, stage
- ✅ Multi-select companies
- ✅ Sort functionality
- ✅ Enrichment status indicators

### Company Profile (/companies/[id])
- ✅ AI-powered enrichment
- ✅ Explainable thesis scoring
- ✅ Summary, keywords, signals
- ✅ Source URLs with timestamps
- ✅ Auto-saving notes
- ✅ Loading & error states

### Lists (/lists)
- ✅ Create custom portfolios
- ✅ Export to CSV
- ✅ Manage multiple lists

### Saved Searches (/saved)
- ✅ Save filter configurations
- ✅ One-click re-run
- ✅ Quick access to frequent searches

---

## 🔧 Customization

### Change Thesis Scoring

Edit `lib/scoring.ts` to match your investment criteria:

```typescript
if (company.sector === "YourSector") {
  score += 30;
  reasons.push("Your reason");
}
```

### Add More Companies

Edit `data/mockCompanies.json`:

```json
{
  "id": "5",
  "name": "New Company",
  "website": "https://example.com",
  "sector": "AI",
  "stage": "Seed",
  "location": "USA"
}
```

---

## 🐛 Troubleshooting

### "Enrichment failed"
- Check your OpenAI API key in `.env.local`
- Ensure you have API credits
- Check the website URL is accessible

### "Module not found"
```bash
npm install
```

### Port already in use
```bash
npm run dev -- -p 3001
```

---

## 📚 Learn More

- Full documentation: See `README.md`
- Architecture: See "Project Structure" in README
- Scoring logic: See `lib/scoring.ts`
- API endpoint: See `app/api/enrich/route.ts`

---

**Ready to scout! 🚀**
