# ChargeOne Energy Network OS — System Architecture

Enterprise CPO Operations Command Center, OCPI/OCPP Roaming Gateway, Charger Telemetry Mesh, and Financial Clearinghouse Ledger.

---

## 1. High-Level Architecture

```mermaid
flowchart TB
    subgraph ClientTier["Client Tier (Presentation & Operations)"]
        UI["React 19 + Vite + Tailwind CSS"]
        Screens["15 Command Center Screens\n(Overview, Telemetry, Roaming, Settlements)"]
        Modals["Global Modals & Drawers\n(⌘K Command Palette, Station Provisioning, AI Drawer)"]
        MobileApp["Driver Mobile App PWA View\n(QR Scan, Live SoC, Route Maps)"]
        UI --> Screens
        UI --> Modals
        UI --> MobileApp
    end

    subgraph GatewayTier["API Gateway & Web Tier (Node.js + Express)"]
        Server["Express REST API (Port 5173)"]
        CORS["CORS & Origin Security"]
        Headers["Security Headers (nosniff, SAMEORIGIN, XSS)"]
        StaticServe["SPA Static Production Bundler (frontend/dist)"]
        Proxy["Vite Proxy Bridge (/api -> :5173)"]
        
        Proxy --> Server
        Server --> CORS
        Server --> Headers
        Server --> StaticServe
    end

    subgraph ServiceTier["Backend API Endpoints"]
        HealthEP["GET /api/health\n(Status, Model Capabilities, Features)"]
        ChatEP["POST /api/chat\n(Multi-Role AI Copilot & Grounding)"]
        GroundEP["POST /api/stations/ground\n(Geospatial Station Locator)"]
        
        Server --> HealthEP
        Server --> ChatEP
        Server --> GroundEP
    end

    subgraph IntelligenceTier["Google Gemini Multi-Model Intelligence Tier"]
        GenAI["@google/genai SDK (User-Agent: aistudio-build)"]
        
        subgraph ModelRouting["Dynamic Model Router by Role"]
            MapsAgent["Role: 'maps'\ngemini-3.5-flash + Google Maps Tool\n(Real-world EV stations, navigation, amenities)"]
            FastTriage["Role: 'fast'\ngemini-3.1-flash-lite\n(OCPP error code diagnostics & rapid field dispatch)"]
            ComplexAuditor["Role: 'complex'\ngemini-3.1-pro-preview (fallback: gemini-3.8-flash)\n(Tariff engineering, TOU arbitrage, OCPI clearing)"]
            GeneralCopilot["Role: 'general'\ngemini-3.5-flash\n(CPO operator assistance & workflow execution)"]
        end
        
        ChatEP --> GenAI
        GroundEP --> GenAI
        GenAI --> ModelRouting
    end

    subgraph DomainEngines["Core Domain Engines & Telemetry Subsystems"]
        OCPP["OCPP 2.0.1 / 1.6J Charger Gateway\n(Thermal, 800V/400V, Coolant Pressure, Bus Voltage)"]
        OCPI["OCPI 2.2.1 Roaming Gateway\n(Locations, Tariffs, Sessions, CDRs, Tokens)"]
        BillingEngine["Tariff & Financial Clearinghouse\n(Gross billing, platform fees, TDS, GST, Bank reconciliation)"]
        FleetEngine["Fleet Monitoring & Policy Engine\n(Charge window, SoC thresholds, driver allocation)"]
        AuditEngine["Security & Packet Audit Trail\n(Trace IDs, protocol logs, security events)"]
    end

    ClientTier <-->|REST / JSON| GatewayTier
    GatewayTier <--> DomainEngines
```

---

## 2. Architectural Layers & Responsibilities

### Layer 1: Client & Presentation Tier (`frontend/`)
Built with **React 19**, **Vite**, and **Tailwind CSS**, providing a high-performance operator cockpit:
- **Operations Dashboard (`OverviewDashboard.tsx`)**: Real-time network throughput, active power (MW), active charging sessions, revenue run-rate, and regional grid load metrics.
- **Hardware Telemetry Mesh (`LiveTelemetryHealth.tsx`)**: Sub-second component health monitoring (power module temperatures, gun A/B thermals, phase voltages L1/L2/L3, coolant pump RPM, isolation resistance in MΩ).
- **Session Audit Dossier (`SessionAuditDossier.tsx`)**: Granular Charge Detail Record (CDR) auditing, SoC curves, kWh delivery verification, and dispute resolution.
- **Inter-CPO Roaming Center (`IntegrationCenter.tsx`)**: OCPI 2.2.1 sync status with partner networks (Tata Power EZ, Shell Recharge, Zeon, Tesla Supercharger network).
- **Financial Clearinghouse (`FinancialSettlements.tsx`)**: Multi-party settlement reconciliation, TDS, platform commission splits, GST compliance, and net payouts.
- **Driver Mobile Experience (`DriverMobileApp.tsx`)**: Emulated mobile PWA for EV drivers (station search, connector reservation, QR scan to charge, live SoC battery animation).
- **Global Command Interfaces**:
  - `⌘K / Ctrl+K`: `CommandPaletteModal.tsx` for instant screen switching and session lookup.
  - `⌘J / Ctrl+J`: `AiMapsAssistantDrawer.tsx` for interactive AI navigation and diagnostics.

