# ⚠️ DATABASE PROTECTION - CRITICAL INFRASTRUCTURE

This document outlines the protection measures in place for the production DynamoDB table.

## Protected Resource

**Table Name:** `agency-narrative-crm`  
**Region:** `us-west-1`  
**Account:** `440047266716` (myagency)

---

## Protection Layers

### 1. DynamoDB Deletion Protection ✅
The table has `DeletionProtectionEnabled: true`. This prevents accidental deletion via:
- AWS Console
- AWS CLI (`aws dynamodb delete-table`)
- CloudFormation stack deletion

**To verify:**
```bash
AWS_PROFILE=myagency aws dynamodb describe-table \
  --table-name agency-narrative-crm \
  --region us-west-1 \
  --query 'Table.DeletionProtectionEnabled'
```

### 2. Point-in-Time Recovery (PITR) ✅
Continuous backups are enabled with a 35-day retention period.

**To restore from a point in time:**
```bash
AWS_PROFILE=myagency aws dynamodb restore-table-to-point-in-time \
  --source-table-name agency-narrative-crm \
  --target-table-name agency-narrative-crm-restored \
  --restore-date-time "2026-01-02T12:00:00Z" \
  --region us-west-1
```

**To verify PITR is enabled:**
```bash
AWS_PROFILE=myagency aws dynamodb describe-continuous-backups \
  --table-name agency-narrative-crm \
  --region us-west-1
```

### 3. IAM Deny Policy ✅
An explicit deny policy `DenyDynamoDBTableDeletion` is attached to:
- User: `agn-web-admin`
- Role: `athlete-narrative-api-prod-us-west-1-lambdaRole`

This provides defense-in-depth even if deletion protection is somehow disabled.

**Policy ARN:** `arn:aws:iam::440047266716:policy/DenyDynamoDBTableDeletion`

---

## ⛔ NEVER DO THE FOLLOWING

1. **Never add the table to CloudFormation/Serverless resources**
   - The table is managed externally
   - Adding it to `serverless.yml` resources section will cause conflicts

2. **Never delete the CloudFormation stack carelessly**
   - If you must delete the stack, ensure the table is retained
   - Use `--retain-resources` flag

3. **Never disable deletion protection**
   - Even temporarily "just to test"

4. **Never detach the IAM deny policy**
   - It's there as a safety net

---

## Emergency Recovery Procedures

### If table is accidentally deleted (with PITR enabled):
```bash
# List available restore points
AWS_PROFILE=myagency aws dynamodb describe-continuous-backups \
  --table-name agency-narrative-crm \
  --region us-west-1

# Restore to a new table
AWS_PROFILE=myagency aws dynamodb restore-table-to-point-in-time \
  --source-table-name agency-narrative-crm \
  --target-table-name agency-narrative-crm-restored \
  --use-latest-restorable-time \
  --region us-west-1

# After verification, rename/replace the original
```

### If deletion protection needs to be re-enabled:
```bash
AWS_PROFILE=myagency aws dynamodb update-table \
  --table-name agency-narrative-crm \
  --region us-west-1 \
  --deletion-protection-enabled
```

---

## Table Schema Reference

| Attribute | Type | Key Type |
|-----------|------|----------|
| PK | String | HASH |
| SK | String | RANGE |

### Global Secondary Indexes

| Index Name | Partition Key | Sort Key |
|------------|---------------|----------|
| GSI1 | GSI1PK | GSI1SK |
| GSI2ClientLists | clientId | createdAt |
| GSI3 | GSI3PK | GSI3SK |

---

## Audit Log

| Date | Action | Performed By |
|------|--------|--------------|
| 2026-01-02 | Enabled deletion protection | Cursor AI |
| 2026-01-02 | Enabled PITR | Cursor AI |
| 2026-01-02 | Created IAM deny policy | Cursor AI |
| 2026-01-02 | Created this documentation | Cursor AI |

---

**Last Updated:** 2026-01-02  
**Owner:** myagency team


