# Fix Vercel 404 Errors

The API functions are returning 404 because of the Root Directory configuration. Here's how to fix it:

## Solution: Remove Root Directory Setting

1. **Go to Vercel Project Settings**
   - Navigate to your project: https://vercel.com/your-project
   - Click "Settings" → "General"

2. **Update Build & Development Settings:**

   **Root Directory:** Leave blank (or set to `.`)

   **Build Command:**
   ```bash
   cd frontend && npm install && npm run build && cd ../api && npm install
   ```

   **Output Directory:** `frontend/dist`

   **Install Command:** (leave default or blank)

3. **Environment Variables:**
   Make sure you have:
   ```
   ANTHROPIC_API_KEY=your-key-here
   ```

4. **Save and Redeploy**

## Why This Works

- With Root Directory blank, Vercel operates from the repo root
- `vercel.json` can properly find `api/index.ts`
- The build command navigates to `frontend/` for building
- The output is still `frontend/dist`
- API functions in `/api` directory are automatically deployed as serverless functions

## Testing After Deploy

1. Frontend: `https://your-project.vercel.app`
2. API Health: `https://your-project.vercel.app/api/health`
3. Full test: Fill out the use case form

The API should now respond with 200 instead of 404!
