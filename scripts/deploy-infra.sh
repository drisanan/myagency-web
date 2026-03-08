#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Safe production deploy for Serverless infrastructure.
#
# Reads ONLY the secrets required for infrastructure from .env.local and
# explicitly sets production values
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
  echo "   Create it with GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, OPENAI_KEY,"
  echo "   SESSION_SECRET, FORMS_SECRET, and CRON_SECRET"
  exit 1
fi

# Read individual values (strips quotes and surrounding whitespace)
get_env() {
  grep "^$1=" "$ENV_FILE" 2>/dev/null | head -1 | cut -d'=' -f2- | sed 's/^[[:space:]"]*//;s/[[:space:]"]*$//'
}

GOOGLE_CLIENT_ID="$(get_env GOOGLE_CLIENT_ID)"
GOOGLE_CLIENT_SECRET="$(get_env GOOGLE_CLIENT_SECRET)"
OPENAI_KEY="$(get_env OPENAI_KEY)"
SESSION_SECRET="$(get_env SESSION_SECRET)"
FORMS_SECRET="$(get_env FORMS_SECRET)"
CRON_SECRET="$(get_env CRON_SECRET)"

if [[ -z "$GOOGLE_CLIENT_ID" || -z "$GOOGLE_CLIENT_SECRET" || -z "$OPENAI_KEY" || -z "$SESSION_SECRET" || -z "$FORMS_SECRET" || -z "$CRON_SECRET" ]]; then
  echo "❌ Missing one or more required secrets in .env.local"
  echo "   Required: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, OPENAI_KEY, SESSION_SECRET, FORMS_SECRET, CRON_SECRET"
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
export SESSION_SECRET
export FORMS_SECRET
export CRON_SECRET
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
