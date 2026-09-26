# VieWorld

Một nơi để giữ lại những điều từ world của nghệ sĩ và fandom: concert từng đi, khoảnh khắc nhớ, vật phẩm đã giữ và những cuộc hẹn sắp tới.

Nguyên mẫu sản phẩm do **Phạm Thanh Phú** thiết kế và phát triển. Artist và fan là nhân vật chính; app là hạ tầng giúp khám phá, kết nối và lưu giữ. Không cần giả lập một thế giới sống, cũng không cần gây áp lực rằng fan phải luôn online.

## Hướng sản phẩm

- Giảm uncertainty để fan có thể enjoy. Home là orientation surface, không phải feed vô tận.
- New ≠ Notification. Chỉ những thay đổi đáng interrupt mới cần thông báo.
- Explore là world browser: artist → lát cắt visual → tiếng nói công khai của fandom.
- Event/live giữ context trong Artist World, không teleport user sang một app khác.
- Collection là những thứ đã giữ; Room là những thứ chủ động chọn trưng bày.
- VieSHOP giữ shopping thông thường. Không fake urgency, không biến concept thành hàng đang bán.

## Điểm đến và routes

Sidebar: **Home / Explore / [Current Artist] / My Space / VieSHOP**. Artist được giữ theo lần ghé gần nhất; nếu chưa có lựa chọn, app chọn một featured artist một lần rồi lưu lại.

| Điểm đến | Route | Vai trò |
| --- | --- | --- |
| Home | `/` | Đang xảy ra gì, tiếp tục từ đâu, điều gì thay đổi và sắp tới |
| Explore | `/explore` | Featured world rows và grid avatar compact của các world còn lại |
| Artist World | `/artist/:artistId` | Identity → active contexts → public Hall voices → tối đa 5 recent slices → commerce → đi sâu |
| Hall | `/artist/:artistId/hall` | Room → conversation → activity rail; chat hội viên không phải public feed |
| Kho lưu trữ | `/artist/:artistId/archive` | Năm/chapter trước, filter là lens phụ |
| Moment Focus | `/artist/:artistId/moment/:momentId` | Một object trong world, có đường quay lại nơi đã mở |
| My Space | `/me` | Phòng của tôi / Bộ sưu tập / Avatar |
| VieSHOP | `/shop` | Catalog tổng; `?artist=artist-a` giữ scope, `&product=…` mở sản phẩm |
| Giỏ hàng / checkout demo | `/cart`, `/checkout/:checkoutId` | Commerce mô phỏng, không thanh toán thật |

`/moments` cũ chuyển về Explore. Moment deep-link cũ resolve artist rồi chuyển sang Moment Focus. Session có artist context chuyển tới `/artist/:artistId?context=session:…`; session legacy chưa map vẫn có fallback riêng.

Trong Artist World, local tabs luôn là **Trang chính / Hall / Kho lưu trữ**. Chọn context giữ world và sidebar; chuyển trong cùng route đưa focus có kiểm soát, giữ compact artist identity nhìn thấy được và tôn trọng reduced motion. Không tự phát media.

### Artist World và bảng thông báo

Trang chính và Archive dùng hero cinematic; Hall/Moment/context dùng compact identity. Trang chính có tối đa ba hoạt động, public Hall voices, rail Moments và vật phẩm từ catalog canonical. Hall dùng rail phòng → conversation → activity rail, với badge hội viên, thích, trả lời, chia sẻ tối đa ba Moments công khai và emoji. Phòng của chương trình IP liên kết thuộc đúng Artist World; không kéo phòng của một artist khác vào chỉ vì có liên kết khám phá.

Archive đọc theo năm rồi chapter; mở chapter mới xem các Moments/context bên trong. `?filter=…&chapter=…` giữ lens/chapter khi quay lại từ Moment Focus. Rail “Mới được giữ lại” mở rộng được và chuyển xuống dưới trên mobile. Các chapter demo cũ chưa có media giữ nguyên và được đánh dấu minh họa, không bịa số capsule hay gán ảnh mới vào một năm lịch sử. Capsule cá nhân chỉ được lấy từ đúng tenant và chủ sở hữu.

`artistPresentation.ts` giải quyết phòng/visual, `artistArchive.ts` nhóm chapter và `ArtistVisualRail` dùng native horizontal scroll với nút điều hướng khi cần. `artist-bulletin.css` là lớp presentation giới hạn cho Artist và thông báo; không đổi shell chung.

