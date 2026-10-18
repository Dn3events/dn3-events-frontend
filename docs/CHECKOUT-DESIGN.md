# Raise the Roof checkout refresh

Appearance-only branch, based on released flat-fee main. No API/pricing/order behavior changed. No deploy or merge without approval.

- Larger current RTR/TentBox festival logo across buyer header and confirmation.
- Warm-paper hero, deep green typography and orange ticket CTA; real community-camping image, date/location and partnership context.
- Existing ticket form, consent, required questions, quote, discount and payment mechanics untouched. Clear jump-to-form button; respects reduced motion.
- RTR-only hero and page palette; other named events receive their own name in the shared header rather than festival imagery.
- No placeholder promises or fabricated event photo. Venue/date/partnership copy comes from local RTR site materials and live checkout context. Current website fetch returned protected access, so local site assets/styles were inspected instead.

Newly sourced photograph, not reused from existing RTR site:
https://tentbox.com/blogs/travel-tips/a-wild-camping-adventure
https://tentbox.com/cdn/shop/articles/2807_-_TentBox_Takeover_CoCos_Wild_Camp-163.jpg?v=1722869629
Caption: Photo: TentBox community event. Not the festival venue.
This is a TentBox-owned public article image. Partnership is established, but a separate image-licensing grant was not verified during this design task; confirm partner usage rights before publication if the partnership does not cover this image.

Local current RTR logo source: rtr-site/assets/52019e94be557b50.webp. TentBox wordmark from existing backend branding asset. Both copied into checkout assets. No generated imagery.

Verification: production build passes. Compared live-before/local-after desktop 1440px and mobile 390px, with identical live API data and quotes. Local preview allowed read-only API responses through a test-only CORS header; no application CORS changes. No order submitted on live data. Full isolated regression passes: invalid/valid login, dashboard links, reload, organiser tabs, question creation/persistence, required question validation, free checkout, stored answers/order detail, mobile menu/login/logout. No external mail/payment. Visually inspected full-page and top-fold screenshots, including photo crop and wordmarks. No horizontal overflow at 390px.
