# Pre-Submission Checklist

## Security
- [ ] `.env.local` not in git: `git status | grep ".env.local"` (should be empty)
- [ ] `.env.example` in git: `git ls-files | grep ".env.example"` (should show file)
- [ ] API key in Vercel environment variables

## Testing
- [ ] Build works: `npm run build`
- [ ] Test enrichment on deployed URL
- [ ] Check browser console (no errors)
- [ ] Check Network tab (no API key visible)

## Submission
- [ ] GitHub repo URL
- [ ] Live Vercel URL
- [ ] Brief description (optional)

---

**Ready to submit when all boxes checked.**
