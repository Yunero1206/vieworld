# VieWorld — Bộ job nhỏ cho Antigravity

Project: `C:\Users\VTD\Desktop\Vieworld`

Dùng tài liệu này thay lịch chạy gói cũ trong `ANTIGRAVITY_START_HERE.md`. `VIEWORLD_WORLD_PLAN.md` vẫn là tài liệu thiết kế tham khảo. Không dùng Python worker cho quy trình này.

## Cách gửi

1. Mở đúng folder Vieworld trong Antigravity. Đính kèm hai file `ANTIGRAVITY_JOBS.md` và `VIEWORLD_WORLD_PLAN.md`.
2. Gửi prompt Khởi động bên dưới. Nó cho phép làm Job 01, không chỉ đọc rồi báo cáo.
3. Sau mỗi job, dùng prompt “Tiếp tục” và số job tiếp theo. Mỗi job có phạm vi và điểm dừng riêng.
4. Nếu đổi chat hoặc context bị rút gọn, dùng prompt “Khôi phục”. Không cần gửi lại lịch sử hội thoại.
5. Job 05 cần duyệt mẫu hình ảnh; chỉ chạy job tích hợp art sau khi duyệt. Có thể làm Job 06/07 bằng placeholder trong lúc chờ.

Một job là một yêu cầu giao việc, **không đồng nghĩa một request model**: đọc file, sửa và kiểm thử có thể cần nhiều lần gọi model. Không ép dùng hết token để tạo thêm chữ. Mục tiêu là một phần việc hoàn chỉnh có kiểm chứng.

## Prompt Khởi động — dán một lần

```text
Làm việc trong C:\Users\VTD\Desktop\Vieworld.
Tôi cho phép sửa code để triển khai redesign VieWorld theo hai tài liệu đính kèm.
Dùng ANTIGRAVITY_JOBS.md làm lịch công việc mới; VIEWORLD_WORLD_PLAN.md là design brief.
Câu “chỉ lập kế hoạch” trong brief là phạm vi của lần review trước, không ngăn
triển khai trong yêu cầu mới này. Không dùng lịch packet cũ để chạy trùng việc.

Đọc instruction repository và docs/CONSTITUTION.md trước. Giữ nguyên các luật
DEMO, presence, avatar approval, participation, replay, membership, order và tenant.
Kiểm tra Git hiện tại: không giả định HEAD/dirty files trong báo cáo cũ vẫn đúng.
Giữ mọi thay đổi người dùng; không reset/clean, git add ., commit, push hay deploy.
Không sửa worker, venv, secrets hoặc project khác. Không cài package mới nếu chưa
được tôi đồng ý. Không gọi agent khác hay khởi chạy AI/worker nền.

Trong job đầu, lưu bản sao nguyên văn hai tài liệu đính kèm vào
docs/world-redesign/PLAN.md và docs/world-redesign/JOBS.md.
Nếu không truy cập được attachment, báo rõ; không tự dựng lại từ trí nhớ.
Tạo docs/world-redesign/STATE.md theo template của bộ job.
Nếu các file đã tồn tại, đọc và cập nhật có kiểm soát, không ghi đè tiến độ.

Chỉ chạy Job 01. Thực hiện code, kiểm tra liên quan, cập nhật STATE rồi dừng.
Không dành nguyên lượt để viết lại plan hoặc báo cáo kiến trúc.
Gom các lần đọc liên quan; loại node_modules, .agy-venv, .agy-run, cache, log lớn,
binary và secrets khỏi tìm kiếm. Không nạp toàn repo vào context.
Khi gặp 503/high demand, 429 hoặc auth error: không tự retry liên tục hay đổi model.
Với lỗi kỹ thuật thông thường, tối đa hai lần sửa có lý do rồi ghi blocker.
Không xóa test hoặc hạ tiêu chí để báo pass.

Trước khi hết context hoặc kết thúc lượt, cập nhật STATE bằng dữ liệu thực.
Chỉ DONE khi đạt tiêu chí; nếu chưa đủ thì IN_PROGRESS hoặc BLOCKED có bằng chứng.
Trả lời ngắn: job, file đã sửa, kiểm tra và exit code, việc chưa xong, job kế tiếp.
```

