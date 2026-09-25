# VieWorld — Test Universe Expansion Implementation Plan

## 1. Mục tiêu

Mở rộng **data và asset trên chính app hiện tại** để có thể test end-to-end các flow đã build:

`Home → Explore → Artist World → Live/Event Context → Hall → Kho lưu trữ → VieSHOP → Bộ sưu tập → Phòng/Avatar`

Dataset phải đủ variation để kiểm tra:

- nhiều artist có trạng thái khác nhau;
- nhiều fan có relationship/quyền khác nhau;
- live/event qua nhiều phase thời gian;
- nhiều context cùng active;
- Hall member và non-member;
- public fan voice vs private chat;
- Archive dày và Archive rất ít dữ liệu;
- Shop có nhiều trạng thái/capability;
- My Space từ trống tới rất nhiều item;
- Room display 1–5 item/surface;
- connection giữa các page;
- empty/error/edge states.

Không lấy “nhiều record” làm mục tiêu. Mục tiêu là **nhiều trạng thái khác nhau**.

---

## 2. Existing data là source of truth

Trước khi generate hoặc seed bất cứ thứ gì mới, audit toàn bộ data hiện có và phân loại mỗi dataset/entity thành đúng một trong năm action:

| Action | Ý nghĩa |
|---|---|
| `KEEP` | Data và relation hiện tại đã đúng, giữ nguyên |
| `NORMALIZE` | Content đúng, chỉ cần bổ sung/chuẩn hóa field |
| `MIGRATE` | Data vẫn dùng nhưng vai trò/route/schema đã đổi |
| `DEPRECATE` | Chỉ bỏ khi chắc chắn là implementation cũ không còn dùng |
| `GENERATE_MISSING` | Chỉ tạo thêm khi hiện tại chưa đủ để test |

Ví dụ:

| Existing data | Action |
|---|---|
| Artist A hiện tại | KEEP |
| Assets concert/live hiện tại | KEEP |
| Moment cũ | MIGRATE sang Artist/Explore/Archive context |
| Product hiện tại | NORMALIZE capability/status |
| Hall message hiện tại | KEEP, chỉ thêm privacy/consent metadata nếu thiếu |
| Room placement cũ | MIGRATE từ 1 slot = 1 item sang display surface |
| Hard-coded card trong JSX | DEPRECATE, thay bằng canonical data |
| Các state chưa từng tồn tại | GENERATE_MISSING |

**Không được tạo `demoDataV2` chạy song song với data hiện tại.**

Seed phải **additive by default**.

Không overwrite non-fixture record trừ khi đó là migration có chủ đích.

Giữ stable ID hiện tại bất cứ khi nào có thể.

---

## 3. Target test universe

Sau khi reuse existing data, chỉ generate cho đến khi đạt xấp xỉ:

| Domain | Tổng target |
|---|---:|
| Artist Worlds | 7 |
| Key fan personas | 8 |
| Crowd fan fixtures | 22 |
| Tổng fan | ~30 |
| World contexts / events | 18 |
| Hall rooms | 8–10 |
| Moments | 45–60 |
| Public Fan Voices | 20–25 |
| Archive chapters | 20–25 |
| Products/items | 40–45 |
| Owned-item relations | 50–70 |
| Guestbook messages | 12–18 |
| Room scenario fixtures | 8–10 |
| Golden end-to-end journeys | 4 |

Nếu existing app đã có 15 product thì chỉ tạo thêm khoảng 25–30 cái, không tạo lại 45.

---

## 4. Artist Worlds

Tạo hoặc map đủ 7 World với **vai trò test khác nhau**:

| Artist | Test role |
|---|---|
| Artist A | flagship; live, event, Hall, Archive, Shop đều có |
| Artist B | quiet world; rất ít activity |
| Artist C | 2–3 context active đồng thời |
| Artist D | Archive dày, history 3 năm |
| Artist E | artist mới/debut, nhiều empty states |
| Artist F | commerce-heavy, nhiều product capabilities |
| Artist G | event/community-heavy, ít merch |

Mỗi artist cần tối thiểu:

- tên + slug/id;
- avatar;
- banner/hero;
- 1–5 Moment tùy world;
- current/upcoming contexts;
- optional products;
- optional Hall;
- Archive data phù hợp.

Không được làm 7 artist giống nhau rồi chỉ đổi tên.

Artist A có thể tiếp tục reuse toàn bộ content đang có.

