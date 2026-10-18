# Raise the Roof checkout refresh

Appearance-only branch, based on released flat-fee main. No API/pricing/order behavior changed. No deploy or merge without approval.

- Larger current RTR/TentBox festival logo across buyer header and confirmation.
- Warm-paper hero, deep green typography and orange ticket CTA; real roof-tent product image, date/location and partnership context.
- Existing ticket form, consent, required questions, quote, discount and payment mechanics untouched. Clear jump-to-form button; respects reduced motion.
- RTR-only hero and page palette; other named events receive their own name in the shared header rather than festival imagery.
- No placeholder promises or fabricated event photo. Venue/date/partnership copy comes from local RTR site materials and live checkout context. Current website fetch returned protected access, so local site assets/styles were inspected instead.

Replacement photograph selected after John rejected the community-event photo and approved another photo from TentBox's own website:
https://tentbox.com/products/tentbox-lite-xl
https://tentbox.com/cdn/shop/files/TLIXL-2026-05-SUN-comp.jpg?v=1776353744&width=816
Caption: Photo: TentBox Lite XL. Not the festival venue.
Product lifestyle image from the Lite XL page, not a different festival/event image. Former community-event image removed. No claim that the scene is Scampston.

Local current RTR logo source: rtr-site/assets/52019e94be557b50.webp. TentBox wordmark from existing backend branding asset. Both copied into checkout assets. No generated imagery.

Verification: production build passes. Compared live-before/local-after desktop 1440px and mobile 390px, with identical live API data and quotes. Local preview allowed read-only API responses through a test-only CORS header; no application CORS changes. No order submitted on live data. Full isolated regression passes: invalid/valid login, dashboard links, reload, organiser tabs, question creation/persistence, required question validation, free checkout, stored answers/order detail, mobile menu/login/logout. No external mail/payment. Visually inspected full-page and top-fold screenshots, including photo crop and wordmarks. No horizontal overflow at 390px.
