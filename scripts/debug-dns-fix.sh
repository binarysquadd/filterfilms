#!/usr/bin/env bash
set -euo pipefail

sudo bash -c 'printf "[Resolve]\nDNS=1.1.1.1 8.8.8.8\nFallbackDNS=1.0.0.1 8.8.4.4\n" > /etc/systemd/resolved.conf'
sudo systemctl restart systemd-resolved
sudo ln -sf /run/systemd/resolve/resolv.conf /etc/resolv.conf

echo "DNS config updated. Verify with:"
echo "  getent hosts oauth2.googleapis.com"