### Visual assets

Reuse theo thứ tự:

`existing artist asset → existing event asset → existing moment asset → generate missing`

Chỉ generate khi thật sự thiếu.

Mỗi artist mới tối đa cần khoảng:

- 1 avatar;
- 1 hero/banner;
- 3–5 Moment visuals;
- 0–2 event artworks.

Không cần cả chục ảnh polished cho mỗi artist.

Dùng fictional artist, không cần likeness celebrity thật.

---

## 5. Fan fixtures và relationship

Chỉ 8 fan cần persona rõ; 22 fan còn lại là crowd data.

### 8 key personas

| Fan | State chính |
|---|---|
| New Fan | follow 0, membership 0, item 0 |
| Casual Fan | follow 2 artist, không membership |
| Hall Member | member Artist A, Hall-active |
| Multi-fandom Fan | follow ~10 world |
| Collector | ~30 owned item, Room gần đầy |
| Long-time Fan | nhiều memories/milestones |
| Commerce Fan | saved/cart/preorder/digital items |
| Public Voice Fan | private + consented + artist-selected message |

Relations phải nằm riêng:

`Follow`  
`Membership`  
`UserWorldState`  
`Ownership`

Không nhét `followers[]` hoặc `members[]` trực tiếp thành demo arrays trong Artist component.

Test được:

- follow 0 / 1 / 3 / 10 artist;
- member/non-member;
- last visited artist;
- current artist khác followed artist;
- refresh vẫn giữ current Artist World.

---

## 6. New-account Artist logic

New account không có `currentArtistId`:

1. kiểm tra last/current artist;
2. nếu không có, kiểm tra followed artists;
3. nếu vẫn không có, chọn **một lần** từ curated featured-world pool;
4. persist lựa chọn đó;
5. không random lại mỗi refresh.

Khi user chủ động vào Artist B từ Explore:

`currentArtistId = Artist B`

Global sidebar dynamic artist slot cập nhật theo world hiện tại.

---

## 7. Controlled time / demo clock

VieWorld hiện phụ thuộc rất nhiều vào time state nên phải có deterministic clock.

Ví dụ dev fixture:

```text
DEMO_NOW = 2026-09-25T20:00:00+07:00
```

Hoặc dùng abstraction hiện có như:

```text
clock.now()
```

Fixture phải phủ:

- quá khứ 30 ngày;
- quá khứ 2 ngày;
- vừa kết thúc;
- đang active;
- +30 phút;
- +3 giờ;
- +2 ngày;
- +30 ngày.

Không seed mọi event là “hôm nay”.

Cùng một live phải test được:

`upcoming → active → ended/replay`

---

## 8. World Context / Event dataset

Target khoảng 18 context.

Các type cần có:

- `live`
- `concert`
- `release`
- `fan_project`
- `drop`
- `community`

Các phase:

- `upcoming`
- `active`
- `ended`

Mỗi context dùng canonical record, không tạo 3 record cho 3 phase.

Artist C bắt buộc có cùng lúc:

- active live;
- upcoming concert;
- active fan project.

Để stress-test context switcher của Artist Home.

### Context connection

Một context có thể reference:

- artist;
- hero/media;
- Hall room;
- Archive chapter;
- Moment sources;
- Shop collection nếu hợp lý.

Không tạo duplicated `LiveCardData`, `HallLiveData`, `HomeLiveData`.

---

## 9. Artist World

Artist Home phải **derive từ canonical entities**, không seed riêng những card UI.

Nó lấy từ:

`Artist + WorldContexts + PublicFanVoices + Moments + Products`

Test đủ:

- Artist A đầy đủ;
- Artist B yên;
- Artist C nhiều context;
- Artist E rất ít content.

### Context Mode

Click live/event từ Artist Home không mở một unrelated standalone page.

Giữ Artist shell và chuyển `Trang chính` sang selected context.

Live:

- upcoming → artwork + countdown;
- active → live player/stage;
- ended → replay/post-live.

Hall integration bên phải:

- member → chat;
- non-member → membership boundary.

Other event archetypes dùng cùng `ContextStage`, chỉ đổi modules.

Không build một page riêng cho mỗi event type.

---

## 10. Hall

Target 8–10 rooms.

Gồm room persistent:

- Phòng chung;
- Fan creations nếu đang có.

Và context-driven:

