# VieWorld — Nền Tảng Kết Nối Fandom & Thế Giới Tương Tác Số

<div align="center">

![VieWorld Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg?style=flat-square)
![Tests](https://img.shields.io/badge/Tests-355%20passed%20%7C%2035%20suites-success?style=flat-square)
![React](https://img.shields.io/badge/React-19.0.0-61dafb.svg?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-6.1-646CFF.svg?style=flat-square)
![License](https://img.shields.io/badge/License-Proprietary%20%2F%20All%20Rights%20Reserved-red.svg?style=flat-square)
![Author](https://img.shields.io/badge/Author-Phạm%20Thanh%20Phú-orange.svg?style=flat-square)

<br/>

**VieWorld — Một thế giới, cùng nhau.**  
*Nền tảng fandom diorama 2.5D độc lập, ấm cúng, chân thực, nơi người hâm mộ và nghệ sĩ cùng sẻ chia những khoảnh khắc đáng nhớ.*

</div>

---

## 👤 Thông Tin Tác Giả & Bản Quyền Sở Hữu Trí Tuệ

> [!IMPORTANT]
> ### TUYÊN BỐ BẢN QUYỀN ĐỘC QUYỀN (PROPRIETARY COPYRIGHT NOTICE)
> - **Tác giả / Nhà thiết kế & Sáng lập:** **Phạm Thanh Phú**
> - **Bản quyền:** **Copyright © 2026 Phạm Thanh Phú. All rights reserved.**
> - **Giấy phép:** Proprietary (Toàn bộ quyền được bảo lưu theo giấy phép [LICENSE](./LICENSE)).
> 
> Toàn bộ ý tưởng sản phẩm, cấu trúc kiến trúc phần mềm, mã nguồn (frontend & architecture), thiết kế giao diện (UI/UX), đồ họa/vector, cơ chế tương tác và tài liệu hiến pháp sản phẩm trong kho lưu trữ này là **tài sản trí tuệ độc quyền của Phạm Thanh Phú**.  
> Mọi hành vi sao chép, trích xuất, tái phân phối, chuyển nhượng hoặc thương mại hóa khi chưa có sự chấp thuận bằng văn bản chính thức từ tác giả đều bị nghiêm cấm theo quy định pháp luật về Sở hữu trí tuệ.

---

## 🌟 Giới Thiệu Dự Án (Overview & Vision)

**VieWorld** là một nguyên mẫu sản phẩm quan hệ người hâm mộ di động (*portable fan relationship platform*) do **Phạm Thanh Phú** nghiên cứu và phát triển. Dự án giải quyết các vấn đề phân mảnh, thiếu tin cậy và thương mại hóa thái quá trong các mô hình fandom truyền thống bằng cách thiết lập một không gian kỹ thuật số minh bạch, nơi người hâm mộ thực sự sở hữu các kỷ niệm và giá trị gắn bó cùng nghệ sĩ yêu thích.

### 🔄 The Signature Loop (Vòng lặp trải nghiệm cốt lõi)

```text
Khám phá (Explore) 
    ↳ Vào thế giới nghệ sĩ (Enter World) 
        ↳ Theo dõi / Đăng ký (Follow / RSVP) 
            ↳ Tham gia tương tác trực tiếp (Moments Live) 
                ↳ Lưu trữ Moment Capsule 
                    ↳ Không gian cá nhân (My Space) 
                        ↳ Trưng bày phòng 2.5D & Phục hồi kỷ niệm 
                            ↳ Quay lại khoảnh khắc kế tiếp (Return)
```

---

## 🎨 Hệ Thống Nhận Diện & Không Gian Quảng Trường (Brand & Plaza System)

### 1. 🌟 Nhận Diện Thương Hiệu Mới: Chữ V Fandom & Quỹ Đạo Thiên Thể
- **Biểu tượng chữ V hữu cơ:** Chữ **V** bo tròn hiện đại chuyển sắc xanh rêu ô-liu (`#224834` – `#559972`).
- **Quỹ đạo thiên thể (Celestial Orbit Ring):** Vòng elip ngọc bích ôm lấy chữ V kèm hạt hành tinh nhỏ ở góc trên bên phải.
- **Ngôi sao thần tượng phát sáng (`✦`):** Tỏa ánh kim vàng ấm (`#E2A638` – `#FFE082`) và 3 tia sáng hướng lên trong lòng chữ V, thể hiện sự thăng hoa của nghệ thuật và tình cảm fan.
- **Component vector thuần:** `<VieWorldLogo />` sắc nét tuyệt đối ở mọi độ phân giải.

### 2. 🏛️ Quảng Trường VieWorld Plaza — Navigation Hub Trực Quan
- **Kiến trúc 4 Điểm Đến Chính:**
  - **Explore** (Trên-Trái): Khám phá các nghệ sĩ, cộng đồng và thế giới âm nhạc (`/artists`).
  - **Moments** (Dưới-Trái): Sân khấu live, buổi hẹn trực tuyến và tín hiệu mới nhất (`/moments`).
  - **My Space** (Trên-Phải): Góc phòng riêng tư, bộ sưu tập, tủ đồ và lưu bút fan (`/me`).
  - **VieSHOP** (Dưới-Phải): Cửa hàng vật phẩm số, merch chính hãng và thẻ hội viên (`/shop`).
- **Bảng hiệu chìm (Engraved Signboard Typography):** Tên bảng hiệu được khắc chìm tinh tế trực tiếp vào bề mặt gỗ và kim loại của từng tòa nhà (sử dụng kỹ thuật letterpress shadow), không dùng thẻ trắng thô ráp lơ lửng.
- **Chip thông báo nhấp nháy (Pulsing Ambient Badges):** Đặt gọn gàng ngay phía dưới bảng hiệu, bỏ dấu chấm màu rối mắt, có hiệu ứng thở nhẹ nhàng (`vw-noti-pulse`).
- **Tâm điểm la bàn ngôi sao:** Đặt nhân vật Linh Nguyễn ngay trung tâm với lối tắt trở về My Space.
- **Responsive 2x2 trên Mobile:** Tự động chuyển đổi thành cụm thẻ tiện ích dễ dàng chạm bằng một ngón tay.

---

## 🚀 Các Không Gian Cốt Lõi (Core Spaces)

### 1. 🔍 Explore (Khám Phá Nghệ Sĩ & Thế Giới)
- Tìm kiếm tức thì với công cụ phân loại theo thể loại, trạng thái Live và nghệ sĩ đang theo dõi.
- Thẻ nghệ sĩ giàu thông tin: banner visual, số lượng người theo dõi, sự kiện sắp diễn ra.

### 2. 💬 Moments & Live Concert
- **Stage Phát sóng Chân thực (Honest Presence):** Phản ánh chính xác trạng thái online/offline của host. Tuyệt đối không dùng AI đóng giả nghệ sĩ.
- **Phòng Live Chat Đồng Bộ:** Hỗ trợ bình luận, thả phản ứng cảm xúc và ghim tin nhắn.
- **YouTube-Style Live Poll Overlay:** Bình chọn trực tiếp dạng overlay nổi tinh gọn, không chiếm không gian phát sóng.
- **Lưu trữ Moment Capsules:** Đóng gói khoảnh khắc đáng nhớ vào bộ sưu tập cá nhân kèm ghi chú riêng tư.

### 3. 🏠 My Space (Không Gian Riêng Tư Của Fan)
- **Cấu trúc 3 tab WAI-ARIA tinh gọn:**
  1. *Phòng của tôi*: Căn phòng 2.5D có thể chuyển đổi giữa Chế độ xem (View) và Chế độ chỉnh sửa (Edit).
  2. *Bộ sưu tập*: Toàn bộ đồ số, capsule và merch fan đang sở hữu, cho phép trưng/cất tức thì.
  3. *Avatar*: Trình tùy biến phụ kiện và trang phục cho nhân vật chibi.
- **Avatar Account Menu:** Đưa các tiện ích như *Túi đồ*, *Fandom Pass*, *Quyền riêng tư*, *Đơn hàng*, *Trợ giúp* vào popover menu gọn gàng trên thanh điều hướng.
- **Chế độ xem như khách (Visitor Projection):** Cho phép bạn bè ghé thăm, đọc câu chuyện kỷ niệm và dán giấy nhớ lưu bút (`RoomGuestbook`).

### 4. 🛍️ VieSHOP (Đại Siêu Thị Fandom Toàn Diện)
- **Gom cụm theo Product Family:** Mỗi dòng sản phẩm gom gọn các biến thể `Hàng thật · Digital · Duo`.
- **Phòng thử đồ Digital:** Banner thử đồ thu gọn cùng drawer thử trang phục trực quan trên avatar.
- **Lưới sản phẩm 4 cột toàn màn hình:** Tối ưu hóa theo tiêu chuẩn Baymard Institute.

---

## 🛠️ Ngăn Xếp Kỹ Thuật (Tech Stack)

| Lớp (Layer) | Công nghệ sử dụng |
|---|---|
| **Core Framework** | React 19 (`react`, `react-dom`, `react-router-dom` v7) |
| **Language** | TypeScript 5.7 (Strict Mode, Type-safe Contracts) |
| **Bundler & Dev Server** | Vite 6.4 (Tối ưu hóa Rollup code-splitting chunks) |
| **Kiểm thử tự động** | Vitest 3.2 + Testing Library + JSDOM (**35 test suites, 355 tests PASS 100%**) |
| **Giao diện & Đồ họa** | Vanilla CSS Design System, Glassmorphism, Nunito & Be Vietnam Pro Typography |
| **Icons** | Lucide React |

---

## 💻 Cài Đặt & Chạy Cục Bộ (Getting Started)

### Yêu cầu môi trường:
- **Node.js:** `>= 18.x` (khuyến nghị Node 20 LTS hoặc Node 22)
- **npm:** `>= 9.x`

### Các bước cài đặt:

```bash
# 1. Clone repository
git clone https://github.com/Yunero1206/vieworld.git
cd vieworld

# 2. Cài đặt dependencies
npm install

# 3. Khởi chạy dev server
npm run dev
# Mặc định truy cập tại: http://localhost:5173

# 4. Kiểm tra TypeScript & Chạy toàn bộ Test Suite
npx tsc -b
npm run test

# 5. Đóng gói bản Production
npm run build

# 6. Chạy thử bản Build (Preview)
npm run preview
```

---

## 🌐 Triển Khai Lên Render (Deployment on Render)

Dự án đã được cấu hình tối ưu để triển khai trực tiếp lên **[Render](https://render.com/)**:

### Cách 1: Triển Khai dạng "Static Site" (Khuyên dùng - Nhanh & Miễn Phí)
1. Đăng nhập [Render Dashboard](https://dashboard.render.com/) ➔ **New +** ➔ **Static Site**.
2. Kết nối repo: `Yunero1206/vieworld`.
3. Điền thông số:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. **Rewrite Rule (BẮT BUỘC cho SPA routing):**
   - Source: `/*` ➔ Destination: `/index.html` (Type: `Rewrite`)
5. Nhấn **Create Static Site**.

### Cách 2: Triển Khai dạng "Web Service" hoặc Render Blueprint
Trong repo đã có sẵn file [`render.yaml`](./render.yaml) để triển khai tự động chỉ với 1 click.

---

## 📜 Giấy Phép (License)

Dự án phát hành theo giấy phép bản quyền độc quyền [LICENSE](./LICENSE). Bản quyền © 2026 **Phạm Thanh Phú**.
