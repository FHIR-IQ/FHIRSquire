# Vercel Final Fix - Complete Guide

You have multiple Vercel deployments which is causing confusion. Here's how to fix it properly.

## Step 1: Delete Extra Vercel Projects

You have TWO projects:
- `fhir-squire-frontend`
- `fhir-squire`

**Action:** Keep ONE project (recommend `fhir-squire`) and delete the other:

1. Go to https://vercel.com/dashboard
2. Click on `fhir-squire-frontend`
3. Settings → General → scroll to bottom
4. Click "Delete Project"
5. Confirm deletion

Now work with ONLY `fhir-squire` project.

## Step 2: Configure the Remaining Project

Go to `fhir-squire` project settings:

### Build & Development Settings

1. **Framework Preset:** `Other` (or leave blank)

2. **Root Directory:** Leave **BLANK** (empty)

3. **Build Command:**
   ```bash
   cd frontend && npm install && npm run build && cd ../api && npm install
   ```

4. **Output Directory:**
   ```
   frontend/dist
   ```

5. **Install Command:** Leave blank or default

6. **Node.js Version:** `18.x`

### Environment Variables

Add these in Settings → Environment Variables:

```
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

## Step 3: Verify File Structure

Your repo should have this structure:
```
/
├── frontend/
│   ├── dist/         (build output)
│   ├── src/
│   └── package.json
├── api/
│   ├── health.ts     (serverless function)
│   ├── use-case/
│   │   └── analyze.ts (serverless function)
│   └── package.json
└── vercel.json
```

## Step 4: Test Deployment

After saving settings and redeploying:

1. **Test Frontend:**
   ```
   https://fhir-squire.vercel.app
   ```
   Should show the FHIRSquire UI

2. **Test API Health:**
   ```
   https://fhir-squire.vercel.app/api/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

3. **Test Full Flow:**
   - Fill out the use case form
   - Click "Get Recommendations"
   - Should work without 404 errors!

## Step 5: Check Functions Tab

After deployment:
1. Go to your project in Vercel
2. Click "Functions" tab
3. You should see:
   - `/api/health`
   - `/api/use-case/analyze`

If these don't appear, the functions aren't being deployed.

## Common Issues & Fixes

### Issue: Functions not appearing

**Fix:** Make sure Root Directory is BLANK, not set to `frontend`

### Issue: Still getting 404

**Fix:** Check the Functions tab - if empty, the API isn't deploying. Verify:
- `api/` folder is at repo root
- `vercel.json` exists at repo root
- `vercel.json` has functions config:
  ```json
  {
    "functions": {
      "api/**/*.ts": {
        "memory": 1024,
        "maxDuration": 60
      }
    }
  }
  ```

### Issue: Build fails

**Fix:** Check build logs. Common causes:
- Missing dependencies in `api/package.json`
- TypeScript errors
- Missing environment variables

## Alternative: If Still Not Working

If Vercel serverless functions still don't work, use Render (free):

1. **Deploy Frontend on Vercel** (no API)
   - Root: `frontend`
   - Build: `npm install && npm run build`
   - Output: `dist`

2. **Deploy Backend on Render** (free tier)
   - Go to https://render.com
   - New Web Service
   - Connect GitHub
   - Root: `backend`
   - Build: `npm install && npm run build`
   - Start: `node dist/index.js`
   - Add env: `ANTHROPIC_API_KEY`

3. **Connect them:**
   Add to Vercel environment variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

## Need Help?

Check:
- Vercel build logs
- Vercel function logs
- Browser console for errors

The issue is almost certainly the Root Directory setting or having multiple projects.
