# VieWorld — unified fan home / v4

Updated: 2026-09-12. Implements the owner's nine-point consistency request. No Git commit or push, no Antigravity calls, no public deployment. Existing fan records, receipts, memberships and unrelated worktree changes are preserved.

## The product rule

World and My Space belong to the fan, not to the last artist visited. Enter a place first; choose an artist only where the task needs one. Artist A is a fictional artist; Neon Sessions is a fictional show/IP, not a second UI skin or a second fan account.

| Place | Entry | Owns | Does not own |
| --- | --- | --- | --- |
| Courtyard | `/` | Five destinations, the fan at the center | Artist selection, event lists, commerce feeds |
| Artist World | `/artists` → `/worlds/:worldId` | Searchable portrait gallery, follow, artist information, authored notes, 2D live-chat frame | Concert listings, listening rooms, wardrobe, collection editing |
| Moments | `/moments` | All-artist schedule, artist/IP filter, concerts, listening, RSVP, membership Hall, membership/benefits | Authored news, wardrobe, private notes |
| Archive | `/archive` | All-artist personal capsules, private notes, save/unsave, available replays | Room slot placement or appearance editing |
| My Space | `/me` | Room editing, wardrobe, placement of already-saved memories, bag/orders/support | Artist switching, collection editing, event calendar |
| VieSHOP | `/shop` | Existing physical/digital/Duo catalog and try-on | Automatic fan membership or unearned digital ownership |

`PANEL_HOME` / `panelRoute` in `src/world/places.ts` route new cross-place actions to their owner instead of rendering a duplicate. Historical `?panel` / `?zone` / `?drawer` links remain readable for compatibility; they are no longer new navigation targets. Existing `/worlds/:worldId/moments` and `/worlds/:worldId/archive` routes remain compatible. Shared room state is not keyed to an artist.

## Typography and visual rules

This is a selected typography system for VieWorld, not a newly drawn proprietary typeface.

- **Nunito 700–800**: brand, page titles, destination names and scene signs. Rounded, soft shapes fit the owner's cozy chibi world.
- **Be Vietnam Pro 400–700**: body, buttons, filters, metadata, dialogs and transactional surfaces. Vietnamese diacritics remain first-class.
- `--font-display` and `--font-sans` are the source of truth. Locally hosted WOFF2 fonts include latin, latin-ext and Vietnamese subsets; font-display swap; both OFL licenses ship beside them. There is no Google Fonts runtime request.
- Body 13–16px, main headings 28–42px, explanatory text 11–13px. Miniature map overview labels are intentionally smaller; zoom and full-size destination links remain available. Controls retain 44px touch targets.
- Cream background, forest-green text/actions, muted sage/teal spaces and amber accents. The artist and room remain the visual focus; platform branding stays small.
- Scene labels are accessible HTML placed on existing map signboards or small object tags. Do not bake important text into raster art. No second card layer over the five map signs.
- Three primary tabs: Thế giới / VieSHOP / My Space. Current-page semantics follow nested routes. Inbox and utility menu hold secondary tasks. Suspense preserves the shell while loading a destination.
- Mobile opens in whole-scene overview; optional close view pans horizontally. Editing automatically uses close view. Reduced-motion preference disables decorative animation. Demo disclosure wraps rather than truncates on mobile.

### Research sources and interpretation

1. [Be Vietnam Pro — designers' repository](https://github.com/bettergui/BeVietnamPro): explicitly refines Vietnamese letterforms and diacritics for readability. Selected for functional text, not claimed as a font used by Weverse.
2. [Google Fonts Nunito metadata](https://github.com/google/fonts/blob/main/ofl/nunito/METADATA.pb): OFL, Vietnamese subset, variable weight family. Chosen rounded display voice is this project's design judgment.
3. [Yellow's Stampeight identity case](https://www.whatsyellow.com/work/stampeight): a quiet brand system framing artists rather than competing with them. Applied the hierarchy principle, not its wordmark, artwork or dark palette.
4. [Weverse's seven-service walkthrough](https://magazine.weverse.io/article/view/1734?lang=en): different artist/fan activities need distinguishable contexts. Used as product reference, not a claim that VieWorld implements real Weverse services.
5. Owner slides 9/10/11 remain the visual/structural reference. No ownership or endorsement claims from the concept slides were reproduced as facts.

## Avatar and art

Builtin imagegen generated the new original fictional fan and artist from slide 11's chibi style. Final PNGs and lightweight WebP derivatives are in `public/images/characters-v4/`; exact prompts, reference role, intermediate/final paths and provenance are in `PROMPTS.json` there. Fan's first generation contained an opaque checkerboard; a dedicated imagegen extraction corrected it. Final alpha was checked as zero at the corner. Originals were preserved outside the repo as well.

All uses go through AvatarRenderer. The raster base has deterministic cosmetic overlay layers for accessories / digital shirt, cap and lightstick, with the prior SVG renderer as an image-load fallback. The artist's default midnight look uses the complete generated jacket; other outfit previews use simple 2D overlays. These overlays are styling mockups, not realistic garment fitting, skeletal animation or physical sizing. Presence, approval, asset owner and session-context restrictions remain independent of visual animation.

## Cleanup / performance

- Removed the redundant WorldPlacesNav component and its duplicate toolbar/dropdown. Recoverable copy: `C:/Users/VTD/Documents/Codex/2026-09-09/l/outputs/vieworld-retired/WorldPlacesNav.tsx`.
- Removed artist-room repeated footer actions, duplicate Archive album button, duplicate My Space calendar/collection editing, news repeated under Live Chat, and the unused last-world helper.
- Lazy route chunks for shop, scenes, sessions, commerce details and Studio; main entry JS about **301 kB minified vs 541 kB** before. This is entry-chunk size, not total application download.
- Nine served world images: **13,579,775 bytes PNG → 868,744 bytes WebP**, about **94% smaller**. New avatar delivery images total **80,920 bytes**. Original PNGs remain recoverable; this is transfer optimization, not a claim of shrinking the entire repo by 94%.
- Self-hosted font subsets; explicit image dimensions and prioritized scene images. No new production library was needed. Sharp was used only in the external preparation script, not added as a runtime dependency.
- Earlier source views still used by historical regression tests and user-owned asset originals were not blindly deleted. They are not imported by the current App routing. Future CSS/module consolidation should use route coverage rather than broad deletion.

## Verification

- TypeScript no-emit: passed.
- Automated suite: **300/300 passed**, including 8 new v4 tests. Old route/label assertions were updated to the owner's revised IA, not removed to hide failures.
- Production build: passed through the existing Windows esbuild-WASM loader; no >500kB chunk warning after route splitting.
- Isolated Edge browser at 1440px and 390px: nine routes/panels, no document overflow, no missing images/HTTP errors, expected font families, artist search/follow, global Moments/filter, truthful chibi stage, separate shelf/Archive, pointer and keyboard furniture movement, save/reload.
- Script and screenshots: `C:/Users/VTD/Documents/Codex/2026-09-09/l/work/verify-world-v4.mjs`, `outputs/vieworld-world-v4/`. Unit report: `outputs/vieworld-tests-v4.json`.
- The pre-existing trailing blank line in `src/index.css` was not changed. Source-data namespaces were not reset.

## Still deliberately not production

No real artist stream, multiplayer, payment, authentication, server inventory or licensed music integration. Currently one fictional artist plus one show/IP: the gallery scales from world records but does not invent real artists or counts. Furniture remains 2D foreground placement; fixed painted essentials do not move. These are honest limitations, not features silently claimed complete.
