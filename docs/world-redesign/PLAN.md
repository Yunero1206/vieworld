# VieWorld — Một world có lý do để quay về

Plan thiết kế và triển khai để giao Antigravity · 10/09/2026

## 1. Kết luận và phạm vi

Đề xuất: **VieWorld là khu phố âm nhạc thu nhỏ. Mỗi artist/IP có một nhà nhạc; mỗi fan có một căn phòng để giữ những khoảnh khắc đã tham gia.**

Đây là hướng thiết kế đề xuất, chưa phải quyết định thương hiệu đã được chủ sản phẩm duyệt. “Khu phố” là mô hình để người dùng hiểu sản phẩm, không phải yêu cầu xây bản đồ lớn hoặc MMO.

Sự khác biệt không nằm ở việc đặt ảnh đằng sau menu. Nó nằm ở vòng trải nghiệm: **ghé nhà nhạc → tham gia một khoảnh khắc → nhận kỷ niệm đúng điều kiện → mang về phòng → có lý do quay lại**. Dùng nhanh như một app thông thường, cảm thấy có nơi chốn như một webgame nhẹ.

Chỉ lập kế hoạch trong lần review này. Không sửa source Desktop, không gọi thêm Antigravity, không gen ảnh hàng loạt, không push Git hoặc triển khai production.

## 2. Hiện trạng đã kiểm tra

Nguồn: `C:/Users/VTD/Desktop/Vieworld`, HEAD `45c6ae2`. Có 10 file tracked đang sửa và `public/` cùng các file worker/venv chưa tracked. Đây là thay đổi hiện có của người dùng; không được reset hoặc ghi đè mù.

Đã đọc source, domain, constitution và xem các JPG mới. Đã bundle riêng source Desktop vào thư mục scratch, render `/worlds/artist-a` và `/me` ở 1440px/390px bằng Edge headless. Bốn lượt mở này không ghi nhận JS page error, ảnh lỗi hoặc tràn ngang. **Đây không phải xác nhận build Vite chuẩn, toàn bộ test suite hay mọi luồng đều đạt.**

| Hiện trạng có bằng chứng | Tác động | Hướng sửa |
|---|---|---|
| `WorldScene.tsx` gọi là bản đồ nhưng render `world-places-grid`: 5 thẻ ảnh nối dài | Người dùng thấy danh mục, không thấy một nơi chốn | Một cảnh tổng thể có đồ vật bấm được, kèm đường đi nhanh bằng chữ |
| Cover Artist A là khán phòng trong nhà, có chữ “AURORA ECHOES” và lịch sự kiện in sẵn; `place-stage.jpg` lại là acoustic rừng thông Đà Lạt | Không gian, sự kiện và danh tính không khớp dữ liệu app | Cùng một nhà nhạc; mọi chữ/tên/ngày là UI lấy từ dữ liệu |
| JPG nhân vật đất sét, ảnh venue gần hiện thực, SVG trong `AvatarStage.tsx`, SVG khác trong `WardrobeCustomizer.tsx` | Avatar và thế giới thay đổi quy luật qua từng màn | Một asset manifest và renderer dùng chung, artist/fan khác nhân vật nhưng chung ngôn ngữ hình ảnh |
| `index.css:1848–1855` ẩn cửa sổ, kệ, thảm, fan của MyRoom bằng `display:none!important` | “Phòng tôi” đang là bảng nút, thiếu sở hữu mang tính cá nhân | Khôi phục phòng thực sự với kệ, tủ đồ và lịch |
| `index.css:254` định nghĩa header ngang cao 64px, nhưng `:578` ghi đè thành khối dọc cao gần viewport | Bản render desktop có vùng điều hướng rất cao trước nội dung | Gỡ xung đột cascade trước khi thêm art; một nguồn layout chính |
| Tab world + mini dock + thẻ địa điểm cùng điều hướng; shop có cả `?zone=shop` và `/shop`; chuyển zone dùng `replace:true` | Lặp menu, khó hiểu Back đi đâu | Một đích chuẩn mỗi chức năng, history thể hiện việc đi vào/rời nơi |
| Góc nghe nhạc cũng mở danh sách sessions chung; Bảng kỷ niệm hứa capsules; Hội quán hứa photocard | Tên địa điểm hứa nhiều hơn nội dung thật | Tách phiên nghe, kho replay và kỷ niệm cá nhân; không hứa vật phẩm chưa có |
| Badge stage đang chạy ghi `LIVE` không có DEMO sát cạnh; câu chào hardcode “Linh” | Thiếu nhất quán với dữ liệu và giới hạn prototype | Dùng session/profile thực trong state, DEMO tại từng chỉ báo live |