---

### Layer 2: API Gateway & Static Server (`backend/`)
Implemented in **Express + TypeScript** (`backend/server.ts`):
- **Single-Port Production Deployment**: Automatically detects `frontend/dist`. When present, Express serves the production React bundle and routes all unknown paths to `index.html` (SPA fallback).
- **CORS & Origin Security**: Controlled via `CLIENT_ORIGIN` (defaults to `http://localhost:3000` during separate dev server operation).
- **Security Headers**: Injects `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection`, and `Referrer-Policy: strict-origin-when-cross-origin`.
- **Unified Environment Architecture**: Centrally managed via root `.env` (with `.env.local` override support), shared seamlessly between frontend Vite bundler, backend Express server, and Prisma ORM.

---

### Layer 3: AI Intelligence & Google Maps Grounding Tier
Powered by the official `@google/genai` SDK with **dynamic role-based model routing**:

| Role / Intent | Target Model | Specialized Function | Tools Attached |
| :--- | :--- | :--- | :--- |
| **`maps`** *(Geospatial Navigation)* | `gemini-3.5-flash` | Locates real EV charging plazas, connector types (CCS2, Type 2, NACS), real addresses, and adjacent amenities (cafes, restrooms, hotels). | `googleMaps: {}` with user lat/lng retrieval bias. |
| **`fast`** *(Rapid Error Triage)* | `gemini-3.1-flash-lite` | Instant diagnosis (<150 words) for field technicians on OCPP error codes (`GroundFailure`, `PowerMeterFailure`, `HighTemperature`). | None (low latency optimized). |
| **`complex`** *(Tariff & Clearing Audit)* | `gemini-3.1-pro-preview`<br>*(fallback to `gemini-3.8-flash`)* | High-order mathematical reasoning for Time-of-Use (TOU) arbitrage, demand penalty mitigation, and clearinghouse settlement disputes. | None (deep reasoning mode). |
| **`general`** *(CPO Co-Pilot)* | `gemini-3.5-flash` | General fleet operational guidance, session overrides, and station troubleshooting. | Conversational context. |

---

## 3. Protocol Integration Architecture

```mermaid
sequenceDiagram
    autonumber
    participant EV as EV Vehicle / Driver App
    participant Charger as Hardware Charger (EVSE)
    participant Gateway as ChargeOne Gateway (OCPP/OCPI)
    participant Core as Ledger & Billing Engine
    participant Partner as Roaming Partner (eMSP/CPO)
    participant AI as Gemini Multi-Model AI

    Note over EV,Charger: 1. OCPP 2.0.1 / ISO 15118 Charging Lifecycle
    EV->>Charger: Plug in Connector (CCS2 / Type 2 / NACS)
    Charger->>Gateway: Authorize.req (RFID Token / eMAID)
    Gateway-->>Charger: Authorize.conf (Accepted)
    Charger->>Gateway: TransactionEvent[Started] (Meter: 0 kWh, SoC: 18%)
    
    loop Every 10 Seconds (Telemetry Stream)
        Charger->>Gateway: TransactionEvent[Updated] (Volts, Amps, Gun Temp, Coolant Bar)
    end

    Note over Gateway,AI: 2. Real-Time Telemetry Anomaly Detection
    alt Thermal Warning (>85°C) or Ground Failure
        Gateway->>AI: POST /api/chat (role: 'fast', telemetry anomaly payload)
        AI-->>Gateway: Rapid Triage: De-rate to 60 kW, dispatch technician
    end

    Note over EV,Charger: 3. Session Completion & Settlement
    EV->>Charger: Stop Charging (SoC: 80%)
    Charger->>Gateway: TransactionEvent[Ended] (Total Energy: 54.2 kWh)
    
    Gateway->>Core: Ingest CDR & Calculate Dynamic Tariff
    Core->>Partner: OCPI 2.2.1 POST /cdrs (Roaming Settlement Push)
    Partner-->>Core: 200 OK (CDR Acknowledged)
    Core->>Core: Update Clearinghouse Ledger (Platform fee, TDS, GST)
```

---

## 4. Directory & File Mapping