## Hợp đồng context — áp dụng cho mọi job

Không dựa vào việc công cụ “tự nhớ”. Nguồn bàn giao là file trong repository.

- Đầu lượt: đọc `STATE.md`, phần job đang làm trong `JOBS.md`, instruction repository; chỉ đọc phần `PLAN.md` và source liên quan.
- Trước đợt sửa lớn: ghi phạm vi và bước kế tiếp vào STATE. Sau một mốc code/test: cập nhật kết quả. Không ghi sau từng tool call nhỏ.
- Nếu lỗi server cắt ngang trước khi lưu: lượt sau đối chiếu Git diff và source thực với STATE; không mặc định file chưa được sửa chỉ vì chưa có báo cáo.
- Không bắt đầu job mới khi phần kiểm tra của job cũ còn dang dở, trừ ngoại lệ art approval đã nêu.
- Nếu context gần đầy: hoàn tất patch đang làm, ghi checkpoint, dừng. Không hứa tự mở chat mới; người dùng gửi prompt Khôi phục để tiếp tục.
- Tài liệu kế hoạch là hướng thiết kế; source/diff/test hiện tại mới là bằng chứng đã thực hiện.

### Template `docs/world-redesign/STATE.md`

```markdown
# VieWorld redesign checkpoint
Updated: <thời điểm>
Branch / HEAD: <giá trị thực>
Current job: <01–10>
Status: TODO | IN_PROGRESS | BLOCKED | DONE

## Product contract
- Khu phố âm nhạc thu nhỏ; mỗi artist/IP một nhà nhạc; mỗi fan một phòng riêng.
- Vào world → tham gia đúng điều kiện → lưu capsule → trưng bày trong phòng.
- Ba nav chính: Khám phá / World / Phòng tôi; inbox là tiện ích.
- 2.5D diorama đất sét mờ; nhãn UI bằng code; không fake live/artist/crowd.
- Giữ nguyên constitution và domain safeguards.

## Job ledger
| Job | Status | Bằng chứng / việc còn lại |
|---|---|---|
| 01 | TODO | |
| 02 | TODO | |
| 03 | TODO | |
| 04 | TODO | |
| 05 | TODO | |
| 06 | TODO | |
| 07 | TODO | |
| 08 | TODO | |
| 09 | TODO | |
| 10 | TODO | |

## Existing user changes
<file/phạm vi có trước job; không nhận là thay đổi của agent>

## Changes made
<file và hành vi đã đổi, ngắn gọn>

## Verification
<lệnh, cwd, exit code, test count nếu có; PASS / FAIL / NOT RUN>
<screenshot path + viewport; kiểm tra thủ công nào đã làm>

## Art approval
<asset IDs, paths, proposed/approved/rejected; ai duyệt và khi nào>
<chưa có xác nhận của người dùng thì không ghi approved>

## Known issues / blockers
<lỗi cụ thể, điều kiện tái hiện, không đoán>

## Exact next action
<bước tiếp theo đủ cụ thể để agent mới làm ngay>
```

## Các job

### Job 01 — Sửa shell/CSS và thu gọn điều hướng

**Đích:** app có bố cục ổn trước khi thêm ảnh.

Phạm vi: `AppShell.tsx`, `index.css`, label tenant liên quan. Kiểm tra cascade thực; trong bản review, rule header ngang 64px bị sidebar dọc cao gần viewport ghi đè. Chọn một layout chuẩn, gỡ rule xung đột thay vì thêm override chồng lên. Ba nav Khám phá / World / Phòng tôi; inbox là tiện ích có accessible name. Giữ lối vào trợ giúp/review/Studio và banner DEMO.

Đạt: 390×844 và 1440×900 không có header gần một màn, không tràn ngang, nav không che nội dung. Thử các link chính; chạy typecheck/build nếu khả dụng. Chưa gen ảnh, chưa thay business state.

### Job 02 — Một cảnh Artist A thay năm thẻ dài

**Đích:** nhìn thấy một nơi chốn và bấm được, chưa cần final art.

