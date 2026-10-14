# VieWorld

VieWorld là product prototype của Phạm Thanh Phú về một không gian chung cho fan và nghệ sĩ. Fan có thể khám phá Artist World, trò chuyện trong Hall, giữ lại kỷ niệm và dùng vật phẩm để tạo dấu ấn riêng trong My Space.

[Trải nghiệm demo](https://vieworld.phamthanhphu.io.vn/) · [Báo cáo kiểm tra 14/10/2026](docs/implementation/vieworld-quality-upgrade-report.md)

Đây là showcase độc lập, không phải nền tảng fandom đang vận hành thật. Nghệ sĩ, cộng đồng, giá, quyền lợi và hoạt động đều là dữ liệu minh họa. Không có OAuth, thanh toán, giao hàng, livestream hoặc hỗ trợ khách hàng thật. **Không nhập thông tin liên hệ, địa chỉ, thanh toán hoặc dữ liệu nhạy cảm thật.**

## Ý tưởng sản phẩm

VieWorld thử nghiệm mối liên hệ **Moment → Place → Position → Continuity**: một khoảnh khắc khiến fan muốn ghé vào, một nơi để gặp nhau, một cách thể hiện mình và những điều đáng giữ để quay lại.

Đây là giả thuyết sản phẩm, chưa có nghiên cứu người dùng hoặc dữ liệu chứng minh retention. Fan không bị buộc đi đủ một funnel hay mua vật phẩm để tham gia cộng đồng.

## Khám phá demo

| Nơi | Route | Trải nghiệm |
| --- | --- | --- |
| Home | `/` | Ba thời điểm Vừa rồi, Đang diễn ra và Sắp tới; hoạt động hiện tại là điểm nhấn. Bubble chọn lọc dẫn về lời nhắn nguồn trong Hall. |
| Explore | `/explore` | Khám phá nghệ sĩ và hoạt động; tìm tiếng Việt không dấu, xem các world đang theo dõi. |
| Artist World | `/artist/:artistId` | Trang chính, Hall và Kho lưu trữ của từng nghệ sĩ. Hoạt động mở ngay trong world, không tách thành một hành trình khác. |
| Hall | `/artist/:artistId/hall` | Khách đọc phòng công cộng; fan đăng nhập có thể trò chuyện miễn phí. Member Lounge và Q&A cần hội viên còn hiệu lực của đúng nghệ sĩ. |
| Kho lưu trữ | `/artist/:artistId/archive` | Kỷ niệm công khai hợp lệ và chapter được biên tập trong fixture; không đưa nội dung private vào timeline. |
| VieCollect | `/shop` | Chọn vật phẩm để sưu tập, mặc lên avatar hoặc trưng trong phòng. Bản vật lý và bản số có luồng nhận demo riêng; hybrid mới chỉ xem concept. |
| My Space | `/me` | Mở thẳng phòng cá nhân. Từ phòng, mở avatar, Bộ sưu tập riêng, các vị trí trưng bày hoặc Sổ lưu bút. |
| Hội viên, đơn hàng | `/memberships`, `/orders` | Xem quan hệ hội viên theo nghệ sĩ, quyền lợi và những lần nhận vật phẩm mô phỏng. |
| Tài khoản, trợ giúp | `/account/settings`, `/account/help` | Thông tin tài khoản private, riêng tư, giao diện và hướng dẫn tra cứu chỉ đọc. Yêu cầu hỗ trợ chỉ lưu trên thiết bị. |

Desktop dùng rail nhỏ, tên hiện khi hover/focus. Mobile có năm đích: Home, Explore, Artist, VieCollect và Tài khoản; My Space nằm đầu menu tài khoản. Tìm kiếm có phạm vi riêng ở Explore, VieCollect và Bộ sưu tập, không có ô tìm kiếm toàn app ở header.

Một luồng có thể thử: tạo hồ sơ demo mới → ghé Hall công cộng → xem thử vật phẩm số → thêm giỏ → chốt và thanh toán thử → nhận bản số → mở My Space → chọn vị trí phù hợp → lưu → tải lại để kiểm tra. Xem thử, thêm giỏ và thanh toán chưa tự cấp quyền sở hữu.

## Chạy local

Dùng Node.js 22 như cấu hình Render và npm. Không cần `.env`, backend hoặc tài khoản dịch vụ.

```sh
npm ci
npm run dev
```

Vite mặc định chạy tại `http://localhost:5173`. Để kiểm tra production build local:

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 5189 --strictPort
```

## Kiểm tra trước khi chia sẻ

```sh
npm run typecheck
npm test
npm run check:source
npm run build
npm run check:showcase
git diff --check
```

`check:source` kiểm tra import graph và literal links/routes. `check:showcase` cần build mới trong `dist/`: kiểm tra entry, asset references, signature ảnh, budget derivative, chunk JavaScript và precache đã phát sinh.

Nếu config loader bị sandbox Windows chặn, đọc log để phân biệt lỗi môi trường với lỗi app. Có thể dùng `npm test -- --configLoader runner`; với build, chạy `npm run typecheck` rồi `npx vite build --configLoader runner`.

Lượt kiểm tra 14/10/2026: 603 test trong 67 suite, typecheck, source/build/asset checks đã pass; browser QA dùng light/dark trên desktop và mobile. Môi trường local dùng Node 26.7.0, **chưa xác minh Node 22**. Chưa đo LCP/CLS hoặc payload qua CDN; offline và release update chưa kiểm tra bằng chế độ mất mạng của browser thật. Xem [báo cáo](docs/implementation/vieworld-quality-upgrade-report.md) để biết phạm vi và giới hạn, không coi test xanh là chứng nhận production.

## Những nguyên tắc giữ xuyên suốt

- Hồ sơ mới bắt đầu riêng, không mượn tên, đồ, đơn hàng hay lời nhắn của Linh. Đăng xuất ẩn dữ liệu protected ngay, giữ dữ liệu hợp lệ để đăng nhập lại.
- Theo dõi không đồng nghĩa hội viên. Hall công cộng miễn phí; private access phụ thuộc đúng fan, tenant, nghệ sĩ và thời hạn.
- Access, mode và lifecycle độc lập. Scheduled cho chuẩn bị; paused chỉ đọc; ended/archived không gửi hoặc react thêm. Hoạt động hủy, media lỗi hoặc quyền chưa duyệt không được mở như phiên hợp lệ.
- Artist presence chỉ xuất hiện theo trạng thái phiên và segment hợp lệ, luôn là minh họa. Avatar trang trí, quote fixture và poll không chứng minh người đang online hoặc nghệ sĩ thật có mặt.
- Public voice cần opt-in, consent và approval đúng ngữ cảnh. Private Lounge/Q&A không được chiếu ra Home/Explore/Archive, dù có consent. Home có tối đa ba bubble cùng hoạt động hiện tại.
- Saved, cart, paid/preorder và owned là các trạng thái khác nhau. Chỉ nhận/fulfilled mới ghi ownership; bản physical-only không mở digital. Receipt hybrid cũ được giữ, không coi đó là bằng chứng luồng hybrid mới đã hoàn thiện.
- Fan chọn món và vị trí tương thích, room tự bố cục với capacity cố định. Move atomic; thao tác lỗi không làm mất nguồn. Gỡ khỏi phòng không xóa đồ sở hữu hoặc provenance. Không kéo thả pixel.
- Avatar chỉ mặc/cầm món đã có fit chuẩn bị sẵn; không dán ảnh sản phẩm lên người để giả hỗ trợ. Tên đồ mặc lấy từ public look của chủ phòng, không từ viewer.
- Dấu mốc 10/20 là số thẻ lịch sử mẫu, không phải tuổi fan, attendance, rank hay spend score. Fandom Pass không cấp entitlement. Selected Q&A không đồng nghĩa answered; câu trả lời fixture có nhãn minh họa.
- Giải quyết hồ sơ hỗ trợ không tự cấp quyền lợi hoặc giao hàng. Ghi chú riêng, order/payment và contact không trở thành metadata công khai.

Deep links còn hữu ích được giữ tương thích: `/inbox`, `/sessions/:id` và các link My Space cũ. Ví dụ `/me?panel=capsules` mở nhóm kỷ niệm trong Bộ sưu tập riêng, không tạo một trang capsule song song.

## Source và delivery

React + TypeScript + Vite; reducer/selector giữ luật domain, fixture cung cấp dữ liệu demo, các route chính lazy-load.

| Thư mục | Vai trò |
| --- | --- |
| `src/views/`, `src/components/` | Routes và giao diện. |
| `src/domain/`, `src/world/` | State, quyền, scope, ownership, placement và luật trình bày. |
| `src/data/` | Fixture minh họa và manifest delivery ảnh. |
| `src/services/` | Lưu/khôi phục dữ liệu browser-local. |
| `src/styles/` | Tokens, typography và composition; `presence.css` là lớp presentation hiện tại. |
| `src/tests/` | Regression domain, privacy, persistence, route và UI contracts. |
| `static/` | Public assets, manifest và service worker; Vite dùng làm `publicDir`. |
| `scripts/` | Source/build checks và công cụ tối ưu ảnh tùy chọn. |
| `docs/implementation/` | Bằng chứng kiểm tra và các quyết định triển khai. |

Ảnh full-size được chuyển sang WebP, giữ artwork, geometry và alpha; notification có thumbnail riêng nhỏ hơn. `src/data/imageDelivery.json` ghi originals, derivatives và budget. Resolver giữ các alias/URL cũ, không đổi ID, fit hoặc ownership. Original files còn để phục vụ compatibility; `dist/` là output được Git ignore, không sửa trực tiếp.

Để tái tạo derivatives, dùng `node scripts/optimize-images.mjs --sharp-module <đường dẫn module Sharp>`. Đây là công cụ dev tùy chọn; Sharp không cần để chạy hoặc build app. Không tạo artwork mới bằng converter.

Be Vietnam Pro dùng cho nội dung, Nunito cho display, Lora cho các heading/editorial đã định nghĩa. Nunito là variable font. Thông báo tính thời gian theo `demoTime`, không theo đồng hồ máy.

State vẫn lưu ngay, không debounce toàn snapshot. Snapshot cùng object/key đã lưu thành công được bỏ qua; ghi lỗi vẫn có memory-fallback notice. Xung đột giữa tab dừng ghi và yêu cầu recovery rõ ràng. Đây không phải khóa transactional hay bảo đảm chống mất dữ liệu khi crash.

## Deploy và cache

`render.yaml` khai báo static SPA:

- Node 22.
- Build: `npm ci && npm run build && npm run check:showcase`.
- Publish: `dist/`.
- SPA rewrite về `index.html`; HTML/service worker không cache cố định.
- Service worker chỉ đăng ký trong production; cache version theo bundle/public assets, không dùng `skipWaiting` ép tab cũ đổi bundle.

Precache gồm shell, CSS/fonts, static dependencies của My Space và đồ nội thất mặc định. Offline là best-effort với những gì đã cache, không bao phủ mọi route hoặc mọi tổ hợp phòng. Vật phẩm/nội dung chưa cache vẫn cần mạng.

Push GitHub không đồng nghĩa deployment đã thành công; cần xem kết quả build/deploy của Render. `vite preview` chỉ dùng kiểm tra local, không là production server.

## Giới hạn và quyền sử dụng

Google/Facebook chỉ mô phỏng lựa chọn đăng nhập, không xác minh danh tính hoặc kết nối tài khoản thật. State lưu theo tenant/fan trong trình duyệt, không đồng bộ thiết bị. Ai dùng chung trình duyệt có thể chọn các hồ sơ demo đã lưu; client guards không phải bảo mật server.

Hall không realtime; media không cấp quyền phát bản ghi thương mại. Giá, tồn kho, giao nhận và moderation đều mô phỏng. Bản vận hành thật còn cần auth/authorization server, dữ liệu authoritative, thanh toán, inventory, moderation, consent và chính sách dữ liệu.

VieWorld không có liên kết chính thức với nghệ sĩ, hãng giải trí hoặc DatVietVAC. Fixture MFan/FanMe không chứng minh quan hệ đối tác. Hình sản phẩm/nhân vật là concept hoặc minh họa AI, không phải ảnh hàng đã sản xuất. Kiểm tra quyền sử dụng media trước khi chia sẻ/public; visual hiện tại không phải bộ asset hoàn chỉnh cho mọi tổ hợp.

© 2026 Phạm Thanh Phú. All rights reserved. Xem [LICENSE](LICENSE) trước khi sao chép, tái phân phối hoặc dùng thương mại.
