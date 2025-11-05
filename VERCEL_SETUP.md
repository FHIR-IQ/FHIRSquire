# Quick Vercel Setup Guide

## Step-by-Step: Deploy FHIRSquire to Vercel

### Step 1: Deploy Frontend

1. **Go to Vercel**
   - Visit: https://vercel.com/new
   - Sign in with your GitHub account

2. **Import Repository**
   - Click "Add New..." → "Project"
   - Select your GitHub account
   - Find and import: `FHIR-IQ/FHIRSquire`

3. **Configure Frontend Build**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   Node Version: 18.x
   ```

4. **Deploy Frontend**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy the deployment URL (e.g., `https://fhirsquire-frontend.vercel.app`)

### Step 2: Deploy Backend (Railway Recommended)

**Why Railway?** Express.js apps work better on Railway than Vercel's serverless functions.

1. **Go to Railway**
   - Visit: https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `FHIR-IQ/FHIRSquire`

3. **Configure Backend**
   - Root Directory: `/backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

4. **Add Environment Variables**
   Click "Variables" tab and add:
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-YOUR-KEY-HERE
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://fhirsquire-frontend.vercel.app
   ```

   Optional:
   ```
   SIMPLIFIER_API_KEY=your-simplifier-key
   ```

5. **Generate Domain**
   - Click "Settings" → "Generate Domain"
   - Copy the URL (e.g., `https://fhirsquire-backend.railway.app`)

### Step 3: Connect Frontend to Backend

1. **Update Frontend Environment Variables in Vercel**
   - Go to your Vercel project dashboard
   - Click "Settings" → "Environment Variables"
   - Add:
     ```
     Name: VITE_API_URL
     Value: https://fhirsquire-backend.railway.app
     ```

2. **Update Frontend Code**
   - The code needs a small change to support this

3. **Redeploy Frontend**
   - Vercel will auto-deploy on push, or click "Redeploy" in dashboard

### Step 4: Test Your Deployment

1. **Test Backend Health**
   ```bash
   curl https://your-backend.railway.app/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Test Frontend**
   - Open your Vercel URL in browser
   - You should see the FHIRSquire interface

3. **Test Full Flow**
   - Fill out the use case form
   - Click "Get Recommendations"
   - Verify Claude AI returns recommendations
   - Generate a profile
   - Download the profile

## Quick Code Update for Production

To make the API client work with the backend URL, update `frontend/src/api/client.ts`:

```typescript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

This is already in the code, so you just need to set the environment variable in Vercel!

## Alternative: Both on Railway

If you prefer to deploy both on Railway:

1. Create two services in Railway
2. One for frontend (set root to `/frontend`)
3. One for backend (set root to `/backend`)
4. Configure accordingly

## Alternative: Backend on Render

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Service settings:
   ```
   Name: fhirsquire-backend
   Root Directory: backend
   Build Command: npm install && npm run build
   Start Command: npm start
   ```
5. Add environment variables (same as Railway)

## Getting Your Anthropic API Key

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Go to "API Keys" section
4. Create a new key
5. Copy the key (starts with `sk-ant-api03-...`)
6. Add to your backend environment variables

## Troubleshooting

### "API key not found"
- Make sure `ANTHROPIC_API_KEY` is set in backend environment variables
- Restart the backend service after adding variables

### "CORS error"
- Update `FRONTEND_URL` in backend to match your Vercel frontend URL
- Make sure no trailing slash in URL

### "Module not found" errors
- Make sure root directory is set correctly
- Check build command includes `npm install`
- Verify Node version is 18.x

### Backend timeout
- Claude API can take 10-15 seconds
- Railway has no timeout limits (good!)
- Vercel free tier has 10s timeout (may not be enough)
- Consider Railway or Render for backend

## Cost Breakdown

**Free Tier:**
- Vercel: Unlimited frontend hosting
- Railway: $5 free credit/month (~500 hours)
- Render: 750 free hours/month
- Anthropic API: Pay per use (very affordable for POC)

**Estimated Monthly Cost:**
- If under Railway free tier: **$0**
- Light usage (100 requests/day): **~$5-10/month**
- Medium usage (1000 requests/day): **~$20-30/month**

## Next Steps

1. Deploy frontend to Vercel ✓
2. Deploy backend to Railway ✓
3. Set environment variables ✓
4. Test the application ✓
5. Share the URL with your team!

## Support

If you run into issues:
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed troubleshooting
- Review backend logs in Railway dashboard
- Check Vercel function logs in Vercel dashboard
- Open an issue on GitHub

---

**Ready to deploy?** Start with Step 1 above! 🚀