Phạm vi: `WorldScene.tsx`, scene CSS; thêm config/SceneCanvas/SceneHotspot nếu thực sự cần. Dựng graybox nhà nhạc nhìn tổng thể bằng HTML/SVG/CSS: sân khấu, máy đĩa, bảng lưu diễn; hội viên/shop là đồ vật phụ. Dùng Link/button thật, label từ dữ liệu, vùng chạm ít nhất 44×44px, focus rõ, lối tắt bằng chữ. Cùng dữ liệu scene có bố cục desktop/mobile, không kéo dài thành năm hero card.

Đạt: mỗi hotspot có phản hồi/đích đến; keyboard dùng được; không chỉ hover. Không hình AI mới, không đổi luật session. Nội dung panel chuẩn hóa ở Job 03.

### Job 03 — Địa điểm mở đúng nội dung, Back đúng chỗ

**Đích:** tên nơi và hành vi khớp nhau.

Phạm vi: `WorldDetailView.tsx`, routing/selector liên quan, panel dùng lại component hiện có. Stage vào session phù hợp theo domain; scheduled/open/running xử lý rõ. Máy đĩa chỉ hiển thị listening. Bảng lưu diễn là archive/replay, không giả là kệ capsule cá nhân. Hội viên giữ phân biệt quyền. Shop có một đích chuẩn `/worlds/:id/shop`; xử lý tương thích URL zone cũ. Bỏ tab/dock trùng lặp; history giữ hành trình vào/rời nơi.

Đạt: thử click từng nơi, Back/Forward, reload deep-link, zone sai, không có session. Chỉ báo live có DEMO sát cạnh, không hardcode Linh hoặc hứa photocard chưa có. Thêm test routing/filter liên quan.

### Job 04 — Phòng fan có đồ vật tương tác

**Đích:** Phòng tôi không còn là dashboard sáu nút.

Phạm vi: `MyRoomScene.tsx`, `MyWorldView.tsx`, scene CSS. Dựng phòng graybox cùng camera/scale với nhà nhạc: avatar, kệ ba ô, tủ đồ, lịch. Kệ mở bộ sưu tập; tủ mở customizer; lịch mở RSVP đúng dữ liệu. Quyền lợi/đơn hàng/hỗ trợ vào menu phụ nhưng không mất route hay recovery. Gỡ CSS ẩn chi tiết phòng có chủ đích.

Đạt: cả ba đồ vật dùng được trên mobile và desktop; empty state có nghĩa; tenant labels và tên fan không hardcode. Chưa thêm persistence cho ba ô — để Job 07.

### Job 05 — Chốt style bằng mẫu nhỏ, không gen hàng loạt

**Đích:** có mẫu để người dùng duyệt trước khi tốn thêm request ảnh.

Đọc phần art trong PLAN. Gen một style board chung, hai character reference artist/fan và một scene Artist A mẫu. Có thể gom character reference vào cùng contact sheet nếu công cụ hỗ trợ, nhưng không giả định một lượt gọi tạo được mọi asset. Original matte-clay 2.5D, camera 3/4 hơi từ trên, ánh sáng trên trái, palette ấm/lavender; không text/logo/ngày/UI/crowd. Fan và artist giữ hai danh tính riêng, không đổi người thành mèo giữa màn.

Đặt mẫu trong `public/images/world-redesign/drafts/`; ghi manifest với prompt/reference/path/status. Không đánh dấu approved, không thay final art trong app. Nếu công cụ gen không khả dụng, xuất prompt và thông số asset còn thiếu rồi báo BLOCKED; không thay bằng ảnh tải ngẫu nhiên và không gọi SVG là ảnh AI.

Đạt: người dùng xem cùng các mẫu và duyệt hoặc chỉ ra điểm sửa. DỪNG để duyệt art. Job 06/07 có thể tiếp tục với placeholder; Job 08 phải chờ duyệt.

### Job 06 — Đồng nhất avatar và phụ kiện

**Đích:** đổi tủ đồ một lần, các màn thấy cùng một diện mạo.

Phạm vi: `AvatarStage.tsx`, `WardrobeCustomizer.tsx`, room/header fan và asset renderer/manifest. Tạo cơ chế render dùng chung nhưng không trộn nhân vật artist với fan. Dùng state/preset accessory hiện có. Có preview chưa lưu, lưu, reload và fallback. Trong lúc art chưa duyệt dùng asset hợp lệ/placeholder nhất quán; không vượt kiểm soát approved/retired của artist.

