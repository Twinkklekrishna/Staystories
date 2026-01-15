# Quick Start Guide

Welcome to **Stay Stories**! This guide gets you up and running in minutes.

## 🚀 The Fastest Way (Automated Setup)

### Windows (PowerShell)
```powershell
.\setup.ps1
```

This will:
- Check Node.js
- Prompt for API key (or use mock AI)
- Install dependencies
- Show next steps

### macOS/Linux (Bash)
```bash
bash setup.sh  # (coming soon)
```

Or follow **Manual Setup** below.

---

## 🛠️ Manual Setup (5 minutes)

### 1. Prerequisites
- [Node.js 18+](https://nodejs.org/) installed

### 2. Configure Environment
Create `.env.local` at the repo root:

**Option A: With Gemini API Key**
```
GEMINI_API_KEY=AIzaSyD...  # Get from https://ai.google.dev/
PORT=4000
```

**Option B: Without API Key (Mock AI)**
```
USE_MOCK_AI=true
PORT=4000
```

### 3. Install Dependencies
```bash
npm install
cd server && npm install && cd ..
```

### 4. Run the Project

**Terminal 1 (Frontend):**
```bash
npm run dev
```
→ Opens at **http://localhost:3000**

**Terminal 2 (Backend):**
```bash
cd server && npm run dev
```
→ Server at **http://localhost:4000**  
→ API docs at **http://localhost:4000/api-docs** (interactive Swagger UI)

---

## ✅ Quick Verification

1. **Frontend works:** Visit http://localhost:3000 in browser
2. **Backend works:** Visit http://localhost:4000/api/health (should return `{"status":"ok",...}`)
3. **Tests pass:** Run `cd server && npm test`

---

## 📚 Documentation

- **[README.md](README.md)** — Overview and features
- **[ENVIRONMENT.md](ENVIRONMENT.md)** — All env variables explained
- **[DEPLOYMENT.md](DEPLOYMENT.md)** — Deploy to production (Railway, Render, Vercel, etc.)
- **Swagger UI** — http://localhost:4000/api-docs (interactive API explorer)

---

## 🐳 Docker (Optional)

Run both frontend and backend in Docker:

```bash
docker-compose up --build
```

Then visit:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Docs: http://localhost:4000/api-docs

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| `Port 3000 already in use` | Change PORT in `.env.local` or kill the process using that port |
| `GEMINI_API_KEY not found` | Set it in `.env.local` or use `USE_MOCK_AI=true` for mock responses |
| `npm install fails` | Try `npm cache clean --force` then `npm install` again |
| Node.js not found | Install from https://nodejs.org/ |

---

## 🎯 Next Steps

- **Explore the app:** Create stays, ask the AI assistant, view the memory wall
- **Read the code:** Check `App.tsx`, `server/src/index.ts`, and `services/`
- **Deploy:** Follow [DEPLOYMENT.md](DEPLOYMENT.md) to go live
- **Customize:** Update colors, text, API endpoints to fit your needs

---

## 📞 Questions?

- Check [README.md](README.md) for full documentation
- Review [ENVIRONMENT.md](ENVIRONMENT.md) for config options
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production setup

Enjoy! 🎉
