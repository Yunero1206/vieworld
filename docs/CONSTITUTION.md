# VieWorld Product Constitution

Version: 1.0  
Owner: Phạm Thanh Phú  
Status: Immutable baseline product rules (requires explicit owner approval to change)

---

## 1. What the Product Is

VieWorld is a portable fan relationship product concept. It establishes a trustworthy, transparent digital space where fans and entertainment worlds connect across curated, meaningful moments:

- **Artist World & IP World**: Digital venues hosting shared moments (e.g., live drop-in sessions, listening rooms, setlist-driven mini-concerts). Fictional launch worlds include **Artist A** and the entertainment show **Neon Sessions**.
- **My World**: The fan's private personal continuity space. It safeguards follows, chosen wardrobe accessories, attendance history, saved Moment Capsules, active memberships, eligible benefits, order records, and support case history.
- **VieSHOP**: A contextual commerce concept embedded within specific worlds, offering transparent terms and products without dark patterns.
- **MFan & FanMe**: Clearly labeled external tenant configuration demonstrations showcasing portability without data leakage.

### The Signature Loop
```
Discover → Enter World → Follow / RSVP → Participate → Save Moment Capsule → View My World → Own / Recover → Return to Next Moment
```
Success is defined by loop clarity, emotional resonance, and product honesty—not by maximized vanity engagement, artificial intimacy, or bloated feature sets.

---

## 2. Product Status and Honesty

VieWorld maintains strict truthfulness in all visual and functional states:

1. **Independent Concept**: VieWorld is an independent product concept developed by Phạm Thanh Phú. It is not an announced, commissioned, or endorsed DatVietVAC product.
2. **Fictional Entity Disclosures**: All artists, shows, and hosts are entirely fictional (e.g., `Artist A`, `Neon Sessions`). All demo content, group messages, counts, reactions, and media are synthetic sample data.
3. **Persistent Demo Notice**: The application must persistently display the top banner:
   ```
   Bản thử nghiệm · Dữ liệu và tương tác mô phỏng
   ```
4. **Truthful Presence & DEMO Badging**: Every live indicator must feature an adjacent `DEMO` badge. Animation alone never indicates artist presence. When an artist disconnects or leaves, presence must visibly transition to `reconnecting` or `disconnected`. An artist cannot be replaced by AI pretending to be them.
5. **No Fake Identity Verification**: Official avatar in this prototype refers strictly to the approved synthetic SVG/asset package within the demo pipeline, never an endorsement or biometric identity verification of a real human artist.
6. **No Fabricated Proof**: The application will not present fabricated user counts, fake testimonials, unverified rights, or claim public deployment URLs.
7. **Local Operator Switch**: Studio operator controls demonstrate operational role behavior, not authenticated production permissions.

---

## 3. Non-Negotiable Distinctions

The prototype enforces distinct domain boundaries across all views and data models:

| Concept Distinction | Required Product Behavior |
|---|---|
| **Follow vs. Membership** | Following is an open, free relationship action. It never creates, implies, or converts to a membership state. |
| **Membership vs. Benefit** | Active membership provides eligibility evaluation but does not automatically grant or guarantee every benefit. |
| **Eligibility vs. Inventory** | Both states must be clearly explained; a fan may be eligible for a benefit even if the underlying physical item is currently out of stock. |
| **Payment vs. Fulfilment** | Simulated payment creates a `paid` order state; physical fulfilment is a distinct, verifiable downstream action. |
| **Attendance vs. Replay** | Replay viewers receive a replay history record; they never receive a `live_attendance` credential or live capsule. |
| **Avatar vs. Artist Presence** | Avatar animations (idle, gestures) never independently set presence state. Host state is strictly driven by session domain events. |
| **Session vs. Segment** | Live hosts may introduce pre-recorded media segments; every segment must accurately reflect whether it is `live` or `recorded`. |
| **Portability vs. Shared Accounts** | Switching tenant configurations (VieWorld, MFan, FanMe) demonstrates schema portability while isolating all user data, orders, and follows. |
| **App Guide vs. Artist** | The deterministic World Guide maintains its own distinct identity (`Hướng dẫn demo`) and never adopts the persona of the artist. |
| **Local Simulation vs. Real Platform** | All production dependencies (banking, KYC, commercial streaming, live WebRTC) remain explicitly unimplemented and disclosed. |

---

## 4. Scope Boundaries and Exclusions

### In Scope for Baseline (P00–P17)
- 1 fictional artist world (`artist-a`) and 1 fictional entertainment IP world (`neon-sessions`).
- 1 approved original 2D avatar asset (`avatar-a-v1`) plus 1 draft asset (`avatar-a-v2`).
- 2 reusable session formats (Drop-in simulation, Listening Room) and 1 mini-concert presentation.
- 1 synthetic fan profile (`fan-linh`).
- 1 membership program (`member-a-01`), 2 benefits (`benefit-replay-01`, `benefit-early-access-01`).
- 2 merchandise products (`product-pin-01`, `product-shirt-01`).
- 1 end-to-end simulated order flow with idempotent request IDs.
- 1 support case recovery flow linking blocked benefits or orders.
- Versioned local persistence with explicit tenant namespacing, reset drawer, and error recovery.

### Hard Exclusions (Do Not Implement)
- **No Real Payments or Billing**: No payment gateways, card capture, bank integrations, or simulated checkout telemetry treated as real GMV.
- **No Production Authentication**: No OAuth, SMS/email OTP, or JWT auth services. Client-side role preview is for demonstration only.
- **No Real Streaming or Copyrighted Media Ripping**: No scraping, proxying, or unauthorized playback from commercial streaming platforms (e.g., Spotify, YouTube). Media is limited to neutral, cleared local demo loops or silent placeholders.
- **No Generative Impersonation or Voice Cloning**: No AI artist clones, synthetic speech synthesis claiming to be the artist, or face tracking.
- **No Real Hardware Permissions**: Baseline prototype must not request browser camera or microphone permissions.
- **No Web3 / Speculative Mechanics**: No tokens, NFTs, gacha mechanics, loot boxes, or spending leaderboards.
- **No Portfolio Site Interference**: The prototype is strictly quarantined within its own directory and repository; existing portfolio assets or websites must never be modified or overwritten.