Bảng thông báo là một inbox duy nhất trên desktop và mobile: toàn bộ thông báo của đúng fan/tenant, mới nhất trước, cuộn bên trong; header và nút đọc tất cả không cuộn theo nội dung. Chọn cả ô để mở destination và đánh dấu đã đọc, không có tầng “Xem tất cả” hay CTA lặp lại. Esc đóng, focus trap và trả focus về chuông; nền inert theo [WAI-ARIA Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). Không tự mở modal khi có nội dung mới.

### Home: hiện tại, ghé lại, tương lai, cập nhật

Home giữ banner “Đang diễn ra” nhỏ chỉ khi world theo dõi/đã RSVP thực sự có phiên chạy hoặc sảnh mở theo đồng hồ demo. Khối quay lại thấp hơn và nhớ chính xác destination/tab/context gần nhất qua `worldJourney.lastDestination`; không tự ưu tiên capsule đã lưu. Home không tự ghi đè nơi quay lại; dữ liệu cũ fallback về lastWorldId. `/me?panel=capsules` vẫn là chức năng ghi chú riêng/lưu capsule còn dùng trong luồng tham dự → kỷ niệm → trưng bày, không phải route chết. Lịch sắp tới đứng trước “Gần đây”; Gần đây gồm cuộc hẹn đã kết thúc, lời nhắn, capsule và cập nhật shop — không phải toàn bộ đều là event trong quá khứ. Live không lặp trong mục này. Asset sản phẩm lấy từ sản phẩm canonical, không dùng một ảnh pin cho mọi món.

