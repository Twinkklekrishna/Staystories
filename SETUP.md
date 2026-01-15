# Setup Script for Windows (PowerShell)

This script automates initial setup of the Stay Stories project on Windows.

## Usage

```powershell
.\setup.ps1
```

Or if you get an execution policy error, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup.ps1
```

Then the script will:
1. Check for Node.js
2. Create/update `.env.local` with prompts for configuration
3. Install root dependencies
4. Install server dependencies
5. Provide instructions for running the project

---

## What the Script Does

- Validates Node.js is installed
- Prompts you for `GEMINI_API_KEY` (or asks if you want to use mock AI)
- Creates `.env.local` with your configuration
- Runs `npm install` in the root and `server/` folder
- Provides next steps (running dev servers, viewing docs, etc.)

---

## Manual Setup (if you prefer)

If you don't want to run the script, follow these steps:

1. **Create `.env.local`:**
   ```
   GEMINI_API_KEY=your_key_here
   PORT=4000
   ```
   Or for development without a key:
   ```
   USE_MOCK_AI=true
   PORT=4000
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   cd server
   npm install
   cd ..
   ```

3. **Run the frontend (in one terminal):**
   ```powershell
   npm run dev
   ```

4. **Run the backend (in another terminal):**
   ```powershell
   cd server
   npm run dev
   ```

5. **View the app:** Open http://localhost:3000 in your browser.

6. **View API docs (optional):** Open http://localhost:4000/api-docs

---

## Troubleshooting

- **Node.js not found:** Download from https://nodejs.org/ and install.
- **Port already in use:** Change `PORT` in `.env.local` or kill the process using the port.
- **GEMINI_API_KEY error:** Either set a valid key in `.env.local` or use `USE_MOCK_AI=true`.

See [ENVIRONMENT.md](ENVIRONMENT.md) for more details on configuration.
