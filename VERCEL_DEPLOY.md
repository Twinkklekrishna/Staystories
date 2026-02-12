# Vercel Deployment Instructions

## Quick Start (5 minutes)

### 1. Sign Up on Vercel
Go to https://vercel.com/signup and create account with GitHub

### 2. Install Vercel CLI
```bash
npm install -g vercel
```

### 3. Push Code to GitHub
```bash
cd d:\Downloads\sahrdaya-attendance-pro
git remote add origin https://github.com/YOUR_USERNAME/sahrdaya-attendance-pro.git
git branch -M main
git push -u origin main
```

### 4. Deploy with One Command
```bash
vercel --prod
```

Or manually:
1. Go to https://vercel.com/new
2. Select "Import Git Repository"
3. Search for `sahrdaya-attendance-pro`
4. Click Import
5. Click Deploy

### 5. Your App is Live!
- **Frontend URL**: `https://sahrdaya-attendance-pro.vercel.app/`
- **Backend API**: `https://sahrdaya-attendance-pro.vercel.app/api/`
- **Access from anywhere** on any device!

## Environment Variables
Backend API URL is automatically detected from Vercel domain.

## Data Storage
- Uses in-memory storage (data resets on redeployment)
- For persistent storage, connect to MongoDB (free tier available)

## Done! 🎉
Your attendance app is now live globally!
