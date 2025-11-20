# GitHub Actions Cron Troubleshooting

## Current Status
- Workflow file: `.github/workflows/daily-refresh.yml`
- Schedule: `45 14 * * *` (9:45 AM EST / 2:45 PM UTC)
- Last manual run: TBD
- Automatic runs: Not triggering as expected

## Common GitHub Actions Cron Issues

### 1. **Delayed or Skipped Runs**
GitHub Actions cron jobs are not guaranteed to run at the exact scheduled time:
- Can be delayed by 15+ minutes during high GitHub load
- May be skipped entirely during peak times
- Not suitable for time-critical tasks

### 2. **Inactive Repository**
- GitHub may disable cron jobs if repo has no activity for 60+ days
- Solution: Commit activity keeps workflows active

### 3. **First Manual Trigger Required**
- Some workflows need to be manually triggered once before cron activates
- Go to Actions tab → Select "Daily Data Refresh" → Click "Run workflow"

### 4. **Default Branch Issues**
- Cron only runs from the default branch (usually `main`)
- Verify the workflow file exists on `main` branch

## How to Debug

### Option 1: Manual Trigger Test
1. Go to: https://github.com/point-onefive/dagestani_mma/actions
2. Click "Daily Data Refresh" workflow
3. Click "Run workflow" dropdown → Run workflow
4. If this works, cron should work too (but may be delayed)

### Option 2: Check Workflow Runs
1. Visit: https://github.com/point-onefive/dagestani_mma/actions
2. Look for any failed or completed runs
3. Check logs for errors

### Option 3: Verify Secrets
- Ensure `OPENAI_API_KEY` is set in repo secrets
- Go to Settings → Secrets and variables → Actions

## Alternative Solutions

### Solution A: Use Vercel Cron (Recommended)
Vercel offers more reliable cron jobs:

1. Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/refresh",
    "schedule": "0 6 * * *"
  }]
}
```

2. Create `app/api/cron/refresh/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await execAsync('npm run refresh');
    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
```

### Solution B: External Cron Service
Use a service like:
- **cron-job.org** - Free, reliable HTTP cron
- **EasyCron** - Paid but very reliable
- **Uptime Robot** - Monitor + can trigger webhooks

Set them to hit a webhook endpoint that triggers data refresh.

### Solution C: Increase Cron Frequency
Try running every hour to see if GitHub picks it up:
```yaml
schedule:
  - cron: '0 * * * *'  # Every hour
```

## Recommended Next Steps

1. **Manually trigger the workflow** once via GitHub Actions UI
2. **Wait 24 hours** to see if cron runs automatically tomorrow
3. **If still no run**, switch to Vercel Cron (more reliable for production)
4. **Monitor** the Actions tab for the next few days

## Current Workflow Verification
```bash
# Check if workflow exists on main
git show main:.github/workflows/daily-refresh.yml

# See recent commits
git log --oneline -5

# Check if secrets are referenced correctly
grep -r "OPENAI_API_KEY" .github/workflows/
```
