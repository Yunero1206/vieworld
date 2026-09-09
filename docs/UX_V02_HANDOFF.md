# VieWorld fan-experience pass — v0.2 handoff

Date: 2026-09-09  
Starting point: commit `96bf95d829af7d70fb321c0fead88c7269f292d7` (P00–P17 baseline)

## Outcome

The fan-facing experience now presents VieWorld as an explorable entertainment world instead of a profile/data manager while preserving the existing domain model, routes, DEMO disclosures, tenant isolation, and constitutional boundaries.

## Implemented

- Reframed Discover around an illustrated destination hero and world cards.
- Added an interactive 2D Artist/IP World scene with stage, music, memory, fan-club, shop, and linked-world hotspots.
- Added URL-persistent World zones through `?zone=`.
- Rebuilt My World as a personal room with shelf, wardrobe, calendar, benefits, orders, and support objects.
- Added URL-persistent My World drawers through `?drawer=`.
- Expanded Live Room stage presence, audience silhouettes, and a sticky interaction rail.
- Restored scroll position to the top on route changes.
- Moved tenant/scenario/operator controls out of the primary fan journey and behind review affordances.
- Rewrote fan-facing policy copy in plain language while keeping the persistent DEMO truthfulness layer.
- Updated regression assertions for the revised labels and review-control disclosure.

## Verification

- TypeScript: `npm.cmd run typecheck` — passed.
- Regression suite: 17 test files, 185/185 tests — passed.
- Production build: 1,921 modules transformed — passed.
- Browser journey: Discover → Artist World → membership hotspot → Live Room → join → Q&A → end session → My World — passed.
- Route persistence: `?zone=membership` and `?drawer=wardrobe` — passed.
- Desktop layout: no horizontal document overflow at 1280 px — passed.
- Mobile layout: 390 × 844, no horizontal document overflow; bottom navigation and responsive scenes verified — passed.

## Environment note

The host sandbox blocks the native esbuild executable from reading its parent filesystem. Verification therefore redirected the development-only esbuild import to the matching `esbuild-wasm@0.25.12`. This was not added to `package.json` or the lockfile and does not change the product runtime.

## Remaining product decisions

- Replace CSS illustration placeholders with final licensed art direction when a visual asset pack is approved.
- Decide whether production navigation should expose reviewer tools at all or gate them behind an authenticated operator surface.
- Define hosting and real backend scope separately; the current app remains an honest browser-local prototype.
