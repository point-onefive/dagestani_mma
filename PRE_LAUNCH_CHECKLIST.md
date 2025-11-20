# Pre-Launch Checklist

## ✅ Completed Items

### Branding & UI
- [x] Domain purchased: dagstats.com
- [x] Circular text updated to "DAGSTATS•UFC•TRACKER•"
- [x] Purple accent dots in circular text
- [x] Homepage rotating taglines with "Welcome to DagStats"
- [x] DecryptedText animation speed optimized (30ms)
- [x] Page headers have one-time typewriter animation
- [x] Footer copyright updated to "DagStats"
- [x] Disclaimer text updated ("informational purposes only")
- [x] All "Matches" changed to "Fights"
- [x] Simplified tagline: "Track fighters born in Dagestan, Russia"
- [x] Subtext: "Data-driven insights for sportsbooks"
- [x] StatBox metrics formatted with purple "Daily"

### Data Quality
- [x] Improved OpenAI prompt with birthplace verification
- [x] Abdul-Rakhman Yakhyaev corrected (Turkey, not Dagestani)
- [x] Tagir Ulanbekov corrected (Russia, Dagestan - IS Dagestani)
- [x] Strategic decision: Track birthplace only, not training camp
- [x] All copy updated to "born in Dagestan"
- [x] Fighter cache: 801 entries validated
- [x] Historical data: 52 fights, no duplicates
- [x] Upcoming data: 2 fights

### Automation
- [x] Daily refresh script created and tested
- [x] GitHub Actions workflow created (`.github/workflows/daily-refresh.yml`)
- [x] Cron schedule: 6 AM UTC daily
- [x] Manual trigger option enabled
- [x] Deduplication logic fixed (fight-level, not event-level)
- [x] Fighter cache persistence verified
- [x] Test script created (`scripts/testDeduplication.ts`)

### Documentation
- [x] `GITHUB_SETUP.md` - Instructions for adding OpenAI API key
- [x] `DATA_ARCHITECTURE.md` - Complete data persistence guide
- [x] `CRON_SETUP.md` - Server cron setup (if needed)

---

## 🚀 Final Steps Before Launch

### 1. GitHub Secrets Configuration
**Action Required:**
1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `OPENAI_API_KEY`
4. Value: [Your OpenAI API key]
5. Click "Add secret"

**Verify:**
```bash
# Go to repo Actions tab
# Click "Daily Data Refresh"
# Click "Run workflow" dropdown
# Click green "Run workflow" button
# Wait 2-3 minutes
# Check that workflow completes successfully
```

---

### 2. Manual Test Run
**Before going live, test the full workflow:**

```bash
# Test deduplication logic
npm run test:dedup

# Run full refresh manually
npm run refresh

# Verify no errors
# Check data files updated:
# - data/upcoming.json
# - data/historical.json  
# - data/stats.json
# - data/fighters.json
```

**Expected Output:**
- ✅ No duplicate fights found
- ✅ Fighter cache working (minimal OpenAI calls)
- ✅ Stats recalculated correctly
- ✅ No errors or warnings

---

### 3. Production Build Test

```bash
# Build for production
npm run build

# Test production server
npm run start

# Visit http://localhost:3000
# Test all pages:
# - Homepage (rotating phrases, pixel blast)
# - Upcoming Fights
# - Historical Fights
# - Stats display
```

**Verify:**
- [x] All pages load without errors
- [x] Animations working (TextType, DecryptedText, PixelBlast)
- [x] Data displays correctly
- [x] Responsive on mobile
- [x] No console errors

---

### 4. Deploy to Production

**Recommended Platform: Vercel (Free Tier)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: dagestani-mma
# - Framework: Next.js
# - Build command: npm run build
# - Output directory: .next
# - Development command: npm run dev

# Add environment variable
vercel env add OPENAI_API_KEY
# Paste your OpenAI API key
# Select: Production, Preview, Development

