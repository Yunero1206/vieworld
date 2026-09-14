# VieWorld — world places & merchandise checkpoint

Updated: 2026-09-11, Asia/Ho_Chi_Minh. Implemented directly in the existing repository. No Antigravity calls, no commit/push, no reset of existing data or unrelated source changes.

## Owner direction implemented

- Keep one fan identity and one public experience: Thế giới / VieSHOP / Phòng tôi.
- Artist A is a fictional Artist World; Neon Sessions is a fictional show/IP world, not a second app or another artist. Artist directory distinguishes the two and supports in-place search. Both reuse the same shell, fan identity and inventory.
- Horizontal places: Artist selector, membership Hall, Live Concert, Live Chat, listening corner, bag. Horizontal overflow is intentional on phones; the room itself also supports panning. Direct buttons mean walking is never required.
- Scene controls remain accessible DOM text/buttons, styled into the calendar board, wardrobe, shelf, stage, record table, shop and Hall rug. Shelf slots are small wooden frames instead of dashed boxes. Image failure retains usable controls.
- Hall checks current fan + current world + active membership + expiry against the demo clock. Posting, persistence, bounded message length, duplicate protection and local report/hide are implemented. The UI clearly says this is local-only demo chat, not real other fans or artist presence.
- Live Concert opens existing concert sessions/2D stage. Live Chat opens authored sample notes and links to the existing Drop-in interaction flow; it is not represented as an actual live artist DM.
- Shop has category, artist/IP, edition, search, sort and saved-item filters; product families; photo/digital image tabs; size selection; explicit included items; terms disclosure; and a fitting corner. Old stock/order records are preserved through additive catalog hydration.
- Physical-only, digital-only and Duo are separate SKUs. Only fulfilled digital/Duo receipts belonging to the current fan allow equip. Try-on stays temporary. Refunded/cancelled receipts no longer render a saved digital appearance. Closed orders cannot be repaid through the reducer.
- Membership and ticket are concept display items linking to the existing membership/schedule flows, not purchasable passes granting admission or rights.

## Image assets

Generated with builtin imagegen, not scraped product photos. Nine original PNGs copied into `public/images/merch-v2/`; original generated files preserved. Exact prompt template, per-image requests and original paths: `public/images/merch-v2/PROMPTS.json`.

| Design | Physical concept | Digital concept | Offer |
| --- | --- | --- | --- |
| Star Club shirt | shirt-physical.png | shirt-digital.png | Physical / digital / Duo |
| Everyday Star cap | cap-physical.png | cap-digital.png | Physical / digital separately |
| First Notes CD | cd-physical.png | None | Physical only; no music license |
| Star Light lightstick | lightstick-physical.png | lightstick-digital.png | Physical / digital separately |
| Membership | None | membership-digital.png | Display-only concept |
| Concert pass | None | ticket-digital.png | Display-only concept |

Avatar wearables are native SVG representations corresponding to these designs; the generated digital PNGs are catalog concepts, not rigged or production-ready game models.

## Validation

- TypeScript `tsc -p tsconfig.app.json --noEmit`: pass.
- Vitest: **275 / 275 tests pass**, including 16 new tests covering migration, tenant preservation, ownership, expiry, Hall posting, catalog filtering, artist search and non-purchasing try-on. Two legacy UI assertions were updated from hardcoded two-product counts to fixture-derived counts for the expanded catalog.
- Production Vite build: pass. Existing Windows native esbuild restriction handled by the local `esbuild-wasm-hooks.mjs` loader. A 526 kB application chunk still produces Vite's bundle-size warning; production code splitting remains follow-up work.
- Isolated Edge verification at 1440×900 and 390×844: world, room, shop, IP world and session screenshots; no document horizontal overflow or broken images; no runtime page errors. Scene/navigation scrolling is intentional.
- Tested letter persistence and focus restoration; wardrobe persistence; physical size/order/payment; bag and nested panels; session attendance → capsule → shelf/private note; digital try → buy → payment → fulfilment → equip → reload; directory search; Live Chat disclosure; Hall send → reload → report/hide.
- Browser test: `C:/Users/VTD/Documents/Codex/2026-09-09/l/work/verify-world-v2.mjs`.
- Evidence: `C:/Users/VTD/Documents/Codex/2026-09-09/l/outputs/vieworld-world-v2/` and `outputs/vieworld-tests-v2.json` under that workspace.
- Local preview verified HTTP 200 at http://127.0.0.1:4173/ serving the latest build. No public deployment.
- `git diff --check` still reports the pre-existing extra blank line at `src/index.css:3692`; that unrelated file was not edited in this iteration.

## Source grounding

- Phạm Thanh Phú, *VieWorld: From Artist Page to a Living Fan World*, v1.0, 8 September 2026. Read-only extraction of `C:/Users/VTD/Downloads/VieWorld_Living_Fan_World_Case_Study.docx`. Used its Artist/IP distinction, shallow optional spatial navigation, truthful presence, independent follow/membership/benefits, and explicit physical/digital entitlements. The owner's current Hall/shop request takes precedence over narrower old prototype inventory limits.
- Official Weverse Shop category organization and separation of memberships, kits and purchase details informed the shop's discoverability, not its artwork or visual identity: https://shop.weverse.io/en/home and https://shop.weverse.io/en/shop/USD/artists/2/sales/16222 (consulted 11 September 2026).

## Honest limitations / next work

This remains a local prototype: no real multiplayer, authenticated membership enforcement, server moderation, licensed artist streams, payments, shipping, ticket issuance or commercial return policies. Demo controls are not production authorization. Before launch, split physical fulfilment and digital grants into audited server-side records, add moderation/authentication and rights-approved media, finalize commercial terms, optimize image delivery and split operator routes out of the public bundle. Do not imply generated merchandise has been manufactured or is official artist merchandise.
