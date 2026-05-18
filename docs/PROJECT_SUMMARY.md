# BI Dashboard | Executive Project Summary

A brief technical reference summarizing the tech stack, endpoints, and specifications of the **BI Dashboard** project.

---

## 📊 Technical Stack Specification

| Tier | Component | Selection | Details |
| :--- | :--- | :--- | :--- |
| **Frontend** | Framework | React 18 (Vite) | Single page router, custom hooks |
| **Styling** | Layout | Tailwind CSS | Dark obsidian glass, custom HSL gradients |
| **Charts** | Visuals | Recharts | Smooth area tracks, donut distributions, dual lines |
| **Backend** | Framework | Node.js + Express 4 | Modular routers, memory upload buffers |
| **Security** | Auth | JWT + Bcryptjs | Signed Authorization headers, hashed tables |
| **Database** | Store | PostgreSQL | Relational schema, indexes, transactions |

---

## 🔒 Security & JWT Policies

- All secure api routes under `/api/kpis`, `/api/dashboard`, `/api/data`, and `/api/reports` are protected by a JWT bearer validation middleware.
- Client stores the token securely in the browser's `localStorage` as `bi_token`.
- Passwords are encrypted before database insertion using `bcryptjs` with a work salt factor of 10.

---

## 📂 Core Endpoints Grid

### Authentication
- `POST /api/auth/register`: Create a new user profile.
- `POST /api/auth/login`: Validate credentials and sign a 7-day token.
- `GET /api/auth/me`: Resolve authenticated session and fetch logged-in profile.

### Dashboards & Analytics
- `GET /api/dashboard/analytics`: Retrieves sums/averages for KPIs, daily trend arrays, segment arrays, and categories distributions.
- `GET /api/dashboard/datasets`: Lists historically uploaded spreadsheet datasets.

### KPI Monitors
- `GET /api/kpis`: Lists all defined KPI target tracks.
- `POST /api/kpis`: Installs a new KPI target monitor (evaluates performance status).
- `PUT /api/kpis/:id`: Adjusts target and actual values (re-evaluates status).
- `DELETE /api/kpis/:id`: Removes KPI monitor from the tracking system.

### Exports & Imports
- `POST /api/data/import`: Multi-part endpoint accepting CSV or JSON files.
- `GET /api/reports/export`: Dynamic data downloader (streams CSV tables or JSON arrays matching query filters).
