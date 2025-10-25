# Security Guidelines for CarerView

## Critical Security Notice

This document outlines security practices and incident response procedures for the CarerView application.

## Environment Variables

### Current Status
- `.env` file is in `.gitignore` (DO NOT COMMIT)
- Current Supabase credentials in `.env` are EXPOSED in git history
- **ACTION REQUIRED**: Rotate credentials immediately after deployment

### Supabase Credential Rotation

If credentials have been exposed, follow these steps:

1. **Log into Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard

2. **Rotate Anon Key**
   - Go to: Project Settings → API
   - Click "Generate new anon key"
   - Update `.env` with new `VITE_SUPABASE_ANON_KEY`

3. **Rotate Service Role Key** (if exposed)
   - Go to: Project Settings → API
   - Click "Generate new service_role key"
   - Update Supabase Function secrets
   - Update any CI/CD secrets

4. **Update All Deployments**
   - Update environment variables in .env file
   - Republish application via Bolt Publishing
   - Update Supabase Functions with new keys

5. **Verify Rotation**
   - Test authentication flow
   - Test Stripe webhooks
   - Monitor error logs for 24 hours

### Environment Variable Best Practices

**NEVER commit these files:**
- `.env`
- `.env.local`
- `.env.production`
- Any file containing API keys, tokens, or secrets

**DO commit:**
- `.env.example` (with placeholder values)

## Row Level Security (RLS)

### Tables with RLS Enabled

All user-facing tables have RLS enabled and policies configured:

1. **profiles** - User profile data
2. **observations** - Caregiver observations
3. **responses** - Observation responses
4. **cv_team** - Team management
5. **cv_team_members** - Team membership
6. **cv_team_invites** - Invitation tokens
7. **cv_team_patient** - Patient PHI/PII data
8. **user_subscriptions** - Subscription data
9. **stripe_customers** - Stripe customer mapping
10. **stripe_subscriptions** - Stripe subscription data
11. **stripe_orders** - Stripe order data

### Critical RLS Rules

- All policies verify `auth.uid()` for user identity
- Patient data (cv_team_patient) is restricted to team members only
- Invite tokens (cv_team_invites.token_hash) should NEVER be selected
- Team access requires active membership verification

## Invite Token Security

### Token Flow
1. Token generated server-side (32 bytes random)
2. Token hashed with SHA-256 before storage
3. Plaintext token sent via URL (one-time use)
4. Token stored in sessionStorage (not localStorage)
5. Token cleared after use or failure

### Token Storage Rules
- **sessionStorage**: Cleared when browser tab closes
- **localStorage**: Persists indefinitely (DO NOT USE for tokens)
- **URL parameters**: Only for initial transmission
- Tokens expire after 7 days

### Reviewing Invite Code
The invite flow in `src/pages/AcceptInvite.tsx` has been secured:
- Changed from localStorage to sessionStorage
- Token cleared immediately after use or error
- Better error messages for user feedback

## Stripe Webhook Security

### Signature Verification
- All webhooks verify Stripe signature
- Supports multiple secrets for rotation
- Invalid signatures return 400 error
- Failed attempts logged to console

### Webhook Secrets Management
Located in: Supabase → Project Settings → Functions → Secrets

