# Production Deployment Guide | BI Dashboard

This document details the configuration instructions for deploying the **BI Dashboard** project to production servers.

---

## 🚀 Recommended Approach: Unified Service on Render (FREE)

Render allows you to host the backend server as a Web Service and compile the frontend React bundle on the same server, saving you from setting up separate frontend and backend instances!

### Step 1: Create a PostgreSQL Instance
1. Log into your Render dashboard.
2. Click **New** → **PostgreSQL**.
3. Name your database (e.g. `bi-dashboard-db`), select the **Free** tier, and click **Create Database**.
4. Once active, copy the **Internal Database URL** or **External Database URL**.

### Step 2: Establish a Web Service
1. Click **New** → **Web Service**.
2. Select your connected GitHub/GitLab repository.
3. Configure the following parameters:
   - **Name**: `bi-insight-dashboard`
   - **Environment**: `Node`
   - **Region**: Select region closest to you
   - **Branch**: `main`
   - **Build Command**: `cd client && npm install && npm run build && cd ../server && npm install`
   - **Start Command**: `cd server && npm start`
4. Choose the **Free** instance type.

### Step 3: Add Environment Variables
Click **Advanced** to add variables matching `server/.env`:
- `PORT`: `5000` (Render overrides this automatically, but good practice)
- `NODE_ENV`: `production`
- `JWT_SECRET`: `your_secure_random_hash_key`
- `DATABASE_URL`: *Paste the External Database URL copied in Step 1*

### Step 4: Deploy 🎉
Click **Create Web Service**. Render will:
1. Pull your code.
2. Build the React frontend into `client/dist`.
3. Install Express backend dependencies.
4. Launch the Express server at `https://bi-dashboard-xxx.onrender.com`.

---

## ⚡ Alternative Approach: Split Deployment (Vercel + Railway)

If you prefer hosting the React static app on Vercel's global CDN and the Express API on Railway:

### 1. Frontend (Vercel)
1. Import your repository into Vercel.
2. Set the **Framework Preset** to **Vite**.
3. Set **Root Directory** to `client`.
4. Configure an Environment Variable on Vercel:
   - `VITE_API_URL`: `https://your-railway-api-url.up.railway.app`
5. Click **Deploy**.

### 2. Backend (Railway)
1. Create a PostgreSQL service on Railway.
2. Import your repository as a new service, pointing the Root Directory to `server`.
3. Reference Railway's automatic `DATABASE_URL` binding.
4. Set the `JWT_SECRET` variable.
5. Click **Deploy**.
