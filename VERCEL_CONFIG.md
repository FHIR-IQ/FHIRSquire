# Vercel Dashboard Configuration

Since the monorepo structure is complex, you need to configure the build settings directly in the Vercel dashboard.

## Configuration Steps

1. **Go to your Vercel project settings**
   - https://vercel.com/your-username/fhirsquire/settings

2. **Navigate to "General" → "Build & Development Settings"**

3. **Configure as follows:**

   **Framework Preset:** `Other`

   **Root Directory:** `frontend`

   **Build Command:**
   ```bash
   npm install && npm run build && cd ../api && npm install
   ```

   **Output Directory:** `dist`

   **Install Command:**
   ```bash
   npm install
   ```

4. **Add Environment Variables** (in "Environment Variables" section):
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
   ```

5. **Save and Redeploy**

## What This Does

- Sets `frontend/` as the root directory, so Vercel operates from there
- Installs frontend dependencies and builds the React app
- Then navigates to `../api` and installs API dependencies
- The `/api` folder will be deployed as Vercel Serverless Functions (via `vercel.json`)

## Alternative: Deploy Just Frontend on Vercel

If the above doesn't work, you can deploy only the frontend on Vercel and use a separate service for the API:

**Vercel (Frontend Only):**
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Output Directory: `dist`

**Railway/Render (Backend):**
- Root Directory: `api`
- Start Command: `npm install && node index.js`
- Add environment variable: `ANTHROPIC_API_KEY`

Then update `frontend` environment variable:
```
VITE_API_URL=https://your-backend.railway.app/api
```

## Testing

After deployment, test:
1. Frontend loads: `https://your-project.vercel.app`
2. API health check: `https://your-project.vercel.app/api/health`
3. Full workflow: Fill out use case form and submit
