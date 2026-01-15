# Deployment Guide

This guide covers deploying the Stay Stories app (frontend + backend) to production.

## Quick Overview

- **Frontend**: Static build (Vite) → can deploy to any static host (Netlify, Vercel, GitHub Pages, etc.)
- **Backend**: Node.js Express server → requires a host that supports Node.js (Railway, Render, Heroku, AWS EC2, etc.)

Both can be containerized with Docker for easier deployment.

---

## Option 1: Deploy Backend & Frontend to Separate Hosts

### Backend (Express server) → Railway or Render

**Railway.app:**
1. Create a Railway account and connect your GitHub repo.
2. Create a new service → select your repo.
3. Set the start command: `cd server && npm install && npm run build && npm start`
4. Add environment variables: `GEMINI_API_KEY`, `NODE_ENV=production`
5. Deploy automatically on git push.

**Render.com:**
1. Create a Web Service → connect your repo.
2. Set build command: `cd server && npm install && npm run build`
3. Set start command: `node dist/index.js`
4. Add environment variables: `GEMINI_API_KEY`, `NODE_ENV=production`
5. Deploy.

### Frontend (Vite build) → Vercel or Netlify

**Vercel:**
1. Create a Vercel account → import your repo.
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy.
5. Update the frontend's API base URL (if backend is on a different domain):
   - In `services/geminiService.ts`, replace `/api/` calls with your backend URL (e.g., `https://your-backend.railway.app/api/`).

**Netlify:**
1. Create a Netlify account → connect your repo.
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy.
5. Same as Vercel: update API URLs if needed.

---

## Option 2: Deploy Both with Docker to a Single Host

If you prefer a unified deployment, containerize and push both to a registry (Docker Hub, GitHub Packages, or AWS ECR), then deploy to:
- **AWS ECS** (Elastic Container Service)
- **Google Cloud Run**
- **DigitalOcean App Platform**
- **Railway** (supports Docker Compose)
- **Render** (supports Docker)

**Example: Railway with Docker Compose**
1. Push your repo to GitHub.
2. Create a Railway service → connect your repo.
3. Ensure a `Dockerfile` and `docker-compose.yml` exist (they do in this project).
4. Railway will auto-detect and build using `docker-compose.yml`.
5. Set `GEMINI_API_KEY` in Railway's environment.
6. Deploy.

---

## Production Checklist ✅

- [ ] Set `GEMINI_API_KEY` in production environment variables (never commit to `.env` files).
- [ ] Set `NODE_ENV=production` on the backend.
- [ ] Update frontend API base URL if backend is on a different domain (in `services/geminiService.ts`).
- [ ] Enable HTTPS/SSL (most hosts do this automatically).
- [ ] Test the `/api/health` endpoint to verify the backend is running.
- [ ] Set up rate limiting on production (already enabled in the server; adjust `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` as needed).
- [ ] Monitor logs and set up error tracking (optional: add Sentry).
- [ ] Plan for scaling (caching, CDN for frontend, load balancing for backend if needed).

---

## Env Vars Reference

**Backend (server):**
- `GEMINI_API_KEY` — Your Google Gemini API key (required for real AI).
- `NODE_ENV` — Set to `production` in production.
- `PORT` — Server port (default 4000).
- `RATE_LIMIT_WINDOW_MS` — Rate limit window in ms (default 60000 = 1 min).
- `RATE_LIMIT_MAX` — Max requests per window per IP (default 30).
- `USE_MOCK_AI` — Set to `true` to use mock AI responses (dev/test only).

**Frontend:**
- No special vars needed; the frontend uses the backend's `/api/` endpoints (or your backend domain if deployed separately).

---

## Troubleshooting

**Backend returns 500 on `/api/ai/chat`:**
- Check if `GEMINI_API_KEY` is set.
- Verify the key is valid (test with a quick script).
- Check server logs for errors.

**Frontend can't reach backend:**
- Ensure backend is running and accessible from the frontend's network.
- Check CORS settings (server allows all origins by default; update if needed).
- If on different domains, update the API base URL in `services/geminiService.ts`.

**Rate limiting too strict:**
- Adjust `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX` env vars.

---

## Support

For questions or issues with deployment, check the README.md or open an issue on GitHub.
