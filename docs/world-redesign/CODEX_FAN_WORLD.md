# VieWorld — one fan & artist world

Implementation checkpoint: 2026-09-11. Owner requested direct Codex implementation, superseding the three public partner-surface direction. No Antigravity/model calls used. Existing uncommitted work retained; no commit or push performed.

## Public experience

- Three persistent destinations: Thế giới, VieSHOP, Phòng tôi.
- One public VieWorld shell. Artist A and Neon Sessions are places within the same experience, not account/platform switches.
- World entry is an interactive illustrated room with a fan avatar. Stage, record player, noticeboard and store open contextual panels/routes.
- Artist letters are explicitly authored fictional demo content. Reading/saving a letter changes the suggested next action; visiting remembers the last world. Neither grants attendance, membership nor purchase rights.
- Personal room connects wardrobe, reminders and a three-slot keepsake shelf. Saved capsules, private notes, placement and removal persist locally.
- VieSHOP uses original SVG product illustrations and the existing product/order domain. Fan appearance follows across world/room/store. Creating an order never automatically pays; payment and fulfilment remain separate simulations. Stock and benefit eligibility guards remain enforced.
- Membership, benefits and support are reached through the bag. Existing order, benefit, session, operator and support detail routes remain available.
- Shared avatar rendering now includes artist accessories/outfits; Studio can preview explicitly disclosed drafts, while public stage rendering remains approval-gated. SVG paint IDs are unique per instance.
- Object panels support Escape, focus trapping/restoration, browser navigation and direct links. Mobile pans the room horizontally without overflowing the document. Reduced-motion preferences disable movement. Missing scene art preserves object controls.

## Source map

- `src/components/FanShell.tsx`: public navigation, quiet platform chrome; no partner selector.
- `src/views/FanWorldView.tsx`: world, room and contextual panels.
- `src/views/FanShopView.tsx`: shared store and product/order flow.
- `src/components/WorldPanel.tsx`: accessible scene overlay.
- `src/components/ProductVisual.tsx`: original vector merchandise illustrations.
- `src/world/fanWorld.ts`: fictional letters and next-session ordering.
- `src/styles/fan-world.css`: scoped public visual layer, retaining existing domain screens.
- `src/tests/fan_world_experience.test.tsx`: 11 additional public experience regression tests.

## Compatibility and scope

Old component files remain for compatibility/tests but the app routes use the new FanShell/FanWorldView/FanShopView. Legacy `zone`/`drawer` query links are mapped where supported. Help links now open the intended room/world panel directly.

The public UI is unified. Historical partner storage namespaces are intentionally NOT destructively merged or erased. VieWorld's existing local state is retained; `worldJourney` is optional, so old saved profiles continue to load. This is not external account federation.

Existing room artwork is reused; Neon currently shares the room layout with a different visual treatment, not bespoke new art. The avatar is a lightweight 2D character, not a multiplayer/game-engine implementation. The shop currently contains the existing demo merchandise catalogue, not newly implemented digital-item fulfilment. Session/transaction/operator detail screens retain their existing functional structures. Real artist presence, payments, ticket issuance and cross-device accounts are not implemented by this redesign.

## Verification

- TypeScript app check: pass.
- Vitest: 259/259 tests pass (26 files), including 11 new tests.
- Real Vite production build: pass. Existing large-chunk warning remains (~502 kB uncompressed main chunk).
- Production bundle tested in isolated headless Edge at 1440×900 and 390×844: world, room, store, Neon and session render with no runtime errors, missing images or document horizontal overflow.
- Browser interactions checked: letter persistence; modal Escape/focus and nested navigation; wardrobe across room/store after reload; order creation and simulated payment; bag/support; live attendance → capsule → shelf; private-note persistence; shelf removal preserving collection.

This Windows session could not execute native esbuild directly, so Vite/Vitest were run using the existing scratch esbuild-WASM loader with `--configLoader runner`. Application dependencies were not replaced. Commands and reports are in the Codex task workspace:

```powershell
node node_modules/typescript/bin/tsc -p tsconfig.app.json --noEmit
node --experimental-loader file:///C:/Users/VTD/Documents/Codex/2026-09-09/l/work/esbuild-wasm-hooks.mjs node_modules/vitest/vitest.mjs run --configLoader runner
node --experimental-loader file:///C:/Users/VTD/Documents/Codex/2026-09-09/l/work/esbuild-wasm-hooks.mjs node_modules/vite/bin/vite.js build --configLoader runner
```

Screenshots and browser report: `C:/Users/VTD/Documents/Codex/2026-09-09/l/outputs/vieworld-fan-build/`.
