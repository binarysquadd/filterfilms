# CLI Credentials (Encrypted)

This folder stores encrypted credentials used by local CLI verification
scripts (gcloud, firebase, drive OAuth). These **do not** get synced to
Vercel.

## Files

- `gcp-oauth-client.sops.json` (encrypted with SOPS)
- `firebase-admin.sops.json` (encrypted with SOPS)

## Encrypt / Decrypt

Use the same SOPS config as the Vercel envs:

- Encrypt:
  - `sops --config platform/vercel/.sops.yaml -e -i platform/creds/gcp-oauth-client.sops.json`
  - `sops --config platform/vercel/.sops.yaml -e -i platform/creds/firebase-admin.sops.json`

- Decrypt (in place):
  - `sops --config platform/vercel/.sops.yaml -d -i platform/creds/gcp-oauth-client.sops.json`
  - `sops --config platform/vercel/.sops.yaml -d -i platform/creds/firebase-admin.sops.json`

## Notes

- Keep plaintext versions **out of git**.
- For CLI checks, decrypt to a temp location if possible.
