# Cron Job Setup for Daily Refresh

## Overview
The daily refresh script (`npm run refresh`) automatically:
- Fetches upcoming UFC events from ESPN API
- Moves completed fights from upcoming → historical
- Adds new Dagestani fights to upcoming table
- Recalculates win rate statistics

## Setup on macOS/Linux

### 1. Make the script executable
```bash
chmod +x scripts/dailyRefresh.ts
```

### 2. Create a wrapper shell script
Create `/Users/td/dev/dagestani_mma/scripts/cron-refresh.sh`:

```bash
#!/bin/bash
cd /Users/td/dev/dagestani_mma
npm run refresh >> /tmp/dagestani-refresh.log 2>&1
```

Make it executable:
```bash
chmod +x scripts/cron-refresh.sh
```

### 3. Set up cron job
Open crontab editor:
```bash
crontab -e
```

Add this line to run daily at 6 AM:
```cron
0 6 * * * /Users/td/dev/dagestani_mma/scripts/cron-refresh.sh
```

Or run every morning at 8 AM:
```cron
0 8 * * * /Users/td/dev/dagestani_mma/scripts/cron-refresh.sh
```

### 4. Verify cron job
List active cron jobs:
```bash
crontab -l
```

Check logs:
```bash
tail -f /tmp/dagestani-refresh.log
```

## Manual Execution

You can also run the refresh manually:

```bash
npm run refresh
```

## Cron Schedule Examples

```cron
# Every day at 6 AM
0 6 * * * /path/to/script

# Every day at midnight
0 0 * * * /path/to/script

# Twice daily (6 AM and 6 PM)
0 6,18 * * * /path/to/script

# Every Monday at 9 AM
0 9 * * 1 /path/to/script
```

## Troubleshooting

### Cron not running
1. Check if cron service is running:
   ```bash
   ps aux | grep cron
   ```

2. Check system logs:
   ```bash
   tail -f /var/log/syslog | grep CRON
   ```

### Permission issues
Make sure the script has executable permissions:
```bash
chmod +x scripts/cron-refresh.sh
chmod +x scripts/dailyRefresh.ts
```

### Environment variables
Cron runs with minimal environment. The script loads `.env.local` automatically, but ensure the file exists and has the correct permissions:
```bash
ls -la .env.local
# Should show: -rw-r--r--
```

## Alternative: launchd (macOS)

On macOS, you can use launchd instead of cron:

Create `~/Library/LaunchAgents/com.dagestani.refresh.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.dagestani.refresh</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/td/dev/dagestani_mma/scripts/cron-refresh.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>6</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/tmp/dagestani-refresh.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/dagestani-refresh-error.log</string>
</dict>
</plist>
```

Load the agent:
```bash
launchctl load ~/Library/LaunchAgents/com.dagestani.refresh.plist
```

Check status:
```bash
launchctl list | grep dagestani
```
