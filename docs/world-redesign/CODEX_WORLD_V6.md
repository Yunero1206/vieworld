# VieWorld v6 — fan display studio & artist communities

Updated 2026-09-12. Latest owner request supersedes v5 place allocation. No Antigravity calls, commits, pushes, resets or destructive data migrations.

## Implemented

- Artist World is a shared directory: generated sage arcade/portrait hall, featured artist, followed shortcuts and searchable artist/IP catalogue. It no longer owns a duplicate room or activity timeline.
- Moments is one selected artist's community: posts, live/concert corner, calendar with saved-only view, member Hall, contextual merchandise linked to specific VieSHOP product details. Existing /worlds/:worldId URLs render this community; header correctly selects Moments. World plaza, Archive and My Space remain artist-independent.
- My Space has a new sofa-free fan display studio and larger fan proportions. Five fixed, individually selectable fixtures: shirt, ticket, CD, lightstick, achievement. Keyboard-accessible shortcuts supplement small image hotspots. Same scene component is used for visitor rooms. Bio/mood moved below the room.
- Placement persists in fanProfile.displaySlots. Product display requires current own-tenant fulfilled receipt; card display uses selected history records; achievements require earned 10/20 thresholds. Clearing a slot preserves ownership/history; refunded products disappear. Displaying a physical shirt does NOT equip or grant its digital twin.
- Old roomDesign/showcaseSlots/publicIdentity.productIds data remain recoverable. Free furniture editor remains as compatibility component/tests but is no longer the main My Space experience. Bio form no longer exposes competing three-product selection.
- Order details show separate create/payment timestamps and a physical journey: shop confirms/packs → carrier handover → sorting center → last-mile delivery → delivered. Carrier, parcel code, location, ETA are clearly fictional. Digital receipts do not get parcel tracking. Expected-stage guard prevents retries from skipping/duplicating steps. Only final delivery grants ownership.
- New receipts persist createdAt/paidAt/fulfilledAt and shipment.events. Old receipts do not invent milestone timestamps from updatedAt. Times follow app demoTime, which may remain fixed while clicking through stages.

## Art

Built-in image generation (not CLI), with prompts recorded in public/images/world-v6/PROMPTS.json:
- myspace.png + myspace.webp: warm sage display studio, no sofa or baked UI/characters.
- artist.png + artist.webp: public portrait arcade, not another artist lounge/stage.
- shirt-cutout.png + shirt-cutout.webp: alpha-cutout decorative representation, derived from existing digital shirt art; shop product imagery unchanged.

Original generation outputs are retained. PNG originals and WebP runtime assets are copied into the repo. Sharp used only for format/size optimization and preserves alpha.

## Research translated into design

- Weverse official renewed home separates platform My Community entry from content within communities: https://campaigns.weverse.io/WV363N6H2?lang=EN
- Weverse Home tab combines artist information, notices/calendar: https://weverse.io/notice/36944 (app-specific update, not a claim that website has identical UI).
- Weverse desktop home/community notices: https://weverse.io/notice/29986
- The Sims official features: inspect rooms, place objects and customize a home: https://www.ea.com/en/games/the-sims/the-sims-4/features . Adapted as five stable purposeful fixtures rather than a full simulation.
- Shopee official help distinguishes carrier tracking/status and delivery-time support: https://help.shopee.vn/portal/4/article/79088 . VieSHOP models these information needs; it does not impersonate Shopee/SPX or call their services.

## Verification

- TypeScript app/tests passed.
- Vitest: 324/324 passed, using maxWorkers=2 to avoid overloaded Windows worker startup. Seven new v6 domain tests cover shipping progression, duplicate/stale steps, scope/status guards, display ownership/revocation, history and persistence.
- Vite production build passed using existing local esbuild WASM loader.
- Isolated Edge browser QA at 1440px and 390px: directory, community/legacy URL, all five community tabs, alternate IP, My Space/visitor, Archive/shop, physical order payment → five shipping stages → shirt placement → visitor item inspection. No page exceptions, failed image requests or horizontal overflow. User's localhost:4173 localStorage was not reset or altered by QA.
- Screenshots/report: C:/Users/VTD/Documents/Codex/2026-09-09/l/outputs/vieworld-world-v6 . Test report: outputs/vieworld-tests-v6.json.

## Boundaries

No real payment, carrier/GPS, artist broadcast, online fan presence or authenticated public room hosting. Membership/access/artist-avatar approval rules remain enforced. Other merchandise uses the retained illustrative product assets; backgrounds and shirt cutout are new. Artist fixtures remain fictional Artist A and Neon Sessions IP, not unapproved real celebrity data.
