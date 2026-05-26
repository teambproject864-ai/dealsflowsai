# CI/CD Pipeline with Time Blocking

## Overview

This document describes the complete CI/CD pipeline for DealFlow.ai with integrated time blocking functionality. The pipeline ensures that blocked date/time slots are never exposed to users in any deployment environment.

## Pipeline Stages

### 1. Validate Blocked Times Configuration
- Validates the `config/blocked-times.json` file
- Checks for schema compliance
- Detects overlapping time slots
- Fails early if configuration is invalid

### 2. Build and Test
- Installs dependencies
- Runs ESLint for code quality
- Builds the application
- Runs all unit and integration tests
- Verifies time blocking logic

### 3. Security Scan
- Runs `npm audit` for dependency vulnerabilities
- Scans for secrets in codebase using TruffleHog

### 4. Deploy to Staging
- Deploys to staging environment
- Verifies time blocking is working correctly
- Fails and triggers rollback if verification fails

### 5. Deploy to Production
- Only triggered manually from main branch
- Deploys to production environment
- Verifies time blocking before finalizing deployment
- Includes automatic rollback on failure

## Time Blocking Feature

### Configuration File (`config/blocked-times.json`)

```json
{
  "blockedSlots": [
    {
      "id": "company-holiday-2026-12-25",
      "start": "2026-12-25T00:00:00Z",
      "end": "2026-12-26T00:00:00Z",
      "reason": "Christmas Day - Company Holiday",
      "type": "holiday",
      "environments": ["production", "staging"]
    }
  ]
}
```

### Schema

- `id`: Unique identifier for the blocked slot
- `start`: ISO 8601 datetime string (UTC)
- `end`: ISO 8601 datetime string (UTC)
- `reason`: Human-readable explanation
- `type`: One of ["holiday", "maintenance", "event", "other"]
- `environments`: Array of environments this slot applies to

### API Functions

```typescript
// lib/time-blocking.ts
loadBlockedTimesConfig(): BlockedTimesConfig
isTimeSlotBlocked(slotStart: Date, slotEnd: Date, environment: string): boolean
filterBlockedTimeSlots(slots: Array<any>, environment: string): Array<any>
getBlockedTimeSlotsForEnvironment(environment: string): BlockedTimeSlot[]
validateBlockedTimesConfig(): { valid: boolean; errors: string[] }
```

## Usage Instructions

### Adding a Blocked Time Slot

1. Edit `config/blocked-times.json`
2. Add a new entry to `blockedSlots` array
3. Run `npm run validate-blocked-times` to validate
4. Commit and push changes - pipeline will handle validation

### Modifying a Blocked Time Slot

1. Edit the existing entry in `config/blocked-times.json`
2. Run validation script
3. Commit changes

### Troubleshooting Pipeline Failures

#### Configuration Validation Failed
- Check `reports/blocked-times-validation.json` for details
- Common issues:
  - Invalid datetime format (must be ISO 8601 UTC)
  - Overlapping time slots in same environment
  - Missing required fields

#### Time Blocking Verification Failed
- Check deployment logs in `logs/deployment.log`
- Verify that all blocked slots are properly filtered
- Ensure environment variable `NEXT_PUBLIC_ENVIRONMENT` is correctly set

#### Deployment Rollback Triggered
- Rollback automatically happens if verification fails
- Check the previous deployment for stability
- Fix the issue before redeploying

## Security Considerations

- Least privilege access for deployment credentials
- All sensitive data encrypted in CI/CD secrets
- Audit logs maintained for all deployments
- Secrets scanning in every pipeline run
