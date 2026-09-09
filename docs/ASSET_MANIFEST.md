# VieWorld Asset Manifest

This document inventories all visual, audio, and case study media assets in the VieWorld project.  
**Rule**: Any asset with unverified rights or unknown licensing is strictly blocked from build and distribution. Missing media must display a deliberate, graceful placeholder, never a broken link or player error.

---

## 1. Prototype Graphic & SVG Assets

| Asset ID | Local File Path | Author / Source | License / Permission | Fictional / Real | Allowed Usage | Alt Text | Approval State |
|---|---|---|---|---|---|---|---|
| `asset-avatar-a-v1` | `src/assets/avatar-a-v1.svg` | Original synthetic vector | Proprietary demo / Creative Commons Zero | Fictional | Drop-in, Listening, Live House | "Original 2D avatar representation for fictional Artist A" | Approved |
| `asset-avatar-a-v2` | `src/assets/avatar-a-v2.svg` | Original synthetic vector | Proprietary demo / Creative Commons Zero | Fictional | Avatar Studio preview only | "Draft 2D avatar variation with festival visor accessory" | Draft |
| `asset-world-artist-a-banner` | `src/assets/banner-artist-a.svg` | Original vector | Proprietary demo | Fictional | Artist A World Header | "Abstract stage lights and sound wave backdrop for Artist A" | Approved |
| `asset-world-neon-banner` | `src/assets/banner-neon.svg` | Original vector | Proprietary demo | Fictional | Neon Sessions World Header | "Stylized neon typography and geometric acoustic panels" | Approved |
| `asset-product-pin` | `src/assets/pin-commemorative.svg` | Original vector | Proprietary demo | Fictional | VieSHOP item display | "Fictional commemorative enamel pin with glowing star motif" | Approved |
| `asset-product-shirt` | `src/assets/shirt-tour.svg` | Original vector | Proprietary demo | Fictional | VieSHOP item display | "Fictional midnight tour graphic t-shirt" | Approved |

---

## 2. Audio & Media Demonstration Assets

| Asset ID | Local File Path | Author / Source | License / Permission | Fictional / Real | Allowed Usage | Approval State |
|---|---|---|---|---|---|---|
| `media-audio-neutral-loop` | `public/media/neutral-demo-loop.mp3` | Synthetic neutral demo loop (120 BPM synth chime) | Royalty-free / Demo | Fictional | Listening Room playback demonstration | Pending local file generation |
| `media-placeholder-silent` | *(Inline SVG & state)* | Core UI component | Internal | Fictional | Displayed whenever audio asset is unmounted or rights expired | Approved |

---

## 3. Case Study Evidence Slots (V00–V08)

Screenshots will only be captured and stored after relevant features pass verification. Labeled by packet/build version.

| Slot ID | Destination Path | Description | Status | Verification Packet |
|---|---|---|---|---|
| `V00` | `docs/assets/v00_cover.png` | Product cover / signature hero presentation | Reserved | P17 |
| `V01` | `docs/assets/v01_world_model.png` | Relational world model and navigation architecture | Reserved | P03 |
| `V02` | `docs/assets/v02_avatar_studio.png` | Studio avatar editor: draft, preview, approved versions | Reserved | P11 |
| `V03` | `docs/assets/v03_artist_session.png` | Active Artist Session stage with truthful presence & queue | Reserved | P04 |
| `V04` | `docs/assets/v04_listening_livehouse.png`| Listening Room and Live House setlist variants | Reserved | P13 |
| `V05` | `docs/assets/v05_my_world_recovery.png` | My World continuity hub, Moment Capsule, and support recovery | Reserved | P06 / P09 |
| `V06` | `docs/assets/v06_journey_flow.png` | End-to-end user loop composite walkthrough | Reserved | P17 |
| `V07` | `docs/assets/v07_technical_boundary.png`| Security boundary, tenant isolation, and honest limits | Reserved | P15 / P17 |
| `V08` | `docs/assets/v08_test_setup.png` | Automated test runner execution & verification output | Reserved | P17 |

---

## 4. Application Demonstration Slots (APP01–APP03)

| Slot ID | Purpose | URL / Reference | Status |
|---|---|---|---|
| `APP01` | Public demonstration link | Unassigned (requires explicit deployment decision) | Unimplemented / Reserved |
| `APP02` | Guided walkthrough script | `docs/DEMO_WALKTHROUGH.md` | Scheduled in P17 |
| `APP03` | Studio operator preview entry | Local route `/studio` | Scheduled in P11–P12 |
