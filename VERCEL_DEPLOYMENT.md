# Vercel Deployment Guide

This guide will help you set up a new repository and deploy the ChainChart UI to Vercel.

## Step 1: Create a New GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository (e.g., `chain-chart-ui` or `chainchart-ui`)
3. **Do NOT** initialize with README, .gitignore, or license (we already have these)

## Step 2: Prepare Your Local Repository

If you want to create a fresh repository for Vercel:

### Option A: Create a New Repository from Current Code

```bash
# Remove existing git history (if you want a fresh start)
rm -rf .git

# Initialize a new git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: ChainChart UI ready for Vercel"

# Add your new GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Option B: Keep Current Repository

If you want to keep the current repository but prepare it for Vercel:

```bash
# Make sure all changes are committed
git add .
git commit -m "Prepare for Vercel deployment"

# Push to your repository
git push origin main
```

## Step 3: Deploy to Vercel

### Via Vercel Dashboard (Recommended)

1. **Sign in to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Project**
   - Click "Add New Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Project Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (if UI is in root) or specify if in subdirectory
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key-here
   NEXT_PUBLIC_API_URL = https://your-api-url.com (optional)
   ```
   
   Make sure to add these for:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (first time will ask questions)
vercel

# For production deployment
vercel --prod
```

## Step 4: Configure Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Navigate to Settings → Domains
3. Add your custom domain
4. Follow DNS configuration instructions

## Step 5: Set Up Automatic Deployments

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches and pull requests

You can configure this in:
- Settings → Git → Production Branch
- Settings → Git → Preview Deployments

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anonymous/public key | `eyJhbGc...` |
| `NEXT_PUBLIC_API_URL` | ⚠️ Optional | Backend API URL | `https://api.example.com` |

## Troubleshooting

### Build Fails

1. **Check build logs** in Vercel dashboard
2. **Verify environment variables** are set correctly
3. **Check Node.js version** - Vercel uses Node 18+ by default
4. **Verify dependencies** - Make sure `package.json` is correct

### Environment Variables Not Working

- Make sure variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding new environment variables
- Check that variables are added to all environments (Production, Preview, Development)

### Supabase Connection Issues

- Verify `NEXT_PUBLIC_SUPABASE_URL` starts with `https://`
- Check that your Supabase project is active
- Verify RLS policies are set up correctly

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Build succeeds without errors
- [ ] Application loads correctly
- [ ] Authentication works
- [ ] Database connections work
- [ ] Custom domain configured (if needed)
- [ ] Analytics/monitoring set up (optional)

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)

