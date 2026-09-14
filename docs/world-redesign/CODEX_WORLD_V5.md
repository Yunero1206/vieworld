# VieWorld v5 — places, public identity and checkout

Updated 2026-09-12. Owner-requested local code iteration. No commit, push, public publication, real payment or Antigravity call.

## Changes

- Five main tabs: Artist World / Moments / My Space / Archive / VieSHOP. Logo returns to shared plaza.
- Artist gallery: followed-home shortcuts, approved featured artist, authored updates/upcoming demo events, searchable all/following/artist/program directory. Catalog remains one fictional artist and one fictional IP; no invented real artist roster or popularity numbers.
- Moments has three room entrances: stage/program schedule, saved appointments, member Hall. Ended events/replays live in Archive. Existing concert/listening deep links retained.
- Hall has Mai Anh and Minh Khang, explicitly fictional demo fans with sample conversation and clickable read-only rooms/items. Active membership gate and local message/report controls retained.
- My Space has bio/mood, earned badge selection, up to three fulfilled products selected for display, visitor preview and existing free room editing. Public projection excludes private notes, order receipts, support and full Archive. Refunded items disappear from public merchandise projection. Public visitor cannot edit the room.
- Archive has serialized sample card history, separate attendance evidence, voluntary cumulative 10/20 return simulation, exact-ID confirmation and permanent digital records. No voucher/access granted. Starts empty; explicit demo action adds 20 fictional cards without changing existing records or adding attendance. Six cards shown initially, with expansion and artist filter.
- Persistent cart supports size/quantity, physical/digital/Duo distinction, review consent, grouped pending checkout, atomic simulated payment, pending cancellation, separate per-receipt fulfilment/support. Add-to-cart grants no receipt or entitlement. Digital quantity is one. New receipts snapshot title/unit price/quantity; old receipts remain readable. Stock/eligibility revalidated at payment; retries do not duplicate receipts or inventory deductions.

## Research and case interpretation

Read `C:/Users/VTD/Desktop/DatVietVAC/DatVietVAC_Ownership_Belonging_Merchandise_Growth_Case_Study.docx`, focusing on Idea 2: exact card identity; physical custody separate from history; attendance separate from ownership. The owner's latest 10/20 request supersedes illustrative 20/50 case thresholds. No securities/share campaign, NFT, real ticket binding or physical-return logistics implemented.

Official Weverse references used for discovery/followed-home/activity separation:
- https://campaigns.weverse.io/WV363N6H2?lang=EN
- https://weverse.io/notice/23154
- https://apps.apple.com/us/app/weverse-connect-with-artists/id1456559188

The 2024 Highlight notice is historical; the current official app listing also describes consolidated feed/discovery. This layout is our design adaptation, not a claim of copying the current Weverse web screen. MFan search did not provide official detail used in implementation.

## Code and persistence

- `src/world/commerce.ts`: cart validation, group checkout/payment/cancellation, receipt totals.
- `src/world/history.ts`: opt-in fixtures, return guards, public identity validation.
- `src/world/community.ts`: fictional profiles and explicit public fan projection.
- `src/views/CartView.tsx`, `MemberSpaceView.tsx`, `ArtistGalleryView.tsx`.
- `src/components/ArchiveCollection.tsx`, `PublicIdentity.tsx`, `HallPanel.tsx`, `FanShell.tsx`.
- Existing FanWorldView, FanShopView, OrderDetailView, RoomInterior, types/reducer, App routes and `world-v5.css` integrated.

New persisted fields are optional within the existing schema; no reset or namespace replacement. QA used a fresh isolated origin/browser context, not the user's port-4173 storage. Unrelated worktree edits preserved.

## Verification

- TypeScript no-emit and production build passed using the existing Windows esbuild-WASM loader.
- Vitest: 317/317 passed, including 17 new v5 tests. Older tests updated for explicitly changed five-tab/cart behavior and copy.
- Isolated Edge browser 1440px/390px: navigation, artist search/follow/reload, mixed cart size/quantity, review/payment/fulfilment/wardrobe, Archive 10 then 20 returns/reload, identity/product display, Hall member visits and item inspection passed. No page errors, broken images or horizontal document overflow on checked routes.
- QA script: `C:/Users/VTD/Documents/Codex/2026-09-09/l/work/verify-world-v5.mjs`.
- Reports/screenshots: `C:/Users/VTD/Documents/Codex/2026-09-09/l/outputs/vieworld-world-v5/`.
- Existing unrelated `src/index.css` trailing-blank-line diff warning left unchanged.

## Remaining prototype boundaries

No real multiplayer, authenticated public profiles, ticket/QR ingestion, return verification, payment/shipping services or real artist catalog. Public rooms display representative objects; true isometric asset mounting can be refined separately. All returns, badges, transactions and sample fan interactions remain explicitly local demo.
