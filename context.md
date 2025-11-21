Below is your **final, expanded, VERY explicit, Copilot-ready `context.md`**.
This version includes everything previously written **PLUS** the reinforced, extremely detailed clarification about:

### ✅ UPCOMING TABLE

### ✅ HISTORICAL TABLE

### ✅ ONE-TIME HISTORICAL LOOK-BACK

### ✅ ONGOING HISTORICAL MAINTENANCE

### ✅ ESPN API LOGIC

### ✅ OPENAI Origin Resolution

### ✅ Storage rules

### ✅ UI + routing rules

### ✅ Mobile-first requirements

### ✅ Aesthetic + animation requirements

### ✅ Everything Copilot needs to build the entire app from zero

**Copy/paste this EXACT file as your `context.md` for Copilot.**

---

# ✅ **context.md** (FINAL — ALL DETAILS INCLUDED FOR COPILOT)

# Dagestan UFC Tracker — Full Technical Specification

### (FOR COPILOT — FOLLOW ALL INSTRUCTIONS EXACTLY)

This repository is **brand new**.
Copilot must generate all folders, components, pages, logic, scripts, and UI from scratch.

The goal is to create:

> **A beautiful, mobile-first, animated UFC dashboard that tracks upcoming and historical fights involving fighters from Dagestan, calculates their win rate, and maintains this automatically using ESPN + OpenAI APIs.**

---

# 1. **Core Concept**

Dagestani fighters win **a lot**.
The app will:

### ✔ Identify fights involving Dagestani fighters

### ✔ Track **upcoming fights**

### ✔ Track **historical results**

### ✔ Calculate Dagestani win-rate over time

### ✔ Update automatically with new events

The site consists of:

1. **Landing Page**
2. **Upcoming Dagestani Matches** Page
3. **Historical Dagestani Matches** Page (with live running win-rate)

---

# 2. **Data Sources**

## **ESPN Free UFC API** (No Key Required)

* Fetch upcoming UFC events
* Fetch completed UFC events
* Fetch fight cards
* Fetch winners, methods, rounds, metadata

### ESPN Endpoints:

**All upcoming events:**

```
https://site.web.api.espn.com/apis/fights/ufc/events
```

**Specific event with card + results:**

```
https://site.web.api.espn.com/apis/fights/ufc/event/{eventId}
```

ESPN results contain:

* fighter names
* fight status (upcoming vs completed)
* winner name
* method ("submission", "KO/TKO", etc.)
* round/time
* event date + location

---

## **OPENAI API** (for Fighter Country Extraction)

We will enrich each fighter with:

```
{
  "country": "Russia (Dagestan)",
  "isDagestani": true
}
```

OpenAI prompt Copilot must use:

```
Given the professional MMA fighter name "{{name}}", return ONLY:
{
  "country": "<country name>",
  "isDagestani": true|false
}
If unknown, return:
{
  "country": "Unknown",
  "isDagestani": false
}
```

Store the OpenAI key in:

```
.env.local
OPENAI_API_KEY=YOUR_KEY
```

---

# 3. **Storage Design (JSON Files)**

Copilot must create a `/data` folder with:

```
data/fighters.json      // cache of fighter → {country, isDagestani}
data/upcoming.json      // upcoming Dagestani matches table
data/historical.json    // historical Dagestani matches table
data/stats.json         // computed win-rate stats
```

These files must always be kept in sync by the data scripts.

---

# 4. TABLE DEFINITIONS

(THIS IS CRITICAL — COPILOT MUST NOT GUESS)

# A. **UPCOMING TABLE** (data/upcoming.json)

Only contains **future scheduled fights** where at least one fighter is Dagestani.

Schema:

```
{
  "eventId": string,
  "eventName": string,
  "eventDate": string,
  "fighterA": string,
  "fighterB": string,
  "isDagestaniA": boolean,
  "isDagestaniB": boolean
}
```

---

# B. **HISTORICAL TABLE** (data/historical.json)

Contains only **completed** fights involving Dagestani fighters.

Schema:

```
{
  "eventId": string,
  "eventName": string,
  "eventDate": string,
  "fighterA": string,
  "fighterB": string,
  "winner": string,
  "method": string,
  "round": string,
  "isDagestaniA": boolean,
  "isDagestaniB": boolean,
  "dagestaniFighter": string,      // The actual Dagestani fighter
  "result": "win" | "loss"
}
```

---

# 5. **ONE-TIME HISTORICAL LOOK-BACK**

(ABSOLUTELY REQUIRED — APP CANNOT LAUNCH WITHOUT THIS)

On first run:

1. Check if `data/historical.json` exists AND has entries.

   * If yes → SKIP backfill.
   * If empty or missing → run historical initialization.

