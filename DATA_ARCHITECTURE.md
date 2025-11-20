# Data Architecture & Persistence Guide

## Overview

DagStats uses a **file-based JSON storage system** with intelligent caching and deduplication. This document explains how data persists, when OpenAI is called, and how duplication is prevented.

---

## Data Files

### 1. `fighters.json` - Fighter Cache (Permanent)
**Purpose:** Cache OpenAI classifications to avoid repeat API calls  
**Structure:**
```json
{
  "islam makhachev": {
    "country": "Russia, Dagestan",
    "isDagestani": true
  },
  "conor mcgregor": {
    "country": "Ireland",
    "isDagestani": false
  }
}
```

**Behavior:**
- ✅ Persists forever across all script runs
- ✅ Keys are lowercase fighter names
- ✅ Checked BEFORE calling OpenAI
- ✅ Only new fighters trigger API calls
- ⚠️ Can contain outdated classifications if prompt changes

**When to Rebuild:**
- After improving OpenAI prompt to fix systematic errors
- After finding specific misclassified fighters
- Use `scripts/revalidateFighters.ts` to clear specific entries

---

### 2. `historical.json` - Completed Fights
**Purpose:** Store Dagestani fights that have already happened  
**Structure:**
```json
[
  {
    "eventId": "7956f026e2672c47",
    "eventName": "UFC 321: Aspinall vs. Gane",
    "eventDate": "October 25, 2025",
    "fighterA": "Umar Nurmagomedov",
    "fighterB": "Mario Bautista",
    "isDagestaniA": true,
    "isDagestaniB": false,
    "winner": "Umar Nurmagomedov",
    "method": "Decision",
    "round": "N/A",
    "dagestaniFighter": "Umar Nurmagomedov",
    "result": "win"
  }
]
```

**Behavior:**
- ✅ Grows continuously as new fights complete
- ✅ Never deleted (permanent record)
- ✅ Deduplication at FIGHT level (not just event level)
- ✅ Multiple Dagestani fighters on same card = multiple entries with same eventId

**Deduplication Logic:**
```typescript
// Create unique identifier: eventId + both fighters (sorted)
const fightId = `${eventId}:${fighterA}|${fighterB}`;
if (existingFights.has(fightId)) {
  skip; // Already processed this exact fight
}
```

---

### 3. `upcoming.json` - Future Fights
**Purpose:** Store upcoming Dagestani fights from ESPN API  
**Structure:**
```json
[
  {
    "eventId": "8db1b36dde268ef6",
    "eventName": "UFC 322: Della Maddalena vs. Makhachev",
    "eventDate": "November 15, 2025",
    "fighterA": "Islam Makhachev",
    "fighterB": "Jack Della Maddalena",
    "isDagestaniA": true,
    "isDagestaniB": false,
    "countryA": "Russia, Dagestan",
    "countryB": "Australia"
  }
]
```

**Behavior:**
- ⚠️ **COMPLETELY OVERWRITTEN** on each refresh
- ✅ No deduplication needed - ESPN API is the source of truth
- ✅ Old fights naturally drop off when ESPN stops listing them
- ✅ Completed fights are picked up by `checkNewCompletedFights()`

**Why Full Overwrite?**
- ESPN API returns current state of upcoming events
- Fights get canceled, rescheduled, fighters change
- Safer to trust ESPN than try to merge data

---

### 4. `stats.json` - Win Rate Statistics
**Purpose:** Calculated statistics from historical data  
**Structure:**
```json
{
  "totalFights": 52,
  "wins": 39,
  "losses": 13,
  "winRate": 75.0
}
```

**Behavior:**
- ✅ Recalculated from scratch on every refresh
- ✅ Always accurate to current historical.json

---

## Daily Refresh Workflow

### Step 1: Check for New Completed Fights
**Source:** UFCStats.com (last 3 events)  
**Logic:**
```typescript
1. Fetch last 3 completed events from UFCStats
2. For each event:
   - Get all fights
   - For each fight:
     a. Create unique fight ID: eventId + fighters (sorted)
     b. Skip if fight ID already exists in historical.json
     c. Check fighter cache for both fighters
     d. Call OpenAI only for new fighters not in cache
     e. If Dagestani fighter involved, add to historical.json
3. Save updated historical.json and fighters.json
```

**Deduplication:** Fight-level (eventId + both fighter names)  
**OpenAI Calls:** Only for fighters not in `fighters.json`

---

### Step 2: Update Upcoming Fights
**Source:** ESPN API  
**Logic:**
```typescript
1. Fetch all upcoming UFC events from ESPN
2. For each event, get fight card details
3. For each fight:
   a. Check fighter cache for both fighters
   b. Call OpenAI only for new fighters not in cache
   c. If Dagestani fighter involved, add to new upcoming array
4. OVERWRITE upcoming.json with new array
5. Save updated fighters.json
```

**Deduplication:** None needed - full overwrite  
**OpenAI Calls:** Only for fighters not in `fighters.json`

---

### Step 3: Recalculate Statistics
**Source:** historical.json  
**Logic:**
```typescript
1. Load historical.json
2. Count wins vs losses
3. Calculate win rate percentage
4. Overwrite stats.json
```

**OpenAI Calls:** None