- Xem live cùng nhau;
- Concert Hà Nội;
- Birthday Project;
- Album Listening;
- Fan Meeting;
- temporary event rooms.

Hall data phải test:

- normal text;
- image/media;
- reply thread;
- poll;
- artist presence;
- private message;
- public-consent message;
- artist-selected message.

Private Hall message **không được tự động xuất hiện ngoài Hall**.

### Public Fan Voice

Phải là một projection riêng có:

- source message;
- consent;
- artist selected/community selected;
- published state.

Explore/Artist Home chỉ đọc `PublicFanVoice`, không query raw private Hall chat.

---

## 11. Moments

Moment vẫn là object, không còn global destination.

Target 45–60 Moment nhưng phân bố không đều.

Ví dụ:

- Artist A: 10–12;
- Artist D: 10–12;
- Artist C: ~8;
- Artist F: ~6;
- quiet/new artist: 1–4.

Mỗi Moment cần context/source nếu có:

- live;
- concert;
- artist update;
- fan project;
- release;
- public Hall voice.

Moment có thể surface ở:

- Home/Gần đây;
- Explore;
- Artist Home;
- Archive chapter.

Không seed một global Moment feed mới.

---

## 12. Explore test data

Explore hiện tại cần đủ để test:

- 5 featured rich rows;
- remaining artists compact;
- artist có 2 strong Moments;
- artist không có fan project;
- artist có 3 public fan voices;
- quiet artist;
- live artist;
- new artist.

Explore phải derive:

`Artist + selected Moments + PublicFanVoices + optional Project`

Không tạo `ExploreCard` như một entity riêng.

Đảm bảo một artist không bị duplicate vô lý liên tục trong cùng page.

---

## 13. Archive

Target khoảng 20–25 chapter.

Artist D phải đủ 3 năm:

### 2026
- Concert
- Album Era
- Birthday Project

### 2025
- Bangkok
- Fan Meeting
- Những ngày thường

### 2024
- Debut Era
- First Live

Artist E chỉ có một hoặc hai chapter để test sparse Archive.

Archive default luôn chronological.

Chapter reference:

- Moments;
- Capsules;
- completed fan projects;
- event media.

Không chuyển Archive thành folders `Photo / Video / Live`.

---

## 14. VieSHOP

Sau khi reuse existing products, bổ sung cho đủ khoảng 40–45 record.

Need variation:

### Availability

- available;
- preorder;
- limited;
- sold out;
- concept;
- membership/pass.

### Capabilities

- physical only;
- room only;
- avatar only;
- avatar + room;
- no preview;
- digital companion.

Capability phải explicit.

Không infer kiểu:

`category === lightstick ⇒ room capable`.

### Product connection

`Product → OwnedItem → Collection → optional RoomPlacement / AvatarEquipment`

Không copy Product thành ba object độc lập.

---

## 15. Shop assets

Reuse existing images trước.

Chỉ generate thêm khi chưa có usable asset.

Target generate mới chỉ khoảng 10–15 product visuals nếu cần.

Ưu tiên variation:

- apparel;
- lightstick;
- album;
- ticket/pass;
- membership;
- collectible;
- room decor.

Nếu item cần My Space thì mới cần thêm specialized representation:

`roomAsset`  
`avatarAsset`

Raw shop photo không được dùng thẳng như một sprite treo trong Room nếu không phù hợp.

---

## 16. Ownership / Collection

`OwnedItem` phải reference canonical `Product`.

Seed đủ các case:

- purchased item;
- saved-only item;
- preorder acquired state nếu app support;
- room-compatible item;
- avatar-compatible item;
- both-compatible;
- unsupported item.

Collection cần đủ:

### Vật phẩm
- áo;
- vé;
- đĩa;
- lightstick;
- khác.

### Kỷ niệm & dấu mốc
- concert photo;
- ticket;
- saved Moment;
- fan-project memory;
- public artist-selected voice;
- first concert;
- first Hall participation;
- one-year fandom;
- completed fan project.

Không thêm XP/rarity/achievement-game system.

---

## 17. My Space Room

Không build free placement.

Giữ architecture:

`Zone → DisplaySurface → 1–5 DisplayItems`

Seed surfaces như:

- wall_main;
- shelf_center;
- clothing_rack;
- console_right;
- floor_left;
- hero_spot.

Mỗi surface có:

- type;
- maxItems;
- capacityUnits;
- allowed types.

Item footprint:

`small / medium / large`

