# VieWorld quality upgrade report

Ngày thực hiện: 14/10/2026. Phạm vi: CORE-0 đến CORE-6 của Implementation Plan, đối chiếu critique v4 với source hiện tại; không mở thêm feature, không push/deploy.

## Workspace và baseline

Repository local VieWorld, branch `main`, HEAD `50128f54bc1b56324e0c0de0d6dd9d48dbc6b99c`. Working tree sạch khi bắt đầu; các correction Truth Audit nằm trong commit `58343a2`, không checkout/reset lại baseline cũ. Không có AGENTS.md áp dụng được tìm thấy trong cây repo hoặc thư mục cha.

Runtime hiện có: Node 26.7.0, npm 11.19.0; bundled Node 24.19.0. Node 22 theo README chưa được kiểm chứng ở bước baseline. Không upgrade dependency/lockfile.

Baseline mới: typecheck pass; test 63 suite/576 test pass (42,52 giây); check:source pass (155 reachable modules, 88 literal links, 34 routes); build pass (2.034 modules, 19,36 giây Vite); check:showcase pass (29 JS chunks, 931 KiB uncompressed, 66 public raster signatures). Sandbox esbuild bị chặn đọc parent directory; test/build/preview chạy lại qua escalation, không sửa app để né lỗi môi trường.

CSS baseline: 31 file, 604.644 source bytes, 458 `!important`; built CSS khoảng 510,35 kB, gzip khoảng 92,74 kB. Đây không phải route payload hoặc điểm Lighthouse. Home/room PNG lần lượt 1.987.419 / 1.949.990 bytes; source concert PNG 1.700.448 bytes.

Browser preview QA riêng `http://127.0.0.1:5189`; hồ sơ mẫu chỉ trên origin này. Ảnh và baseline notes ở thư mục QA private ngoài repo. Không clear/reset storage của người dùng. Baseline 1440×900 và 390×844: Home, Explore, Artist, listening context, Hall, Q&A route, Archive, room, VieCollect, Help và support. Root display font Nunito nhưng fan shell effective Be Vietnam Pro; giữ editorial treatment khi hợp nhất tokens.

## Findings và quyết định cuối

Implementation Plan là brief kiểm soát; critique Gemini được kiểm chứng từng nhận xét, không áp dụng như specification. HEAD cuối vẫn là HEAD ban đầu; toàn bộ kết quả ở working diff, chưa commit/push/deploy.