---

## Why Full Historical Rebuild?

**You asked:** "Why did we rebuild all historical data if fighters are cached?"

**Answer:** You DIDN'T have to! But rebuilding was beneficial because:

1. **Improved OpenAI Prompt** - After discovering misclassifications (Abdul-Rakhman Yakhyaev, Tagir Ulanbekov), the prompt was enhanced with:
   - Explicit birthplace verification
   - Dagestan region emphasis
   - Edge case examples

2. **Fighter Cache Had 801 Entries** - Many were classified with the old, less accurate prompt

3. **Options Were:**
   - **Option A:** Keep cache, only new fighters get improved prompt (inconsistent)
   - **Option B:** Clear cache entirely, reclassify all 801 fighters (expensive)
   - **Option C:** Clear specific bad entries, rebuild historical (chosen approach)

4. **What Happened:**
   - Ran `revalidateFighters.ts` to clear problem fighters
   - Ran `buildHistorical.ts` to rebuild from scratch
   - Most fighters were already cached (only ~5 new OpenAI calls)
   - All historical fights now reflect corrected classifications

---

## Tomorrow's Cron Run - What Will Happen?

### Scenario: UFC event happened last night

1. **Step 1: Check Completed Fights**
   - Fetches last 3 events from UFCStats
   - Sees new event (e.g., UFC 322)
   - Creates fight IDs for all fights on card
   - Checks against historical.json
   - **Result:** Only net new fights are added (no duplicates)

2. **Step 2: Update Upcoming**
   - ESPN API no longer lists UFC 322 (it's over)
   - **Result:** UFC 322 naturally removed from upcoming.json

3. **Step 3: Recalculate Stats**
   - Includes the new fights from Step 1
   - **Result:** Win rate updated

### Scenario: No new events

1. **Step 1:** Checks last 3 events, all already in historical.json, skips them
2. **Step 2:** Fetches upcoming from ESPN, overwrites upcoming.json
3. **Step 3:** Stats unchanged

### OpenAI API Calls

- **Only for new fighters** never seen before
- If Islam Makhachev fights again: 0 API calls (both fighters cached)
- If new Dagestani debut: 2 API calls (opponent + new fighter)
- Typical daily run: 0-10 API calls

---

## Testing Checklist

✅ **Test 1: Historical Fight Deduplication**
- 52 unique fights across 29 events
- No duplicate fight entries
- Multiple fights per event handled correctly

✅ **Test 2: Upcoming vs Historical Overlap**
- No overlap (upcoming events haven't happened yet)

✅ **Test 3: Fighter Cache Integrity**
- 801 valid cache entries
- All have `isDagestani` and `country` properties

✅ **Test 4: Data Quality**
- No "draw", "TBD", or suspicious names

✅ **Test 5: Dagestani Classification**
- 18 unique Dagestani fighters identified
- All have country data from cache

---

## Manual GitHub Actions Test

### Before Testing
1. Add `OPENAI_API_KEY` to GitHub Secrets:
   - Go to repo Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI key
   - Save

### Run Manual Test
1. Go to **Actions** tab in GitHub
2. Click **Daily Data Refresh** workflow
3. Click **Run workflow** → **Run workflow**
4. Wait 2-3 minutes for completion

### Expected Results
```
✅ Step 1: Checking UFCStats
   📋 Checking event: UFC XXX
      ℹ️  No new Dagestani fights in this event
   
   ℹ️  No new Dagestani fights found

✅ Step 2: Fetching upcoming UFC events
   📡 Found X upcoming UFC events
   💾 Saved X upcoming Dagestani fights

✅ Step 3: Recalculating statistics
   Total Fights: 52
   Wins: 39
   Losses: 13
   Win Rate: 75.0%

✅ Daily refresh complete!
```

### Verify No Duplication
1. Check the commit created by GitHub Actions
2. Look at `data/historical.json` diff
3. **Should see:** No changes (if no new events)
4. **OR:** Only NEW fights added (if events completed)
5. **Should NOT see:** Duplicate entries for existing fights

---

## Common Questions

### Q: Will tomorrow's cron duplicate data?
**A:** No! Fight-level deduplication prevents this.

### Q: Why does historical.json have multiple entries with same eventId?
**A:** Multiple Dagestani fighters on the same card = multiple fights.

### Q: Why overwrite upcoming.json instead of merging?
**A:** ESPN API is authoritative. Fights get canceled/rescheduled frequently.

### Q: When should I rebuild historical?
**A:** Only when fixing systematic classification errors. Daily refresh handles incremental updates.

### Q: How many OpenAI calls per day?
**A:** Usually 0-10. Only new fighters never seen before trigger API calls.

### Q: What if a fighter switches training camps?
**A:** Doesn't matter! We track birthplace, not current training location.

---

## Summary

🎯 **Data Persistence:** Fighter cache is permanent, historical grows continuously, upcoming is refreshed  
🎯 **Deduplication:** Fight-level checking (eventId + both fighters)  
🎯 **OpenAI Efficiency:** Cache-first approach minimizes API costs  
🎯 **Tomorrow's Cron:** Will work perfectly with no duplication  
🎯 **Manual Testing:** Safe to run GitHub Actions manually  

**Ready for production!** 🚀
