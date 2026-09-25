# VieWorld — một thế giới, cùng nhau

<div align="center">

![Build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)
![Tests](https://img.shields.io/badge/tests-427%20passed%20%7C%2046%20files-success?style=flat-square)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square)
![Universe](https://img.shields.io/badge/Universe-Expanded%20v2-8a2be2?style=flat-square)
![License](https://img.shields.io/badge/license-proprietary-red?style=flat-square)

**Một fan world ấm cúng, nơi fan khám phá nghệ sĩ, gặp nhau trong những khoảnh khắc chung, giữ lại kỷ niệm và kết nối trong một vũ trụ fandom thống nhất.**

</div>

![Quảng trường VieWorld](./static/images/world-v8/plaza.webp)

---

## 🌟 VieWorld là gì?

VieWorld là nguyên mẫu sản phẩm fandom do **Phạm Thanh Phú** thiết kế và phát triển. Sản phẩm không đặt platform hay cửa hàng thương mại ở trung tâm; nhân vật chính của toàn bộ trải nghiệm là mối quan hệ gắn kết và chân thành giữa **Fan, Nghệ sĩ và Cộng đồng**.

Thay vì một dashboard kỹ thuật số chứa các tab tính năng rời rạc, VieWorld tổ chức trải nghiệm như một thế giới sống động có thể ghé thăm:
- **Quảng trường (Plaza)** đóng vai trò là giao lộ trung tâm và điểm xuất phát chung.
- **Từng không gian chuyên biệt** đảm nhiệm một vai trò rõ ràng, liền mạch và tự nhiên trong hành trình của fan.

```text
Quảng trường (Plaza)
  ├── Explore: Khám phá nghệ sĩ, world và khoảnh khắc cộng đồng
  ├── Artist World & Moments: Ngôi nhà của nghệ sĩ, theo dõi sự kiện live, archive và thảo luận tại Hall
  ├── My Space: Định hình danh tính avatar cá nhân, lưu giữ kỷ niệm và quản lý bộ sưu tập
  ├── VieSHOP: Thử đồ trực quan (Try-on), chọn phiên bản thực/số (Physical, Digital, Duo)
  └── Quay trở về với thế giới chung cho những khoảnh khắc tiếp theo
```

---

## 🏛️ Các không gian trải nghiệm chính

| Không gian | Đường dẫn | Vai trò trong hành trình | Tính năng cốt lõi cho Fan |
|---|---|---|---|
| **Quảng trường** | `/` | Giao lộ kết nối toàn bộ vũ trụ | Chiêm ngưỡng diorama 2.5D, chọn điểm đến, truy cập nhanh hồ sơ cá nhân qua Avatar trung tâm. |
| **Explore** | `/explore` | Khám phá nghệ sĩ & cộng đồng | Duyệt các hàng khoảnh khắc nổi bật (featured & compact rows), tìm kiếm thông minh, lọc nghệ sĩ theo trạng thái. |
| **Artist World** | `/artist/:artistId` | Không gian chuyên biệt của từng nghệ sĩ | Truy cập trang chủ nghệ sĩ, dòng thời gian sự kiện, phòng thảo luận Hall và biên niên sử Archive. |
| **Moments & Live** | `/moments`, `/sessions/:id` | Đồng hành cùng sự kiện trực tiếp | Tham gia phòng phát sóng trực tiếp, phòng chờ (lobby), tương tác lightstick ảo, gửi lời cổ vũ và hỏi đáp. |
| **My Space** | `/me` | Không gian và danh tính của riêng fan | Tùy biến avatar fan chibi, trang trí kệ đồ 2.5D, quản lý Fandom Pass, gắn thẻ kỷ vật và xem sổ lưu bút (Guestbook). |
| **VieSHOP** | `/shop` | Mua sắm có ngữ cảnh trong fan journey | Xem theo family sản phẩm, phân biệt Physical – Digital – Bundle/Duo, thử đồ trực quan và kiểm tra đơn hàng mô phỏng. |

---

## 🪐 Vũ trụ Fandom mở rộng (Expanded Universe)

VieWorld sở hữu một bộ dữ liệu thử nghiệm phong phú và chặt chẽ, được thiết kế theo đúng quy chuẩn kiến trúc thực tế:

### 1. 7 Artist Worlds với 7 vai trò riêng biệt
- **Artist A (`artist-a`)**: Thế giới Live-first flagship, lịch trình diễn và sự kiện tương tác cao.
- **MIRA (`artist-mira`)**: Thế giới thiên về cốt truyện (Lore/Archive-heavy), thần thoại ánh trăng và cộng đồng Moonies.
- **KAI (`artist-kai`)**: Thế giới Cyberpunk tràn đầy năng lượng đường phố, cộng đồng Pulse Crew sôi nổi.
- **Artist D (`artist-d`)**: Kho lưu trữ chiều sâu với 3 năm lịch sử hoạt động liên tục (2024, 2025, 2026).
- **Artist E (`artist-e`)**: Nghệ sĩ mới ra mắt (Debut artist) với trạng thái sơ khởi và các khung dữ liệu ban đầu.
- **Artist F (`artist-f`)**: Thế giới đa dạng sản phẩm (Commerce-heavy) với đủ loại phân loại hàng hóa.
- **Artist G (`artist-g`)**: Nghệ sĩ tĩnh lặng (Quiet artist) với ít sự kiện hoạt động, kiểm tra tính ổn định của layout.

### 2. Hệ sinh thái 30 Fan & Personas
- **8 Key Fan Personas**: Được thiết kế để kiểm thử mọi ngóc ngách trải nghiệm (Hardcore Collector, Lurker Streamer, Debut Visitor, Multistan Socialite, International Fan, Audio Purist, Event Hunter, Casual Browser).
- **22 Crowd Fans**: Đảm bảo mật độ sinh động cho các phòng Hall, danh sách tương tác và không gian cộng đồng.

### 3. Dòng thời gian & Tính riêng tư nghiêm ngặt
- **18 World Contexts / Sessions**: Bao phủ đầy đủ các pha thời gian: `running`, `scheduled`, `ended`, `cleared`.
- **8–10 Phòng Hall**: Quy định ranh giới riêng tư chặt chẽ. Thảo luận nội bộ của hội viên không bao giờ rò rỉ ra ngoài Explore trừ khi có sự đồng ý (`explorePreviewConsent: true`) và kiểm duyệt (`explorePreviewStatus: 'approved'`).
- **23 Public Fan Voices**: Tiếng nói cộng đồng được chọn lọc từ Hall clips, Guestbook notes và Q&A replies.
- **42 Sản phẩm với Single Entity Model**: Đầy đủ danh mục Merch, Album, Ticket, Membership với các thuộc tính xem trước minh bạch (`avatar: boolean`, `room: boolean`).
- **15 Ghi chú Guestbook**: Từng fan để lại sticker, màu sắc và lời chúc tại các tọa độ riêng trong phòng.

---

## 🧭 Hành trình Fan hoàn chỉnh (Fan Journeys)

1. **Khám phá tự nhiên**: Tìm kiếm nghệ sĩ có hỗ trợ tiếng Việt không dấu, xem các mẩu chuyện nổi bật tại Explore và bước vào thế giới riêng của nghệ sĩ.
2. **Hẹn gặp & Đồng hành**: Nhận thông báo sự kiện, RSVP lịch diễn, tương tác qua phòng phát sóng thời gian thực và tham gia vào không gian Hall dành cho hội viên.
3. **Giữ gìn kỷ niệm**: Tùy chỉnh diện mạo avatar fan với các trang phục số sở hữu, đặt vật phẩm lên kệ phòng cá nhân 2.5D, và viết lưu bút cho bạn bè.
4. **Mua sắm minh bạch**: Thử đồ số (Digital Try-on) trước khi mua, hiểu rõ từng gói sản phẩm ngoài đời thực hay trang phục cho avatar mà không bị nhập nhằng.
5. **Kịch bản kiểm thử linh hoạt**: Dễ dàng chuyển đổi giữa các persona qua công cụ `ScenarioManager` tích hợp sẵn.

---

## 🛠️ Kiến trúc kỹ thuật & Công nghệ

| Tầng kiến trúc | Công nghệ & Thư viện | Trách nhiệm |
|---|---|---|
| **Core UI** | React 19, React Router 7, Lucide React | Xây dựng giao diện hướng thành phần, rendering hiệu năng cao. |
| **Ngôn ngữ** | TypeScript 5.7 (Chế độ nghiêm ngặt) | Đảm bảo an toàn kiểu dữ liệu 100% trên toàn bộ codebase. |
| **Styling** | Vanilla CSS, Design Tokens | Không phụ thuộc TailwindCSS, sử dụng hệ thống token nhất quán và font self-hosted (Be Vietnam Pro, Nunito). |
| **Quản lý trạng thái** | Reducer Domain State, Pure Invariants | Quản lý logic bằng reducer thuần khiết, tính bất biến reference nghiêm ngặt. |
| **Tài nguyên tĩnh** | Vite 6, thư mục `static/` | Tối ưu hóa bundle, chia tách vendor chunks và hỗ trợ tải trang tức thì. |
| **Kiểm thử tự động** | Vitest 3, Testing Library, JSDOM | Bộ kiểm thử toàn diện với 46 test suite kiểm tra hợp đồng và hành trình người dùng. |

---

## 📁 Cấu trúc thư mục

```text
├── src/
│   ├── assets/              # Tài nguyên nội bộ dự án
│   ├── components/          # Các component UI tái sử dụng (Shell, Avatar, Stage, Notifications,...)
│   ├── context/             # AppContext & Provider hỗ trợ hydration và scenario state
│   ├── data/                # Canonical fixtures, Expanded Universe & Scenario Manager
│   ├── domain/              # Types, Reducers, và cấu hình Tenant (VieWorld, MFan, FanMe)
│   ├── hooks/               # Custom React hooks (Accessibility, Dialogs,...)
│   ├── services/            # Storage adapters (LocalStorage, Memory fallback)
│   ├── styles/              # Design tokens và hệ thống style theo từng không gian
│   ├── tests/               # 46 test files kiểm thử tự động toàn diện
│   ├── utils/               # Tiện ích tìm kiếm tiếng Việt và xử lý dữ liệu
│   ├── views/               # Các trang view cấp route chính (Plaza, Explore, ArtistWorld, Shop,...)
│   └── world/               # Business logic về cộng đồng, thương mại, sự kiện và quyền riêng tư
├── static/                  # Thư mục tài nguyên public phục vụ Vite (Images, Fonts, Media)
├── index.html               # Điểm vào ứng dụng SPA
├── vite.config.ts           # Cấu hình Vite dev server và production build
└── package.json             # Danh sách dependencies và các kịch bản chạy lệnh
```

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### Yêu cầu môi trường
- **Node.js**: Phiên bản 20 trở lên
- **npm**: Phiên bản 9 trở lên

### Các bước cài đặt

```bash
# 1. Clone kho lưu trữ
git clone https://github.com/Yunero1206/vieworld.git
cd vieworld

# 2. Cài đặt dependencies
npm ci

# 3. Khởi chạy dev server
npm run dev
```

Mở trình duyệt tại: `http://localhost:5173`

---

## 🧪 Kiểm thử và Đóng gói sản phẩm

```bash
# Kiểm tra an toàn kiểu dữ liệu (TypeScript)
npm run typecheck

# Chạy toàn bộ 46 test suite (427 tests)
npm test

# Đóng gói bản phát hành sản xuất
npm run build

# Chạy thử bản build sản xuất
npm run preview
```

### Kết quả kiểm định chất lượng:
- **TypeScript Typecheck**: Pass 100% (Không lỗi `TS6133`, `TS18048`, `TS2322`).
- **Automated Tests**: **427/427 passed (46/46 test files)**.
- **Production Build**: Hoàn thành sạch sẽ trong ~5.3s, tối ưu hóa CSS và JS chunks.

---

## 👤 Tác giả & Bản quyền

> **Tác giả / Product Designer & Developer:** Phạm Thanh Phú  
> **Copyright © 2026 Phạm Thanh Phú. All rights reserved.**

VieWorld là phần mềm thuộc quyền sở hữu trí tuệ của tác giả. Toàn bộ thiết kế ý tưởng, mã nguồn, kiến trúc hệ thống và tài nguyên đồ họa được bảo lưu bản quyền. Vui lòng không sao chép, tái phân phối hoặc thương mại hóa khi chưa có sự chấp thuận bằng văn bản từ tác giả.