Đạt: phụ kiện fan đã lưu hiện nhất quán ở mọi bề mặt fan; không chỉ đổi tên dưới một JPG giữ nguyên. Avatar nghệ sĩ không tạo presence từ animation. Kiểm tra missing/unapproved asset và tenant switch. Không gen sprite sheet nhiều frame.

### Job 07 — Capsule về kệ, lưu được sau reload

**Đích:** hoàn thành điểm khác biệt cốt lõi của VieWorld.

Phạm vi: room UI, type/reducer/storage migration tối thiểu, test. Ba slot chỉ tham chiếu capsule đã lưu thuộc fan hiện tại. Chọn capsule → chọn ô → trưng bày; thay thế, bỏ khỏi ô, mở chi tiết. Bỏ khỏi kệ không xóa capsule. Một capsule tối đa một ô. Lưu tenant/fan-scoped, xử lý reference thiếu; migration giữ dữ liệu cũ thay vì reset storage.

Đạt: trưng bày/reload/thay thế/bỏ khỏi kệ và tenant isolation qua test. Replay vẫn không tạo live-attendance capsule; không đổi eligibility để ép demo thành công. Kiểm tra luồng participation hợp lệ → lưu capsule → mang về phòng. Chưa drag-and-drop hay social room.

### Job 08 — Tích hợp art đã duyệt, thêm phản hồi nhẹ

**Điều kiện:** Job 05 được người dùng duyệt, không chỉ có ảnh đã gen.

Gen asset còn thiếu cho Artist A và phòng fan theo đúng reference duyệt; chia thành nhóm nhỏ nếu cần. Background tách object/avatar; chữ là HTML. Alpha phải thật, camera/scale/anchor khớp. Thêm manifest và fallback; không bake người/live state vào nền.

Tích hợp vào scene, micro-animation focus/press/idle nhẹ; hỗ trợ reduced motion. Lightstick chỉ phản hồi cục bộ, không tăng fake audience hay cấp capsule. Mobile tái bố cục layer, không crop mất hotspot. Lưu reference/prompt và danh sách asset cần duyệt bổ sung nếu khác mẫu.

Đạt: world/phòng/session có cùng hệ hình ảnh; mọi hotspot còn khớp vị trí, label đọc được, ảnh hỏng vẫn dùng được. Báo dung lượng ảnh thực. Không làm lại domain trong job này.

### Job 09 — Neon và các màn phụ cùng một hệ

**Đích:** không chỉ trang world đẹp còn phần khác quay về style cũ.

Dùng chung scene/asset config để làm Neon Sessions: graphite/indigo, cyan/rose, cùng vật liệu/camera nhưng khác identity. Không copy ảnh acoustic Artist A hoặc fork logic. Đồng bộ WorldCard/WorldHeader/NextMomentCard, Discover, directory, shop và các bề mặt phụ. Khám phá ưu tiên hôm nay/tiếp tục; directory ưu tiên chọn/tìm world, không lặp nguyên nội dung.

Đạt: Artist A và Neon khác chủ thể nhưng cùng cách dùng; link qua lại đúng tên. Shop/order/benefit/recovery/inbox không mất chức năng. Nếu cần art mới ngoài mẫu đã duyệt, trình mẫu thay vì tự nhận được duyệt.

### Job 10 — Regression và bàn giao

**Đích:** chứng minh app dùng được, không chỉ gửi ảnh đẹp.

Chạy scripts test/typecheck/build thực của repo; báo chính xác exit code và số test. Phân biệt baseline failure với regression. Browser QA tại 360×800, 390×844, 768×1024, 1440×900. Kiểm tra keyboard/focus/dialog Escape, reduced motion, không tràn/che CTA, missing image, deep-link/Back/reload, session trống/khóa/vắng artist, tenant isolation và data recovery.

Demo vòng: Khám phá → Artist A → phiên demo hợp lệ → tương tác → lưu capsule → về phòng → trưng bày → đổi phụ kiện → reload. Dùng operator demo hợp lệ; không sửa domain để demo luôn pass.

