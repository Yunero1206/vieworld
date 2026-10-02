# VieWorld

VieWorld là bản thử nghiệm của Phạm Thanh Phú về một hành trình fan liền mạch: khám phá nghệ sĩ, tham gia hoạt động trong Artist World, giữ kỷ niệm và chọn cách xuất hiện trong My Space. Đây là showcase sản phẩm, không phải dịch vụ bán hàng, hội viên hay livestream đang vận hành thật.

Demo public: [vieworld.phamthanhphu.io.vn](https://vieworld.phamthanhphu.io.vn/). Render lấy source từ GitHub; thay đổi local chưa push sẽ chưa có trên bản public.

## Chạy và kiểm tra

Cần Node.js 22 và npm. Không cần `.env` cho dữ liệu demo.

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
npm run check:showcase
```

Vite mặc định chạy ở `http://localhost:5173`. `check:showcase` cần build mới trong `dist/`: kiểm tra entry, tham chiếu asset trực tiếp, kích thước chunk JavaScript và định dạng ảnh. Nếu sandbox Windows chặn config loader, dùng `npm test -- --configLoader runner`, rồi `npm run typecheck` và `npx vite build --configLoader runner`.

## Một hành trình, các nơi khác nhau

| Nơi | Route | Vai trò |
| --- | --- | --- |
| Home | `/` | Ba thời điểm Gần đây, Hiện tại, Sắp tới. Hiện tại là điểm nhấn; không phải feed vô hạn hoặc bảng quản lý phòng. |
| Explore | `/explore` | Tìm không dấu theo Artist World. Tên nghệ sĩ khớp chính xác hoặc tiền tố đứng trước hoạt động khớp; theo dõi và độ mới chỉ là ưu tiên phụ. |
| Artist World | `/artist/:artistId` | Trang chính có một hoạt động chính, một hoạt động phụ, tiếng nói fandom, kỷ niệm và vật phẩm liên quan. |
| Hall | `/artist/:artistId/hall` | Hội viên trò chuyện theo phòng. Trả lời mở thành thread; ngữ cảnh bên phải bám phòng đang chọn. |
| Kho lưu trữ | `/artist/:artistId/archive` | Timeline công khai của nghệ sĩ với bốn nhóm: tất cả, sự kiện, thời kỳ và dự án. Không trộn ghi chú riêng của fan. |
| VieSHOP | `/shop` | Một card cho mỗi dòng sản phẩm. Chi tiết mở ở giữa màn hình, chọn Ngoài đời, Trong VieWorld hoặc Cả hai theo phiên bản thực sự có. |
| My Space | `/me` | Mở thẳng phòng. Chọn avatar, giá trang phục, kệ, bảng kỷ niệm, góc âm nhạc hoặc sổ lưu bút để tương tác. Bộ sưu tập riêng mở từ phòng. |
| Hội viên, đơn hàng | `/memberships`, `/orders` | Hội viên được nhóm theo nghệ sĩ; đơn hàng nhóm theo lần checkout thay vì đếm mỗi dòng thành một đơn. |
| Tài khoản, trợ giúp | `/account/settings`, `/account/help` | Thiết lập riêng tư, liên hệ, giao diện và hướng dẫn. Hồ sơ hỗ trợ demo chỉ lưu trên thiết bị. |

Desktop dùng rail nhỏ; tên hiện khi hover hoặc điều hướng bằng bàn phím. Mobile có năm đích: Home, Explore, Artist, VieSHOP và Tài khoản. My Space là mục đầu trong menu tài khoản. Không có search chung ở header: Explore, Shop và Bộ sưu tập có phạm vi tìm riêng.

## Những luật quan trọng

- Đăng nhập demo mới được mở hoặc sửa dữ liệu cá nhân. Khách vẫn xem nội dung công khai, không mượn tên hay đồ của hồ sơ Linh.
- Tạo hồ sơ mới không tạo sẵn đơn hàng, kỷ niệm hoặc lời nhắn của fan khác. State lưu theo tenant và ID fan.
- Theo dõi không đồng nghĩa hội viên. Hội viên cần còn hiệu lực để vào Hall.
- Phòng Hall của phiên đã kết thúc chỉ đọc lại; không gửi hoặc react thêm. Phiên hủy, thiếu media hoặc chưa duyệt quyền không được mở thành phòng hợp lệ.
- Chỉ hiển thị artist đang hiện diện khi session được chọn thực sự running và báo `artistPresence=present`. Không suy ra số người online từ avatar minh họa.
- Lời nhắn Hall được đưa ra nơi công khai phải có opt-in tài khoản, consent cho lời nhắn và trạng thái duyệt; lời nhắn bị report không được chiếu ra. Quote fixture được ghi là minh họa.
- Home có tối đa ba lời nhắn cùng hoạt động Hiện tại. Bubble dẫn về đúng phòng và tin nguồn; Hall vẫn kiểm tra hội viên. Hình fan ngồi ghế là artwork trang trí, không đại diện người đang online.
- Lưu món, thêm giỏ hoặc xem thử không cấp quyền sở hữu. Bản physical không mặc định kèm digital.
- Avatar dùng một thân chuẩn; trang phục, nón và món cầm tay chỉ dùng fit đã chuẩn bị. Món chưa có fit không được dán ảnh lên avatar để giả lập hỗ trợ.
- Room có vị trí và giới hạn cố định. Hover hoặc focus món để xem thử nhẹ, chọn để giữ bản xem thử, xác nhận mới lưu. Không kéo thả pixel, không xóa món đã mua khi cất khỏi phòng. Kệ trống không giả ánh sáng của một lightstick chưa đặt.
- Link quyền lợi và thời hạn chỉ hiện khi có metadata hợp lệ. Không tự tạo deadline, quyền xem lại hoặc điểm đến.
- Hội viên tổng quan ưu tiên quyền lợi cần chú ý và quan hệ với từng nghệ sĩ. Quyền lợi đã nhận, hết hạn hoặc thu hồi nằm trong lịch sử, không cộng vào số quyền lợi hiện có.
- Liên kết giữa các nghệ sĩ không biến hoạt động của họ thành hoạt động chung. Programme được tìm qua đúng nghệ sĩ chủ quản; pulse Explore ưu tiên ngữ cảnh hoạt động chính.
- Shop không dùng lời nhắn concert không liên quan làm đánh giá sản phẩm. Khi chưa có câu chuyện gắn với dòng sản phẩm, dùng nội dung biên tập và ghi rõ từng phiên bản nhận được gì.

Các link My Space cũ còn hữu ích được chuyển về nơi hiện tại. Ví dụ `/me?panel=capsules` mở nhóm kỷ niệm trong Bộ sưu tập riêng, không tạo thêm một trang capsule song song. Dữ liệu sở hữu, vị trí cũ và ghi chú riêng được giữ.

## Source và hình ảnh

| Thư mục | Trách nhiệm |
| --- | --- |
| `src/views/`, `src/components/` | Route và giao diện; các trang chính lazy-load. |
| `src/domain/`, `src/world/` | Reducer, selector, quyền, tìm kiếm, đơn hàng và luật trình bày. |
| `src/data/` | Fixture minh họa, không phải API production. |
| `src/services/` | Lưu state demo và phục hồi khi storage lỗi. |
| `src/styles/` | Token, typography và CSS. `presence.css` là lớp composition hiện tại. |
| `src/tests/` | Regression logic, dữ liệu và UI; contract hiện tại ở `presence_contracts.test.tsx`, `presence_visual_connections.test.tsx` và `presence_md_continuation.test.tsx`. |
| `static/` | Asset public gốc, manifest và service worker. |

Vite dùng `static/` làm `publicDir`. `dist/` là output tạo lại được, được Git ignore; không sửa ảnh hoặc code trực tiếp trong đó. Các ảnh sản phẩm có alias qua `merchImages.ts`. Product ID và ownership không thay đổi khi đổi presentation.

Một số món fixture từng mượn ảnh sai loại được thay bằng illustration SVG trong `CatalogItemArt`, dùng chung cho Shop, Collection và Room. Đây là hình concept, không phải ảnh hàng thật. Avatar fit nằm ở `avatarFit.ts`; chỉ mở khả năng thử/mặc khi món có fit phù hợp.

Nhóm fan trên Home và bàn sổ lưu bút dùng WebP có nền trong suốt. Chữ, thông báo và lời nhắn vẫn được render bằng giao diện, không nằm trong ảnh. Sổ lưu bút là đồ nội thất mặc định; không tự cấp vật phẩm sưu tập. Animation bubble ngắn và tắt khi người dùng chọn giảm chuyển động.

## Giới hạn demo

Google/Facebook chỉ mô phỏng lựa chọn đăng nhập, không OAuth thật hoặc xác minh danh tính. State ở trình duyệt, không đồng bộ giữa thiết bị. Người dùng chung trình duyệt có thể mở các hồ sơ demo đã lưu. Không nhập địa chỉ, thông tin liên hệ, thanh toán hoặc dữ liệu nhạy cảm thật.

Các artist, nội dung, giá, quyền lợi và phiên live là dữ liệu minh họa. Hall không có mạng realtime; media không cấp quyền phát bản ghi thương mại. Kiểm tra phía client không phải bảo mật production. Bản vận hành thật còn cần xác thực và ủy quyền server, thanh toán/inventory xác nhận, moderation, đồng bộ, consent và chính sách dữ liệu.

Visual mới bám hierarchy và behavior của bộ ảnh đã chốt; không phải bản chép pixel hoặc bộ asset hoàn chỉnh cho mọi tổ hợp. Món chưa có fit vẫn được giữ trong dữ liệu sở hữu, nhưng không có nút mặc giả.

## Deploy

`render.yaml` cấu hình static site: `npm ci && npm run build && npm run check:showcase`, publish `dist/` và rewrite SPA về `index.html`. Service worker chỉ đăng ký production; offline là best-effort với asset đã cache.

Trước khi chia sẻ, kiểm tra Home, Explore, ba tab Artist, Room/Collection/Avatar, Shop, checkout, tài khoản mới, sign-out, light/dark, màn hình hẹp, bàn phím và reload. Xác nhận quyền sử dụng media trước khi public. Test xanh và build thành công không chứng minh app sẵn sàng cho giao dịch hoặc dữ liệu fan thật.

## Bản quyền

© 2026 Phạm Thanh Phú. All rights reserved. Xem [LICENSE](LICENSE) trước khi sao chép, tái phân phối hoặc dùng thương mại.
