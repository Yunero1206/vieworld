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

High-fidelity visual vector assets captured and verified for the v0.1.0 prototype. Labeled with DEMO disclaimers, version number, and failure state presentation.

| Slot ID | Destination Path | Description | Status | Verification Packet |
|---|---|---|---|---|
| `V00` | [`docs/assets/v00_cover.svg`](file:///c:/Users/VTD/Desktop/Vieworld/docs/assets/v00_cover.svg) | Product cover / signature hero presentation | **Verified** | P17 |
| `V01` | [`docs/assets/v01_world_model.svg`](file:///c:/Users/VTD/Desktop/Vieworld/docs/assets/v01_world_model.svg) | Relational world model and navigation architecture | **Verified** | P03 / P17 |
| `V02` | [`docs/assets/v02_avatar_studio.svg`](file:///c:/Users/VTD/Desktop/Vieworld/docs/assets/v02_avatar_studio.svg) | Studio avatar editor: draft, preview, approved versions | **Verified** | P11 / P17 |
| `V03` | [`docs/assets/v03_artist_session.svg`](file:///c:/Users/VTD/Desktop/Vieworld/docs/assets/v03_artist_session.svg) | Active Artist Session stage with truthful presence & queue | **Verified** | P04 / P17 |
| `V04` | [`docs/assets/v04_listening_livehouse.svg`](file:///c:/Users/VTD/Desktop/Vieworld/docs/assets/v04_listening_livehouse.svg) | Listening Room and Live House setlist variants | **Verified** | P13 / P17 |
| `V05` | [`docs/assets/v05_my_world_recovery.svg`](file:///c:/Users/VTD/Desktop/Vieworld/docs/assets/v05_my_world_recovery.svg) | My World continuity hub, Moment Capsule, and support recovery | **Verified** | P06 / P09 / P17 |
| `V06` | [`docs/assets/v06_journey_flow.svg`](file:///c:/Users/VTD/Desktop/Vieworld/docs/assets/v06_journey_flow.svg) | End-to-end user loop composite walkthrough | **Verified** | P17 |
| `V07` | [`docs/assets/v07_technical_boundary.svg`](file:///c:/Users/VTD/Desktop/Vieworld/docs/assets/v07_technical_boundary.svg) | Security boundary, tenant isolation, and honest limits (Error Boundary failure state) | **Verified** | P15 / P16 / P17 |
| `V08` | [`docs/assets/v08_test_setup.svg`](file:///c:/Users/VTD/Desktop/Vieworld/docs/assets/v08_test_setup.svg) | Automated test runner execution & verification output (185/185 tests passing) | **Verified** | P17 |

---

## 4. Application Demonstration Slots (APP01–APP03)

| Slot ID | Purpose | URL / Reference | Status |
|---|---|---|---|
| `APP01` | Public demonstration link | Unassigned (pending explicit owner deployment authorization) | **Unimplemented / Reserved** |
| `APP02` | Guided walkthrough script | [`docs/DEMO_WALKTHROUGH.md`](file:///c:/Users/VTD/Desktop/Vieworld/docs/DEMO_WALKTHROUGH.md) | **Completed** |
| `APP03` | Studio operator preview entry | Local route `/studio` (`/studio/avatar`, `/studio/operator`) | **Completed** |
