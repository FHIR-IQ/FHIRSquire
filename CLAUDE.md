# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FHIRSquire is an AI-powered FHIR Profile builder and research tool that integrates with Claude AI to provide intelligent recommendations for healthcare interoperability implementations. It's a monorepo containing:

- **Backend**: Node.js/Express API with TypeScript
- **Frontend**: React/Vite SPA with TypeScript
- **Integration**: Claude AI (Anthropic), Simplifier.net

## Key Features

1. **Use Case Analysis**: Users describe their healthcare interoperability needs
2. **AI-Powered Recommendations**: Claude analyzes use cases and recommends existing FHIR profiles from well-known IGs (US Core, IPS, mCODE, etc.)
3. **Profile Generation**: Automatically generates FHIR StructureDefinitions (R4, R5, R6)
4. **Simplifier.net Integration**: Upload profiles and create Implementation Guides
5. **Complete Documentation Workflow**: From use case to published profile

## Development Commands

```bash
# Install dependencies
npm install

# Development (runs both frontend and backend)
npm run dev

# Run separately
npm run dev:backend   # Backend on http://localhost:3001
npm run dev:frontend  # Frontend on http://localhost:5173

# Build
npm run build         # Build all workspaces
npm run build:backend
npm run build:frontend

# Testing & Linting
npm test
npm run lint
```

## Environment Configuration

Required environment variables in `backend/.env`:

```
ANTHROPIC_API_KEY=sk-ant-...         # Required for Claude AI
PORT=3001                             # Backend port
FRONTEND_URL=http://localhost:5173    # For CORS
SIMPLIFIER_API_KEY=...               # Optional for Simplifier.net
DEFAULT_FHIR_VERSION=R4
```

## Architecture

### Backend Structure (`backend/src/`)

- **`services/`**
  - `claudeService.ts`: Claude AI integration for use case analysis and recommendations
  - `fhirProfileGenerator.ts`: FHIR StructureDefinition generation (R4/R5/R6)
  - `simplifierService.ts`: Simplifier.net API integration

- **`routes/`**
  - `useCase.ts`: Use case analysis endpoints
  - `profile.ts`: Profile generation and management
  - `simplifier.ts`: Simplifier.net operations

- **`middleware/`**
  - `asyncHandler.ts`: Async error handling wrapper
  - `errorHandler.ts`: Global error handler

### Frontend Structure (`frontend/src/`)

- **`components/`**
  - `UseCaseForm.tsx`: Step 1 - Use case intake form
  - `RecommendationsList.tsx`: Step 2 - Display AI recommendations
  - `ProfileGenerator.tsx`: Step 3 - Generate and view FHIR profile
  - `SimplifierUpload.tsx`: Step 4 - Upload to Simplifier.net

- **`store/`**
  - `useStore.ts`: Zustand state management for workflow data

- **`api/`**
  - `client.ts`: Axios-based API client

### Workflow State Management

The application uses Zustand for state management with the following flow:

1. User enters use case data → `useCaseData` stored
2. Claude analyzes → `analysis` and `recommendations` stored
3. User selects recommendation → `selectedRecommendation` stored
4. Generate specification → `profileSpecification` stored
5. Generate profile → `generatedProfile` stored
6. Upload to Simplifier (optional)

## FHIR Context

### StructureDefinition Generation

- Profiles are generated as FHIR StructureDefinitions
- Support for R4 (currently implemented), R5, R6 (planned)
- Differential elements approach (constraining base profiles)
- Must-support elements, cardinality constraints, terminology bindings

### Common FHIR Resources

- Patient, Observation, Condition, Procedure, MedicationRequest, AllergyIntolerance
- Extensions are supported and can be added to profiles

### Known Implementation Guides

The system is aware of and recommends profiles from:
- US Core Implementation Guide
- International Patient Summary (IPS)
- mCODE (Oncology)
- CARIN Blue Button
- Da Vinci HRex
- C-CDA on FHIR

## Key Implementation Details

### Claude AI Integration

- Model: `claude-sonnet-4-5-20250929`
- Two main operations:
  1. **Use Case Analysis**: Returns structured JSON with recommendations
  2. **Specification Generation**: Returns markdown specification document
- Prompts are carefully crafted to return structured, parseable responses

### FHIR Profile Generation

- Uses `@ahryman40k/ts-fhir-types` for R4 type definitions
- Generates differential elements (not snapshots)
- Supports:
  - Must-support flags
  - Cardinality constraints (min/max)
  - Terminology bindings (required, extensible, preferred, example)
  - Extensions with slicing

### API Error Handling

- All async route handlers wrapped in `asyncHandler`
- Validation using Zod schemas
- Structured error responses: `{ success: boolean, error?: string, data?: any }`

## Testing Considerations

When adding tests:
- Backend: Unit tests for services, integration tests for routes
- Frontend: Component tests with React Testing Library
- E2E: Consider Playwright for full workflow testing

## Common Patterns

### Adding a New API Endpoint

1. Define Zod schema for validation
2. Create route handler in appropriate router file
3. Wrap handler with `asyncHandler`
4. Add API client method in `frontend/src/api/client.ts`
5. Use in component with proper error handling

### Adding Support for New FHIR Version

1. Update `fhirProfileGenerator.ts` with version-specific logic
2. Add type definitions for the FHIR version
3. Update UI to allow version selection
4. Test with sample profiles

### Extending Claude AI Prompts

- Prompts are in `claudeService.ts`
- Always request structured JSON responses
- Include FHIR domain context in prompts
- Handle parsing errors gracefully

## Troubleshooting

### "Claude API Error"
- Check `ANTHROPIC_API_KEY` is set correctly
- Verify API key has credits
- Check for rate limiting

### "Simplifier Integration Not Configured"
- Optional feature - can skip if not needed
- Requires `SIMPLIFIER_API_KEY` in backend `.env`
- Test connection with `/api/simplifier/status`

### Frontend Not Connecting to Backend
- Ensure backend is running on port 3001
- Check Vite proxy configuration in `vite.config.ts`
- Verify CORS settings in backend `index.ts`

## Performance Notes

- Claude API calls can take 5-15 seconds depending on complexity
- Large profiles (>100 elements) may slow down JSON rendering
- Consider pagination for profile lists if >50 profiles

## Security Considerations

- API keys must never be committed
- Frontend .env should not contain sensitive keys
- Validate all user input with Zod before processing
- Sanitize profile names for filesystem operations
- Simplifier uploads use authenticated API calls
