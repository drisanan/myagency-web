#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Safe production deploy for Serverless infrastructure.
#
# Reads ONLY the secrets (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
# OPENAI_KEY) from .env.local and explicitly sets production values
# for any env var that differs between local dev and production.
#
# This prevents localhost URLs from leaking into production deploys.
# ─────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env.local"

# ── 1. Extract only the secrets we need from .env.local ──
if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ .env.local not found at $ENV_FILE"
  echo "   Create it with GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and OPENAI_KEY"
  exit 1
fi

# Read individual values (strips quotes and surrounding whitespace)
get_env() {
  grep "^$1=" "$ENV_FILE" 2>/dev/null | head -1 | cut -d'=' -f2- | sed 's/^[[:space:]"]*//;s/[[:space:]"]*$//'
}

GOOGLE_CLIENT_ID="$(get_env GOOGLE_CLIENT_ID)"
GOOGLE_CLIENT_SECRET="$(get_env GOOGLE_CLIENT_SECRET)"
OPENAI_KEY="$(get_env OPENAI_KEY)"

if [[ -z "$GOOGLE_CLIENT_ID" || -z "$GOOGLE_CLIENT_SECRET" ]]; then
  echo "❌ GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required in .env.local"
  exit 1
fi

# ── 2. Safety check: ensure no localhost URLs will be deployed ──
echo "🔍 Production deploy safety check..."
echo "   GOOGLE_REDIRECT_URI → using serverless.yml default (https://api.myrecruiteragency.com/google/oauth/callback)"
echo "   FRONTEND_URL         → using serverless.yml default (https://www.myrecruiteragency.com)"
echo ""

# ── 3. Export ONLY the secrets — everything else uses serverless.yml defaults ──
export GOOGLE_CLIENT_ID
export GOOGLE_CLIENT_SECRET
export OPENAI_KEY
export AWS_PROFILE="${AWS_PROFILE:-myagency}"

# Explicitly UNSET any localhost vars that might be in the shell environment
unset GOOGLE_REDIRECT_URI 2>/dev/null || true
unset FRONTEND_URL 2>/dev/null || true
unset NEXT_PUBLIC_API_BASE_URL 2>/dev/null || true
unset IS_OFFLINE 2>/dev/null || true

STAGE="${STAGE:-prod}"
REGION="${AWS_REGION:-us-west-1}"

echo "🚀 Deploying athlete-narrative-api to stage=$STAGE region=$REGION"
echo ""

serverless deploy --stage "$STAGE" --region "$REGION"

echo ""
echo "✅ Deploy complete!"
