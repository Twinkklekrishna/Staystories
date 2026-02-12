#!/usr/bin/env powershell

Write-Host "Starting Vercel deployment..." -ForegroundColor Green

$responses = @(
    "y",  # Set up and deploy?
    "0",  # Select scope (first option)
    "n",  # Link to existing project?
    "y"   # Deploy now?
)

cd "D:\Downloads\sahrdaya-attendance-pro"

# Try standard deployment
Write-Host "Deploying to Vercel..." -ForegroundColor Cyan
vercel --prod
