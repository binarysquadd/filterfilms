SOPS_CONFIG := platform/vercel/.sops.yaml
SOPS_FILES := $(wildcard platform/vercel/envs/*.sops.env)

.PHONY: sops-encrypt sops-decrypt vercel-sync vercel-sync-all vercel-deploy-preview vercel-deploy-prod dev drive-backup test creds-encrypt creds-decrypt

sops-encrypt:
	@for f in $(SOPS_FILES); do \
		sops --config $(SOPS_CONFIG) -e -i $$f; \
	done

sops-decrypt:
	@for f in $(SOPS_FILES); do \
		sops --config $(SOPS_CONFIG) -d -i $$f; \
	done

creds-encrypt:
	@sops --config $(SOPS_CONFIG) -e -i platform/creds/gcp-oauth-client.sops.json
	@sops --config $(SOPS_CONFIG) -e -i platform/creds/firebase-admin.sops.json

creds-decrypt:
	@sops --config $(SOPS_CONFIG) -d -i platform/creds/gcp-oauth-client.sops.json
	@sops --config $(SOPS_CONFIG) -d -i platform/creds/firebase-admin.sops.json

vercel-sync:
	@if [ -z "$(ENV)" ]; then \
		echo "Usage: make vercel-sync ENV=development|preview|production" >&2; \
		exit 1; \
	fi
	@platform/vercel/sync-envs.sh $(ENV)

vercel-sync-all:
	@platform/vercel/sync-envs.sh development
	@platform/vercel/sync-envs.sh preview
	@platform/vercel/sync-envs.sh production

vercel-deploy-preview:
	@vercel --cwd .

vercel-deploy-prod:
	@vercel --prod --cwd .

dev:
	@npm run dev

drive-backup:
	@./scripts/run-drive-backup.sh

test:
	@npm test