```
chargeone-energy-network-os/
│
├── .env                              # Root monorepo configuration (port, api keys, proxy)
├── .env.example                      # Root environment template
├── package.json                      # Monorepo orchestrator (npm workspaces: frontend, backend)
├── tsconfig.json                     # TypeScript Solution configuration
├── ARCHITECTURE.md                   # System Architecture Documentation
│
├── backend/                          # Express + TypeScript API Server
│   ├── .env                          # Backend runtime environment configuration
│   ├── .env.example                  # Backend environment template
│   ├── package.json                  # Backend dependencies (@google/genai, express, cors, dotenv)
│   ├── tsconfig.json                 # Backend TypeScript compiler settings (NodeNext)
│   └── server.ts                     # Core API server:
│                                     #   - /api/health
│                                     #   - /api/chat (Multi-role Gemini routing + Maps)
│                                     #   - /api/stations/ground (Google Maps Grounding)
│                                     #   - Static SPA delivery (frontend/dist fallback)
│
└── frontend/                         # React 19 Client Application
    ├── .env                          # Frontend environment configuration (VITE_API_URL)
    ├── vite.config.ts                # Vite bundler config with /api reverse proxy to :5173
    ├── package.json                  # Frontend dependencies (lucide-react, react, tailwindcss)
    ├── tsconfig.json                 # Frontend TypeScript compiler settings (ESNext)
    ├── index.html                    # Single Page App shell
    └── src/
        ├── main.tsx                  # React entry point
        ├── App.tsx                   # Central state machine (screen router, modals, hotkeys)
        ├── index.css                 # Design system tokens and custom utilities
        ├── types/
        │   └── index.ts              # Data contracts: ChargerNode, ActiveSession,
        │                             # RoamingPartner, SettlementBatch, ChatbotRole
        ├── data/
        │   └── mockData.ts           # Seed dataset: 400V/800V chargers, sessions, settlements
        └── components/
            ├── Header.tsx            # Network status, live alerts, quick action triggers
            ├── Sidebar.tsx           # Category navigation (Ops, Roaming, Finance, Field)
            ├── modals/
            │   ├── AiMapsAssistantDrawer.tsx # Drawer for Gemini Maps grounding & triage
            │   ├── CommandPaletteModal.tsx   # ⌘K instant search & navigation
            │   ├── ProvisionStationModal.tsx # Station onboarding & OCPP credentialing
            │   └── ToastNotification.tsx     # Operator feedback toast
            └── screens/
                ├── OverviewDashboard.tsx     # Executive metrics, capacity & live sessions
                ├── LiveTelemetryHealth.tsx   # Charger physical health & thermal telemetry
                ├── StationsChargersList.tsx  # Station registry, ports, and power status
                ├── ChargingSessionsList.tsx  # Active & completed session log
                ├── SessionAuditDossier.tsx   # Deep CDR analysis & compliance audit
                ├── MapsIntelligenceView.tsx  # Geospatial charger map & route planning
                ├── IntegrationCenter.tsx     # OCPI roaming partner telemetry
                ├── FinancialSettlements.tsx  # Clearinghouse reconciliation & payouts
                ├── TariffsPricingView.tsx    # Dynamic TOU tariff management
                ├── RevenueFinancialsView.tsx # Profitability & grid energy cost modeling
                ├── FleetMonitoringView.tsx   # Fleet vehicle rules & SoC policies
                ├── AuditLogsView.tsx         # Network trace logs & security events
                └── DriverMobileApp.tsx       # Driver mobile interface emulator
```

---

## 5. Subsystem Specifications

### A. Charger Telemetry Mesh & Power Distribution
- **Dual Architecture Support**: Operates both standard `400V ARCH` (passenger EVs) and ultra-fast `800V ARCH` (high-power commercial & depot hubs up to 360 kW).
- **Physical Sensor Monitoring**:
  - Bus voltage ($V$) and delivery current ($A$) per port.
  - Phase voltages ($L_1, L_2, L_3$).
  - Temperature tracking: Bay ambient, Cable Gun A, Cable Gun B, and Inverter Power Modules.
  - Coolant loop pressure (bar), Pump RPM, and Electrical Isolation Resistance ($M\Omega$).

### B. OCPI 2.2.1 Inter-CPO Roaming Gateway
- **Modular Sync Architecture**:
  - **`locations`**: Synchronizes station availability, connector specs, and tariff links.
  - **`tariffs`**: Ingests real-time variable pricing schemas from partner networks.
  - **`sessions`**: Synchronous active session status push to eMSPs.
  - **`cdrs`**: Cryptographically signed charging detail records pushed to clearinghouses.
  - **`tokens`**: Whitelist authorization for roaming RFID / eMAID tokens.

### C. Financial Clearinghouse & Settlement Engine
- **Settlement Math Pipeline**:
  $$\text{Gross Billing} = \sum (\text{Energy Delivered} \times \text{TOU Rate}) + \text{Idle Fees}$$
  $$\text{Net Payable} = \text{Gross} - \text{Platform Fee} - \text{Gateway Surcharge} - \text{TDS (Tax)} \pm \text{Adjustments}$$
- **Dispute Reconciliation**: Supports disputing anomalous sessions (e.g., negative energy readings or mid-session meter drops) with automated adjustment notes and batch re-calculation.

---

## 6. Security & Deployment Architecture

1. **API Key Isolation**: `GEMINI_API_KEY` is strictly held backend-side in `backend/server.ts`. The frontend never possesses raw secret credentials, communicating exclusively through the secured `/api/chat` and `/api/stations/ground` gateway proxies.
2. **Reverse Proxying**: In local development, the Vite dev server on port `3000` proxies all `/api/*` traffic transparently to the Express server on port `5173`.
3. **Production Standalone Hosting**: Executing `npm run build` generates optimized assets into `frontend/dist`. The backend serves these static files directly, eliminating the need for a separate NGINX reverse proxy for standard single-instance container deployments.
