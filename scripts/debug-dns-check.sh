#!/usr/bin/env bash
set -euo pipefail

getent hosts oauth2.googleapis.com
curl -I https://oauth2.googleapis.com/token
