# VieWorld — rà kết nối và fan journey

Ngày kiểm tra: 27/09/2026. Phạm vi: frontend showcase hiện tại; giữ assets, nội dung, stable IDs, cart/saved/ownership và các flow demo còn dùng. Không deploy, không bật thanh toán/OAuth thật, không xóa dữ liệu fan.

## Kết luận

**Sẵn sàng cho bước publish showcase có điều kiện**, không sẵn sàng làm dịch vụ production. Những luồng fan chính đã nối và có regression tests; các điểm gãy tìm được trong đợt này đã sửa. Trước khi public cần xác nhận quyền dùng ảnh/media và chạy checklist trên host thật. Không coi số test hoặc kiểm tra token contrast là chứng nhận toàn app.

Không cần thêm một hệ onboarding, hệ badge cạnh tranh hay thêm destination để journey hoàn chỉnh. Những bổ sung hữu ích nhất hiện là trạng thái trống có đường đi tiếp, nhận đồ digital demo rõ ràng, bảo vệ lưu dữ liệu và phục hồi lỗi.

## Một fan đi hết hành trình

| Bước | Tính nhất quán cần giữ | Kiểm tra / sửa trong đợt này |
| --- | --- | --- |
| Lần đầu → khám phá | Không ép login; featured artist chỉ assign một lần; artist slot luôn có identity | Regression guest/currentArtist; giữ hệ thống assign hiện có |
| Explore → Artist / Moment / event | Artist click vào world trung tính; Moment mở focus có back đúng; chương trình IP nối artist hợp lệ | Dùng `artistForWorld` chung cho redirect và global search; không rơi vào `/artist/neon-sessions` sai |
| Login → hội viên / Hall | Đăng nhập không tự mua membership; overlay không làm mất artist/room | Test UI login Google demo → đúng Hall room → membership demo → composer; logout khóa chat riêng |
| Live / RSVP | RSVP khác tham dự; không autoplay; context giữ artist shell | Test domain join lặp không sinh attendance; QA context switch, badge và Hall panel; phase vẫn theo đồng hồ demo |
| Kết thúc → kỷ niệm | Kỷ niệm của đúng fan, tenant; chat riêng không thành public voice | Capsule notification mở `/me?section=collection&mode=memories&type=capsule`; hỗ trợ alias `type=memory` cũ |
| Artist → Shop | Cùng catalog, scope giữ trong URL, back được | QA scoped shop; guard product tenant; không copy product object |
| Lưu / giỏ / trả tiền / nhận | Saved và paid chưa đồng nghĩa owned; retry không cấp trùng | Test UI checkout → thanh toán mô phỏng → nhận digital → Collection; bước nhận digital-only nối ngay tại checkout |
| Collection → Room / Avatar | Canonical ownership; chỉ compatible items; fan chủ động chọn trưng | Test placement/equipment/reload; không auto trưng khi vừa nhận; phân biệt chưa sở hữu với lọc rỗng |
| Room customization | Surface/preset, không free positioning; controls đọc rõ trên mobile/dark | Sửa drawer màu legacy; focus trap / Esc / khóa background scroll; QA Tab và Shift+Tab |
| Quay về Home | Tiếp tục **chính nơi ghé cuối**, không chọn một memory khác thay user | Test destination `/me?section=avatar`; QA từ Archive về Home vẫn resume Archive |
| Tài khoản / hỗ trợ / reload | Contact không ở public projection; không render record fan/tenant khác; không mất đồ khi logout | Tests public projection và private record guards; dữ liệu ownership/display tồn tại qua reload/logout |

Test journey xuyên suốt là integration ở reducer/domain, kèm các test UI Hall/login và Shop/checkout/Collection. Không gọi đó là một test browser E2E tự động chạy toàn bộ journey; live kết thúc được điều khiển bởi demo operator, không phải fan tự kết thúc live của nghệ sĩ.

## Lỗi và thay đổi thực tế