# Deploy to production
vercel --prod
```

**Alternative: Netlify, Railway, Fly.io**

---

### 5. Domain Configuration

**After deploying:**
1. Go to your domain registrar (where you bought dagstats.com)
2. Add DNS records:
   - Type: A Record
   - Name: @ (root domain)
   - Value: [Vercel IP - provided after deployment]
   
   OR
   
   - Type: CNAME
   - Name: www
   - Value: [Your Vercel domain].vercel.app

3. In Vercel dashboard:
   - Go to project Settings → Domains
   - Add domain: dagstats.com
   - Add domain: www.dagstats.com
   - Follow verification steps

**Wait 24-48 hours for DNS propagation**

---

### 6. Post-Launch Monitoring

**First 24 Hours:**
- [ ] Check GitHub Actions runs successfully at 6 AM UTC
- [ ] Verify data files update correctly
- [ ] Monitor OpenAI API usage (should be minimal)
- [ ] Test upcoming fights display
- [ ] Test historical fights display
- [ ] Verify stats calculation

**First Week:**
- [ ] Watch for any fighter misclassifications
- [ ] Monitor for duplicate entries
- [ ] Check for any scraping errors
- [ ] Verify cron runs daily without issues

---

## 🔍 Testing Scenarios

### Scenario 1: UFC Event Happened Last Night
**Expected Behavior:**
1. Cron runs at 6 AM UTC
2. Checks last 3 UFCStats events
3. Finds new completed fights with Dagestani fighters
4. Adds to historical.json (no duplicates)
5. Removes from upcoming.json automatically (ESPN no longer lists it)
6. Stats recalculate with new data

**Verify:**
- New fights in historical.json
- Win rate updated
- No duplicates

---

### Scenario 2: New UFC Card Announced
**Expected Behavior:**
1. ESPN API now includes new event
2. Daily refresh fetches upcoming events
3. Identifies Dagestani fighters on card
4. Adds to upcoming.json
5. Uses fighter cache (minimal OpenAI calls)

**Verify:**
- New upcoming fights displayed on website
- Fighter cache used (check logs for API calls)

---

### Scenario 3: Fighter Classification Error Found
**Steps to Fix:**
1. Update `lib/openai.ts` prompt if needed
2. Run `scripts/revalidateFighters.ts`
3. Delete bad cache entries
4. Run `npm run refresh`
5. Verify correction

---

## 📊 Success Metrics

### Launch Day
- [ ] Website loads at dagstats.com
- [ ] All pages functional
- [ ] Data displaying correctly
- [ ] GitHub Actions cron working
- [ ] No errors in logs

### Week 1
- [ ] Daily refresh runs successfully 7/7 days
- [ ] OpenAI API costs < $1/day
- [ ] No duplicate data found
- [ ] No user-reported bugs

### Month 1
- [ ] Historical data growing consistently
- [ ] Win rate tracking accurately
- [ ] No data quality issues
- [ ] Site performance good (< 2s load time)

---

## 🆘 Troubleshooting

### Issue: GitHub Actions Fails
**Check:**
1. OPENAI_API_KEY secret added correctly
2. Check Actions tab for error logs
3. Verify `.github/workflows/daily-refresh.yml` exists
4. Check npm dependencies in package.json

### Issue: Duplicate Fights Appearing
**Check:**
1. Run `npm run test:dedup`
2. Look for duplicate fight IDs
3. Check `dailyRefresh.ts` deduplication logic
4. Manually remove duplicates from historical.json

### Issue: Fighter Misclassified
**Fix:**
1. Edit `lib/openai.ts` if prompt issue
2. Run `scripts/revalidateFighters.ts`
3. Delete bad cache entry
4. Re-run refresh

### Issue: Stats Not Updating
**Check:**
1. Verify historical.json has fights
2. Check stats.json calculation logic
3. Verify recalculateStats() function runs

---

## 🎯 Ready to Launch?

**Final Checks:**
- ✅ All tests passing
- ✅ GitHub Actions configured
- ✅ Production build successful
- ✅ Domain ready
- ✅ Documentation complete
- ✅ Monitoring plan in place

**When ready:**
```bash
# Deploy to production
vercel --prod

# Monitor first cron run (6 AM UTC next day)
# Check GitHub Actions → Daily Data Refresh → Latest run

# 🎉 Launch!
```

---

## 📝 Notes

**Important Dates:**
- Development started: [Date]
- Testing completed: [Date]
- Production launch: [Date]
- First cron run: [Date at 6 AM UTC]

**Key People:**
- Developer: [Your name]
- Domain: dagstats.com
- Hosting: [Vercel/Netlify/etc]
- GitHub: [Repo URL]

**Support:**
- For data issues: Check DATA_ARCHITECTURE.md
- For GitHub Actions: Check GITHUB_SETUP.md
- For deployment: Check platform docs
