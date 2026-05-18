# BI Dashboard | Premium Business Intelligence Engine

BI Dashboard is a state-of-the-art, full-stack Business Intelligence and performance tracking web application. Crafted with a premium obsidian-glass design system, it delivers highly responsive metric charts, Key Performance Indicator (KPI) thresholds monitoring, dynamic spreadsheet imports, custom report extraction, and strict JWT-authenticated profile controls.

---

## 🏛️ System Architecture

```plain
bi-dashboard/
├── client/              # React.js Frontend (Vite + Tailwind CSS + Recharts)
│   ├── src/
│   │   ├── components/  # Chart UI elements, KPI trackers, layout wrappers
│   │   ├── pages/       # Dashboard, Analytics, KPIs, Imports, Reports, Auth
│   │   ├── services/    # API Layer (Axios instance)
│   │   └── context/     # AuthContext (JWT handling, session status)
├── server/              # Node.js + Express Backend
│   ├── routes/          # API Routers (Auth, KPIs, Imports, Reports)
│   ├── middleware/      # JWT guards, Multer buffer handlers
│   └── config/          # PostgreSQL database connection & Demo Backup store
└── database/            # Database schema blueprints & rich mock datasets
```

---

## ⚡ Main Features

1. **Custom Interactive Dashboards**: Powered by `Recharts` rendering area charts, segment comparisons, category donut structures, and historical trend matrices.
2. **KPI Threshold Alerting**: Define warning and critical alert values for business metrics. Status badges change dynamically (`green` for On Track, `amber` for Warning, `red` for Critical) comparing actuals to target parameters.
3. **Dynamic Excel/CSV/JSON Imports**: High-performance pure-React drag-and-drop uploads panel. Parsed data points populate metrics engines in real-time.
4. **Customizable Report Downloads**: Select date scopes, segments, or category sectors to extract files as CSV tables or JSON spreadsheets.
5. **Zero-Configuration Demo Mode**: Auto-detects database connectivity status. If PostgreSQL is not detected, it gracefully logs a notice and switches into **Demo Mode**, operating a robust in-memory datastore so the application works 100% out of the box.

---

## 🚀 Step-by-Step Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (Optional - falls back to Demo Mode automatically!)

### 1. Extract Project Structure & Install
From the project root directory, run the automated installation script:
```bash
npm run install:all
```
This single command installs all client, server, and workspace-management dependencies.

### 2. Configure Database (Optional)
If you want to use a live PostgreSQL instance, update `server/.env` with your connection string:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/bi_dashboard
```
Run the setup script to initialize and seed tables:
```bash
cd server && npm run setup-db
```

### 3. Launch Development Server
Start the frontend and backend concurrently:
```bash
npm run dev
```
- **Frontend Panel**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`

---

## 🔑 Default Credentials

- **Email**: `demo@bidashboard.com`
- **Password**: `password123`
*Or enter any valid email and password (min 6 characters) to register automatically in Demo Mode!*
