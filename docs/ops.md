# Operations Runbook

## Secrets & Config

- Encrypted env files live in `platform/vercel/envs/*.sops.env`.
- Local encryption keys: `~/.config/sops/age/keys.txt` (private key). Back it up securely.
- Public age recipient is stored in `platform/vercel/.sops.yaml`.

## Vercel Env Sync (Manual)

- Sync one environment:
  - `make vercel-sync ENV=development|preview|production`
- Sync all:
  - `make vercel-sync-all`

## Deployments

- Preview deploy:
  - `make vercel-deploy-preview`
- Production deploy:
  - `make vercel-deploy-prod`

## Healthcheck

- Run locally (uses `env` file if present):
  - `./scripts/run-drive-healthcheck.sh`
- Force prod/remote/local:
  - `DRIVE_HEALTHCHECK_TARGET=prod ./scripts/run-drive-healthcheck.sh`

## Backups

- Manual backup:
  - `make drive-backup`
- Backup root folder:
  - Uses `GOOGLE_DRIVE_BACKUP_FOLDER_ID` if set,
  - otherwise creates/uses `GOOGLE_DRIVE_BACKUP_ROOT_NAME` (default `filterfilms-backups`).
- Retention:
  - Set `DRIVE_BACKUP_RETENTION` to keep the most recent N backups (by created time).

## Token Refresh (Google OAuth)

If Drive auth fails (`invalid_client`/`invalid_grant`):

1. Run `scripts/drive-auth-once.ts` on the Google account owner’s machine.
2. Replace `GOOGLE_OAUTH_REFRESH_TOKEN` in prod env.
3. Re-sync envs + redeploy.

## Restore (Not Automated Yet)

- Restore will be added later. For now, manually copy files from a backup folder into the live folder.
