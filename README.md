# VieWorld

VieWorld là prototype tương tác về một hành trình fan liền mạch: khám phá nghệ sĩ, tham gia một cuộc hẹn trong Artist World, giữ lại kỷ niệm hoặc vật phẩm, rồi tự chọn cách trưng bày trong My Space. Đây là bản showcase sản phẩm của Phạm Thanh Phú, **không phải** dịch vụ bán hàng, hội viên hay livestream đang vận hành thật.

Demo public: [vieworld.phamthanhphu.io.vn](https://vieworld.phamthanhphu.io.vn/). Bản deploy lấy source từ GitHub qua Render, nên có thể chưa trùng revision với những thay đổi local chưa được push.

## Chạy trên máy

Cần Node.js 22 và npm. Không cần `.env` để chạy dữ liệu demo.

```sh
npm ci
npm run dev
```

Vite mặc định mở ở `http://localhost:5173`. Các lệnh kiểm tra trước khi chia sẻ hoặc deploy:

```sh
npm run typecheck
npm test
npm run build
npm run check:showcase
```

`check:showcase` cần bản build mới trong `dist/`: nó kiểm tra entry, asset được tham chiếu trực tiếp, kích thước chunk JavaScript và định dạng thực của ảnh public. Các ảnh sản phẩm tạo URL động được kiểm tra thêm bằng test. Nếu sandbox Windows chặn config loader của Vite/Vitest, dùng `npm test -- --configLoader runner` và `npm run build -- --configLoader runner`.

## Đi qua app như một fan

| Bước | Route chính | Điều cần hiểu |
| --- | --- | --- |
| Bắt đầu, khám phá | `/`, `/explore` | Home giúp định hướng và quay lại đúng chỗ vừa ghé; Explore mở các Artist World. |
| Theo một nghệ sĩ | `/artist/:artistId` | Trang chính, Hall và Kho lưu trữ nằm trong cùng world. Event/live dùng context của world, không đưa fan sang một site khác. |
| Trò chuyện, nhớ lại | `/artist/:artistId/hall`, `/artist/:artistId/archive` | Hall chat riêng cần phiên demo và quyền hội viên; tiếng nói công khai được chọn lọc tách khỏi chat riêng. |
| Tìm và chọn món | `/shop`, `/shop?artist=artist-a` | VieSHOP đọc cùng catalog với Artist World. Lưu/cho vào giỏ chưa tạo quyền sở hữu; xem thử My Space không tự nhận món. |
| Giữ, trưng, xuất hiện | `/me` | Bộ sưu tập đọc món đã nhận. Room chỉ hiện đồ fan chủ động trưng; Avatar chỉ dùng quyền digital phù hợp. |

My Space có ba tab **Phòng của tôi / Bộ sưu tập / Avatar**. Room dùng các mặt trưng bày và bố cục chuẩn bị sẵn, có giới hạn số món/sức chứa; không kéo thả tự do theo pixel. Ảnh sản phẩm trong Shop và cách thể hiện trong Room/Avatar là hai lớp presentation của cùng một sản phẩm/quyền, không phải ba bản sao dữ liệu.

Icon tài khoản mở đăng nhập/đăng ký demo. Google và Facebook là lựa chọn mô phỏng trên một hồ sơ mẫu, **không OAuth thật**. Khách vẫn có thể xem nội dung công khai, nhưng không được nhìn My Space cá nhân hoặc được chào bằng tên của fan mẫu. Không nhập thông tin liên hệ, địa chỉ hay dữ liệu thanh toán thật vào bản demo.

## Source và dữ liệu

| Nơi | Trách nhiệm |
| --- | --- |
| `src/views/`, `src/components/` | Route và giao diện; các trang chính được lazy-load. |
| `src/domain/`, `src/world/` | State, reducer, selector và luật sản phẩm: context, quyền, Shop, Collection, Room. |
| `src/data/` | Fixture và nội dung minh họa; không phải API production. |
| `src/services/` | Lưu state demo theo fan/tenant, fallback và bản sao phục hồi. |
| `src/styles/` | Token sáng/tối, typography và CSS theo page. |
| `src/tests/` | Regression cho logic và giao diện. |
| `static/` | File public gốc, gồm ảnh, manifest và service worker. |

Vite dùng `static/` làm `publicDir`. `dist/` là **output build có thể tạo lại**, được Git ignore; ảnh xuất hiện trong cả `static/images` và `dist/images` sau build là cơ chế sao chép, không phải hai thư viện cần giữ hoặc chỉnh riêng. Đừng sửa trực tiếp `dist/`. Ảnh Shop có tên canonical/alias qua `src/world/merchImages.ts`; digital và physical chỉ chia sẻ file khi nội dung byte thực sự giống nhau. Giữ product ID và dữ liệu sở hữu khi đổi tên file ảnh.

State demo sống trong trình duyệt, không có server account isolation. Reducer kiểm tra tenant/fan và chống lặp một số thao tác nhận món, nhưng kiểm tra phía client không phải lớp bảo mật production. Một bản vận hành thật vẫn cần xác thực/ủy quyền server-side, thanh toán và inventory có xác nhận, realtime cho Hall/live, đồng bộ dữ liệu, moderation, consent và chính sách lưu/xóa thông tin cá nhân.

## Deploy và kiểm tra thực tế

`render.yaml` cấu hình Render static site: `npm ci && npm run build && npm run check:showcase`, publish `dist/`, và rewrite SPA về `index.html` cho deep link. Service worker chỉ đăng ký ở build production; offline là best-effort với asset đã cache, không phải cam kết mọi route sẽ chạy không mạng.

Trước khi dùng như showcase công khai, kiểm tra ít nhất Home, Explore, ba tab Artist, ba tab My Space, Shop global/scoped, giỏ hàng, trạng thái khách, light/dark, màn hình hẹp, bàn phím và reload. Đối chiếu quyền sử dụng ảnh/media và nội dung demo trước khi chia sẻ rộng. Test xanh và build thành công **không chứng minh** app đã sẵn sàng cho giao dịch hoặc dữ liệu fan thật.

## Bản quyền

© 2026 Phạm Thanh Phú. All rights reserved. Xem [LICENSE](LICENSE) trước khi sao chép, tái phân phối hoặc sử dụng thương mại.
