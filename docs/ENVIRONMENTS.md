# Environment Configuration Guide

This document describes the two clean environments: **Local Development** and **Production**.

## Overview

| Environment | Frontend | API | Database |
|-------------|----------|-----|----------|
| **Local** | http://localhost:3000 | http://localhost:3001 | DynamoDB (us-west-1, table: `agency-narrative-crm`) |
| **Production** | https://www.myrecruiteragency.com | https://api.myrecruiteragency.com | DynamoDB (us-west-1, table: `agency-narrative-crm`) |

> ⚠️ **Important**: Both environments use the **same production DynamoDB table**. Local development reads/writes real data. Be careful with destructive operations.

---

## Local Development Environment

### Prerequisites

1. **AWS CLI** configured with the `myagency` profile
2. **Node.js** (v20+)
3. **Chrome** browser (for Selenium tests)

### Starting Local Servers

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - API:**
```bash
npm run dev:api
```

### How Local API Works

The `dev:api` script sets these environment variables:
- `IS_OFFLINE=true` - Signals serverless-offline mode
- `AWS_PROFILE=myagency` - Uses your local AWS credentials
- `AWS_REGION=us-west-1` - Targets the production region
- `TABLE_NAME=agency-narrative-crm` - Uses the production table

When `IS_OFFLINE=true`, the DynamoDB client loads credentials from your `~/.aws/credentials` file using the `myagency` profile.

### Verify Local Setup

```bash
# Check API health
curl http://localhost:3001/health

# Check frontend
curl http://localhost:3000 | head -5
```

---

## Production Environment

### Deployment

**Deploy API (Lambda functions):**
```bash
AWS_PROFILE=myagency \
GOOGLE_CLIENT_ID="<your-google-client-id>" \
GOOGLE_CLIENT_SECRET="<your-google-client-secret>" \
npm run infra:deploy
```

**Deploy Frontend:**
Frontend deploys automatically via AWS Amplify when pushing to `master`:
```bash
git push origin HEAD
```

### Verify Production

```bash
curl https://api.myrecruiteragency.com/health
```

---

## Running Tests

### Selenium Tests Against Production

```bash
BASE_URL=https://www.myrecruiteragency.com \
API_BASE_URL=https://api.myrecruiteragency.com \
npm run test:selenium:all
```

### Selenium Tests Against Local

```bash
BASE_URL=http://localhost:3000 \
API_BASE_URL=http://localhost:3001 \
npm run test:selenium:all
```

### Individual Test Commands

| Test | Command |
|------|---------|
| Intake Flow | `npm run test:selenium:intake` |
| Client Create | `npm run test:selenium:client-create` |
| Agency Wizard | `npm run test:selenium:agency-wizard` |
| Athlete Profile | `npm run test:selenium:athlete-profile` |
| Public Profile | `npm run test:selenium:athlete-profile-public` |
| Lists | `npm run test:selenium:lists` |
| All Tests | `npm run test:selenium:all` |

---

## Production Safety

### How We Protect Production

1. **AWS Credentials Isolation**
   - Production Lambda uses IAM role credentials (automatic)
   - Local development uses `myagency` AWS profile (explicit)
   - The `IS_OFFLINE` flag determines which credential source is used

2. **Environment Variable Defaults**
   - `TABLE_NAME` defaults to `agency-narrative-crm` in both environments
   - `AWS_REGION` defaults to `us-west-1`

3. **Code Safety**
   ```typescript
   // In common.ts - credentials only loaded from profile when IS_OFFLINE=true
   const client = new DynamoDBClient({ 
     region: process.env.AWS_REGION || 'us-west-1',
     credentials: IS_OFFLINE ? fromIni({ profile: 'myagency' }) : undefined
   });
   ```

### What NOT to Do

- ❌ Never set `IS_OFFLINE=true` in production Lambda environment
- ❌ Never deploy with test/mock credentials
- ❌ Never run destructive database operations without verification

---

## Troubleshooting

### "ResourceNotFoundException: Requested resource not found"

**Cause:** DynamoDB table not found or wrong region.

**Fix:** Ensure `AWS_REGION=us-west-1` and `TABLE_NAME=agency-narrative-crm` are set.

### "Cookie not being set locally"

**Cause:** Cookie domain mismatch.

**Fix:** Local development uses `localhost` domain. Ensure you're accessing via `http://localhost:3000`.

### "401 Unauthorized on local API"

**Cause:** Session cookie not being sent or AWS credentials not loading.

**Fix:**
1. Check `AWS_PROFILE=myagency` is set
2. Verify `~/.aws/credentials` has the `myagency` profile
3. Restart both frontend and API servers

---

## Quick Reference

```bash
# Start local development
npm run dev        # Terminal 1 - Frontend
npm run dev:api    # Terminal 2 - API

# Deploy to production
git push origin HEAD                    # Frontend (Amplify auto-deploy)
AWS_PROFILE=myagency npm run infra:deploy  # API (manual)

# Run tests locally
BASE_URL=http://localhost:3000 API_BASE_URL=http://localhost:3001 npm run test:selenium:intake

# Run tests against production
BASE_URL=https://www.myrecruiteragency.com API_BASE_URL=https://api.myrecruiteragency.com npm run test:selenium:intake
```
