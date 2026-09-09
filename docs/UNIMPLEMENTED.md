# VieWorld Unimplemented Scope & Constitutional Boundaries

This document formalizes all architectural boundaries, deferred features, and constitutional hard exclusions for the **VieWorld Prototype (v0.1.0)**.

---

## 1. Constitutional Hard Exclusions (Non-Goals)

Per [`docs/CONSTITUTION.md`](file:///c:/Users/VTD/Desktop/Vieworld/docs/CONSTITUTION.md) §4, the following capabilities are strictly forbidden from implementation within this prototype:

| Exclusion Category | Rationale & Architectural Rule | Current Prototype Equivalent |
|---|---|---|
| **Real Financial Transactions** | No real bank accounts, credit card numbers, Stripe/PayPal integrations, or payment gateways. Prevents financial liability and PCI DSS compliance scope. | Simulated 1-click checkout with mock token balances, deterministic voucher codes, and double-click idempotency tokens (`src/context/ShopContext.tsx`). |
| **Production Authentication & SSO** | No remote OAuth2, OpenID Connect, biometric scanners, or persistent passwords. Avoids credential storage vulnerability and PII liability. | Local tenant switcher and in-memory simulated user session (`vie-fan-01`, `mfan-user-01`, `fanme-user-01`). |
| **Biometric & Facial Cloning** | No webcam facial landmark capture, voice replication models, or deepfake generative video generation. Safeguards artist likeness rights. | 2D/SVG modular avatar part manifests (`AvatarStudioView`) and static synthetic SVG asset representations. |
| **Generative Persona Impersonation** | No autonomous generative LLMs allowed to pose as living or deceased artists, generate simulated personal direct messages, or fabricate intimacy. | Bounded World Guide (`WorldGuidePanel`) restricted to verified factual platform deep links; system notification inbox strictly distinguishes administrative announcements from automated events. |
| **Live Device Sensor Permissions** | No requests for browser `navigator.mediaDevices.getUserMedia` (webcam/microphone), GPS geolocation, or background notifications. | Truthful stage presence indicators displaying predefined simulator states (`Live`, `Replay`, `Offline`, `Disconnected`). |
| **Cryptocurrency & Web3 Assets** | No blockchain smart contracts, NFT minting, crypto wallets, gas fees, or speculative secondary marketplaces. | Non-transferable, local-first Moment Capsules and verified membership badge tiers stored within browser local storage. |
| **Autoplay Audio & Involuntary Sound** | No background sound or autoplay upon page navigation or route change. Prevents hearing discomfort and uninvited data consumption. | `SilentMediaPlaceholder` and user-initiated play/pause toggles with muted-by-default audio channels. |

---

## 2. Deferred Expansion Packets

The following expansion packets are defined in the master roadmap but remain **LOCKED** pending formal stakeholder authorization:

### Expansion Packet X01 — Multi-User Live Cluster
- **Status**: LOCKED (Blocked pending authorization)
- **Scope**:
  - Centralized real-time server (Node.js/Go/Elixir WebSocket cluster).
  - Production database persistence (PostgreSQL / Redis session store).
  - Remote tenant authentication and JWT session management.
  - Multi-user chat broadcast with rate limiting and automated spam filters.
  - Concurrent user presence counters backed by real distributed node metrics.

### Expansion Packet X02 — Live AI Contextual Assistant
- **Status**: LOCKED (Blocked pending authorization)
- **Scope**:
  - External LLM API integration (e.g., Gemini API, OpenAI API).
  - Read-only tool execution over platform state (retrieval-augmented generation).
  - Strict monthly spend caps and per-user token quotas.
  - System prompt guardrails prohibiting artist persona impersonation.
  - Content moderation filter ensuring responses remain strictly educational and platform-focused.

### Expansion Packet X03 — Real Artist WebRTC Video Ingest
- **Status**: LOCKED (Blocked pending authorization)
- **Scope**:
  - WebRTC media server integration (e.g., LiveKit, Janus, MediaSoup).
  - Studio operator video capture console with explicit hardware consent dialogs.
  - Adaptive bitrate streaming (HLS/DASH fallback) for high-scale audience fanout.
  - Ultra-low latency audio sync for real-time artist Q&A.

---

## 3. Application Demonstration Slots (APP01–APP03)

| Slot ID | Destination / Identifier | Implementation Status | Notes |
|---|---|---|---|
| **APP01** | Public Demonstration URL | **Unimplemented / Reserved** | A public deployment link (e.g. Vercel, Netlify, Cloudflare Pages) was **NOT** authorized during baseline execution. The prototype remains strictly a local developer build executed via `npm run dev` on `http://localhost:5173`. Any cloud deployment requires an explicit owner decision and infrastructure provisioning. |
| **APP02** | Guided Walkthrough Document | **Completed** | Delivered in [`docs/DEMO_WALKTHROUGH.md`](file:///c:/Users/VTD/Desktop/Vieworld/docs/DEMO_WALKTHROUGH.md) with comprehensive step-by-step verification flows. |
| **APP03** | Studio Operator Preview Entry | **Completed** | Accessible at local route `/studio` with sub-routes `/studio/avatar` and `/studio/operator`. |

---

## 4. Architectural Boundaries Summary

```mermaid
graph TD
    subgraph Fully Implemented in v0.1.0 (Local-First)
        A[React 19 + Vite Frontend]
        B[Local-First Reducer State Engine]
        C[Namespaced LocalStorage Persistence]
        D[Truthful Stage Simulation]
        E[Idempotent VieSHOP & Fulfilment]
        F[Decoupled Reconciliation & Support]
        G[Bounded Rule-Based World Guide]
        H[Avatar Studio Asset Lifecycle]
        I[Multi-Tenant Isolation]
    end

    subgraph Strictly Excluded & Unimplemented
        J[Live WebRTC Ingest / Camera]
        K[Production Payment Gateway / Stripe]
        L[External OAuth / Biometric Auth]
        M[Generative Persona LLMs]
        N[Public Cloud Deployment APP01]
        O[Distributed WebSockets Server]
        P[Web3 / Crypto Wallets]
    end

    A -.->|Simulated Action| B
    B --> C
    A -.-x|FORBIDDEN| J
    A -.-x|FORBIDDEN| K
    A -.-x|FORBIDDEN| L
    A -.-x|FORBIDDEN| M
    A -.-x|PENDING APPROVAL| N
    A -.-x|DEFERRED X01| O
    A -.-x|FORBIDDEN| P
```

---

## 5. Next Steps for Stakeholders

If the platform owner wishes to progress beyond the baseline prototype:
1. Review the baseline implementation using [`docs/DEMO_WALKTHROUGH.md`](file:///c:/Users/VTD/Desktop/Vieworld/docs/DEMO_WALKTHROUGH.md).
2. Authorize or reject deployment of **APP01** to a staging cloud environment.
3. Review potential prioritization of Expansion Packets **X01**, **X02**, and **X03**.
