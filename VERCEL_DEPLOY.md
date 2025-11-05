# Deploy FHIRSquire to Vercel (All-in-One)

This guide shows how to deploy both frontend and backend to Vercel in a single project using Vercel Serverless Functions.

## Quick Deploy to Vercel

### Step 1: Import to Vercel

1. Go to https://vercel.com/new
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import your repository: `FHIR-IQ/FHIRSquire`

### Step 2: Configure Project

Vercel should auto-detect the configuration from `vercel.json`, but verify:

- **Framework Preset**: Other (or leave blank)
- **Root Directory**: `.` (leave as root)
- **Build Command**: Automatically detected from `vercel.json`
- **Output Directory**: `frontend/dist`
- **Install Command**: Automatically detected

### Step 3: Add Environment Variables

In the Vercel project settings, add the following environment variables:

**Required:**
```
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

**Optional:**
```
SIMPLIFIER_API_KEY=your-simplifier-key
NODE_ENV=production
```

### Step 4: Deploy!

Click "Deploy" and wait for the deployment to complete (usually 2-3 minutes).

## How It Works

### Project Structure
```
FHIRSquire/
├── frontend/          # React app → Static files served by Vercel
├── api/              # Express routes → Vercel Serverless Functions
│   ├── index.ts      # Main handler
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   └── middleware/   # Express middleware
└── vercel.json       # Vercel configuration
```

### Request Flow
```
User Browser
     ↓
Vercel CDN (serves frontend)
     ↓
/api/* requests → Vercel Serverless Function
     ↓
api/index.ts (Express app)
     ↓
Routes → Services → External APIs (Claude, Simplifier)
```

### Serverless Function Configuration

The `/api` directory is automatically deployed as a Vercel Serverless Function:

- **Runtime**: Node.js 18+
- **Memory**: 1024 MB
- **Timeout**: 60 seconds (enough for Claude API calls)
- **Region**: Automatic (closest to user)

## Environment Variables

### Get Your Anthropic API Key

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to "API Keys"
4. Create a new API key
5. Copy the key (starts with `sk-ant-api03-...`)
6. Add it to Vercel environment variables

### Optional: Simplifier.net Integration

1. Go to https://simplifier.net
2. Create an account
3. Go to account settings → API keys
4. Generate a new key
5. Add `SIMPLIFIER_API_KEY` to Vercel

## Testing Your Deployment

### 1. Test the Frontend
- Open your Vercel URL (e.g., `https://fhirsquire.vercel.app`)
- You should see the FHIRSquire interface

### 2. Test the API
```bash
# Test health endpoint
curl https://your-project.vercel.app/api/health

# Should return: {"status":"ok","timestamp":"..."}
```

### 3. Test Full Flow
1. Fill out the use case form
2. Submit for analysis
3. Wait for Claude AI recommendations (10-15 seconds)
4. Select a recommendation
5. Generate a FHIR profile
6. Download the profile

## Vercel Pro Features (Optional)

Free tier includes:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless functions (10s timeout)

Upgrade to Pro for:
- 60s function timeout (better for Claude API)
- More bandwidth
- Analytics
- Team collaboration

For this POC, **free tier is sufficient** if you're okay with 10-second function timeout. Most Claude API calls complete within that time.

### Increase Timeout on Pro Plan

If you upgrade to Vercel Pro, you can increase the timeout:

```json
// vercel.json
{
  "functions": {
    "api/index.ts": {
      "memory": 1024,
      "maxDuration": 60  // 60 seconds on Pro
    }
  }
}
```

## Troubleshooting

### "Function Timeout"
- Claude API calls can take 10-15 seconds
- Free tier has 10s limit, Pro has 60s
- Consider upgrading if you hit this limit frequently

### "Module not found"
- Check that all dependencies are in `api/package.json`
- Vercel will `npm install` in the `api/` directory

### "CORS Error"
- The Express app has CORS enabled for all origins (`*`)
- If you need to restrict, update `api/index.ts`:
  ```typescript
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://your-domain.vercel.app'
  }));
  ```

### "API Key Not Found"
- Verify environment variables are set in Vercel dashboard
- Redeploy after adding environment variables
- Check the function logs in Vercel dashboard

### "Build Failed"
- Check build logs in Vercel dashboard
- Ensure Node version is 18.x or higher
- Try redeploying

## Monitoring

### View Logs
1. Go to Vercel dashboard
2. Select your project
3. Click "Functions" tab
4. Click on `/api` function
5. View real-time logs

### View Analytics
- Free tier: Basic analytics
- Pro tier: Detailed analytics, function metrics

## Custom Domain (Optional)

1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Vercel automatically provisions SSL

## Cost Estimate

**Free Tier (Sufficient for POC):**
- Vercel: $0/month
- Anthropic API: ~$0.01-0.10/request
- Total: Pay only for API usage

**With Vercel Pro:**
- Vercel: $20/month
- Anthropic API: Same as above
- Total: ~$20-30/month

**Monthly API costs for 100 use case analyses:**
- Input tokens: ~500 tokens/request × 100 = 50K tokens = $0.15
- Output tokens: ~2000 tokens/request × 100 = 200K tokens = $3.00
- **Total: ~$3-5/month** for moderate usage

## Advantages of Vercel All-in-One

✅ **Single deployment** - No need for separate frontend/backend services
✅ **Automatic scaling** - Serverless functions scale automatically
✅ **Global CDN** - Fast frontend delivery worldwide
✅ **Zero configuration** - Works out of the box with `vercel.json`
✅ **Free tier** - Generous free tier for POCs
✅ **Integrated** - Frontend and API in the same domain (no CORS issues)
✅ **Easy rollbacks** - One-click rollback to previous deployments

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Add environment variables
3. ✅ Test the application
4. Share the URL with your team!
5. (Optional) Add custom domain
6. (Optional) Upgrade to Pro for longer timeouts

---

**Need help?** Check the function logs in Vercel dashboard or open an issue on GitHub.