```
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

Or for rotation:
```
STRIPE_WEBHOOK_SECRETS=["whsec_old", "whsec_new"]
```

## CORS Configuration

### Current CORS Settings
All Supabase Edge Functions use:
```typescript
'Access-Control-Allow-Origin': '*'
```

### Production Recommendations
1. Restrict to specific origins:
   ```typescript
   'Access-Control-Allow-Origin': 'https://carerview.com'
   ```

2. Or validate origin dynamically:
   ```typescript
   const allowedOrigins = ['https://carerview.com', 'https://www.carerview.com'];
   const origin = req.headers.get('origin');
   const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
   ```

## Security Definer Functions

Functions running with elevated privileges:

1. `cv_get_active_team()` - Gets user's active team
2. `cv_set_active_team(p_team)` - Sets active team (validates membership)
3. `cv_create_team_with_patient()` - Creates team atomically
4. `cv_list_members(p_team)` - Lists team members (validates membership)
5. `cv_get_remaining(p_team)` - Gets observation quota (validates membership)
6. `cv_check_team_seats(p_team)` - Checks seat availability
7. `cv_create_invite(p_team, p_email)` - Creates invite token
8. `cv_accept_invite(p_token)` - Accepts invite token
9. `cv_apply_plan_to_owner_teams(p_owner, p_plan_id)` - Enforces plan limits (service_role only)

### Validation Requirements
All SECURITY DEFINER functions MUST:
- Verify `auth.uid()` is not null
- Validate user has permission for the operation
- Use explicit permission checks (not RLS bypass)
- Log sensitive operations

## Audit Logging

### Currently Logged
- Admin user deletion (`admin_events` table)

### Recommended Additions
1. Team membership changes
2. Observation deletion
3. Plan enforcement actions
4. Failed authentication attempts
5. Invite creation/acceptance

### Implementing Audit Logs
```sql
INSERT INTO public.admin_events (
  admin_id,
  event_type,
  event_data,
  created_at
) VALUES (
  auth.uid(),
  'team_member_removed',
  jsonb_build_object('team_id', team_id, 'user_id', removed_user_id),
  now()
);
```

## Rate Limiting

### Current Status
⚠️ **NO RATE LIMITING IMPLEMENTED**

### Recommended Implementation
Use Supabase Edge Functions with rate limiting:

```typescript
// Example using Upstash Redis
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

const identifier = req.headers.get("x-forwarded-for") ?? "anonymous";
const { success } = await ratelimit.limit(identifier);

if (!success) {
  return new Response("Too many requests", { status: 429 });
}
```

## Authentication Security

### Password Requirements
Enforced by Supabase Auth:
- Minimum 6 characters (Supabase default)
- No complexity requirements by default

### Recommendations
1. Enable email confirmation (currently disabled)
2. Implement MFA for admin accounts
3. Add password strength indicator
4. Monitor failed login attempts

## Data Classification

### PHI/PII Data
Handled in accordance with HIPAA guidelines:
- `cv_team_patient.full_name`
- `cv_team_patient.date_of_birth`
- `observations.patient_name`
- `profiles.email`

### Access Controls
- PHI accessible only to team members
- RLS policies enforce access restrictions
- Encrypted at rest (Supabase default)
- Encrypted in transit (HTTPS only)

## Incident Response

### Data Breach Procedure
1. **Identify**: Determine scope and affected data
2. **Contain**: Revoke exposed credentials immediately
3. **Assess**: Review audit logs for unauthorized access
4. **Notify**: Contact affected users within 72 hours (HIPAA requirement)
5. **Document**: Record incident details and response actions
6. **Review**: Update security measures to prevent recurrence

### Contact Information
- Security Lead: [TO BE ADDED]
- Supabase Support: support@supabase.com
- Stripe Support: https://support.stripe.com

## Security Checklist for Production

- [ ] Rotate all Supabase credentials
- [ ] Enable email confirmation for new signups
- [ ] Implement rate limiting on auth endpoints
- [ ] Restrict CORS to production domains
- [ ] Enable Stripe webhook signature verification
- [ ] Set up security monitoring/alerting
- [ ] Review and test all RLS policies
- [ ] Conduct penetration testing
- [ ] Set up automated security scanning
- [ ] Document incident response procedures
- [ ] Enable database backups
- [ ] Implement audit logging for sensitive operations
- [ ] Add Content Security Policy headers
- [ ] Review SECURITY DEFINER functions
- [ ] Test data export/deletion workflows

## Regular Security Tasks

### Weekly
- Review Supabase logs for anomalies
- Check failed authentication attempts
- Monitor Stripe webhook failures

### Monthly
- Review RLS policies for gaps
- Audit user permissions
- Check for unused/stale invites
- Review team membership roster

### Quarterly
- Rotate Stripe webhook secrets
- Review and update this document
- Conduct security training
- Test incident response procedures

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email security contact (TO BE ADDED)
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if known)

## Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/security)
- [Stripe Security Best Practices](https://stripe.com/docs/security/guide)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/)

---

Last Updated: 2025-10-22
Next Review: 2026-01-22
