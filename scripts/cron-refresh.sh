#!/bin/bash
# Wrapper script for cron job
# This script runs the daily refresh and logs output

cd "$(dirname "$0")/.."
exec npm run refresh >> /tmp/dagestani-refresh.log 2>&1