Các vấn đề trên không có nghĩa phải bỏ domain hiện tại. React + router + reducer/context + storage đang là nền phù hợp để triển khai lớp trải nghiệm này.

## 3. Học gì từ sản phẩm khác — và không học gì

- **Weverse:** học cách gom thông tin quan trọng và dẫn thẳng vào LIVE/listening. Không lấy feed/tab làm cấu trúc toàn bộ VieWorld. Đây là nguyên tắc rút ra từ thông báo cập nhật app 3.16.0, không phải tuyên bố về toàn bộ giao diện web hiện tại. [Nguồn chính thức](https://weverse.io/notice/36944).
- **Habbo:** học việc “room” là một nơi có tên, dễ tìm và dễ quay lại qua Navigator. Không đưa vào lần này nền kinh tế đồ nội thất, phòng công cộng do người dùng vận hành hay multiplayer. [Habbo Navigator](https://help.habbo.com/hc/en-us/articles/360011619999-The-Navigator).
- **Poptropica:** học các điểm đến theo chủ đề, mỗi nơi có việc cụ thể để làm và một nơi xuất phát rõ. Không bắt fan đi bộ, nhảy, giải đố mới xem được sự kiện. [Poptropica trên đơn vị đang lưu trữ game](https://www.coolmathgames.com/0-poptropica).

Các ứng dụng cho VieWorld bên dưới là đề xuất thiết kế từ những nguyên tắc này, không sao chép bố cục, nhân vật, asset hoặc thương hiệu của game.

## 4. World bible: sáu quy tắc không được phá

1. **Một nơi, một công việc chính.** Sân khấu để tham gia; góc nghe để tìm phiên nghe; bảng lưu diễn để xem kho công khai; phòng fan để giữ kỷ niệm riêng.
2. **Một đối tượng, một danh tính xuyên màn.** Avatar, phụ kiện, vé kỷ niệm và bảng tên không đổi thiết kế tùy component.
3. **Một lần bấm phải có kết quả.** Mở nội dung, đổi lựa chọn có phản hồi, hoặc giải thích rõ chưa khả dụng. Không đặt ảnh trông như nút nhưng không làm gì.
4. **Không có mê cung.** Có lối tắt bằng chữ tới mọi hotspot; người dùng không phải hiểu game mới dùng được app.
5. **Art không là nguồn sự thật.** Ngày giờ, số lượng, live, quyền lợi, tên người và việc sở hữu lấy từ state, không nằm trong JPG.
6. **Thế giới sống nhờ hoạt động có nghĩa.** Chuyển động nhẹ phục vụ phản hồi, không đắp fake chat, fake crowd, AI nghệ sĩ hoặc phần thưởng để buộc điểm danh.

### Cấu trúc dễ nhớ

```text
VieWorld
├── Khám phá (/) — hôm nay có gì, tiếp tục việc đang làm
├── World (/worlds) — tìm/chọn nhà nhạc, các world đang theo dõi
│   └── Nhà nhạc (/worlds/:id)
│       ├── Sân khấu → phiên sự kiện
│       ├── Góc nghe → chỉ các phiên listening
│       ├── Bảng lưu diễn → kho nội dung/replay công khai
│       └── Quầy nhỏ → hội viên, VieSHOP (phụ trợ)
└── Phòng tôi (/me)
    ├── Kệ kỷ niệm → capsule cá nhân
    ├── Tủ đồ → diện mạo avatar
    └── Lịch trên tường → các lịch đã hẹn
```

Ba mục điều hướng chính: **Khám phá / World / Phòng tôi**. Hộp thư là nút tiện ích có tên truy cập được. Trợ giúp/tài khoản/review không cạnh tranh với ba mục chính. Giữ đường dẫn cũ và quyền truy cập Studio/operator; chuyển công cụ review vào khu phù hợp, không xóa để làm đẹp.

Khám phá không lặp nguyên directory: ưu tiên một khoảnh khắc gần nhất, tiếp tục gần đây và world đang theo dõi. Calendar có lối vào ở Khám phá và phòng; chưa cần thêm một route lớn chỉ để đổi nav.

### Artist A và Neon Sessions

- Artist A: nhà nhạc ấm, gỗ sáng, rèm lavender, sân khấu nhỏ; phong cách của một artist giả lập, không tự gán cho nghệ sĩ thật hoặc địa điểm thật.
- Neon Sessions: nhà nhạc của chương trình, graphite/indigo, ánh cyan và rose, biển hình học. Cùng góc máy, tỉ lệ và quy tắc tương tác; không dùng lại ảnh sân khấu Đà Lạt.
- Liên kết giữa hai world là cửa sang một địa điểm có tên và chủ thể rõ; không gộp hai danh tính hoặc khiến fan hiểu IP là một người.
- Phòng fan dùng cùng vật liệu và scale, ánh sáng sáng hơn, màu nhấn do đồ lưu niệm mang vào. Mỗi capsule cho thấy nó đến từ world nào.

## 5. Các màn và tương tác phải hoạt động thế nào

### Nhà nhạc

Một cảnh diorama nhìn thấy toàn bộ, tối đa ba điểm chính được nhấn. Hội viên/shop là hai đồ vật phụ, không thêm hai thẻ hero. Thanh tên world nhỏ, Follow rõ nghĩa; CTA sự kiện hiện tại không bị giấu dưới cảnh dài.

| Đồ vật / nút | Hành động thật | Trạng thái và phản hồi |
|---|---|---|
| Cửa sân khấu | Vào session phù hợp | Đang diễn → “Vào sân khấu · DEMO”; sắp diễn → chi tiết/RSVP; không có → lịch trống, không giả live |
| Bảng lịch ở cửa | Mở danh sách phiên của world | Lọc theo dữ liệu; xử lý cả scheduled/open/running theo domain, không chỉ scheduled/running |
| Máy đĩa | Mở phiên format `listening` | Không có phiên → empty state; không tự phát nhạc không có bản quyền |
| Bảng lưu diễn | Mở archive/replay | Khóa/chưa có/quyền xem được nói rõ; không gọi kho công khai là kệ capsule cá nhân |
| Thẻ hội viên trên quầy | Mở nội dung membership | Follow không đồng nghĩa là hội viên; không hứa photocard chưa triển khai |
| Túi mua sắm | Đi tới `/worlds/:id/shop` | Một route shop chuẩn; URL cũ được xử lý tương thích |
| Biển sang world liên kết | Sang đúng world có tên | Có đường về; không tự follow hoặc đăng ký hộ |

Quy hoạch URL đề xuất: giữ `/worlds/:id`, dùng `?zone=sessions`, `?zone=listening`, `?zone=archive`, `?zone=membership`; shop dùng route hiện có. Một `WorldPlacePanel` giải quyết nội dung từng zone. Không giữ đồng thời tab bar năm mục và mini dock năm mục. “Về nhà nhạc” luôn rõ; Back/Forward, reload và link trực tiếp phải được test.

### Phiên sự kiện

Giữ cấu trúc tham gia và quyền hiện có. Cảnh sân khấu là góc nhìn gần của chính nhà nhạc vừa vào, không một ảnh ngẫu nhiên khác.

- Live status, ai đang dẫn, artist có mặt hay vắng, live/recorded và DEMO phải luôn rõ.
- Lightstick của fan: bấm tạo phản hồi sáng cục bộ ngắn; không tăng số người, không tự tạo attendance/capsule.
- Poll/chat sử dụng cơ chế demo sẵn có; không thêm trò chơi nhịp điệu vào MVP này.
- Avatar vẫy/chào chỉ khi có trạng thái hợp lệ. Một animation đẹp không chứng minh nghệ sĩ đang hiện diện.
- Artist vắng: sân khấu/standee tĩnh với chú thích; team dẫn thì ghi team. Asset chưa duyệt vẫn fallback theo quyền hiện có.
- Kết thúc: dùng kết quả domain để hiển thị capsule đủ điều kiện và CTA “Mang về phòng”. Không dùng việc bấm nút làm điều kiện thay thế participation.

### Phòng tôi — điểm khác biệt cần làm trước

- Một phòng nhìn rõ avatar fan, kệ ba ô, tủ đồ, lịch trên tường. Lịch hẹn mở nội dung thực, không nút nhảy sang nhóm follows không liên quan.
- Kệ: chọn một capsule đã lưu → chọn ô 1/2/3 → món kỷ niệm xuất hiện → mở lại xem chi tiết. MVP dùng click/tap, chưa drag-and-drop.
- Có thay thế, bỏ khỏi ô và trạng thái ô trống. Bỏ khỏi kệ **không xóa capsule**. Kỷ niệm nhiều hơn ba vẫn nằm trong bộ sưu tập.
- Tủ đồ: chọn → xem thử → Lưu; sau lưu, header/phòng/phiên dùng đúng accessory đó. Không hiện tên phụ kiện mới trên một JPG không đổi hình.
- Avatar fan: chạm để chào hoặc mở tủ đồ; cùng nhân vật ở mọi màn, không đổi từ người sang mèo tùy trang.
- Quyền lợi, đơn hàng, trợ giúp vào menu “Tài khoản & quyền lợi”, không làm thành ba đồ vật chủ đạo. Vẫn giữ trạng thái đơn và đường phục hồi.
- Phòng là riêng tư trong prototype; chưa có ghé phòng bạn, public posting hoặc multiplayer.

## 6. Art direction và gói gen ảnh

### Style khóa cho bản đầu

**2.5D miniature diorama, chất liệu đất sét mờ, khối đơn giản, góc nhìn 3/4 hơi từ trên xuống, ánh sáng mềm từ trên trái.** Trẻ trung nhưng không nursery/baby, thân thiện nhưng không biến mỗi object thành thú bông. Nhân vật fan và artist là hai thiết kế người stylized riêng; mascot động vật hiện tại không tiếp tục đóng vai cùng một fan.

Đề xuất token: nền UI `#F6F4EF`, ink `#242333`, màu nhấn `#7261D4`; Artist A wood/cream/lavender; Neon graphite/cyan/rose. Đây là điểm xuất phát phải kiểm tra tương phản, không kết luận bảng màu đã đạt accessibility.

Ảnh không chứa text, logo, nút, UI, watermark, ngày, giá, badge live hoặc crowd giả. Mọi nhãn vẽ bằng HTML. Artwork cảnh không dùng ảnh người thật/nghệ sĩ thật. Không yêu cầu công cụ bắt chước chính xác Habbo/Poptropica/Weverse.

### Gen ít nhưng đủ để lập hệ thống

| Nhóm | Giao phẩm MVP | Cách dùng |
|---|---|---|
| Reference | 1 style board: vật liệu, góc máy, kích thước tương đối; 2 character sheets artist/fan | Duyệt trước, dùng làm reference cho mọi lệnh sau |
| Scene nền | 3 nền: Artist A, phòng fan, Neon Sessions | Nền không có đối tượng sẽ cần đổi trạng thái; cùng camera, không gen riêng mỗi card |
| Đồ vật | Stage entrance, máy đĩa, bảng lưu diễn, quầy; kệ, tủ, lịch | PNG/WebP alpha thực, cùng scale; biển chữ là code |
| Avatar | 2 base nhân vật; lớp phụ kiện khớp hệ preset hiện có | Crop header từ asset chuẩn; không gen avatar header độc lập |
| Kỷ niệm | 1 mẫu vé, 1 mẫu khung ảnh | Dữ liệu sự kiện và nguồn world là UI, chưa cần nhiều món collectible |

Đây là danh sách **asset**, không phải cam kết số request hoặc số ảnh sẽ được công cụ tạo trong một lượt. Chỉ bắt đầu với Artist A và phòng fan; Neon thực hiện sau khi vòng chính qua nghiệm thu.

Kích thước mục tiêu: nền desktop 1600×1000; object 512–1024px tùy kích thước hiển thị; avatar base 768px. Mobile ưu tiên tái bố cục các layer cùng bộ asset trong khung khoảng 4:5, không crop mù một JPEG ngang. Nếu cần một nền mobile riêng, giữ đúng cùng căn phòng và vật liệu bằng reference đã duyệt.

PNG alpha phải kiểm tra bằng nền sáng/tối, không chấp nhận nền caro được vẽ vào ảnh. Ảnh gen không mặc nhiên là rig hoạt hình: MVP dùng transform/overlay nhẹ; chỉ thêm pose vẫy tay khi chứng minh cùng tỉ lệ, anchor và nhân vật. Không gen sprite sheet dài ngay từ đầu.

### Prompt template cho scene

```text
Create an original production background asset for VieWorld, a fictional music
neighbourhood. Use the approved attached style board as the visual reference.
Scene: [Artist A intimate music house / fan's personal room / Neon Sessions venue].
Soft matte-clay 2.5D miniature diorama, consistent elevated three-quarter camera,
soft upper-left lighting, simple readable silhouettes, youthful not infantile.
Palette and landmarks: [from the approved world bible].
Reserve clear spaces for separately composited [object list and positions].
No people, text, letters, logos, dates, UI, buttons, watermark, or baked live status.
Output only the background artwork. Do not invent another location or art style.
```

### Prompt template cho avatar/object

```text
Using the approved character sheet/style board, create [exact asset ID].
Preserve character identity, proportions, palette, camera and upper-left lighting.
[Exact pose/object shape]. Isolated transparent background, full object visible,
comfortable clear margins, no pedestal unless specified, no text or UI.
For accessory layers: match the approved base's canvas, scale and anchor exactly.
Do not reinterpret the character or generate multiple unrelated variants.
```

Mỗi asset cần manifest ghi `id`, `worldId/characterId`, role, source file, kích thước, anchor, reference, prompt, trạng thái duyệt, alt hoặc decorative, quyền sử dụng. Không tự đánh dấu approved chỉ vì gen thành công. Không có khả năng gen trong phiên đang dùng → báo rõ, giữ placeholder có tên, không tải ảnh ngẫu nhiên thay thế.

## 7. Code plan: thêm lớp trải nghiệm, không viết lại engine

Giữ React/TypeScript/router/context/reducer/storage. Không thêm Three.js, Unity, Phaser, backend, auth hay multiplayer cho lần này.

Các file mới bên dưới là đề xuất, cần đối chiếu cấu trúc thật trước khi tạo:

- `src/world/worldManifest.ts`: world identity, palette, background, place IDs, asset refs. Không suy diễn mọi identity từ `world.type`.
- `src/world/assetManifest.ts`: registry asset đã duyệt và fallback. Nối với kiểm soát approved/rights của avatar hiện có, không tạo đường bypass.
- `src/components/SceneCanvas.tsx`: bố cục layer theo tọa độ chuẩn hóa; cấu hình riêng desktop/mobile.
- `src/components/SceneHotspot.tsx`: Link/button thật, label, focus, tooltip, disabled reason. Background decorative không gánh click toàn ảnh.
- `src/components/AvatarRenderer.tsx`: cơ chế render thống nhất, character khác nhau, phụ kiện/state từ một nguồn; dùng lại trong AvatarStage, wardrobe, room và profile.
- `src/components/WorldPlacePanel.tsx`: nội dung zone dùng component nghiệp vụ hiện có.
- `src/styles/tokens.css`, `shell.css`, `scene.css`: tách CSS có chủ đích sau audit; bỏ rule xung đột thay vì nối thêm override.

File trọng tâm cần sửa: `AppShell.tsx`, `WorldScene.tsx`, `MyRoomScene.tsx`, `AvatarStage.tsx`, `WardrobeCustomizer.tsx`, `WorldHeader.tsx`, `WorldCard.tsx`, `NextMomentCard.tsx`, `DiscoverView.tsx`, `WorldDetailView.tsx`, `MyWorldView.tsx`, `SessionView.tsx`, `ShopView.tsx`, `index.css`.

Phần state mới tối thiểu: ba room slots tham chiếu capsule ID, scoped theo fan và tenant. Action đặt/bỏ/thay thế kiểm tra capsule tồn tại và thuộc fan hiện tại; chỉ trưng bày capsule đã lưu. Nếu một capsule không còn hợp lệ, ô trở về trống, không crash. Một capsule ở tối đa một ô để hành vi rõ ràng.

Không sao chép capsule hoặc đánh dấu quyền sở hữu trong component. Nếu cần thay schema, thêm migration tương thích và test: reload không mất tủ đồ/capsules/RSVP/orders, dữ liệu cũ vẫn đọc được, tenant A không nhìn thấy phòng tenant B. Trước khi triển khai phải kiểm tra cơ chế versioning hiện tại, không tự tăng version rồi reset storage.

## 8. Thứ tự giao việc cho Antigravity

### Gói 0 — Chốt baseline và bản đồ thay đổi

Chỉ đọc constitution, docs liên quan và file mục tiêu. Báo branch/HEAD/dirty files; ghi rõ tests nào chạy được. Không chạy lại toàn repo nhiều lần. Đề nghị snapshot/commit riêng thay đổi người dùng trước các đợt lớn; không `git add .` vì có venv/worker. Tạo `docs/world-redesign-status.md` để lưu tiến độ gọn. Chưa gen ảnh.

Đạt khi: biết chính xác cái gì phải giữ, danh sách file sẽ sửa, failure baseline phân biệt với lỗi mới.

### Gói 1 — Sửa layout và dựng vòng thô

Sửa xung đột shell/CSS, ba nav chính, WorldPlacePanel, scene graybox Artist A và phòng fan. Hotspot bằng hình khối placeholder có nhãn, stage thực sự mở session. Gỡ menu trùng, chuẩn hóa route và Back. Chưa thay domain, chưa gen ảnh.

Đạt khi: 390px và 1440px vào được world/phiên/phòng, không vùng header cao gần một màn, không cần cuộn qua năm thẻ hero, không nút chết.

### Gói 2 — Khóa hình ảnh bằng mẫu nhỏ

Gen style board + hai character reference; sau đó một scene Artist A mẫu. Duyệt một contact sheet trước khi gen các asset còn lại. Không tự gen thêm nhiều phong cách để “thử vận may”.

Đạt khi: chủ sản phẩm nhận ra đây là cùng một thế giới và chấp nhận hướng thẩm mỹ. **Đây là checkpoint cần duyệt hình ảnh; dừng tại đây nếu chưa được duyệt.**

### Gói 3 — Tích hợp Artist A và avatar

Thay placeholder bằng layer có manifest; dùng một renderer avatar trên các bề mặt; phụ kiện khớp. Thêm hover/focus/press, micro-animation, reduced motion; trạng thái session và quyền asset đúng. Không nhân rộng sang Neon trước khi ổn.

Đạt khi: nhấp đúng đồ vật mở đúng nội dung; image fail vẫn dùng được; avatar trong header/phòng/tủ đồ giữ nguyên danh tính và phụ kiện đã lưu.

### Gói 4 — Hoàn chỉnh “mang kỷ niệm về phòng”

Thêm kệ ba ô và state/migration tối thiểu; luồng đủ điều kiện nhận/lưu capsule → trưng bày → reload còn nguyên. Bỏ khỏi kệ không xóa dữ liệu. Làm lịch, tủ đồ và menu quyền lợi nhất quán.

Đạt khi: người mới đi trọn vòng mà không cần người hướng dẫn; replay không cấp live-attendance capsule; đổi tenant không rò phòng/đồ.

### Gói 5 — Neon, rà toàn app và bàn giao

Dùng config/asset cùng hệ thống để ra Neon, không fork logic. Đồng bộ Discover, directory, shop, inbox và màn recovery. Test browser/device, unit/regression, build chuẩn. Báo diff + ảnh + lệnh/exit code + lỗi còn lại. Chỉ commit/push nếu được người dùng yêu cầu hoặc đã cho phép rõ.

Đạt khi: hai world khác bản sắc nhưng cùng cách dùng; bề mặt phụ không quay lại hệ giao diện cũ.

## 9. Nghiệm thu — không chỉ “trông đẹp”

- Từ Khám phá vào world tối đa 1 lần bấm; từ world vào phiên nổi bật tối đa 1 lần bấm khi phiên cho phép. Luôn có lối tắt không gian bằng chữ.
- Viewport 360×800, 390×844, 768×1024, 1440×900: không tràn ngang, nav không che CTA, safe area hợp lý. Kiểm tra header thật bằng screenshot chứ không chỉ lint.
- Hotspot có tên rõ, vùng chạm mục tiêu ít nhất 44×44 CSS px; Tab/Enter/Space đúng ngữ nghĩa; drawer Escape/close/focus-return hoạt động; không hover-only.
- Nhãn/số liệu là text có thể đọc bằng trợ năng; status không chỉ phân biệt bằng màu; kiểm tra tương phản. Với reduced motion, bỏ chuyển động không cần thiết.
- Back/Forward, reload deep-link, zone không hợp lệ, world/session thiếu, không có sự kiện, replay bị khóa, ảnh hỏng đều có đường đi hợp lý.
- Avatar: accessory preview trước Lưu và state sau Lưu phân biệt; mọi nơi cập nhật cùng nguồn; asset unapproved/retired không được render như approved.
- Capsule: không nhận sai điều kiện, không nhân đôi qua thao tác bấm lại, trưng bày đúng fan, bỏ kệ không xóa capsule; persistence/migration/tenant isolation qua test.
- Follow ≠ membership ≠ benefit ≠ inventory; paid ≠ fulfilled; replay ≠ live attendance. Không giấu lỗi quyền/đơn dưới animation.
- DEMO luôn rõ; riêng mọi badge live có DEMO gần kề. Không fake nghệ sĩ, audience, doanh thu hoặc số người tham gia.
- Mục tiêu tài nguyên đề xuất: scene đang mở gồm ảnh nén tổng không quá khoảng 1.5 MB; lazy-load world khác, không video nền; đo rồi ghi kết quả, không tự tuyên bố đạt hiệu năng.
- Chạy test/build theo scripts của repo; ghi số test và exit code thực tế. Không lấy con số test ở báo cáo cũ làm bằng chứng lần này.

### Bài demo 90 giây

Mở Khám phá → vào Artist A → hiểu ngay có gì đang diễn → vào session demo → thử lightstick/poll → qua kịch bản participation hợp lệ → lưu capsule → mang về kệ phòng → đổi phụ kiện → reload → cả món kỷ niệm lẫn diện mạo còn nguyên. Kịch bản review dùng điều khiển demo được phép; không thay luật domain để ép demo thành công.

## 10. Kiểm soát request và phạm vi

- Mỗi prompt chỉ chạy **một gói**. Kết thúc bằng file sửa, việc đạt/chưa đạt, lệnh đã chạy và bước kế tiếp. Không “inspect toàn bộ” lại ở mọi gói.
- Đọc status file ngắn ở đầu gói; đọc source theo câu hỏi cụ thể. Không nạp `node_modules`, `.agy-venv`, cache, binary, log lớn hoặc secret.
- Đề nghị tối đa hai lần thử có chủ đích cho một lỗi; hết thì báo nguyên nhân và lựa chọn. Với quota/429/auth hoặc model không tồn tại: dừng ngay, không tự đổi model hay retry loop.
- Cần phân biệt “một prompt giao việc” với request nội bộ công cụ. Không hứa rằng sáu gói chỉ tốn sáu requests. Đặt budget trong Antigravity nếu có hỗ trợ và kiểm tra usage giữa các gói.
- Không tự cài dependency mới, chạy agent nền, đụng worker/venv, push/deploy hoặc mua dịch vụ để đạt hình thức nghiệm thu.
- Chưa làm: public social feed, multiplayer, phòng bạn bè, avatar tự đi, game engine 3D, tiền ảo/gacha, minigame độc lập, production streaming/payments/auth, chatbot giả nghệ sĩ.

## 11. Hồ sơ giao lại sau mỗi gói

`docs/world-redesign-status.md` ghi: gói hiện tại, quyết định đã duyệt, file sửa, test/exit code, lỗi còn lại, asset đã duyệt, gói kế tiếp. Kèm screenshot desktop/mobile và asset manifest. Các quyết định thay đổi art direction/logic nghiệp vụ phải được chủ sản phẩm xác nhận, không tự sửa world bible giữa chừng.

**Ưu tiên cuối cùng:** một Artist World và một phòng fan có thể dùng trọn vẹn đáng giá hơn mười địa điểm đẹp nhưng không liên quan nhau.