| Finding | Trạng thái | Trước → sau / lý do |
| --- | --- | --- |
| Tên đồ mặc hardcode | Fixed | Lookup public look của fan đang xem theo tenant/slot/item; digital edition ưu tiên rồi bundle/physical, tie-break ID; tên thiếu/rỗng dùng fallback theo slot |
| Help mất các loại kết quả | Fixed | `unknown`, `unsupported_topic`, `injection_blocked` có message/limitation/suggested cards đúng loại; answered và approved topics giữ nguyên, vùng status polite |
| Listening notes thiếu | Fixed | Details dùng trackNumber/title/duration/notes thật; `isCurrent` ghi “Bản chọn trong demo”, không claim playback |
| Notification dùng wall clock | Fixed | `demoTime` được truyền explicit; invalid/missing/future clamp “Vừa xong”; ngày lịch dùng Asia/Ho_Chi_Minh |
| companionDays ở Room Polaroid | Fixed | Gỡ prop không dùng; giữ field compatibility ở nơi khác, không bịa tenure |
| Root/font declarations trùng | Fixed | Gỡ token mâu thuẫn; Nunito 9 faces → 3 variable faces theo metadata `wght=200–1000`; Be Vietnam Pro/Lora vẫn đúng vai trò |
| Order/Support “toàn nền trắng hardcode” | Partly not reproduced; bounded fix | Nhiều card đã semantic, không thay toàn trang. Browser phát hiện timeline nền kem/chữ sáng và chữ phụ quá tối; sửa timeline. Resolution support và completed icons dùng semantic color pairs |
| Ảnh nặng / compatibility | Fixed | 31 derivatives WebP + 6 thumbnail trong số đó; giữ mọi original/ID/fit/crop/mask; manifest budgets và resolver chung |
| Cache chỉ có HTML/ảnh phòng | Fixed | Precache shell/static closure của My Space + CSS/fonts/default furniture; release digest giữ nguyên, không skipWaiting |
| Redundant autosave khi đổi profile | Fixed | Skip snapshot cùng object/key đã lưu durable; register từ 4 → 2 `saveState` calls trong fixture đo; mọi commit khác vẫn immediate |
| Debounce 250ms / context split / async hydration | Deferred with evidence | Serialize khoảng 0,15ms/snapshot mock; chưa có React commit profiling/bottleneck proof. Không timer, migration hoặc store unification |
| CSS nhiều thế hệ | Fixed trong phạm vi kín | 80 rules world-diorama/diorama không còn runtime DOM caller bị gỡ sau kiểm tra selector động, pseudo/media và caller; không blanket delete `!important` |
| Session fallback đọc tenant khác | Fixed | Fallback SessionView chỉ nhận session active tenant; Avatar ContextStage phải approved, đúng tenant/artist và allowed format |
| Retire toàn SessionView | Deferred | Compatibility fallback và các legacy operator/Q&A contracts còn; giữ suite/action/data, không revive nó cho luồng chính |
| Inbox bị gọi là dead code | Already satisfied / giữ nguyên | `/inbox` còn route, auth/notification/deep-link contract; đã mở trong browser |
| Artist transition tính offset header cũ | Fixed | Gỡ query `.fw-header` không còn dùng; giữ focus, reduced-motion, không hijack initial deep link |
| Toàn app layers / Inspector / SSR / provenance / Why Locked | Deferred | Không cần để core hoạt động đúng; không thêm UI placeholder hoặc architecture production |
| Node 22, real browser offline/profiler | Not verified | Runtime hiện có không phải Node 22; CUA không có network-offline/Profiler controls. Không đánh PASS những mục này |

