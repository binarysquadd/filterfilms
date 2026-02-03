#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT="${1:-}"

if [[ -z "${ENVIRONMENT}" ]]; then
  echo "Usage: $0 <development|preview|production>" >&2
  exit 1
fi

case "${ENVIRONMENT}" in
  development|preview|production) ;;
  *)
    echo "Invalid environment: ${ENVIRONMENT}" >&2
    exit 1
    ;;
esac

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SOPS_CONFIG="${ROOT_DIR}/platform/vercel/.sops.yaml"
ENC_FILE="${ROOT_DIR}/platform/vercel/envs/${ENVIRONMENT}.sops.env"

if [[ ! -f "${ENC_FILE}" ]]; then
  echo "Missing file: ${ENC_FILE}" >&2
  exit 1
fi

if ! command -v sops >/dev/null 2>&1; then
  echo "sops is required" >&2
  exit 1
fi

if ! command -v vercel >/dev/null 2>&1; then
  echo "vercel CLI is required" >&2
  exit 1
fi

if [[ ! -f "${SOPS_CONFIG}" ]]; then
  echo "Missing SOPS config: ${SOPS_CONFIG}" >&2
  exit 1
fi

SENSITIVE_FLAG="--sensitive"
if [[ "${ENVIRONMENT}" == "development" ]]; then
  SENSITIVE_FLAG=""
fi

# Decrypt to stdout, then push each KEY=VALUE line to Vercel.
# Assumes values may contain '=' but not newlines.
sops --config "${SOPS_CONFIG}" -d "${ENC_FILE}" | \
  sed '/^\s*#/d;/^\s*$/d' | \
  while IFS='=' read -r key value; do
    if [[ -z "${key}" ]]; then
      continue
    fi
    # Strip surrounding quotes if present to avoid pushing quoted values.
    if [[ "${value}" == \"*\" && "${value}" == *\" ]]; then
      value="${value#\"}"
      value="${value%\"}"
    elif [[ "${value}" == \'*\' && "${value}" == *\' ]]; then
      value="${value#\'}"
      value="${value%\'}"
    fi
    printf "%s" "${value}" | vercel env add "${key}" "${ENVIRONMENT}" --force --yes ${SENSITIVE_FLAG} --cwd .
  done