`homeOrientation.ts` lọc tenant, world và quyền phát nhất quán, capsules theo fan/tenant, sắp lịch gần nhất và không tự biến ngày thực tế thành ngày demo. Lựa chọn bố cục dựa trên [visual hierarchy](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/) và phân biệt [status indicators / notifications](https://www.nngroup.com/articles/indicators-validations-notifications/); đây là quyết định thiết kế cho prototype, chưa phải kết quả nghiên cứu fan VieWorld. `home-inbox.css` chỉ scope Home/inbox, dùng typography và light/dark tokens hiện có.

Rà liên kết: mode Vật phẩm/Kỷ niệm của Collection được giữ bằng URL; legacy `type=achievement` map sang lens Dấu mốc. Đọc một/tất cả thông báo chỉ đổi record đúng tenant/fan. Rail Artist chỉ cập nhật state khi trạng thái mép thực sự thay đổi, không re-render theo mỗi pixel scroll. Không đổi schema ownership/cart hoặc xóa dữ liệu capsule.

Schema thêm optional `ChatMessage.replyToId`, `momentIds`, `AppState.hallReactions` và `artistLetters`; dữ liệu cũ không cần reset. Reply/media/reaction kiểm tra đúng phòng và Artist World; chat không tự thành public voice. Lời riêng hiện chỉ lưu trên thiết bị, chưa gửi artist/team. Chia sẻ ảnh trong Hall hiện dùng Moment canonical, chưa có upload ảnh cá nhân hoặc realtime backend. Artist A có thêm một fan-project minh họa dùng asset cũ; không sinh thư viện ảnh mới trong packet này.

## Chạy local

Dùng Node.js LTS tương thích Vite 6 và npm. Cài dependency từ lockfile:

```sh
npm ci
npm run dev
```

Mở địa chỉ terminal in ra, mặc định `http://localhost:5173`.

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

Nếu config loader gặp lỗi quyền trên môi trường Windows bị giới hạn, thử `npm test -- --configLoader runner` hoặc `npm exec vite -- build --configLoader runner`. Đây là workaround môi trường, không phải yêu cầu của app.

## Kiến trúc và dữ liệu

React 19, React Router, TypeScript, Vite, CSS thuần. Vitest + Testing Library kiểm thử domain và UI. Các destination chính dùng route-level lazy loading.

```text
src/components/   shell, room, avatar, context stage, notification UI
src/views/        route-level pages
src/hooks/        appearance, dialogs, artist context transition
src/domain/       typed state, reducers và invariants
src/world/        selectors, artist/context, commerce và room logic
src/data/         canonical fixtures và demo scenarios
src/services/     persistence, fallback và backup
src/styles/       tokens, page styles, shared reading layer
src/tests/        domain, integration và regression tests
static/           public images, fonts, media, service worker
```

`static/` là publicDir của Vite; `dist/` là build output. Không sửa asset ở `dist/` rồi kỳ vọng source cũng thay đổi.

Giữ stable IDs và canonical objects. Shop/Collection/Room/Avatar dùng quan hệ ownership/display/equipment, không sao chép product card thành entity khác. Artist commerce đọc cùng `state.products` với shop; format giá dùng utility chung `src/world/commerce.ts`.

Room dùng display surfaces có maxItems, footprint/capacity, compatibility, focal item và preset geometry. Lưu lựa chọn và quan hệ trưng bày; renderer bố trí trong scene coordinate system. Không physics engine, không free pixel placement, không tự trưng mọi món mới mua.

Hall preview dùng public/consented projection đã xét eligibility, không lấy toàn bộ private chat. Client-side checks **không phải security boundary cho production**.

### Giới hạn backend

Hiện là frontend prototype. State lưu theo namespace/tenant qua adapter local storage, có fallback và backup hiện có. Không có server authentication, payment gateway, realtime backend hay server-authoritative inventory. Demo time/presence không phải dữ liệu live production.

Không reset dữ liệu chỉ để sửa presentation. Packet theme không đổi schema ownership/cart. Reducer invariants/idempotency giúp demo; production vẫn cần:

- Server authentication/authorization cho membership, Hall và private room.
- Public projection API riêng; consent/revocation/moderation có audit trail.
- Checkout idempotency, inventory transaction và payment verification phía server.
- Pagination khi catalog/archive/world pool lớn; đo trên dữ liệu và thiết bị thật.
- Đồng bộ, retention và migration cho dữ liệu fan; local storage không phải backup tài khoản.

## Typography, spacing, light/dark

Lora self-hosted cho tiêu đề editorial; Be Vietnam Pro cho body/UI, có Vietnamese subsets. Artwork/logo giữ identity riêng. Không dùng handwriting cho toàn bộ lời nhắn tiếng Việt.

Hệ chữ mới giữ hai family đang có thay vì thêm font: Be Vietnam Pro 400 cho nội dung, 500 cho nhãn, 600 cho title vật phẩm, 700 cho emphasis; Lora 500–600 cho heading editorial. UI 14px, body 15px, metadata 13px, caption 12px, line-height 1.5–1.65. `--font-display` không còn trỏ tới Nunito; không sinh glyph/font AI vì cần bộ dấu, hinting và license thực sự. Nguồn family: [Be Vietnam Pro](https://github.com/bettergui/BeVietnamPro).

`appearance.css` quản lý semantic tokens nền/surface/text/muted/accent/focus. `experience.css` là reading/spacing layer chung, tải sau page styles. Tránh mã màu cố định cho vùng đọc; hero/media và giấy/room không cần đảo màu như UI.

`refinement.css` chốt typography, rail 64px/152px, search và catalog/context density sau các stylesheet legacy. Icon/artist avatar cùng cột 28px; nhãn Giỏ hàng/Thông báo/Tài khoản xuất hiện khi mở rail. Mobile giữ icon có accessible name.

### Search và hội viên trong live

`SearchCombobox` dùng chung grammar cho header, Shop và Collection: tối đa 6 gợi ý, exact/prefix trước contains, tìm tiếng Việt không dấu, Arrow Up/Down/Enter/Escape, không bắt phím Enter khi IME đang composition. Gợi ý tự chạy trong local catalog, không gửi câu tìm hoặc dữ liệu fan tới Google. Header chỉ index Artist World, sự kiện được phép, Moments public và sản phẩm đúng tenant; Collection chỉ index đồ đã sở hữu theo mode; Shop index product families trong artist scope. Học mẫu tương tác từ [WAI-ARIA Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) và [GOV.UK search autocomplete](https://design-guide.publishing.service.gov.uk/components/search-autocomplete/).

Shop: search/tiện ích → một hàng danh mục → catalog. Nghệ sĩ ở Bộ lọc, chỉ show scope chip khi được chọn. “Có thể thử trong My Space” là lens nhỏ; preview từng món vẫn mở đúng món, không chuyển tới một màn hình chung.

Membership thêm optional `startedAt` cho kỳ hiện tại. Badge cạnh tên chat có mốc mới/1/3/6/12 tháng, mỗi artist demo có symbol riêng; không xếp hạng theo tiền. Không suy ngày bắt đầu từ `updatedAt`; record cũ chưa có ngày chỉ có badge hội viên, không tenure giả. Expired/inactive không được badge. Demo voices đánh dấu “mẫu”; badge demo không phải membership của một người thật. Gia hạn sau khi hết kỳ bắt đầu kỳ mới; chưa triển khai lịch sử cộng dồn nhiều kỳ. Tham khảo nguyên tắc loyalty badge của [YouTube memberships](https://support.google.com/youtube/answer/7544492?hl=en).

Context stage vẫn dùng Session/Hall room canonical. Ánh sáng khi artist đang present/live và lightstick reaction cục bộ là visual demo, không số liệu khán giả. Reduced motion tắt chuyển động; private Hall vẫn kiểm tra membership. Không có WebSocket/live streaming backend mới trong packet này.

Spacing section dùng token chung; heading/link/actions wrap trên màn hình hẹp thay vì thu nhỏ chữ. Explore giữ density, My Space giữ warmth, Artist World giữ cinematic artwork nhưng Hall/Archive/controls theo cùng appearance.

Regression test token text/link trên reading surfaces theo ngưỡng 4.5:1 cho chữ thường của [WCAG 2.2](https://www.w3.org/TR/WCAG22/#contrast-minimum). Đây không phải chứng nhận toàn app đạt WCAG: overlays, ảnh chứa chữ, states, zoom và screen reader vẫn cần kiểm tra riêng. Tôn trọng [reduced motion](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html).

Agency và belonging là nguyên tắc thiết kế, không phải tác động tâm lý đã được chứng minh cho app. Áp dụng tinh thần autonomy/relatedness từ [Self-Determination Theory](https://selfdeterminationtheory.org/theory/) để fan được chọn cách tham gia; không thêm guilt copy, XP hay pressure-driven commerce.

## Hiệu năng và offline

- Giữ code splitting; tái sử dụng currency formatter; memoize/dedupe artist products bằng Set.
- Tái sử dụng ảnh hiện có, không gen thư viện ảnh mới trong packet này.
- Hero không lazy load; grid dùng lazy loading khi renderer hỗ trợ, giữ geometry/ratio để hạn chế layout shift. Tham khảo [CLS](https://web.dev/articles/optimize-cls) và [lazy loading](https://web.dev/learn/performance/lazy-load-images-and-iframe-elements).
- Worker chỉ can thiệp navigation và public app assets cùng origin, không API/private responses. Chỉ retire cache namespace VieWorld. HTML fallback dành cho navigation; script thiếu khi offline trả lỗi, không HTML giả JavaScript.
- Worker mới không ép takeover tab đang mở. Đóng các tab cũ/mở lại để worker mới activate. Offline là best-effort cho asset đã cache, không cam kết mọi route/asset chưa ghé hoạt động offline.

Deploy cần SPA navigation fallback về `index.html`. Public assets phải có đúng MIME; URL asset không tồn tại không nên rewrite thành HTML. Cache file hashed dài hạn; HTML/worker cần cơ chế cập nhật. Chỉ expose dev/preview server ra mạng khi có chủ đích.

Nhiều stylesheet legacy còn được giữ để bảo toàn flow cũ. Gom toàn bộ CSS/chia AppContext theo domain là packet riêng cần profiling và regression coverage, không xóa hàng loạt chỉ để bundle nhỏ hơn. Đo [INP](https://web.dev/articles/optimize-inp), LCP/CLS trên thiết bị thật trước khi tuyên bố performance production.

## QA khi sửa app

- Home, Explore, Artist Home/context, Hall, Archive, My Space ba tab và Shop ở light/dark.
- Vietnamese diacritics, keyboard/focus, text zoom, reduced motion, màn hình hẹp.
- Context giữ artist identity; back/close không mất world; deep link không bị scroll hook chiếm quyền.
- Shop global/scoped; concept/sold-out, empty results, saved/cart và preview compatibility.
- Ownership không duplicate; Collection → Room/equipment cùng canonical reference.
- Cache không can thiệp API, không trả HTML cho script lỗi.
- Typecheck, test suite, production build. Không dùng badge/số test cố định làm cam kết chất lượng.

## Bản quyền

© 2026 Phạm Thanh Phú. All rights reserved. Phần mềm và tài nguyên được bảo lưu bản quyền; không sao chép, tái phân phối hoặc thương mại hóa khi chưa có chấp thuận bằng văn bản của tác giả.
