# Vercel GitOps

This folder contains GitOps assets for Vercel env management.

Contents:

- envs/: SOPS-encrypted env files per environment.
- .sops.yaml: SOPS configuration (set your age recipient).
- sync-envs.sh: Sync env vars to Vercel via CLI.

Setup:

1. Create or provide an age keypair. Public key should look like: age1...
2. Update platform/vercel/.sops.yaml with your age recipient.
3. Add GitHub secrets:
   - AGE_KEY: your age private key (from ~/.config/sops/age/keys.txt)
   - VERCEL_TOKEN: a Vercel token with access to the project
4. Encrypt env files with sops (use the config file):
   - sops --config platform/vercel/.sops.yaml -e -i platform/vercel/envs/development.sops.env
   - sops --config platform/vercel/.sops.yaml -e -i platform/vercel/envs/preview.sops.env
   - sops --config platform/vercel/.sops.yaml -e -i platform/vercel/envs/production.sops.env
5. Run the sync script locally or via GitHub Actions.

Make targets:

- Encrypt all: make sops-encrypt
- Decrypt all (in-place, leaves plaintext): make sops-decrypt
- Sync one: make vercel-sync ENV=development|preview|production
- Sync all: make vercel-sync-all

Notes:

- GitHub Actions workflows must live in .github/workflows.
- Vercel environments on the free plan are: development, preview, production.
