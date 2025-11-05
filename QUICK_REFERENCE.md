# FHIRSquire Quick Reference

## Commands Cheat Sheet

```bash
# Setup
npm install                    # Install all dependencies
cp .env.example backend/.env  # Copy environment template

# Development
npm run dev                   # Start frontend + backend
npm run dev:frontend          # Start frontend only (port 5173)
npm run dev:backend           # Start backend only (port 3001)

# Build
npm run build                 # Build all workspaces
npm run build:frontend        # Build frontend only
npm run build:backend         # Build backend only

# Code Quality
npm run lint                  # Lint all code
npm run lint:fix              # Fix linting issues
npm test                      # Run tests

# Cleanup
npm run clean                 # Remove all node_modules and dist folders
```

## Project Structure Quick Map

```
FHIRSquire/
├── backend/
│   ├── src/
│   │   ├── index.ts                    # Express app entry
│   │   ├── services/
│   │   │   ├── claudeService.ts        # Claude AI integration ⭐
│   │   │   ├── fhirProfileGenerator.ts # FHIR profile generation ⭐
│   │   │   └── simplifierService.ts    # Simplifier.net API
│   │   ├── routes/
│   │   │   ├── useCase.ts              # /api/use-case/*
│   │   │   ├── profile.ts              # /api/profile/*
│   │   │   └── simplifier.ts           # /api/simplifier/*
│   │   └── middleware/
│   │       ├── asyncHandler.ts         # Async error wrapper
│   │       └── errorHandler.ts         # Global error handler
│   └── .env.example                    # Environment template
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                     # Main app with stepper
│   │   ├── components/
│   │   │   ├── UseCaseForm.tsx         # Step 1: Use case intake ⭐
│   │   │   ├── RecommendationsList.tsx # Step 2: AI recommendations ⭐
│   │   │   ├── ProfileGenerator.tsx    # Step 3: Generate profile ⭐
│   │   │   └── SimplifierUpload.tsx    # Step 4: Upload to Simplifier
│   │   ├── store/
│   │   │   └── useStore.ts             # Zustand state management
│   │   └── api/
│   │       └── client.ts               # Axios API client
│   └── vite.config.ts                  # Vite configuration
│
├── profiles/                           # Generated FHIR profiles
├── .env.example                        # Root environment template
├── package.json                        # Workspace configuration
├── README.md                           # Project overview
├── GETTING_STARTED.md                  # Tutorial
├── CLAUDE.md                           # Developer guide
└── POC_SUMMARY.md                      # POC summary
```

## Environment Variables

### Required
```bash
ANTHROPIC_API_KEY=sk-ant-...           # Get from console.anthropic.com
```

### Optional
```bash
SIMPLIFIER_API_KEY=...                 # Get from simplifier.net
PORT=3001                               # Backend port (default: 3001)
NODE_ENV=development                    # Environment
FRONTEND_URL=http://localhost:5173      # For CORS
DEFAULT_FHIR_VERSION=R4                 # Default FHIR version
```

## API Endpoints Reference

### Health Check
```
GET /health → { status: 'ok', timestamp: '...' }
```

### Use Case Analysis
```
POST /api/use-case/analyze
Body: {
  businessUseCase: string,
  reasonForProfile: string,
  specificUseCase: string,
  dataRole: 'consumer' | 'producer' | 'intermediary',
  fhirVersion: 'R4' | 'R5' | 'R6',
  organizationContext?: string
}
Response: {
  success: true,
  data: {
    recommendations: ProfileRecommendation[],
    analysis: string,
    suggestedApproach: 'use-existing' | 'extend-existing' | 'create-new',
    rationale: string,
    additionalConsiderations: string[]
  }
}
```

```
POST /api/use-case/generate-spec
Body: {
  useCase: UseCaseData,
  selectedRecommendation: ProfileRecommendation,
  customRequirements?: string
}
Response: { success: true, data: { specification: string } }
```

### Profile Generation
```
POST /api/profile/generate
Body: ProfileGenerationRequest
Response: { success: true, data: { profile: StructureDefinition } }

POST /api/profile/save
Body: { profile: any, filename: string }
Response: { success: true, data: { filepath: string, message: string } }

GET /api/profile/list
Response: { success: true, data: Array<ProfileSummary> }

POST /api/profile/validate
Body: { resource: any, profile: StructureDefinition }
Response: { success: true, data: { valid: boolean, errors: string[] } }
```

