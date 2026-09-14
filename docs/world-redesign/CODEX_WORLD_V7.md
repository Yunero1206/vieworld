# VieWorld v7 — less forced spatial UI

Owner revision: 2026-09-13. Supersedes v6 five-destination allocation.

## Shipped UX

- Four main tabs: Artist Home, Moments, My Space, VieSHOP; brand returns to outdoor VieWorld. Removed separate Archive doorway/nav and scope banner/link. Existing about-demo URL returns to the plaza, not a broken route.
- Artist Home: compact followed-artist shortcuts → highlights filtered by following/all → searchable artist/IP directory. All artist entries route directly to their Moments community. No hall diorama or hidden room hotspots. Highlight data is labeled sample, not fabricated popularity or real-time presence.
- Moments uses ordinary content tabs and explicit livestream/concert actions. Removed navigable room from Live and removed room backdrops from broadcast/session player. Maintains existing access and avatar approval/presence checks.
- My Space: Room display and Private collection tabs in the same account. Legacy archive URLs open the private collection in My Space. Notes, attendance, ticket history, achievements, replay and order tools remain available; no data migration/deletion.
- Custom: five fixed typed display slots; title search without accents, artist filter and date range. Only owned eligible items of the correct type. Explicit + display or hide, persisted independently from ownership/equip. Unknown old receipt dates are not invented and do not match date filters. Capsules can be chosen without leaking private notes. Public visitor gets selected display only.
- Existing room/gallery originals and legacy components retained for compatibility; unused public scene modules no longer imported into active FanWorldView. Public AboutDemo chunk no longer shipped through App route.

## Research rationale

Weverse distinguishes community entry points and personal/discovery feeds. Adapted for clarity rather than copying branding or assuming mobile-only features exist on desktop:

- Home feed/discovery/community access: https://weverse.io/notice/36020
- PC discover/join artist categories and community highlights: https://weverse.io/notice/29986
- Community information/calendar/notices: https://weverse.io/notice/36944

VieWorld keeps its warm Nunito / Be Vietnam Pro visual language, existing chibi assets, outdoor world and personal display room. No new generation needed for this content-navigation revision.

## Verification / reproduction

- TypeScript and production Vite build using existing esbuild WASM loader.
- Vitest including v7 tests for four tabs, removed scope UI, merged legacy archive, typed custom filters, capsule privacy.
- Browser script: C:/Users/VTD/Documents/Codex/2026-09-09/l/work/verify-world-v7.mjs
- Isolated Edge 1440/390 screenshot and journey report: C:/Users/VTD/Documents/Codex/2026-09-09/l/outputs/vieworld-world-v7
- Tests JSON: C:/Users/VTD/Documents/Codex/2026-09-09/l/outputs/vieworld-tests-v7.json
- Browser checks include discovery/community tabs, My Space/collection, old URLs, shipping purchase journey, custom search/clear and visitor display. User localhost:4173 storage is not touched by these isolated tests.

## Remaining product boundaries

Still local prototype: no real live artist service, payment, delivery tracking or authenticated public sharing. Demo disclosures are kept at these actions. Existing demo catalogue contains fictional Artist A and Neon Sessions IP; directory rendering supports additional fixture records without inventing real artist affiliations.
