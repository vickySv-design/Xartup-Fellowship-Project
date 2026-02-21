# Level 1 Testing Checklist

## 🧪 Pre-Submission Testing

Run through this checklist before submitting to ensure reliability and safety.

---

## ✅ Core Workflow Test

### 1. Discovery Flow
- [ ] Open app at http://localhost:3000
- [ ] Search for "AgriSense" in search box
- [ ] Filter by sector "ClimateTech"
- [ ] Filter by stage "Pre-Seed"
- [ ] Verify results update correctly
- [ ] Check enrichment status badges appear

### 2. Company Profile
- [ ] Click on "AgriSense AI"
- [ ] Verify all overview cards display correctly
- [ ] Check website link is clickable

### 3. Enrichment Flow
- [ ] Click "Enrich with AI" button
- [ ] Verify loading spinner appears
- [ ] Verify loading message shows: "Fetching public website..."
- [ ] Verify loading message changes to: "Extracting intelligence..."
- [ ] Wait for enrichment to complete
- [ ] Verify no errors appear

### 4. Enrichment Results
- [ ] Verify Summary section displays
- [ ] Verify "What They Do" bullets display
- [ ] Verify Keywords display
- [ ] Verify Signals display
- [ ] Verify Sources section shows URL
- [ ] Verify timestamp is present

### 5. Thesis Score
- [ ] Verify score displays (0-100)
- [ ] Verify score reasons display as badges
- [ ] Verify score matches company criteria
- [ ] Check that score includes signals from enrichment

### 6. Caching
- [ ] Reload the page (F5)
- [ ] Verify enrichment data persists
- [ ] Verify cache indicator appears: "Cached result – Enriched on..."
- [ ] Click "Re-run enrichment" button
- [ ] Verify enrichment runs again

### 7. Notes
- [ ] Type notes in the textarea
- [ ] Wait 2 seconds
- [ ] Verify "Saved" indicator appears
- [ ] Reload page
- [ ] Verify notes persist

### 8. Save to List
- [ ] Click "Save to List" button
- [ ] Verify success message appears
- [ ] Click again
- [ ] Verify "Already saved" message

### 9. Lists Management
- [ ] Navigate to Lists page
- [ ] Click "Create List"
- [ ] Enter name "Q1 2024 Pipeline"
- [ ] Click Create
- [ ] Verify list appears

### 10. Saved Searches
- [ ] Navigate to Saved Searches
- [ ] Click "Save New Search"
- [ ] Enter name "India ClimateTech"
- [ ] Enter sector "ClimateTech"
- [ ] Enter location "India"
- [ ] Click Save
- [ ] Click "Run Search"
- [ ] Verify redirects to discover with filters

---

## 🔥 Error Handling Tests

### 1. Invalid API Key
- [ ] Edit .env.local and set invalid key
- [ ] Restart dev server
- [ ] Try to enrich a company
- [ ] Verify demo mode activates
- [ ] Verify yellow warning banner appears
- [ ] Verify demo data displays

### 2. Network Failure Simulation
- [ ] Turn off internet
- [ ] Try to enrich
- [ ] Verify error message appears
- [ ] Verify "Retry" button appears
- [ ] Turn on internet
- [ ] Click Retry
- [ ] Verify enrichment works

### 3. Malformed Data
- [ ] Check that empty arrays don't break UI
- [ ] Check that missing fields show fallback text
- [ ] Verify no console errors

---

## 🔐 Security Checks

### 1. API Key Protection
- [ ] Open browser DevTools → Network tab
- [ ] Enrich a company
- [ ] Check API request
- [ ] Verify API key is NOT in request headers
- [ ] Verify API key is NOT in response
- [ ] Check .gitignore includes .env*.local

### 2. Environment Variables
- [ ] Verify .env.local is in .gitignore
- [ ] Verify no API keys in frontend code
- [ ] Verify enrichment only happens server-side

---

## 🎨 UI Polish Checks

### 1. Spacing & Typography
- [ ] Check consistent padding across cards
- [ ] Check font sizes are uniform
- [ ] Check button sizes are consistent
- [ ] Check no misaligned elements

### 2. Loading States
- [ ] Verify spinner animates smoothly
- [ ] Verify loading text is clear
- [ ] Verify disabled buttons show cursor: not-allowed

### 3. Error States
- [ ] Verify error messages are red
- [ ] Verify error icon appears
- [ ] Verify retry button is visible

### 4. Hover States
- [ ] Hover over buttons - verify color change
- [ ] Hover over links - verify color change
- [ ] Hover over table rows - verify background change

### 5. Transitions
- [ ] Check all transitions are smooth
- [ ] Check no jarring animations
- [ ] Check page loads feel polished

---

## 📊 Data Validation

### 1. Score Recalculation
- [ ] Enrich "AgriSense AI" (India + ClimateTech + Pre-Seed)
- [ ] Verify score is 65+ (20+25+20)
- [ ] Verify reasons include "India-based", "ClimateTech focus", "Early stage"
- [ ] Check if signals add points

### 2. Cache Persistence
- [ ] Enrich company
- [ ] Close browser
- [ ] Reopen browser
- [ ] Navigate to company
- [ ] Verify enrichment still cached

---

## 🚨 Critical Failures (Must Fix)

If any of these fail, DO NOT submit:

- [ ] Enrichment crashes the app
- [ ] API key visible in browser
- [ ] Score doesn't update after enrichment
- [ ] Cache doesn't work
- [ ] Error states break UI
- [ ] Notes don't save
- [ ] Loading states missing

---

## ✅ Level 1 Complete

When all items checked:
- App is stable
- App is reliable
- App is professional
- App is demo-safe

**Ready for submission! 🚀**
