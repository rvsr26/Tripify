# Tripify Enterprise — Deployment Guide

## Architecture (Production)

```
Browser / Flutter App
        ↓ HTTPS
Vercel (Frontend — React SPA)
        ↓ HTTPS
Railway (Backend — Node.js + Socket.io)
        ↓
MongoDB Atlas  |  Cloudinary  |  Google Gemini  |  Stripe
```

---

## Why This Split?

| Concern | Why |
|---------|-----|
| Frontend → Vercel | Global CDN, instant deploys, zero config |
| Backend → Railway | WebSockets (Socket.io) require a persistent server, which Vercel serverless cannot provide |

---

## Step 1 — Deploy Backend to Railway

### 1.1 Create Railway Account
Go to [railway.app](https://railway.app) and sign up with GitHub.

### 1.2 Create New Project
```
Dashboard → New Project → Deploy from GitHub repo → select Tripify → backend/
```

Railway will auto-detect the `railway.json` and `Procfile`.

### 1.3 Set Environment Variables
In Railway project → Settings → Variables, add all variables from `backend/.env.example`:

**Required:**
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
GOOGLE_CLIENT_ID=...
GEMINI_API_KEY=...
NODE_ENV=production
```

**For CORS (add your Vercel URL after Step 2):**
```
ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:5173
```

### 1.4 Get Your Railway URL
After deploy: Settings → Networking → Public Domain
Copy the URL, e.g. `https://tripify-backend-production.railway.app`

---

## Step 2 — Deploy Frontend to Vercel

### 2.1 Connect to Vercel
```
vercel.com/dashboard → Import Project → select Tripify → frontend/
```

### 2.2 Set Environment Variables
In Vercel Project → Settings → Environment Variables:
```
VITE_API_URL=https://tripify-backend-production.railway.app/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 2.3 Build Settings
```
Framework Preset: Vite
Root Directory:   frontend
Build Command:    npm run build
Output Directory: dist
```

### 2.4 Add Vercel URL to Railway CORS
Go back to Railway, update `ALLOWED_ORIGINS`:
```
ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:5173
```

---

## Step 3 — Configure Google OAuth

In [Google Cloud Console](https://console.cloud.google.com):
1. APIs & Services → Credentials → OAuth 2.0 Client
2. Add Authorized JavaScript origins:
   - `https://your-app.vercel.app`
   - `http://localhost:5173`
3. Add Authorized redirect URIs:
   - `https://your-app.vercel.app`

---

## Step 4 — Verify Deployment

```bash
# Check backend health
curl https://tripify-backend-production.railway.app/api/health

# Check MCP server
curl https://tripify-backend-production.railway.app/api/mcp/info

# Check environment
curl https://tripify-backend-production.railway.app/api/diag
```

Expected responses:
```json
{"status":"ok","env":"production"}
{"name":"Tripify Enterprise MCP Server","version":"1.0.0","tools":23,...}
{"MONGO_URI":"✅ DEFINED","JWT_SECRET":"✅ DEFINED","GEMINI_API_KEY":"✅ DEFINED",...}
```

---

## Step 5 — Test MCP with MCP Inspector

Install and run:
```bash
npx @modelcontextprotocol/inspector
```

In the Inspector:
1. Transport: StreamableHTTP
2. URL: `https://tripify-backend-production.railway.app/api/mcp`
3. Headers: `Authorization: Bearer <your-jwt-token>`

Click "Connect" → you should see all 23 tools listed.

---

## Local Development

```bash
# Terminal 1 — Backend
cd backend
cp .env.example .env  # fill in your values
npm install
npm run dev           # starts on http://localhost:4000

# Terminal 2 — Frontend  
cd frontend
cp .env.example .env  # set VITE_API_URL=http://localhost:4000/api
npm install
npm run dev           # starts on http://localhost:5173
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | JWT signing secret (32+ chars) |
| `JWT_REFRESH_SECRET` | ✅ | Refresh token secret (different from above) |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth Client ID |
| `GEMINI_API_KEY` | ✅ | Google AI Studio API key |
| `CLOUDINARY_CLOUD_NAME` | ⚠️ | Required for image uploads |
| `CLOUDINARY_API_KEY` | ⚠️ | Required for image uploads |
| `CLOUDINARY_API_SECRET` | ⚠️ | Required for image uploads |
| `STRIPE_SECRET_KEY` | ⚠️ | Required for payments |
| `ALLOWED_ORIGINS` | ✅ (prod) | Comma-separated allowed CORS origins |
| `AI_RATE_LIMIT` | Optional | Max AI calls per user per hour (default: 30) |

---

## Socket.io Verification

After deploying to Railway, test real-time:
```javascript
// In browser console on your Vercel app
const io = require('socket.io-client');
const socket = io('https://tripify-backend-production.railway.app');
socket.on('connect', () => console.log('✅ Socket.io connected!'));
```

---

## Flutter Mobile Configuration

Update `mobile_flutter/lib/config/api_config.dart`:
```dart
const String apiBaseUrl = 'https://tripify-backend-production.railway.app/api';
const String socketUrl  = 'https://tripify-backend-production.railway.app';
```
