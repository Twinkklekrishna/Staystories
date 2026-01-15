# Environment Variables Reference

This document lists all environment variables used by the Stay Stories app (frontend and backend).

## Backend Server (`server/`)

### Required (for production AI)
- **`GEMINI_API_KEY`** (string)
  - Your Google Gemini API key for AI chat and description generation.
  - Get one at: https://ai.google.dev/
  - Example: `GEMINI_API_KEY=AIzaSyD...`
  - If not set: AI endpoints return 500 error (unless `USE_MOCK_AI=true`).

### Optional
- **`PORT`** (number, default: `4000`)
  - Port the Express server listens on.
  - Example: `PORT=5000`

- **`NODE_ENV`** (string, default: `development`)
  - Set to `production` when deploying to production.
  - Also controls whether mock AI is used (see `USE_MOCK_AI` below).
  - Example: `NODE_ENV=production`

- **`RATE_LIMIT_WINDOW_MS`** (number, default: `60000`)
  - Time window (in milliseconds) for rate limiting.
  - Example: `RATE_LIMIT_WINDOW_MS=60000` (1 minute)

- **`RATE_LIMIT_MAX`** (number, default: `30`)
  - Max requests per IP per window before rate limiting kicks in.
  - Example: `RATE_LIMIT_MAX=30`

- **`USE_MOCK_AI`** (string: `'true'` or `'false'`, default: auto-detect)
  - Force use of mock AI responses (for development/testing without a real API key).
  - If `true`, the server returns canned responses regardless of `GEMINI_API_KEY`.
  - Automatically enabled when `NODE_ENV=development` (unless `GEMINI_API_KEY` is set).
  - Example: `USE_MOCK_AI=true`

## Frontend (`/`)

The frontend is a static Vite app and doesn't require environment variables at build time. However, if deployed to a different domain than the backend, you may need to update the API base URL:

### Optional (code-level config)
- **API base URL** (in `services/geminiService.ts`)
  - By default, the frontend assumes the backend is at `/api/...` on the same domain.
  - If the backend is on a different host (e.g., `https://api.example.com`), update the fetch calls in `services/geminiService.ts` to use the full URL.
  - Example: `fetch('https://api.example.com/api/ai/chat', ...)`

## Docker / Docker Compose

When using Docker or Docker Compose, environment variables can be:
1. Set in a `.env.local` file (loaded by docker-compose via `env_file`).
2. Passed as `--env` flags to `docker run`.
3. Set in your host's environment before running `docker-compose`.

Example `.env.local` for Docker:
```
GEMINI_API_KEY=your_key_here
PORT=4000
NODE_ENV=production
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=30
```

## Example `.env.local` Files

### Development (with mock AI)
```
GEMINI_API_KEY=
PORT=4000
NODE_ENV=development
USE_MOCK_AI=true
```

### Development (with real API key)
```
GEMINI_API_KEY=AIzaSyD...
PORT=4000
NODE_ENV=development
```

### Production
```
GEMINI_API_KEY=AIzaSyD...
PORT=4000
NODE_ENV=production
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=30
```

## Validation & Startup Checks

The backend logs a warning on startup if:
- `GEMINI_API_KEY` is not set AND `USE_MOCK_AI` is not enabled.
- In this case, AI endpoints will return 500 errors.

Monitor the server logs after startup to ensure all required variables are configured correctly.
