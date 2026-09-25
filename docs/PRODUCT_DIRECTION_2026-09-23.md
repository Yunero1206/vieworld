# VieWorld — định hướng product sau P17

Cập nhật: 23/09/2026 · Trạng thái: định hướng để đối chiếu các quyết định UX và product tiếp theo. Đây chưa phải đặc tả triển khai.

## Product thesis

VieWorld là một nơi để fan nắm được điều đang diễn ra, tận hưởng mối quan hệ với nghệ sĩ và giữ lại những điều họ từng trải qua ở nhiều world. Sự sống đến từ artist, fan, concert, comeback, ký ức, merch và tương tác thật. App hỗ trợ, kết nối và lưu giữ những điều đó; app không cần mô phỏng một thế giới tự sống.

Mục tiêu cảm nhận của fan: **“Tui nắm được tình hình rồi. Giờ tui có thể enjoy.”**

Thước đo cho các quyết định thiết kế: VieWorld có giảm bất định và tăng niềm vui cho fan không? Có giúp họ hiểu điều nào cần chú ý, điều nào có thể khám phá khi rảnh, và điều nào đã trở thành kỷ niệm của riêng họ không?

## Các nguyên tắc giữ lại

1. **Con người là nhân vật chính.** Artist và fan thật tạo ra ý nghĩa. Platform là hạ tầng phục vụ họ. Tránh AI giả artist, hoạt động giả, điểm năng lượng, XP hoặc gamification chỉ nhằm tạo cảm giác “world đang sống”.
2. **Artist presence quý hơn avatar technology.** Avatar hoặc 2D chỉ có giá trị khi giúp truyền đạt sự hiện diện có thật và đúng ngữ cảnh. Tương tác tương lai nên do artist/team chủ động biên soạn; platform có thể hỗ trợ sản xuất. Artist không phải duy trì avatar liên tục để world có giá trị.
3. **Nhiều cách làm fan cùng tồn tại.** Có người sưu tầm, đi concert, yêu thời trang, xem artist, giao lưu. Không ép tất cả vào một mechanic chung. Sự gắn kết đến từ những mối liên hệ có ý nghĩa giữa trải nghiệm, không từ việc mọi người làm cùng một hành động.
4. **Nội dung có quan hệ, nhưng có giới hạn.** Concert có thể liên hệ với outfit, merch, moment và memory; sự liên hệ giúp fan đi tiếp một cách tự nhiên. Không cần mô hình “mọi thứ nối với mọi thứ” hay knowledge graph phức tạp trước khi có nhu cầu cụ thể.
5. **New ≠ Notification.** Notification chỉ dành cho điều xứng đáng ngắt quãng fan, nhất là thông tin cần hành động hoặc có hạn. Những thay đổi còn lại phải được nhận ra dễ dàng khi fan quay lại. Số lượng unread không phải tín hiệu thành công.
6. **“Caught up” là trạng thái tốt.** Khi không có gì cần chú ý, app có thể yên. Không cần bơm thêm item để trang luôn bận rộn.
7. **Thời gian và sự hiện diện không phải UI controls.** Không bắt fan bấm “Day 3” hoặc một công tắc mô phỏng để cảm nhận thay đổi. Nếu dùng kịch bản thời gian trong quá trình thiết kế, bộ điều khiển đó chỉ thuộc môi trường thử nghiệm, không thuộc trải nghiệm fan.
8. **VieWorld không cần tự chứng minh nó là world.** World cá nhân hình thành dần khi fan tích lũy artist họ theo, concert đã đi, món đã giữ, moment nhớ và lịch hẹn sắp tới.

## Hệ quả đối với app hiện tại

### Homepage: bề mặt định hướng sự chú ý

Homepage không trở thành page thứ năm hoặc feed tổng hợp bốn page. Nó trả lời ngắn gọn ba câu hỏi: **đang xảy ra gì**, **sắp tới điều gì nhạy về thời gian**, **điều gì liên quan trực tiếp tới tôi đã thay đổi từ lần ghé trước**. Thứ tự chính: happening now → upcoming/time-sensitive → changed for me. Artist là ngữ cảnh của từng hoạt động, không phải nhóm cấp cao nhất. Theo dõi mười artist không được tạo mười dải nội dung cạnh tranh nhau. Số item càng ít mà fan vẫn thấy đủ thông tin càng tốt.

### Navigation toàn app

Giữ gần như nguyên hierarchy **Explore / Moments / My Space / VieSHOP** cùng header/logo rõ và tiết chế. Chỉ đổi điều hướng cấp cao khi có bằng chứng fan không tìm được việc họ muốn làm.

### Artist level: cần làm rõ lại

`Nhà Artist / Live & Concert / Hall hội viên / Merchandise` hiện đang đặt place, activity, quyền hội viên, cộng đồng và commerce ngang hàng. Cần kiểm tra lại việc nào thuộc artist context, việc nào là entry tới Moments hoặc VieSHOP; đặc biệt tránh `Merchandise` lặp lại VieSHOP và `Live & Concert` lặp lại Moments. Chưa chốt taxonomy mới chỉ dựa trên trực giác; cần thử theo tác vụ fan thật.

### Presentation grammar

Vấn đề nổi bật của P17 nằm ở cách trình bày: banner, tab, card, section và grid xuất hiện quá dày khiến app giống artist portal hoặc data manager. Refine từng màn hình bằng cách xác định câu hỏi chính của fan, một ưu tiên thị giác và hành động tiếp theo. Giảm lớp container và nhãn lặp trước khi thêm component mới.

### My Space, collection, Capsule, wardrobe

Đây là những cách fan giữ và thể hiện điều có thật. Chúng không cần trở thành game loop. Một món có thể liên hệ với concert/moment/artist đã tạo ra ý nghĩa của nó; riêng tư và quyết định trưng bày vẫn thuộc fan.

### Artist interaction

Nội dung, lời nhắn, lịch, outfit hoặc interaction do artist/team tạo và phê duyệt. Phân biệt nội dung đã đăng, lịch sắp tới và artist thực sự đang hiện diện. Sự vắng mặt có thể được thể hiện trung thực; không suy ra artist online chỉ từ avatar, post mới hay video phát lại.

## Những việc chưa chốt

- Homepage nên giữ hình thức quảng trường hiện tại đến mức nào khi thêm thông tin định hướng? Cần thử vị trí và độ ưu tiên trên desktop/mobile.
- Quy tắc cụ thể nào khiến một thay đổi trở thành notification, và fan kiểm soát quy tắc đó ra sao?
- Cách hiển thị “changed for me” nào đủ rõ mà không biến thành unread list?
- Artist level nên có những lựa chọn nào sau khi thử các hành trình: chỉ xem artist, tham gia live, vào cộng đồng, xem lịch và tìm merch?
- Quan hệ tối thiểu giữa concert, moment, merch và memory cần dữ liệu gì để có ích, không thành hệ thống metadata nặng?

## Cách dùng tài liệu này

Trước mỗi thay đổi lớn, đối chiếu với product thesis và những nguyên tắc ở trên. Ưu tiên sửa cách sắp xếp và cách nói của app; chỉ thêm dữ liệu/feature khi một tác vụ fan cụ thể cần nó. Hướng thử nghiệm “một tuần hư cấu với nút chọn Ngày 1–7” đã được bỏ khỏi app ngày 23/09/2026 và **không** là hướng UX/product được duyệt.
