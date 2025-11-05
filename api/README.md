# API Serverless Functions

This directory contains Vercel Serverless Functions for the FHIRSquire backend.

## Structure

Each `.ts` file in this directory and subdirectories becomes a serverless endpoint:

- `api/index.ts` → `/api` (API info)
- `api/health.ts` → `/api/health` (health check)
- `api/use-case/analyze.ts` → `/api/use-case/analyze` (Claude AI analysis)

## How Vercel Deploys These

Vercel automatically:
1. Finds all `.ts` files in `api/` directory
2. Compiles them with TypeScript
3. Creates serverless functions
4. Maps file paths to URL paths

## Requirements

Each file must:
1. Import `VercelRequest` and `VercelResponse` from `@vercel/node`
2. Export a default function: `export default function handler(req, res) {}`
3. Have dependencies listed in `api/package.json`

## Testing Locally

```bash
cd api
npm install
vercel dev
```

## Deployment

Vercel automatically deploys these when:
- Repo root has `vercel.json` with functions config
- Root Directory in Vercel settings is blank (repo root)
- Build command installs api dependencies: `cd ../api && npm install`
