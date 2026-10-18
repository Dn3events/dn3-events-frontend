# Consent-aware marketing connections

Branch-only implementation. Do not activate or deploy without approval.

## Brevo

- Event settings have an optional positive `brevoListId`. Blank disables new contact jobs.
- Set `BREVO_MARKETING_ENABLED=true` and the existing server-only `BREVO_API_KEY` only after the organiser approves the account, destination list and launch. No key is exposed to the browser.
- A contact job is committed with each completed free order or verified paid Stripe order, only when that order has email opt-in and the event has a list configured. No pending-order, quote, guest, ticket-resend or historical-backfill syncing.
- The existing durable outbox handles retries and locking. While the feature or key is unavailable, contact jobs stay pending without consuming attempts. Failure does not undo the sale or block ticket email.
- Worker rereads eligibility and erasure state. Existing Brevo email blocklisting is respected; it never sends `emailBlacklisted=false`, changes the email address, sends a campaign or triggers the transactional-email API for contact sync.
- Only email and destination-list membership are sent. Consent time stays on the ticket order. The provider must retain its unsubscribe controls; no campaign has been configured by this change.
- Operational caveat: remote erasure/withdrawal of contacts already synced must be actioned in Brevo as well as the ticket database. This PR does not install unsubscribe webhooks or a historical reconciliation job. Campaign automations attached to a chosen list must be reviewed before activation: adding a contact to such a list can trigger pre-existing provider automation.
- New nullable schema column requires migration `20261018002000_marketing_connections` before deployment. No live migration has been run.

## Meta Pixel

The frontend uses the event's existing optional `facebookPixel` setting, validated as digits only. It loads no Meta SDK before separate advertising-cookie consent. Email opt-in does not grant advertising consent. No tracking if unset, refused or pending payment. It sends explicit single-pixel PageView and confirmed Purchase events, total and currency only, with automatic configuration disabled. No advanced matching, buyer PII, question answers, payment reference or order IDs are passed as event data. Meta still receives normal network/browser identifiers, disclosed in the consent UI and privacy notice.

The payment bearer reference is held in session storage and removed from the visible URL before the SDK can load. If storage fails, the reference stays visible and tracking is disabled. Refusal is remembered for six months. Withdrawal revokes consent, deletes accessible Meta first-party cookies and reloads to unload the SDK. Purchase replay is suppressed in this tab's session storage. This is best-effort browser measurement, not financial reporting or cross-device deduplication. An ad blocker, closed tab or refusal can prevent measurement. No Conversions API is installed.

## Verification

153 backend tests, including eight new marketing tests, pass against disposable Postgres. Mocked browser checks cover no pre-consent SDK, refusal across reload, grant, withdrawal, no pending/refused-purchase tracking, completed free order, independent email consent, sanitised success URL and refresh deduplication. Existing full login/mobile/checkout/questions/order regression passes. SDK requests are intercepted, not sent to Meta. Brevo fetches are mocked, never sent to live contacts. Live-provider validation remains for a separately approved launch.

References:
- https://developers.brevo.com/reference/create-contact
- https://developers.brevo.com/reference/get-contact-info
- https://developers.facebook.com/docs/meta-pixel/implementation/gdpr/ (public documentation access was unavailable during this run)

Additional implementation references inspected: https://stackoverflow.com/questions/48858665/disable-facebook-pixel-code-on-specific-button-click-events and https://github.com/nuxt/scripts/blob/main/packages/script/src/runtime/registry/meta-pixel.ts . These support explicit events/consent commands and disabling automatic configuration; they do not replace live-provider launch validation.