Variable font cần descriptor range đúng axes, không cần một file khác cho từng weight. [MDN Variable fonts](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Fonts/Variable_fonts). Context memo không khiến state consumers chỉ nhận slice; vì vậy không dùng số lượng view làm bằng chứng phải tách Provider. [React useContext](https://react.dev/reference/react/useContext). Cascade layers không được thêm riêng vào current CSS khi legacy còn unlayered/important; thứ tự important giữa layers đảo ngược. [MDN @layer](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@layer).

## Số đo trước / sau

| Đo trực tiếp | Baseline | Sau | Diễn giải |
| --- | ---: | ---: | --- |
| Source CSS, 31 file | 604.644 B | 587.907 B | Giảm 16.737 B, khoảng 2,8%; không phải payload |
| Built CSS | ≈510,35 kB | 497.092 B | Giảm khoảng 13,3 kB; baseline Vite log làm tròn |
| Built CSS gzip | ≈92,74 kB | 91.002 B | Không phải số bytes mạng/CDN đã đo |
| `!important` source | 458 | 455 | Chỉ 3 declaration thuộc rules retired; không lấy giảm count làm mục tiêu |
| 31 source → derivatives | 33.639.256 B | 2.804.872 B | Khoảng 91,7% cho tập derivative; original vẫn trong repo nên tổng repo tăng |
| Meadow PNG → WebP | 1.987.419 B | 186.574 B | Giữ 1672×941 |
| Room PNG → WebP | 1.949.990 B | 210.118 B | Giữ 1672×941 và scene geometry |
| Concert PNG → WebP | 1.700.448 B | 92.172 B | Giữ 1619×971 |
| Registration `saveState` calls | old 2 + new 2 | old 1 + new 1 | Một fixture, mock storage, no StrictMode; không claim mọi write giảm 50% |
| JSON snapshot | 56.391 B | 56.391 B | Không đổi schema/giảm data |

Serialize runs trước: 0,153587 / 0,149765 / 0,166959 ms, median 0,153587 ms. Runs sau ở targeted fixture: 0,126959 / 0,146003 / 0,157085 ms, median 0,146003 ms. Node 26/jsdom, 100 JSON.stringify/run, ba run; khác CPU contention nên không claim latency gain. `saveState` call count được spy ở adapter boundary; localStorage write duration, IDB latency và production React commits **not measured**.

Asset inventory ban đầu: 72 raster, 38.282.013 B trong static/images và src/assets. Converter kiểm tra dimensions/alpha sau conversion. Product full-size q90 giữ 1024² hoặc 1254²; portraits 896×1200 giữ alpha; notification thumbs width 320 giữ aspect. Thumbnail budget 30 KiB, product/portrait 220 KiB, room/cover 400 KiB; KAI cover 321.940 B có texture phức tạp nhưng nằm trong cover budget. Artist-A legacy CSS cover và originals là compatibility exceptions, không claim mọi route dùng toàn bộ 31 derivatives. Danh sách đầy đủ nằm trong [imageDelivery.json](../../src/data/imageDelivery.json).

Built precache 41 paths, khoảng 1,80 MB raw file size, gồm root/index duplicate và fonts/dependencies. Đây là footprint precache chứ không là transferred bytes; offline reliability không miễn phí. `fetch()` có thể được HTTP cache đáp ứng/revalidate, không mặc định mỗi request truyền lại toàn bộ ảnh. [MDN HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching).

Cold/warm route request count, encoded/transferred bytes, LCP candidate, LCP/CLS và Render CDN cache behavior: **not measured**. Không có Lighthouse score hoặc retention claim.

## Kiểm tra và journey

### Commands trên source cuối

| Command | Kết quả thực chạy |
| --- | --- |
| `npm run typecheck` | Exit 0 |
| `npm test -- --configLoader runner` | Exit 0, 67 suite / 603 test, 41,59s, bắt đầu 23:13:21; sau edit code cuối |
| `npm run check:source` | Exit 0, 156 reachable modules / 88 literal links / 34 routes |
| `npm run build` | Exit 0, 2.036 modules, Vite 12,06s ở lần cuối |
| `npm run check:showcase` | Exit 0 trên build mới; 29 JS / 937 KiB raw; 96 public raster signatures / 31 budgets / built precache references |
| `git -c core.safecrlf=false diff --check` | Exit 0; option chỉ giảm warning CRLF khi review, không thay repo config |

Warning đáng kể: Node 26 experimental localStorage warning và jsdom `location.reload` not implemented trong ErrorBoundary test. Assertions pass; không coi jsdom reload là browser proof. Một full run trung gian có 602 pass/1 fail vì receipt assertion còn đòi PNG; migrate đúng resolver WebP, giữ snapshot assertion rồi rerun full. Không xóa suite để xanh.

Targeted regressions đã chạy trong các phase: correctness/guide/notifications/presentation; asset/profile compatibility; storage/isolation/conflict; reduced motion/theme/Hall; SW VM. Các kết quả intermediate không thay full pass cuối.

### Browser thực tế

QA origin riêng 5189, IAB production preview; light/dark, 1440×900, 1280×800, 390×844 và 360×800. Kiểm tra DOM/computed style trên Home, Explore, Artist main/listening, Hall, Q&A, Archive, Room, public Member Space, VieCollect, Help, Inbox, support và receipt. Không thấy tràn ngang ở các viewport kiểm tra. Ảnh paint bắt ngay sau lazy navigation có thể còn loading; chúng không được tính là proof visual. Proof được lấy ở call sau khi nội dung đã hiển thị, lưu `proof-*` trong QA private.

Visual đã xem trực tiếp: Home/Room/VieCollect desktop, try-on/room có item mobile, notes mở rộng 360 dark, order timeline và resolution support, notification overlay. Root/shell display Nunito; nội dung Be Vietnam Pro; Artist/utility editorial headings Lora, public-room section headings Nunito. Không ép mọi heading cùng một family. Timeline dark background `rgb(38,51,43)`, muted `rgb(175,190,178)`: contrast **6,808:1**; light timeline dùng nền `rgb(242,245,239)` và muted `rgb(93,109,99)`. Đây là kiểm tra reading pair hẹp, không chứng nhận accessibility toàn app. [WCAG Contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

| Journey | Browser / regression evidence, giới hạn |
| --- | --- |
| Guest | Sign-out bỏ Hall composer ngay; `/me` gate không hiển thị tên/đồ riêng; Home/Explore/public Hall đã đọc |
| Fan mới | Tạo hồ sơ “QA mới 14/10” chỉ trên QA origin: Collection 0, guestbook trống; post free Hall được; Q&A đúng artist có gate, không thấy private body |
| Member | Relogin Linh mở Q&A; answered fixture có nhãn minh họa và “selected ≠ answered”. Expiry/artist validity coverage ở community_first_hall; không tua clock để giả lifecycle browser |
| Moment | Listening nhúng đúng Artist; notes thật; valid legacy redirect và invalid/foreign/rights/media/avatar guards có regression qua current route. Scheduled/paused/ended là các fixture tests riêng, **không** claim same-fixture lifecycle browser journey |
| Archive/privacy | Eligibility và loại private/foreign/invalid coverage trong Hall/presence/Truth Audit suites; browser mở Archive. Không thêm public projection |
| Collection/Room | Star shirt digital: try-on → cart → pending → paid → receive → drawer preview → save → reload giữ placement → remove/save vẫn available owned → relogin Collection còn 1 món |
| Physical/hybrid | Receipt/physical-only/legacy hybrid invariant suites pass; hybrid mới vẫn concept-only. Không thực hiện shipment thương mại hoặc claim đã browser-run physical lifecycle đầy đủ |
| Accounts | Sign-out hide ngay; profile mới không có item của Linh; sign-in lại Linh giữ receipt/collection và không carry lời nhắn private của QA mới. Tenant switch/isolation unit tests pass |
| Help/notifications | Unknown, unsupported, injection message và answered query không dấu hiển thị; listening details đọc được. Notification time theo demo, mark-all-read về 0; Escape return bell focus, scroll lock được trả lại; drawer Escape return surface trigger |
| Persistence | Hai tab cùng profile: tab B post Hall, tab A hiện dừng auto-save; đóng B, A reload dữ liệu mới giữ post. Mock denied/quota, savedAt-only, manual profile transition conflict tests pass; không claim transactional CAS |
| Assets/SW | Original + derivative signature/budget/geometry/alpha, old receipt/resolver, built dependency existence và network HTML-as-image guard pass. VM warm offline/nav fallback, cache-denied, unavailable asset, old-cache-only activation tests pass. Cold install/update with old tab/network-offline trong browser **not verified** |

Typing tiếng Việt và keyboard Escape đã kiểm tra bằng UI; real OS IME composition, screen reader và OS reduced-motion browser toggle **not verified**. Reduced-motion stage freeze và context transition/cancel có unit regressions; global media rules được giữ. Không dùng các test đó để claim native IME hoặc toàn bộ keyboard journey pass.

## Test migration map

| Assertion cũ | Contract giữ lại / coverage sau |
| --- | --- |
| Room/artist/receipt image phải đúng đuôi PNG | `presence_contracts`, `world_v4_consistency`, `review_fixes` chấp nhận derivative WebP; geometry/alpha/signature và original tồn tại ở converter + `image_delivery`; receipt snapshot vẫn không phụ thuộc catalogue còn sống |
| Help phải dùng copy guardrail dài/thuật ngữ cũ | `guide` cập nhật copy read-only; `quality_upgrade` kiểm tra result types/suggestions/actionLink, không mutation/fetch/HTML |
| CSS phải có selector diorama hồi tiếp | Retire assertion của DOM không còn runtime; `job08_art_integration_feedback` kiểm tra AvatarStage freeze/unfreeze khi reducedMotion. Không xóa legacy cue/privacy/presence assertions khác |
| Context transition đo top header cũ | Markup test dùng current rail, giữ smooth/focus/no initial hijack/reduced-motion/unmount cancellation |
| Label/timestamp chưa có regression | `quality_upgrade`: đúng owner look/digital rank/tenant/fallback/empty title, explicit clock boundary; thêm actual route rights/media/foreign và approved avatar format/owner guards |
| Autosave gọi thừa nhưng chưa đo | `context_persistence_quality`: three serialize runs, write counts, same-key lock, profile restore, savedAt-only and denied storage |
| Offline chỉ có source URL | `service_worker_delivery` VM giữ network/cache/fallback semantics; `check:showcase` kiểm tra built hashed shell/dependencies tồn tại. Không coi VM là browser offline test |

## Files thay đổi

| Nhóm | Files |
| --- | --- |
| Correctness / guards | `src/world/merchCatalog.ts`, `src/views/MemberSpaceView.tsx`, `src/views/PersonalUtilityView.tsx`, `src/data/guideKnowledge.ts`, `src/components/ContextStage.tsx`, `src/components/notifications/notificationHelper.ts`, `src/components/FanShell.tsx`, `src/components/RoomPolaroidModal.tsx`, `src/components/DisplayRoom.tsx`, `src/views/SessionView.tsx`, `src/hooks/useArtistContextTransition.ts` |
| Fonts / CSS / contrast | `src/index.css`, `src/styles/fonts.css`, `src/styles/appearance.css`, `src/styles/world-v4.css`, `src/styles/world-v6.css`, `src/styles/refinement.css`, `src/styles/artist-context.css`, `src/styles/presence.css`, `src/views/SupportCaseDetailView.tsx` |
| Asset wiring | `src/data/imageDelivery.json`, `src/world/imageDelivery.ts`, `src/world/merchImages.ts`, `src/world/artistVisuals.ts`, `src/world/exploreRows.ts`, `src/components/AvatarRenderer.tsx`, `src/data/artistChatConfig.ts`; 31 binaries listed exactly as `target` in manifest |
| Delivery / build | `scripts/optimize-images.mjs`, `scripts/check-showcase.mjs`, `static/sw.js`, `vite.config.ts` |
| Persistence | `src/context/AppContext.tsx` |
| Existing regressions | `src/tests/guide.test.tsx`, `src/tests/artist_context_transition.test.tsx`, `src/tests/job08_art_integration_feedback.test.tsx`, `src/tests/presence_contracts.test.tsx`, `src/tests/world_v4_consistency.test.tsx`, `src/tests/review_fixes.test.tsx` |
| New regressions | `src/tests/quality_upgrade.test.tsx`, `src/tests/context_persistence_quality.test.tsx`, `src/tests/image_delivery.test.ts`, `src/tests/service_worker_delivery.test.ts` |
| Handoff | `README.md`, `docs/implementation/vieworld-quality-upgrade-report.md` |

## Compatibility và giới hạn bàn giao

Không đổi product/item/session/room/fan/receipt/grant IDs, ownership, provenance, avatar fit hay placement geometry. Không migrate schema, xóa localStorage, bật IDB authoritative hydrate, tạo scheduler hoặc delay privacy guard. Resolver nhận alias/URL cũ; originals giữ nguyên. `/inbox`, valid `/sessions/:id` redirect, invalid recoverable fallback và useful `/me?panel=...` links được giữ. Legacy operator/actions/capability không bị xóa chỉ vì ngoài nav fan.

SW digest tiếp tục phụ thuộc bundle/public artwork. Không hardcode version mới hoặc skipWaiting. Stable image URLs vẫn refresh background; JS/HTML network-first với cache fallback. Offline chỉ best-effort với core/asset đã cache, không toàn bộ phòng hoặc mọi route. Không unregister/clear cache hoặc storage trên origin người dùng.

DEFERRED: SessionView retirement toàn phần, toàn app CSS layers, dispatch-only context nếu chưa có consumer phù hợp, debounce scheduler, storage unification/async freshness, Inspector/time controls/Why Locked/provenance, SSR/OG/production backend. Cần lượt riêng với bằng chứng và compatibility migration; không có phần feature nửa hoàn chỉnh trong UI.

QA artifacts ở thư mục kiểm tra private ngoài repository, không nằm trong diff repo. Không nhập contact/payment thật. Source diff sẵn review; demo boundaries và giả thuyết sản phẩm không thay đổi. Cần kiểm tra Node 22, browser offline/update và CDN payload trước khi nâng claim về runtime/performance/offline. Khi chốt audit chưa push/deploy, không sửa Word showcase; publication GitHub là bước tiếp theo theo yêu cầu chủ dự án, không phải bằng chứng deployment thành công.
