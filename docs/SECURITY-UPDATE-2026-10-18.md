# Frontend dependency security update

Scope: runtime dependency updates only. No application source, database, payment settings, live event data or hosting settings changed.

## Versions
- Axios 1.13.6 -> 1.20.0
- follow-redirects 1.15.11 -> 1.16.1 (Axios dependency)
- form-data 4.0.5 -> 4.0.6 (Axios dependency)
- react-router-dom / react-router 6.30.3 -> 7.18.4
- @remix-run/router 1.23.2 removed from dependency tree

The application remains a declarative HashRouter React 18 application. No data-router or server-rendering conversion was needed. The Vite production build passes with the existing bundle-size advisory.

## Runtime audit
`npm audit --omit=dev`: 0 vulnerabilities, versus 6 flagged package entries before this update.

## Browser regression checks
Ran the actual production Vite build through local Chrome against the real backend with a disposable local PostgreSQL database. No external email keys, no real Stripe key, no live data.

Passed:
- Wrong password rejected, then correct password signs in.
- Dashboard event link, direct event URL and reload.
- Tickets, Checkout, Sales, Buyers, Reports and Settings tabs load without browser errors or server 500 responses.
- Organiser creates text/dropdown questions and sees them persist after reload.
- Public checkout receives ticket price quote and validates required dropdown.
- Optional text answer, mobile 390px layout without horizontal overflow.
- Free checkout completes, saves both answers, and organiser order details display them.
- Mobile navigation menu and logout.
- Protected event URL returns to login after logout.

Screenshots inspected: mobile login/menu, desktop/mobile checkout and organiser order details. A previous screenshot captured the mobile menu mid-animation; checked again with reduced motion and confirmed the fully open menu.

## Remaining scope
Full `npm audit` still reports 17 development/build-tool package entries (12 high, 4 moderate, 1 low). These are not included in the clean production-dependency audit. Do not interpret this change as all-dependency clearance or a full security audit. Some suggested fixes involve major Vite/Tailwind/plugin upgrades and need a separate tested build-tool update.

No merge or deployment without owner approval. Deployment should use the existing Railway frontend service, not unpause the parked Vercel project.
