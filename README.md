<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# ChargeOne Energy Network OS

Enterprise CPO Operations Command Center, OCPI/OCPP Roaming Gateway, Charger Telemetry Mesh, PostgreSQL/Prisma Database, and Financial Clearinghouse Ledger.

---

## Project Structure

```
chargeone-energy-network-os/
├── frontend/                     # React 19 + Vite + Tailwind CSS Client
│   ├── src/                      # Source code
│   │   ├── components/           # Core layout components, modals, and screen views
│   │   │   ├── modals/           # Command Palette, AI Drawer, Station Provisioning
│   │   │   └── screens/          # 13 dedicated CPO command center views
│   │   ├── data/                 # Mock telemetry & station seed data
│   │   ├── types/                # Unified TypeScript type definitions
│   │   ├── App.tsx               # Primary application container & navigation
│   │   ├── main.tsx              # React DOM entrypoint
│   │   └── index.css             # Tailwind CSS design system styles
│   ├── index.html                # Vite HTML entrypoint
│   ├── vite.config.ts            # Vite config (loads root .env & proxies /api)
│   ├── tsconfig.json             # Frontend TypeScript configuration
│   └── package.json              # Frontend dependencies and scripts
│
├── backend/                      # Node.js + Express + Prisma API Server
│   ├── prisma/                   # PostgreSQL ORM Schema and Seeder
│   │   ├── schema.prisma         # Data models (Stations, Chargers, Sessions, Roaming)
│   │   └── seed.ts               # Seed script with real-world station & charger telemetry
│   ├── server.ts                 # Express REST API, CORS & Gemini AI integration
│   ├── db.ts                     # Prisma client & pg connection pool setup
│   ├── prisma.config.ts          # Prisma CLI configuration
│   ├── tsconfig.json             # Backend TypeScript configuration
│   └── package.json              # Backend dependencies and scripts
│
├── .env                          # Unified monorepo environment configuration
├── .env.example                  # Environment configuration template
├── package.json                  # Root npm workspace orchestrator
├── tsconfig.json                 # Root TypeScript solution configuration
├── ARCHITECTURE.md               # Comprehensive system architecture documentation
├── .gitignore                    # Monorepo git ignore rules
└── README.md                     # Project documentation
```

---

## Getting Started

### 1. Install Dependencies
Run from the root directory to install all dependencies for both frontend and backend using npm workspaces:
```bash
npm install
```

### 2. Configure Environment Variables
A single unified `.env` file at the root governs both frontend and backend configurations:
```bash
cp .env.example .env
```

Ensure your `.env` contains your Google Gemini API key and PostgreSQL connection string:
```env
# Server & Client Ports
PORT=5173
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000
VITE_API_URL=http://localhost:5173

# AI & Telemetry
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
APP_URL=http://localhost:5173
DISABLE_HMR=false

# PostgreSQL Database Connection
DATABASE_URL="postgresql://postgres:root@localhost:5432/chargeone?schema=public"
```

### 3. Database Setup (Prisma & PostgreSQL)
Initialize your PostgreSQL database and seed real-world network data directly from the root:
```bash
# Push schema to database
npm run db:push

# Generate Prisma Client
npm run db:generate

# Populate database with seed data
npm run db:seed
```

### 4. Running the Project

#### Run both Frontend & Backend concurrently:
```bash
npm run dev
```

#### Or run independently:
- **Backend API Server** (runs on `http://localhost:5173`):
  ```bash
  npm run dev:backend
  ```

- **Frontend Client** (runs on `http://localhost:3000` with proxy to backend):
  ```bash
  npm run dev:frontend
  ```

### 5. Build for Production
```bash
npm run build
```
This compiles the frontend production bundle to `frontend/dist`. The backend automatically serves this production bundle when accessed in production mode.