Lưu ảnh và `docs/world-redesign/QA.md`: test PASS/FAIL/NOT RUN, lỗi tồn tại, giới hạn prototype, asset còn pending. Chỉ sửa lỗi liên quan tìm thấy, không thêm feature. Nếu nhiều lỗi, chia job sửa nhỏ và ghi ledger; chưa DONE khi còn lỗi chặn vòng chính. Không push/deploy.

## Prompt Tiếp tục — dùng sau mỗi job

```text
Tiếp tục VieWorld trong C:\Users\VTD\Desktop\Vieworld.
Đọc docs/world-redesign/STATE.md và Job [XX] trong JOBS.md.
Chỉ thực hiện Job [XX], đọc phần PLAN/source liên quan, không audit lại toàn repo.
Nếu job trước chưa xong, hoàn tất phần dang dở trước; nếu job này đã DONE và bằng
chứng còn đúng, báo lại, không làm trùng. Giữ các giới hạn từ prompt Khởi động.
Thực hiện, kiểm tra, cập nhật STATE và dừng. Chưa được duyệt art thì không tích hợp
art mới. Không chuyển job hoặc retry lỗi quota/high demand tự động.
```

## Prompt Khôi phục — khi đổi chat, bị cắt hoặc hết context

```text
Khôi phục công việc VieWorld trong C:\Users\VTD\Desktop\Vieworld.
Nguồn bàn giao: docs/world-redesign/STATE.md, JOBS.md, PLAN.md và Git diff hiện tại.
Đọc instruction repo, STATE và job hiện tại; đọc PLAN/source theo nhu cầu.
Đối chiếu file thật với checkpoint vì lượt trước có thể bị cắt giữa chừng.
Không tin báo cáo DONE nếu thiếu bằng chứng, không ghi đè thay đổi đã làm, không
reset data/Git. Tiếp tục đúng “Exact next action” của job dở; không bắt đầu lại
thiết kế, không làm lại audit và không chạy nhiều job cùng lúc.
Nếu STATE chưa tồn tại, khôi phục tối thiểu từ hai tài liệu và diff, ghi điểm chưa
chắc thay vì bịa tiến độ; hỏi tôi chỉ khi thiếu quyết định thật sự chặn công việc.
Hoàn thành và kiểm tra job hiện tại, cập nhật STATE rồi dừng. Giữ art approval gate,
constitution, không push/deploy/cài package/agent nền/retry lỗi server liên tục.
```

## Tùy chọn: tự nối một cụm job có giới hạn

Chỉ dùng khi muốn ít phải gửi prompt. Ví dụ này cho phép cụm 02–04, không phải tự chạy toàn bộ plan:

```text
Đọc checkpoint VieWorld và làm lần lượt Job 02 → 03 → 04 trong JOBS.md.
Job nào đã DONE thì kiểm tra nhanh bằng chứng và bỏ qua, không làm lại.
Sau mỗi job đạt tiêu chí, cập nhật STATE rồi mới sang job kế tiếp.
Dừng sau Job 04, khi cần duyệt, có blocker hoặc context không đủ.
Không thực hiện Job 05/gen ảnh, không tự mở agent/chat mới hay chạy background.
Nếu phải dừng sớm, ghi Exact next action để tôi gửi prompt Khôi phục.
Giữ mọi giới hạn an toàn, domain và kiểm thử của prompt Khởi động.
```

## Đọc đúng lỗi đang gặp

Log người dùng cung cấp cho thấy Python ngoài Codex đã chạy và backend trả HTTP 503 / UNAVAILABLE / high demand. Không cần tiếp tục sửa PATH để chữa riêng lỗi này. Đổi model thủ công hoặc thử sau là lựa chọn vận hành của người dùng; không bảo đảm model khác sẽ khả dụng. Bộ job không phụ thuộc 3.8 hay 3.7 và không tự đếm quota tài khoản.

Runner trước chỉ fallback khi chạm giới hạn model calls, không khi ném exception 503. Quy trình trong tài liệu này bỏ runner, dùng trực tiếp giao diện Antigravity và checkpoint trong repository.
