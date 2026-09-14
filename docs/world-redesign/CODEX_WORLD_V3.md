# Five-place VieWorld — implementation checkpoint

Updated 2026-09-12. Owner reference slides: `C:/Users/VTD/Desktop/DatVietVAC/Case Vieshop/9.png`, `10.png`, `11.png`. These were treated as concept references, not instructions to reproduce corporate ownership/endorsement claims. The actual user requested implementation of the five-place fan world and room customization; VieSHOP was allowed to remain unchanged.

## Architecture / experience

| Place | Route | Existing features merged |
| --- | --- | --- |
| Courtyard | `/` and `/worlds` | Linh at center; five doors; artist/IP context selector; direct mobile links |
| Artist World | `/worlds/:worldId` | Artist information, authored notes, listening corner, Live Chat with approved 2D artist frame |
| Moments | `/worlds/:worldId/moments` | Concerts, RSVP/calendar, membership, membership-scoped Hall |
| Archive | `/worlds/:worldId/archive` | Saved Moment Capsules/private notes, permitted replay list |
| My Space | `/me` | Existing wardrobe/owned digital items, showcase memories, calendar/bag, new room editor |
| VieSHOP | `/shop` | Existing edition-aware catalog and fitting room, unchanged |

The main public shell remains Thế giới / VieSHOP / Phòng tôi. The courtyard is now distinct from any room. All four room interiors have their own artwork and spatial layout. Cross-room links and object buttons do not require controlling a walking avatar. Historical root `?panel`, `?zone` and `?drawer` links still open their old content rather than breaking saved links. No persisted fan/commerce state was reset.

## My Space editor

- Room / Furniture / Decor / Memories / Avatar categories.
- Three visual room tones; four free placeable props (chair, table, plant, lamp), up to eight instances.
- Pointer drag, keyboard arrows and explicit directional buttons; optional grid snapping; visual direction changes; remove/cancel/save.
- Independent visibility for added furniture, actual showcase memories and owned digital display. Fixed sofa/walls/record desk remain part of the room illustration, explicitly identified as fixed essentials.
- Optional `fanProfile.roomDesign`, validated and deep-copied by `SAVE_ROOM_DESIGN`. Invalid/nonfinite/out-of-bounds/null/duplicate/oversized props are rejected; missing or invalid persisted layouts display the safe starter layout. Old storage loads without migration/reset.
- Position is a bounded 2D overlay, not a 3D physics scene. Direction uses 2D mirroring/tilting, not four separately rendered camera angles. Furniture overlap is possible and can be adjusted. No earned collectible or merchandise entitlement is fabricated by placing a prop.

## Artist/live behavior

`ArtistBroadcast` reuses existing PresencePanel/AvatarStage/session interactions. It accepts only approved assets whose owner and allowed context match the session. A scheduled, recorded or team-hosted segment is not labeled as a live artist presence. Scene display avatars are frozen, explicitly marked as display/demo. In active artist-hosted live demo sessions, the existing 2D avatar animation is shown; links open actual chat/questions/audio controls. No human streaming, artist impersonation, licensed artist audio or multiplayer infrastructure was added.

`AvatarStage` accepts an optional cozy scene background, also used by the existing SessionView. An existing global `.frozen { transform:none !important }` rule had displaced the stage actor; scoped positioning now holds for both running and frozen states. Stage anchoring is verified in the browser.

Final visual pass increased cozy-scene static-avatar opacity for legibility without changing presence labels or enabling animation for absent artists. Production build, all 292 tests, and desktop/mobile interaction checks were rerun successfully afterward.

## Artwork / provenance

Builtin imagegen generated nine project assets from owner style references: plaza, artist salon, amber concert hall, teal archive, private My Space, and four transparent foreground furniture sprites. Saved under `public/images/world-v3/`. Exact prompts, references and retained original paths: `public/images/world-v3/PROMPTS.json`.

All source originals were preserved; versioned filenames avoid overwriting earlier room or merchandise art. Furniture PNG transparency checked (corner alpha 0; center alpha 252–253); native SVG fallbacks remain if sprite images fail. Scene art failure keeps accessible DOM navigation/buttons available. All artworks are illustrative, not evidence of actual products, users, artists or events.

## Research rationale

The owner's slide 10 provides the five-place topology, slide 11 provides the personal-room styling and editing concept, and slide 9 frames catalog filtering rather than a new app surface. Shop taxonomy was not broadened or claimed fully implemented in this iteration.

For an external interaction reference, the official Sky support article describes placing props to create cozy Shared Spaces and treating memories as revisitable player creations: https://thatgamecompany.helpshift.com/hc/en/13-sky-beta/faq/421-what-are-message-shrines-message-candles-message-boats-shared-spaces-and-shared-memories/?l=en (read 2026-09-11). Applied only the design principle of optional spatial personalization; did not copy the game economy, reward claims or art.

## Verification / handoff

- TypeScript no-emit check passed.
- 292 automated tests passed (17 new plaza/editor/presence cases in addition to the prior 275). Prior room tests were updated for the new Artist World objects and the nonduplicated directory header.
- Production Vite build passed using the existing Windows esbuild-WASM loader. Main application bundle remains about 541 kB minified and emits Vite's size warning; route splitting/image delivery optimization is follow-up, not a hidden completed task.
- Isolated Edge checks at 1440px and 390px: five doors, eight visual routes/panels, no page overflow or broken images, direct navigation, concert/Live Chat 2D avatar, editor pointer and keyboard movement, direction/save/reload/cancel, Archive capsule entry. The frozen artist's stage-relative position is checked explicitly.
- Browser script: `C:/Users/VTD/Documents/Codex/2026-09-09/l/work/verify-world-v3.mjs`.
- Screenshots/report: `C:/Users/VTD/Documents/Codex/2026-09-09/l/outputs/vieworld-world-v3/`.
- Unit report: `C:/Users/VTD/Documents/Codex/2026-09-09/l/outputs/vieworld-tests-v3.json`.
- Preview: http://127.0.0.1:4173/ . No public deployment, commit or push. Existing user changes and the pre-existing `src/index.css` trailing blank line are untouched.

Before production: authenticated server-side permissions and inventories, real multiplayer/moderation, separate digital/physical fulfilment, licensed media, and optimized asset delivery remain necessary. This iteration is the functional local concept, not a production MMO or commerce backend.
