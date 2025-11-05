# Deployment Guide

## Deploying to Vercel

This guide covers deploying FHIRSquire to Vercel (or similar platforms).

### Prerequisites

1. GitHub repository with the code pushed
2. Vercel account (free tier works)
3. Anthropic API key

### Option 1: Deploy Frontend and Backend Separately (Recommended)

Since this is a monorepo with separate frontend and backend, the best approach is to deploy them separately.

#### Deploy Frontend to Vercel

1. **Import Project in Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select the repository: `FHIRSquire`

2. **Configure Frontend Build**
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables**
   - No environment variables needed for frontend (API calls go through proxy in dev, direct in prod)

4. **Deploy**
   - Click "Deploy"
   - Note the deployment URL (e.g., `https://fhirsquire.vercel.app`)

#### Deploy Backend to Vercel (or Railway/Render)

**Option A: Vercel Serverless Functions**

1. Create a new Vercel project for backend
2. Root Directory: `backend`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Set Environment Variables:
   ```
   ANTHROPIC_API_KEY=your_key_here
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

**Option B: Railway (Better for Express apps)**

1. Go to https://railway.app
2. New Project → Deploy from GitHub repo
3. Select `FHIRSquire` repo
4. Root Directory: `/backend`
5. Add Environment Variables:
   ```
   ANTHROPIC_API_KEY=your_key_here
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
6. Deploy

**Option C: Render**

1. Go to https://render.com
2. New Web Service
3. Connect GitHub repository
4. Settings:
   - Name: `fhirsquire-backend`
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: Node
5. Add Environment Variables (same as above)

#### Update Frontend to Use Backend URL

After deploying backend, update the frontend API client:

1. In Vercel dashboard for frontend, add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```

2. Update `frontend/src/api/client.ts`:
   ```typescript
   const apiClient = axios.create({
     baseURL: import.meta.env.VITE_API_URL || '/api',
     // ...
   });
   ```

3. Redeploy frontend

### Option 2: Monorepo Deployment (Advanced)

If you want to deploy both from a single Vercel project:

1. **Create `vercel.json` in root** (already created)

2. **Configure Build in Vercel**
   - Root Directory: `.`
   - Build Command: `npm run build`
   - Output Directory: `frontend/dist`

3. **Set Environment Variables**
   ```
   ANTHROPIC_API_KEY=your_key_here
   SIMPLIFIER_API_KEY=your_key_here (optional)
   NODE_ENV=production
   ```

4. **Note**: Vercel serverless functions have limitations for Express apps. Railway or Render might be better for the backend.

### Environment Variables Summary

**Backend Environment Variables** (Required):
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...  # From console.anthropic.com
NODE_ENV=production
PORT=3001                            # Or dynamic port from platform
FRONTEND_URL=https://your-frontend.vercel.app
```

**Backend Environment Variables** (Optional):
```bash
SIMPLIFIER_API_KEY=...              # From simplifier.net
SIMPLIFIER_BASE_URL=https://api.simplifier.net
DEFAULT_FHIR_VERSION=R4
```

**Frontend Environment Variables** (Optional):
```bash
VITE_API_URL=https://your-backend.railway.app
```

### Recommended Architecture

```
User Browser
     ↓
Frontend (Vercel)
https://fhirsquire.vercel.app
     ↓
Backend (Railway/Render)
https://fhirsquire-api.railway.app
     ↓
External APIs
- Claude AI (Anthropic)
- Simplifier.net
```

### Post-Deployment Checklist

- [ ] Frontend loads successfully
- [ ] Backend API health check works: `GET /health`
- [ ] CORS is configured correctly
- [ ] Environment variables are set
- [ ] Claude AI integration works
- [ ] Use case analysis completes successfully
- [ ] Profile generation works
- [ ] Download functionality works
- [ ] Simplifier upload works (if configured)

### Testing Deployment

1. **Test Health Endpoint**
   ```bash
   curl https://your-backend-url.railway.app/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Test Frontend**
   - Open frontend URL in browser
   - Fill out use case form
   - Submit and verify AI analysis works
   - Generate a profile
   - Download the profile JSON

3. **Test API Integration**
   ```bash
   curl -X POST https://your-backend-url.railway.app/api/use-case/analyze \
     -H "Content-Type: application/json" \
     -d '{
       "businessUseCase": "Test",
       "reasonForProfile": "Test",
       "specificUseCase": "Test",
       "dataRole": "consumer",
       "fhirVersion": "R4"
     }'
   ```

### Troubleshooting

**Frontend can't reach backend:**
- Check CORS settings in `backend/src/index.ts`
- Verify `FRONTEND_URL` environment variable
- Update `frontend/src/api/client.ts` with correct backend URL

**Claude API errors:**
- Verify `ANTHROPIC_API_KEY` is set correctly
- Check API key has credits
- Review backend logs for detailed errors

**Build failures:**
- Ensure `node_modules` is not in git
- Check Node.js version (18+ required)
- Verify all dependencies in package.json

**Serverless timeout:**
- Claude API calls can take 10-15 seconds
- Increase timeout in platform settings (e.g., Vercel allows 60s on paid plans)
- Consider using Railway/Render for longer timeouts

### Alternative Platforms

**Netlify** (Frontend):
- Similar to Vercel
- Good for static sites
- Serverless functions available

**Fly.io** (Backend):
- Good for Express apps
- Supports long-running processes
- Global deployment

**DigitalOcean App Platform** (Full Stack):
- Can deploy both frontend and backend
- Good pricing
- Easy database integration

### Cost Estimates (Monthly)

**Free Tier:**
- Vercel: Free (with limits)
- Railway: $5 free credit/month
- Render: Free tier available
- Anthropic API: Pay-per-use

**Paid (for production):**
- Vercel Pro: $20/month
- Railway: ~$5-20/month depending on usage
- Render: ~$7-25/month
- Anthropic API: ~$0.003/1K tokens (input), ~$0.015/1K tokens (output)

### Scaling Considerations

- Add Redis caching for Claude responses
- Implement rate limiting
- Add authentication/authorization
- Use CDN for frontend assets
- Consider database for profile storage
- Implement background job processing

### Security

- [ ] Use HTTPS everywhere
- [ ] Set up CSP headers
- [ ] Enable rate limiting
- [ ] Add API authentication
- [ ] Rotate API keys regularly
- [ ] Monitor for security vulnerabilities
- [ ] Set up error alerting

---

For questions, refer to the [README.md](README.md) or open an issue on GitHub.
