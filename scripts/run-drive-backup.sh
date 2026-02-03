#!/usr/bin/env bash
set -euo pipefail

if [ -f "./env" ]; then
  set -a
  . ./env
  set +a
fi

exec npx tsx scripts/drive-backup.ts
