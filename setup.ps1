#!/usr/bin/env pwsh

# Setup script for Stay Stories (Windows PowerShell)
# Usage: .\setup.ps1

Write-Host "🎯 Stay Stories Setup" -ForegroundColor Cyan
Write-Host "=====================`n"

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
  Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
} else {
  Write-Host "✗ Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
  exit 1
}

# Prompt for GEMINI_API_KEY
Write-Host "`n🔑 Gemini API Key Configuration" -ForegroundColor Yellow
$useRealKey = Read-Host "Do you have a Gemini API key? (y/n) [default: n]"

$envContent = "PORT=4000`n"

if ($useRealKey -eq 'y') {
  $apiKey = Read-Host "Enter your GEMINI_API_KEY"
  if ($apiKey) {
    $envContent += "GEMINI_API_KEY=$apiKey`n"
  } else {
    Write-Host "Skipping API key (will use mock AI mode)" -ForegroundColor Yellow
    $envContent += "USE_MOCK_AI=true`n"
  }
} else {
  Write-Host "Using mock AI mode for development" -ForegroundColor Yellow
  $envContent += "USE_MOCK_AI=true`n"
}

# Create .env.local
Write-Host "`nCreating .env.local..." -ForegroundColor Yellow
$envFile = ".env.local"
Set-Content -Path $envFile -Value $envContent -Encoding UTF8
Write-Host "✓ .env.local created" -ForegroundColor Green

# Install root deps
Write-Host "`n📦 Installing root dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
  Write-Host "✗ Failed to install root dependencies" -ForegroundColor Red
  exit 1
}
Write-Host "✓ Root dependencies installed" -ForegroundColor Green

# Install server deps
Write-Host "`n📦 Installing server dependencies..." -ForegroundColor Yellow
cd server
npm install
if ($LASTEXITCODE -ne 0) {
  Write-Host "✗ Failed to install server dependencies" -ForegroundColor Red
  exit 1
}
cd ..
Write-Host "✓ Server dependencies installed" -ForegroundColor Green

# Summary
Write-Host "`n✅ Setup Complete!" -ForegroundColor Green
Write-Host @"
Next steps:

1. Run the frontend (in one terminal):
   npm run dev
   → Opens at http://localhost:3000

2. Run the backend (in another terminal):
   cd server && npm run dev
   → Server at http://localhost:4000
   → API docs at http://localhost:4000/api-docs

3. For more info:
   - See README.md for overview
   - See DEPLOYMENT.md for production deployment
   - See ENVIRONMENT.md for configuration options

Happy coding! 🚀
"@