### Simplifier Integration
```
GET /api/simplifier/status
Response: { success: true, data: { configured: boolean, message: string } }

GET /api/simplifier/projects
Response: { success: true, data: SimplifierProject[] }

POST /api/simplifier/upload
Body: { projectScope: string, profile: any, filename: string }
Response: { success: true, data: { success: boolean, url?: string } }
```

## State Management (Zustand)

```typescript
// Store structure
{
  useCaseData: UseCaseData | null,           // Step 1 data
  analysis: Analysis | null,                  // Step 2 AI analysis
  selectedRecommendation: ProfileRecommendation | null,  // Step 2 selection
  profileSpecification: string | null,        // Step 3 specification
  generatedProfile: any | null,               // Step 3 generated profile

  // Actions
  setUseCaseData: (data) => void,
  setAnalysis: (analysis) => void,
  setSelectedRecommendation: (rec) => void,
  setProfileSpecification: (spec) => void,
  setGeneratedProfile: (profile) => void,
  reset: () => void
}
```

## Common Tasks

### Adding a New FHIR Resource Type

1. Update `fhirProfileGenerator.ts`:
   ```typescript
   // Add to type definitions if needed
   ```

2. Update Claude prompt in `claudeService.ts`:
   ```typescript
   // Add to known resource types
   ```

### Adding a New IG to Recommendations

1. Update Claude prompt in `claudeService.ts`:
   ```typescript
   // Add to list of known IGs in buildAnalysisPrompt()
   ```

### Modifying the Workflow

1. Update `App.tsx` - add/remove steps
2. Create new component in `frontend/src/components/`
3. Add to store if state is needed
4. Update progress stepper in `App.tsx`

### Adding Validation Rules

1. Update Zod schema in route file:
   ```typescript
   const schema = z.object({
     // Add new fields with validation
   });
   ```

## Troubleshooting

### Port Conflicts
```bash
# Kill process on port
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

### API Key Issues
```bash
# Check if key is loaded
node -e "console.log(process.env.ANTHROPIC_API_KEY)"

# Verify .env location
ls backend/.env
```

### Build Errors
```bash
# Clean and reinstall
npm run clean
rm -rf node_modules package-lock.json
npm install
```

### CORS Issues
```bash
# Check backend CORS config in backend/src/index.ts
# Verify FRONTEND_URL matches actual frontend URL
```

## Useful Code Snippets

### Test Claude AI Connection
```typescript
// In backend/src/index.ts, add:
app.get('/test-claude', async (req, res) => {
  try {
    const result = await claudeService.analyzeUseCase({
      businessUseCase: "Test",
      reasonForProfile: "Test",
      specificUseCase: "Test",
      dataRole: "consumer",
      fhirVersion: "R4"
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});
```

### Debug State in React
```typescript
// Add to any component:
import { useStore } from '../store/useStore';

function MyComponent() {
  const state = useStore();
  console.log('Current state:', state);
  // ...
}
```

### Validate FHIR Profile Manually
```bash
# Using HAPI FHIR validator (not included in POC)
curl -X POST https://validator.fhir.org/validate \
  -H "Content-Type: application/json" \
  -d @profiles/my-profile.json
```

## Performance Tips

- Claude API calls take 5-15 seconds - show loading indicators
- Large profiles (>100 elements) - consider pagination
- Cache Claude responses for similar use cases (not implemented)
- Use React.memo() for expensive component renders
- Debounce form inputs if adding real-time validation

## Security Checklist

- [ ] Never commit `.env` files
- [ ] Validate all user input with Zod
- [ ] Sanitize file names before saving
- [ ] Use HTTPS in production
- [ ] Rate limit API endpoints
- [ ] Add authentication for production use
- [ ] Validate FHIR profiles before use

## Resources

- [FHIR R4 Spec](https://hl7.org/fhir/R4/)
- [US Core IG](https://www.hl7.org/fhir/us/core/)
- [Simplifier.net](https://simplifier.net)
- [Claude API Docs](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)

## Support

- GitHub Issues: [Open an issue]
- Documentation: See README.md and GETTING_STARTED.md
- FHIR Questions: https://chat.fhir.org

---

**Last Updated:** November 2025