### Required fixture cases

- empty;
- 1 item;
- 2 items;
- 3 items;
- 4 items;
- 5 small items;
- large + medium + small;
- capacity exactly full;
- over-capacity attempt;
- focal item;
- incompatible item;
- preset change.

### Auto-arrange

Không dùng physics.

Không lưu pixel x/y.

Có manually authored normalized layout presets theo:

`surfaceType + itemCount + preset`

Presets:

- Cân đối;
- Tự nhiên;
- Tập trung.

Stored state chỉ cần:

- surface;
- ordered item IDs;
- focal item;
- preset.

Web/mobile đều render cùng normalized scene.

---

## 18. Avatar

Không thêm AI generation trong packet này.

Seed đủ asset để test:

- ~6 hair;
- ~5 face presets;
- ~5 outfits;
- ~10–12 accessories.

Primary editor categories vẫn:

`Diện mạo / Trang phục / Phụ kiện`

Item room-only không được xuất hiện trong Avatar editor.

Item avatar-only không cần xuất hiện như room placement.

---

## 19. Guestbook

Seed 12–18 messages.

Có variation:

- ngắn;
- dài vừa phải;
- emoji;
- tiếng Việt nhiều dấu;
- nhiều người gửi;
- nhiều ngày.

Không generate wall-of-text.

Typography do UI xử lý; fixture chỉ cần realistic lengths.

---

## 20. Home scenarios

Không seed Home cards.

Home phải derive canonical data.

Test với:

- new fan;
- one-artist fan;
- three-artist fan;
- ten-artist fan;
- returning fan after several days.

Phải có đủ data để nhìn thấy:

`Tiếp tục từ chỗ bạn dừng lại`  
`Gần đây`  
`Sắp tới`

Không để 10 follow tạo Home dài vô tận.

---

## 21. Search

Seed intentional keyword overlap.

Ví dụ keyword:

`Hà Nội`

phải có thể match:

- event;
- product;
- Archive chapter;
- ticket/memory.

Need cases:

- artist result;
- event result;
- item result;
- no result.

---

## 22. Synthetic numbers

Tất cả số liệu demo phải deterministic và rõ là synthetic data.

Có thể dùng realistic ranges:

- Hall active users: 5–800;
- live viewers: 50–5,000;
- fan-project participants: 20–3,000;
- product price: 150k–1.2m VND;
- public voice reactions: 2–1,500.

Không random lại mỗi refresh.

Không để artist nào cũng có hàng nghìn người.

Quiet world phải thật sự quiet.

Không dùng metrics để tạo artificial popularity competition nếu UX không cần.

---

## 23. Bốn Golden Journeys phải chạy được

| Journey | Flow |
|---|---|
| Discovery | New Fan → Explore → Artist B → Follow → current world đổi → Home cập nhật → refresh vẫn giữ |
| Live | Artist A → countdown → live → Hall member/non-member → ended → replay → Archive |
| Commerce | Artist A → VieSHOP scoped → acquire lightstick → Collection → Room → đặt focal |
| Public Voice | Hall post → consent → artist selects → PublicFanVoice → Artist Home/Explore |

Nếu dataset không support đủ bốn flow này thì packet chưa hoàn thành.

---

## 24. Edge cases bắt buộc

Phải seed ít nhất một case của:

- artist không có Moment;
- artist không active context;
- context không có Hall room;
- product missing image fallback;
- sold out product;
- concept item;
- Collection filter zero results;
- room surface full;
- incompatible item;
- non-member vào Hall;
- Archive chỉ một chapter;
- 3 context active cùng lúc;
- fan follow 10 artist;
- user có 30 item nhưng chỉ trưng 8;
- search zero result.

Không được “sửa” fixture để page lúc nào cũng đẹp.

App phải chịu được data xấu/sparse/dense.

---

## 25. Asset-generation policy

Trước mỗi batch generation, tạo asset gap matrix:

| Entity | Asset needed | Existing | Usable | Generate |
|---|---|---|---|---|

Chỉ gen cột `Generate = yes`.

Không được generate:

- 30 portrait fan riêng;
- 45 product photos mới;
- hundreds of Hall messages;
- fake runtime AI recommendation imagery;
- duplicate Artist A assets chỉ để đồng bộ aesthetic.

Content mới phải fictional và đủ để test, không cần production-grade art cho mọi record.

---

## 26. Implementation sequence

