# Dagestan UFC Tracker

A beautiful, mobile-first Next.js application that automatically tracks upcoming and historical UFC fights involving Dagestani fighters and calculates their running win rate.

## Features

- 🥊 **Upcoming Fights**: View all upcoming UFC fights with at least one Dagestani fighter
- 📊 **Historical Data**: Browse past fights with win/loss tracking
- 📈 **Win Rate Statistics**: Live calculation of Dagestani fighters' overall win rate
- 🤖 **AI-Powered**: Uses OpenAI to automatically identify fighter origins
- 🎨 **Stunning UI**: Features animated PixelBlast background and TextType effects
- 📱 **Mobile-First**: Fully responsive design optimized for all screen sizes

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Data Source**: ESPN UFC API (free, no key required)
- **AI**: OpenAI GPT-4o-mini for fighter origin detection
- **Storage**: JSON file-based database

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/point-onefive/dagestani_mma.git
cd dagestani_mma
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file with your OpenAI API key:
```bash
OPENAI_API_KEY=your_key_here
```

4. Run the data refresh script to populate initial data:
```bash
npm run refresh
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run bootstrap` - **One-time**: Scrape historical UFC data from UFCStats.com
- `npm run refresh` - **Daily**: Update upcoming fights and move completed to historical

## Data Management Workflow

### Initial Setup (One-Time)

1. **Bootstrap Historical Data**
   ```bash
   npm run bootstrap
   ```
   - Scrapes last 15 completed UFC events from UFCStats.com
   - Identifies fighter origins using OpenAI API
   - Populates `data/historical.json` with Dagestani fights
   - Calculates initial win rate statistics
   - **Note**: Only new fighters trigger OpenAI API calls (cached after first lookup)

### Daily Operations

2. **Scheduled Refresh**
   - Set up a daily cron job (see `CRON_SETUP.md`)
   - Recommended time: Every morning at 6-8 AM
   - Script automatically:
     - Fetches upcoming UFC events from ESPN
     - Moves past-date fights from upcoming → historical
     - Adds new Dagestani matchups to upcoming table
     - Prevents conflicts (upcoming = future only, historical = past only)
     - Recalculates win rate

3. **Manual Refresh**
   ```bash
   npm run refresh
   ```
   Run this anytime to sync with latest ESPN data

### Data Flow

```
                                    ┌─────────────────┐
                                    │   ESPN API      │
                                    │  (Free, Public) │
                                    └────────┬────────┘
                                             │
                                             ▼
                          ┌──────────────────────────────────┐
                          │   Daily Refresh Script           │
                          │  • Fetch upcoming events         │
                          │  • Check event dates             │
                          │  • Identify Dagestani fighters   │
                          └──────┬───────────────────┬───────┘
                                 │                   │
                    Future date  │                   │  Past date
                                 ▼                   ▼
                        ┌─────────────┐     ┌────────────────┐
                        │  upcoming   │     │  UFCStats.com  │
                        │  .json      │     │  (for results) │
                        └─────────────┘     └────────┬───────┘
                                                     │
                                            ┌────────▼────────┐
                                            │  historical     │
                                            │  .json          │
                                            │  + winner info  │
                                            └─────────────────┘
```

### Important Limitation: Historical Data

⚠️ **The ESPN public API only provides access to upcoming UFC events, not completed historical events with results.** 

**This means:**
- ESPN API → `upcoming.json` (future fights only)
- UFCStats.com scraping → `historical.json` (past fights with winners)
- The two tables **never overlap** by design

**To get results for completed fights:**
1. Wait for UFC event to complete
2. Run `npm run bootstrap` again to scrape latest results from UFCStats.com
3. Or manually add fight results to `historical.json`

**Workarounds:**
- Run bootstrap monthly to capture recent completed events
- Use a paid UFC API that provides real-time results
- Implement UFCStats.com scraping in the daily refresh (requires careful rate limiting)

## Project Structure

```
dagestani_mma/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Landing page
│   ├── upcoming/          # Upcoming fights page
│   └── historical/        # Historical fights page
├── components/            # React components
│   ├── PixelBlast.tsx    # Animated background
│   ├── TextType.tsx      # Typing animation
│   ├── FightCard.tsx     # Upcoming fight display
│   ├── HistoricalRow.tsx # Historical fight row
│   └── StatBox.tsx       # Win rate statistics
├── lib/                   # Core business logic
│   ├── espn.ts           # ESPN API integration
│   ├── openai.ts         # OpenAI fighter detection
│   ├── dagestan.ts       # Table management
│   └── storage.ts        # JSON file operations
├── data/                  # JSON data storage
│   ├── fighters.json     # Fighter origin cache
│   ├── upcoming.json     # Upcoming matches
│   ├── historical.json   # Completed fights
│   └── stats.json        # Win rate statistics
└── scripts/              # Utility scripts
    └── refresh.ts        # Data update script
```

## API Usage & Rate Limiting

### ESPN API
- **Rate Limits**: None (free public API)
- **Usage**: Fetches UFC event and fight card data
- **No API key required**

### OpenAI API
- **Usage**: Identifies fighter country of origin and Dagestani status
- **Caching**: All results cached to minimize API calls
- **Bootstrap Strategy**: Only analyzes last 5 events on first run
- **Ongoing**: Only new fighters trigger API calls

## Design

The application features a high-tech, cinematic aesthetic inspired by Dagestani command centers:

- **Colors**: 
  - Background: `#050505` (near black)
  - Accent: `#B19EEF` (purple)
  - Dagestani Badge: Emerald green
- **Typography**: System fonts with smooth antialiasing
- **Animations**: Subtle fade-ins, hover effects, and count-up animations
- **Layout**: Mobile-first with responsive grid/flex layouts

## License

MIT

## Acknowledgments

- ESPN for providing free UFC API access
- OpenAI for powering fighter origin detection
- The Dagestani MMA community for inspiration