2. **Historical Initialization Process (one time only):**

   * Fetch the last **X** completed UFC events from ESPN (Copilot chooses 5–10).
   * For each event:

     * Get the fight card
     * For each completed fight:

       * Get both fighter names
       * Resolve each fighter via OpenAI (and cache in fighters.json)
       * Keep ONLY the fights involving at least one Dagestani
       * Compute win/loss:

         * if Dagestani = winner → win
         * else → loss
       * Insert into historical.json
   * After inserting all:

     * Compute `wins`, `losses`, `total`, `winRate`
     * Save these stats in `stats.json`

**This entire backfill must NEVER run again unless `/data` is deleted.**

---

# 6. **ONGOING HISTORICAL MAINTENANCE**

(RUNS EVERY TIME THE APP OR CRON FETCHER RUNS)

Every new run:

1. Fetch ESPN events
2. For each event:

   * If fights are completed AND not already in historical.json:

     * Enrich fighters via origin cache/OpenAI
     * Confirm if fight involves Dagestani fighter
     * Append new fight to historical.json
3. Recompute:

   * wins
   * losses
   * winRate
4. Write updated stats.json

---

# 7. **ONGOING UPCOMING TABLE POPULATION**

Every run:

1. Fetch ESPN events
2. Identify events in the future
3. Parse fight cards
4. For each fight:

   * Determine fighter origins (via cached fighters.json or OpenAI)
   * If either fighter is Dagestani → include in upcoming.json
5. Save sorted by date

These populate the `/upcoming` page.

---

# 8. SITE STRUCTURE (Next.js App Router)

```
/app/page.tsx                 → Landing page with PixelBlast + TextType
/app/upcoming/page.tsx        → Upcoming table cards
/app/historical/page.tsx      → Historical table + win rate
/components/                  → UI components
/lib/espn.ts                  → ESPN fetcher utilities
/lib/openai.ts                → OpenAI country extractor
/lib/storage.ts               → JSON load/save helpers
/lib/dagestan.ts              → Dagestani detection logic
/scripts/refresh.ts           → Cron-like script for data updating
```

---

# 9. DESIGN & ANIMATION REQUIREMENTS

## Landing Page

* Use **PixelBlast** full-screen animated background
* Use **TextType** animated title
* Two large buttons with Framer Motion animations:

```
[ UPCOMING MATCHES ]  
[ HISTORICAL MATCHES ]
```

## Theme

**High-tech / Dagestani command center / cinematic hacking console**

Colors:

* Background: `#050505`
* Accent: `#B19EEF` or `#8F74FF`
* Clean, minimal spacing

## Pages

* Titles use TextType
* Tables/cards use subtle animations (opacity fade, slide)
* Stats box uses animated count-up + flicker effect

---

# 10. MOBILE-FIRST REQUIREMENTS

Mandatory:

* Everything works perfectly at **375px** width
* Desktop → table layout
* Mobile → stack cards
* Buttons full width
* PixelBlast height smaller on mobile (~400px)
* No overflow issues

---

# 11. REQUIRED COMPONENTS

Copilot must generate:

```
/components/FightCard.tsx
/components/HistoricalRow.tsx
/components/StatBox.tsx
/components/PageHeader.tsx
```

All styled using:

* TailwindCSS
* Framer Motion
* PixelBlast / TextType included where needed

---

# 12. INSTALLATION (Copilot must write instructions + scripts)

Initialize project:

```
npx create-next-app@latest --typescript --tailwind dagestan-ufc
```

Install dependencies:

```
npm install framer-motion openai three postprocessing
```

Install PixelBlast & TextType components (adapt paths properly):

```
npx shadcn@latest add @react-bits/PixelBlast-JS-CSS
npx shadcn@latest add @react-bits/TextType-JS-CSS
```

Copilot must modify these so that they integrate perfectly into this project.

---

# 13. GLOBAL REQUIREMENTS FOR COPILOT

Copilot must:

### ✔ Create both tables (upcoming & historical)

### ✔ Implement full ESPN parsing

### ✔ Implement OpenAI enrichment

### ✔ Implement fighter caching

### ✔ Implement one-time historical initialization

### ✔ Implement ongoing data refresh logic

### ✔ Compute and maintain win rate

### ✔ Build all routes with Next.js App Router

### ✔ Build animated landing page

### ✔ Build mobile-first UI

### ✔ Include Framer Motion animations everywhere appropriate

### ✔ Keep all code modular, clean, typed

### ✔ Use TypeScript everywhere

### ✔ Store no API keys in Git

---

# 14. SUMMARY FOR COPILOT

**You MUST implement EVERYTHING described in this file.**

The app contains:

* 🔹 **two tables**
* 🔹 **one-time historical look-back**
* 🔹 **ongoing table maintenance**
* 🔹 **ESPN → upcoming + historical**
* 🔹 **OpenAI → origin + Dagestani detection**
* 🔹 **mobile-first UI**
* 🔹 **PixelBlast animated landing page**
* 🔹 **TextType header titles**
* 🔹 **historical win rate statistic**

Everything must be functional out of the box.

---

# End of `context.md`

---