1. **Audit schema + existing records + routes + hard-coded demo data.**
2. **Classify everything thành KEEP / NORMALIZE / MIGRATE / DEPRECATE / GENERATE_MISSING.**
3. **Snapshot current deterministic data trước migration.**
4. **Normalize/migrate existing records trước; chưa generate mới.**
5. **Create canonical fixture manifest cho Artists, Fans, Contexts, Products.**
6. **Audit existing assets và lập gap matrix.**
7. **Generate missing assets tối thiểu.**
8. **Seed identity layer: artists, fans, follows, memberships, current world.**
9. **Seed controlled-time contexts/events.**
10. **Seed Hall + privacy + Public Fan Voice.**
11. **Seed Moments + Archive relationships.**
12. **Normalize/seed VieSHOP products + capability matrix.**
13. **Seed ownership/Collection.**
14. **Seed Room surfaces + 1–5 item scenarios.**
15. **Seed Avatar-compatible assets/state.**
16. **Seed Home/Explore scenarios indirectly qua canonical data.**
17. **Add edge fixtures.**
18. **Run four Golden Journeys.**
19. **Run visual regression với cùng deterministic personas.**
20. **Return implementation report.**

---

## 27. Phải làm / Không được làm

| Phải | Không được |
|---|---|
| Reuse existing data trước | Xóa data cũ rồi dựng demo universe mới |
| Preserve canonical IDs | Rename ID hàng loạt để “sạch hơn” |
| Seed cùng production-like schema | Hard-code records trong React component |
| Use deterministic seed | Math.random cho canonical fixture |
| Keep one Product entity | Copy Shop item thành Collection/Room/Avatar item |
| Keep Hall privacy boundary | Leak private Hall message sang Explore |
| Derive Home/Explore | Seed riêng Home cards |
| Use explicit capabilities | Infer capability từ tên/category |
| Migrate old Moments | Xóa Moment chỉ vì bỏ global Moments page |
| Use controlled time | Tất cả event cùng ngày |
| Hand-author Room layouts | Build physics/free positioning engine |
| Generate only missing assets | Regenerate toàn bộ visual library |
| Report UX weakness | Tự redesign feature để fixture fit |
| Keep scope on test data | Build payment, recommender, AI avatar mới |

---

## 28. Dev utilities cần có

Phải có cách reset/switch scenario dễ dàng.

Ví dụ tương đương:

```text
seedDemo()
resetDemo()

loadScenario("new-fan")
loadScenario("hall-member")
loadScenario("multi-fandom")
loadScenario("collector")
loadScenario("commerce")
```

Nếu app dùng localStorage thì reset local state có kiểm soát.

Nếu dùng persistent DB thì seed có fixture namespace/tag rõ ràng.

Không bắt dev phải manual xóa từng record.

---

## 29. Deliverables cuối packet

Antigravity phải trả đúng các phần sau:

### Existing-data audit
- records/schema/routes đã kiểm tra;
- KEEP/NORMALIZE/MIGRATE/DEPRECATE/GENERATE_MISSING.

### Implementation
- files changed;
- migrations;
- seed files;
- scenario files.

### Assets
- assets reused;
- assets generated mới;
- asset mappings.

### Dataset summary
- số Artist;
- Fan;
- Context;
- Hall room;
- Moment;
- Archive chapter;
- Product;
- OwnedItem;
- Room fixtures.

### Connections verified
- Follow;
- current Artist;
- Hall membership;
- Hall → Public Fan Voice;
- Context → Hall;
- Context → Archive;
- Product → ownership;
- ownership → Collection;
- Collection → Room/Avatar.

### QA
- 4 Golden Journeys;
- edge cases tested;
- known failures;
- known limitations.

---

## 30. Definition of Done

Packet chỉ pass khi VieWorld hiện tại — **không phải một parallel demo app** — có thể chạy ổn với dataset mở rộng và chứng minh được:

`new user → discover world → follow → return home`

`artist → event/live → Hall → Archive`

`artist → product → Shop → ownership → Collection → Room/Avatar`

`private fandom activity → consent → public fan voice`

với cả sparse, dense, empty, locked, active, ended, sold-out và over-capacity states.

Đó là lúc dataset mới hoàn thành nhiệm vụ: **không phải làm app trông nhiều content hơn, mà ép toàn bộ product architecture mình vừa xây mấy ngày nay chứng minh rằng nó thực sự đứng vững.**
