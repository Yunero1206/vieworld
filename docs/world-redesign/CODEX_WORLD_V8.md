# VieWorld v8 — identity, collection and broadcast refinement

Updated 2026-09-13. No commit, reset, storage wipe or Antigravity calls.

## Implemented

- Four outdoor destinations in the new plaza art. HTML names align to physical signs; keyboard links and mobile shortcuts remain. My Space and the plaza remain artist-independent.
- Fan appearance editor in My Space → Chỉnh avatar: original plus three new transparent chibi presets, free accessories, preview, randomize, cancel and explicit save. This is a preset-based editor, not independent facial/body sliders. Existing paid digital clothing stays entitlement-gated.
- Optional `fanProfile.avatarPreset` persisted by a guarded reducer action. Default old profiles remain unchanged. Appearance projects into header, plaza, My Space, shop try-on, Hall and current fan visitor view. Artist identity is unaffected.
- Room fixtures now take the fan to the appropriate collection type. No search/filter editor under the room. Legacy `?custom=` links open the equivalent private collection.
- Collection uses a prominent search box, type chips, collapsible artist/date filters, result counts and clear. Explicit “Đặt vào Phòng trưng bày”/“Cất khỏi Phòng trưng bày” actions preserve ownership and history. Existing slot replacement is disclosed. Private notes never become public through display.
- Ticket return/achievement history preserved in Hành trình & thành tựu. Journal/replay/order entry points are grouped into a disclosure.
- Live & Concert has one selected session preview, one join link and a session list. Selecting concert changes the target session. Ended/cancelled sessions are excluded. Artist asset approval, presence truthfulness and session access checks remain. Preview hides technical asset/outfit IDs; full Studio behavior remains.
- Warm Nunito / Be Vietnam Pro typography retained, with consistent chips, spacing, explicit labels and responsive layouts. Generated assets use WebP for delivery, PNG for provenance.

## Design research

- YouTube Live Chat: https://support.google.com/youtube/answer/15268877?hl=en — keeps interaction tied to the viewed live session.
- Twitch channel anatomy: https://help.twitch.tv/s/article/a-tour-of-your-channel-page — separates player/channel identity from other broadcasts; theater mode reduces surrounding distractions.
- Sims appearance inspiration: https://thesims-api.ea.com/game-info/smarter-sims — appearance/fashion customization; this prototype intentionally uses a small preset selector.
- Weverse discovery reference: https://weverse.io/notice/36020 and https://weverse.io/notice/29986 — discovery/followed content inform hierarchy, not copied branding or claims of equivalent streaming.

## Validation

- Full suite: 333/333 passed. After final preview/spacing polish, focused regression suite: 20/20 passed.
- TypeScript `--noEmit`: passed. Production Vite build: passed.
- Final isolated Edge pass: 44 route/flow captures at 1440 and 390 px; no horizontal overflow, broken images, failed HTTP responses or browser page errors. Avatar cancel/save/reload and visitor appearance assertions passed.

See the v8 Vitest JSON report and isolated Edge QA artifacts under `C:/Users/VTD/Documents/Codex/2026-09-09/l/outputs/`. QA uses its own origin/storage, not the user's active app storage. Routes checked at 1440 and 390 px: plaza, artist home, Moments tabs, My Space, collection, demo member, shop; simulated physical checkout and delivery, explicit display placement, search/clear, avatar cancel/save/reload and visitor projection.

## Boundaries

Local prototype only: no real streaming, payment, multiuser synchronization or public profile publishing. The appearance picker uses four complete base presets rather than interchangeable skin/hair layers. Existing historical/legacy code and storage preserved where removal would break compatibility.

Asset prompts and source paths: `public/images/world-v8/PROMPTS.md`.
