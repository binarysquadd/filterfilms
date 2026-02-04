# Vercel Env Management

Purpose: GitOps-style env management for Vercel projects.

Files:

- `platform/vercel/envs/*.sops.env`
- `platform/vercel/sync-envs.sh`

Setup:

1. Create or provide an age keypair. Public key should look like: age1...
2. Update `platform/vercel/.sops.yaml` with your age recipient.
3. Add GitHub secrets:
   - `AGE_KEY` (age private key, from `~/.config/sops/age/keys.txt`)
   - `VERCEL_TOKEN` (Vercel token with access to the project)
4. Encrypt env files with sops:
   - `sops --config platform/vercel/.sops.yaml -e -i platform/vercel/envs/development.sops.env`
   - `sops --config platform/vercel/.sops.yaml -e -i platform/vercel/envs/preview.sops.env`
   - `sops --config platform/vercel/.sops.yaml -e -i platform/vercel/envs/production.sops.env`
5. Run the sync script locally or via GitHub Actions.

Common commands:

- Encrypt all envs: `make sops-encrypt`
- Sync one env: `make vercel-sync ENV=production`
- Sync all: `make vercel-sync-all`

Notes:

- Dev/Preview/Prod are the only envs on free plan.
- Vercel hides env values; source of truth is the encrypted env files.
