# 🚀 Quick Setup Guide

Your monorepo is ready! Follow these steps to push to GitHub.

## ✅ What's Been Done

- ✅ Created root `package.json` with workspace configuration
- ✅ Added `.gitignore` to exclude sensitive files
- ✅ Created comprehensive `README.md`
- ✅ Fixed Redis connection resilience
- ✅ Initialized Git repository
- ✅ Made initial commit

## 📋 Next Steps

### 1. Create GitHub Repository

Go to [github.com/new](https://github.com/new) and:
- Repository name: `stripe-analytics` (or whatever you prefer)
- Description: "Full-stack Stripe analytics platform with background job processing"
- Visibility: Public or Private (your choice)
- **DO NOT** initialize with README (we already have one)

### 2. Push to GitHub

Copy the commands from GitHub (they'll look like this):

```bash
cd /Users/micky/Desktop/full-stack
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

**Or if you prefer SSH:**

```bash
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 3. Create Environment Files

**IMPORTANT:** Before deploying, create your actual `.env` files:

```bash
# Web environment
cp web/.env.example web/.env
# Then edit web/.env with your actual credentials

# Worker environment
cp worker/.env.example worker/.env
# Then edit worker/.env with your actual credentials
```

### 4. Test the Monorepo Commands

```bash
# Install all dependencies
npm run install:all

# Run both web and worker together
npm run dev

# Or run separately
npm run dev:web      # Just the Next.js app
npm run dev:worker   # Just the background worker
```

## 🔧 Generate Encryption Key

You need a 32-byte hex key for `STRIPE_SECRET_ENCRYPTION_KEY`:

```bash
openssl rand -hex 32
```

Use the same key in both `web/.env` and `worker/.env`.

## 🚢 Deployment Checklist

### Vercel (Web)
1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Railway/Render (Worker)
1. Create new service
2. Connect to your GitHub repo
3. Set root directory to `worker`
4. Set environment variables
5. Deploy

## 📝 .gitignore Protection

Your `.gitignore` already protects:
- ✅ `.env` files (won't be committed)
- ✅ `node_modules/`
- ✅ `.next/` build folders
- ✅ Sensitive files

**Never commit:**
- Real `.env` files
- API keys
- Database URLs
- Secrets

## 🎯 Quick Reference

**Useful commands:**
```bash
# Check git status
git status

# View commit history
git log --oneline

# See what files are ignored
git status --ignored

# Run full stack locally
npm run dev
```

## ❓ Need Help?

If something isn't working:
1. Check that all `.env` files are configured
2. Verify PostgreSQL is running
3. Verify Redis is accessible
4. Check the terminal logs for errors

---

**You're all set!** 🎉

Just create the GitHub repo and push. Your monorepo is production-ready!

