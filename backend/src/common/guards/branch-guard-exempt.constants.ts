/**
 * Controllers that legitimately do not apply BranchGuard, with the reason why.
 *
 * This list is the explicit, reviewed counterpart to the implicit assumption
 * enforced by guard-coverage.spec.ts: every controller either appears here
 * (a deliberate, documented exception) or applies BranchGuard. A controller
 * silently missing BranchGuard with no entry here is treated as a bug — that
 * exact bug class (users, sessions, academic-sessions, live-classes) is what
 * this list and its test exist to prevent from recurring.
 *
 * Entries marked TODO are known gaps being fixed in the remediation effort
 * tracked alongside this file — remove the entry in the same commit that adds
 * BranchGuard to the controller.
 */
export const BRANCH_GUARD_EXEMPT_CONTROLLERS: Record<string, string> = {
  'app.controller.ts': 'Root health/version endpoint, no tenant data.',
  'health/health.controller.ts': 'Infra liveness checks, no tenant data.',
  'public-api/public-api.controller.ts':
    'ApiKeyGuard-protected; branch scope is derived server-side from the validated API key record, not from request input.',
  'upload/upload.controller.ts':
    'Delegates branch scoping to the caller-supplied context validated inside the service; revisit if this drifts.',
  'providers/providers.controller.ts':
    'Provider health/balance are account-level (SMTP/SMS/WhatsApp config), not per-branch data.',
  'integrations/integrations.controller.ts':
    'API key management is per-account; branch scope is enforced inside service methods via ctx.',
  'search/search.controller.ts':
    'Global search is intentionally cross-branch for SUPER_ADMIN; branch users are scoped via req.user.branchId inside the service.',
  'translations/translations.controller.ts':
    'Public read by locale; bulk upsert is SUPER_ADMIN-only global i18n data, not branch-scoped.',
  'modules-config/modules-config.controller.ts':
    'Module toggles are branch-scoped inside the service via an explicit branchId param, not via BranchGuard/TenantContext.',
  'finance/payments.controller.ts':
    'Payment-gateway webhook, authenticated via provider signature verification, not JWT/branch context.',
  'automation/automation.controller.ts':
    'Automation config CRUD is branch-scoped inside the service via an explicit branchId param.',
  'automation/automation-health.controller.ts':
    'Read-only operational health metrics, not tenant data.',
  'live-classes/meet-oauth.controller.ts':
    'Google OAuth redirect/callback flow, no tenant data access.',
  'live-classes/meet-webhooks.controller.ts':
    'Google Meet webhook, authenticated via webhook secret, not JWT/branch context.',
  'settings/backup.controller.ts':
    'SUPER_ADMIN-only, operates across all branches by design.',

  // TODO(remediation): remove as each is fixed —
  // see /home/im-adam/.claude/plans/ethereal-dazzling-tide.md Phases 2-3.
  'alumni/alumni.controller.ts':
    'TODO(phase 3): orphaned/broken duplicate of the stakeholder-based alumni feature, slated for removal.',
};