- Redirect của session/IP và global search trước đây không chung cách resolve artist. Nay dùng cùng helper, có tenant guard.
- Hall trước đây còn dựa vào membership fixture khi logout; Hall legacy có thể render message mà không chặn membership. Nay UI/domain kiểm tra phiên demo và quyền; guest mở auth tại chỗ.
- Membership active nhưng quá hạn có thể bị no-op khi gia hạn. Nay kỳ hết hạn được gia hạn, không cấp lại benefit trùng.
- Digital checkout trước đây cần đi vòng qua order để nhận đồ. Nay có bước nhận demo tại checkout digital-only; trả tiền không tự cấp ownership trước khi nhận.
- Capsule notification và một link từ kệ kỷ niệm mở sai mode Collection. Nay mở Kỷ niệm/Capsule; URL cũ vẫn được hiểu. Chi tiết capsule mở editor ghi chú riêng đúng ID, không bắt fan tìm lại trong toàn bộ danh sách.
- Collection 0 món trước đây chỉ có “Xem tất cả” và vẫn trống. Nay có next step đúng mode, không giả lập vật phẩm cho user.
- Room drawer dark theme còn heading/link tím đậm và empty box trắng. Nay controls/reading surfaces dùng semantic theme; artwork vẫn giữ màu vật liệu.
- Các trang benefit/support chi tiết và liên kết hồ sơ hỗ trợ trong order/benefit bổ sung kiểm tra đúng fan/tenant/subject type. Đây là guard frontend, không phải server authorization.
- Dữ liệu partial/malformed không được selector dùng mù quáng; giữ recovery copy trước khi khởi tạo guest. Không đổi storage version hoặc reset bản lưu hợp lệ.
- Ghi memory-only trả về không durable và có cảnh báo; mở nhiều tab không âm thầm ghi đè snapshot mới. Offline báo rõ nhưng không hứa mọi page chưa cache vẫn chạy.
- Error boundary root/route, local backup whitelist và route reset key giúp phục hồi mà không bắt buộc xóa demo.
- `typecheck` cũ không đi vào project references: đổi thành `tsc -b`. Vitest được cập nhật 4.1.11 để xử lý advisory của tooling.
- Cấu hình publish giữ một static SPA; bỏ dịch vụ Node chạy `vite preview` như production. Không có route đang dùng nào bị xóa, không xóa ảnh/sản phẩm/kỷ niệm.

`/me?panel=capsules` vẫn có quan hệ thật với capsule riêng và ghi chú, nên giữ. Các view demo Studio/operator vẫn được dùng để điều khiển phiên và thử trạng thái, không xóa vì không ở navigation chính.

## Files thay đổi trong đợt audit này

- Routing/search: `src/App.tsx`, `src/world/worldContext.ts`, `src/world/searchDiscovery.ts`.
- Hall/membership/domain: `src/world/merchCatalog.ts`, `src/domain/reducer.ts`, `src/components/HallPanel.tsx`, `src/views/ArtistHall.tsx`.
- Ownership/commerce/private links: `src/world/display.ts`, `src/views/CartView.tsx`, `src/views/FanShopView.tsx`, `src/views/OrderDetailView.tsx`, `src/views/BenefitDetailView.tsx`, `src/views/SupportCaseDetailView.tsx`.
- My Space UX: `src/components/CollectionBrowser.tsx`, `src/components/DisplayRoom.tsx`, `src/views/FanWorldView.tsx`, `src/styles/appearance.css`.
- Recovery/shell: `src/services/storageAdapter.ts`, `src/context/AppContext.tsx`, `src/components/ApplicationHealth.tsx` (mới), `src/components/ErrorBoundary.tsx`, `src/components/StatusNotice.tsx`, `src/components/FanShell.tsx`, `src/main.tsx`.
- Delivery/tooling: `package.json`, `package-lock.json`, `vite.config.ts`, `render.yaml`, `index.html`, `static/manifest.json`, `scripts/check-showcase.mjs` (mới).
- Tests: `src/tests/showcase_connections.test.tsx` (mới), `src/tests/fan_journey_showcase.test.tsx` (mới), `src/tests/notifications.test.tsx`, `src/tests/theme_contrast.test.ts`, `src/tests/context_stage_refinement.test.tsx`, `src/tests/artist_bulletin_refinement.test.tsx`, `src/tests/world_v4_consistency.test.tsx`.
- Tài liệu: `README.md`, file này. Bỏ một import không dùng trong `src/views/FanWorldView.tsx` để typecheck thật pass.

Repo đã có thay đổi từ packet account/privacy/support trước audit; được bảo toàn, không coi là toàn bộ thay đổi mới của đợt này.

Schema không thêm product/ownership copy hay backend mới. AppContext thêm flags UI cho persistence; Room/Collection vẫn đọc entity cũ. Không gen thêm asset hay demo product trong đợt này.

## Kiểm chứng

Chạy từ repo với dependency lockfile hiện tại:

```sh
npm run typecheck
npm test -- --configLoader runner
npm run build -- --configLoader runner
npm run check:showcase
npm audit
```

Kết quả cuối cùng sau khi chạy lại toàn bộ suite:

| Kiểm tra | Kết quả |
| --- | --- |
| Typecheck thật (`tsc -b`) | Pass |
| Vitest 4.1.11 | **58 files / 499 tests pass** |
| Production build | Pass, giữ route chunks |
| `check:showcase` | Pass: 27 literal assets, built entry/manifest/worker; 25 JS files, 994 KiB tổng uncompressed |
| `npm audit` (cả dev dependencies) | 0 vulnerabilities được registry báo ở thời điểm kiểm tra |
| `git diff --check` | Pass |

`--configLoader runner` là workaround cho shell Windows hạn chế quyền, không bắt buộc trên môi trường bình thường. Test runner có cảnh báo experimental localStorage của Node và thông báo jsdom chưa hỗ trợ `location.reload()` ở một test recovery cũ; suite vẫn pass. Browser preview không ghi các lỗi này. Không coi dependency audit là security audit toàn app.

QA browser trên production preview riêng ở localhost, không reset dữ liệu tab app của user:

- Home light/dark: text tương phản, banner nhỏ; resume là last destination; upcoming trước recent.
- Artist Home/context/Hall: cùng shell, room/badge, không autoplay; có empty/gated state trong UI tests.
- Explore → Moment Focus → quay lại Explore; Archive theo năm/chapter, sidebar global không đổi destination.
- My Space: Room drawer, Collection trống, Avatar immediate UI; notification overlay cuộn nội bộ và Esc; menu tài khoản/theming.
- Shop artist-scoped mobile, desktop kiểm tra trong suite; deep route refresh ở preview.
- Viewport overrides desktop 1440×900, tablet 1024×900, mobile 390×844. Trong các trang đã đọc DOM không thấy document overflow ngang hay ảnh đã tải bị broken; console không ghi error/warn trong lượt QA này.
- Drawer Room: Shift+Tab từ close về link cuối, Tab trở lại close; Escape đóng và trả focus. Đây không phải screen-reader audit, kiểm tra mọi mức browser zoom hoặc test trên thiết bị thật.

## Hiệu năng / khả năng lưu

Build giữ route chunks và lazy image grids; guard script báo tổng JS mọi route khoảng 1 MiB **uncompressed**, không phải tải tất cả ở trang đầu. Entry khoảng 468 kB / 134 kB gzip; CSS legacy khoảng 474 kB / 86 kB gzip. Vẫn có artwork PNG/JPG lớn ~1–2 MB. Không xóa nội dung/chia toàn bộ CSS chỉ để đẹp số; bước tiếp theo phù hợp là profiling rồi tối ưu định dạng/kích thước ảnh và CSS theo route.

Chưa đo LCP/INP/CLS dưới throttling hoặc Lighthouse; không tuyên bố “mượt nhất” trên mọi máy. Script chỉ kiểm tra 27 public asset literal, built entry/manifest/worker và chunk guard; không phải full dynamic-asset inventory.

App boot dùng synchronous storage. IndexedDB có backup async nhưng chưa nối automatic restore/import đầy đủ. Multi-tab dùng pause + tải bản sao + reload thủ công, chưa merge dữ liệu. Recovery validation chỉ là envelope tối thiểu; corruption sâu field con vẫn cần validation domain/migration kỹ hơn cho production.

## Checklist trước public

1. Xác nhận quyền sử dụng từng ảnh, artwork, logo, âm thanh và font. Label “demo” không thay thế quyền dùng media. Chưa có manifest provenance đầy đủ để xác nhận điều này.
2. Publish `dist/` bằng static hosting HTTPS, không public dev server/preview server. Bản `render.yaml` đã chuẩn bị, chưa thực hiện deploy.
3. Mở và refresh trực tiếp `/artist/artist-a/hall`, `/artist/artist-a/archive`, `/shop?artist=artist-a`, `/me?section=collection`; legacy `/moments` phải về Explore.
4. Kiểm tra HTTP MIME của CSS/JS/fonts/images và trường hợp asset không tồn tại. Wildcard SPA fallback của host không được làm browser nhận HTML giả JavaScript; kiểm tra riêng sau deploy.
5. Xác nhận HTML/service worker cập nhật được, tab cũ không bị force takeover; mở phiên mới và thử reload sau một bản phát hành mới.
6. Chỉ dùng contact giả; OAuth/payment/live/support là mock. Không nhận giao dịch, thông tin giao hàng hay private fandom thật trong showcase.
7. Thử trên một điện thoại thật, keyboard/zoom và mạng chậm. Đi lại journey đăng nhập, Hall, cart/checkout, Collection và phòng trước khi gửi link rộng rãi.

Chưa phù hợp production vì chưa có OAuth/session an toàn, authorization server, inventory/payment verification, realtime/moderation, account isolation/PII protection hay support delivery thật. SVG manifest icon không bảo đảm install behavior giống nhau ở mọi browser.

## Cơ sở kỹ thuật / UX

Các quyết định ưu tiên control, feedback, predictable navigation và recovery; không khẳng định hiệu quả tâm lý đã được nghiên cứu trên fan VieWorld.

- [W3C — status messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages): trạng thái lưu/offline phải đọc được, không chỉ màu.
- [W3C — preliminary accessibility checks](https://www.w3.org/WAI/test-evaluate/preliminary/): kiểm tra nhanh không thay thế đánh giá accessibility đầy đủ.
- [React — error boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary): xử lý lỗi render bằng fallback; không bắt được mọi async/network error.
- [Vite — static deployment](https://vite.dev/guide/static-deploy), [build](https://vite.dev/guide/build): build/static hosting và route chunking; preview không phải server production.
- [Render — redirects/rewrites](https://render.com/docs/redirects-rewrites): SPA deep links phải kiểm tra ở host thật.
- [Vitest security advisory](https://github.com/vitest-dev/vitest/security/advisories/GHSA-82fw-gwwq-j7x9): cập nhật tooling lên bản fix, không coi đó là lỗi runtime của static app.

Xem README cho nguyên tắc autonomy/belonging, search combobox, contrast và typography đã dùng trong các packet trước.
