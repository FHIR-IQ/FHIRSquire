# FHIRSquire Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FHIRSquire POC                           │
│                  AI-Powered FHIR Profile Builder                 │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Browser    │      │   Backend    │      │  External    │
│   (React)    │◄────►│   (Express)  │◄────►│  Services    │
└──────────────┘      └──────────────┘      └──────────────┘
      │                      │                      │
      │                      │                      ├─ Claude AI
      │                      │                      └─ Simplifier.net
      ▼                      ▼
┌──────────────┐      ┌──────────────┐
│   Zustand    │      │  Services    │
│    Store     │      │  Layer       │
└──────────────┘      └──────────────┘
```

## Application Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Workflow                            │
└─────────────────────────────────────────────────────────────────┘

Step 1: Use Case Entry
┌─────────────────┐
│ UseCaseForm     │  User fills out:
│                 │  • Business use case
│  [Text inputs]  │  • Reason for profile
│  [Selects]      │  • Specific requirements
│  [Submit]       │  • FHIR version (R4/R5/R6)
└────────┬────────┘
         │ POST /api/use-case/analyze
         ▼
┌─────────────────────────────────────┐
│   Claude AI Analysis Service        │
│                                     │
│  1. Receives use case data          │
│  2. Constructs analysis prompt      │
│  3. Calls Claude Sonnet 4.5 API    │
│  4. Parses JSON response            │
│  5. Returns recommendations         │
└────────┬────────────────────────────┘
         │ Analysis + Recommendations
         ▼

Step 2: Review Recommendations
┌─────────────────┐
│Recommendations  │  Claude AI suggests:
│     List        │  • Existing FHIR profiles
│                 │  • US Core, IPS, mCODE, etc.
│  [Card 1] 95%   │  • Relevance scores
│  [Card 2] 88%   │  • Detailed reasoning
│  [Card 3] 76%   │  • Must-support elements
│                 │
│  [Select]       │  User selects best match
└────────┬────────┘
         │ POST /api/use-case/generate-spec
         ▼
┌─────────────────────────────────────┐
│   Claude AI Specification Service   │
│                                     │
│  1. Uses selected recommendation    │
│  2. Incorporates custom reqs        │
│  3. Generates detailed markdown     │
│  4. Returns specification           │
└────────┬────────────────────────────┘
         │ Profile Specification (Markdown)
         ▼

Step 3: Generate Profile
┌─────────────────┐
│ProfileGenerator │  Shows specification
│                 │
│  [Markdown Doc] │  User reviews & generates
│                 │
│  [Generate]     │  → POST /api/profile/generate
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   FHIR Profile Generator Service    │
│                                     │
│  1. Parses specification            │
│  2. Creates StructureDefinition     │
│  3. Adds differential elements      │
│  4. Sets must-support flags         │
│  5. Adds cardinality constraints    │
│  6. Binds terminology               │
│  7. Returns valid FHIR JSON         │
└────────┬────────────────────────────┘
         │ FHIR StructureDefinition (JSON)
         ▼
┌─────────────────┐
│  Profile View   │  Display:
│                 │  • Profile metadata
│  [JSON viewer]  │  • Full JSON structure
│  [Download]     │  • Download option
│  [Save Local]   │  • Local save option
└────────┬────────┘
         │
         ▼

Step 4: Upload (Optional)
┌─────────────────┐
│SimplifierUpload │  If configured:
│                 │  • Select project
│  [Project list] │  • Create new project
│  [Upload]       │  • Upload profile
│  [Skip]         │  • Create IG
└────────┬────────┘
         │ POST /api/simplifier/upload
         ▼
┌─────────────────────────────────────┐
│   Simplifier.net Integration        │
│                                     │
│  1. Authenticates with API key      │
│  2. Uploads StructureDefinition     │
│  3. Creates project resources       │
│  4. Returns Simplifier URL          │
└─────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
App.tsx (Main Container)
  │
  ├─ ProgressSteps (Stepper UI)
  │
  └─ CurrentStep (Conditional Rendering)
       │
       ├─ UseCaseForm
       │    │
       │    ├─ Form Fields
       │    ├─ Validation
       │    └─ API Call → analyzeUseCase()
       │
       ├─ RecommendationsList
       │    │
       │    ├─ Analysis Summary
       │    ├─ Recommendation Cards
       │    ├─ Custom Requirements
       │    └─ API Call → generateSpecification()
       │
       ├─ ProfileGenerator
       │    │
       │    ├─ Specification Display (Markdown)
       │    ├─ Generate Button → generateProfile()
       │    ├─ Profile Summary
       │    ├─ JSON Viewer
       │    └─ Download/Save Actions
       │
       └─ SimplifierUpload
            │
            ├─ Configuration Check
            ├─ Project Selection/Creation
            ├─ Upload Action → uploadToSimplifier()
            └─ Success/Skip Options
```

### Backend Services

```
Express App (index.ts)
  │
  ├─ Middleware
  │    ├─ CORS
  │    ├─ JSON Parser
  │    └─ Error Handler
  │
  └─ Routes
       │
       ├─ /api/use-case
       │    ├─ POST /analyze
       │    │    └─> ClaudeService.analyzeUseCase()
       │    │
       │    └─ POST /generate-spec
       │         └─> ClaudeService.generateProfileSpecification()
       │
       ├─ /api/profile
       │    ├─ POST /generate
       │    │    └─> FHIRProfileGenerator.generateR4Profile()
       │    │
       │    ├─ POST /validate
       │    │    └─> FHIRProfileGenerator.validateResource()
       │    │
       │    ├─ POST /save
       │    │    └─> fs.writeFile()
       │    │
       │    └─ GET /list
       │         └─> fs.readdir() + parse
       │
       └─ /api/simplifier
            ├─ GET /status
            │    └─> SimplifierService.isConfigured()
            │
            ├─ GET /projects
            │    └─> SimplifierService.getProjects()
            │
            ├─ POST /projects
            │    └─> SimplifierService.createProject()
            │
            ├─ POST /upload
            │    └─> SimplifierService.uploadProfile()
            │
            └─ POST /ig
                 └─> SimplifierService.createImplementationGuide()
```

## Data Flow

### State Management (Zustand)

```
┌──────────────────────────────────────────────────────┐
│                   Zustand Store                       │
├──────────────────────────────────────────────────────┤
│                                                       │
│  useCaseData: {                                       │
│    businessUseCase: string                            │
│    reasonForProfile: string                           │
│    specificUseCase: string                            │
│    dataRole: 'consumer' | 'producer' | 'intermediary' │
│    fhirVersion: 'R4' | 'R5' | 'R6'                   │
│    organizationContext?: string                       │
│  }                                                    │
│                                                       │
│  analysis: {                                          │
│    recommendations: ProfileRecommendation[]           │
│    analysis: string                                   │
│    suggestedApproach: string                          │
│    rationale: string                                  │
│    additionalConsiderations: string[]                 │
│  }                                                    │
│                                                       │
│  selectedRecommendation: ProfileRecommendation        │
│                                                       │
│  profileSpecification: string (markdown)              │
│                                                       │
│  generatedProfile: StructureDefinition (FHIR JSON)    │
│                                                       │
└──────────────────────────────────────────────────────┘
```

### API Request/Response Flow

```
Frontend                Backend                External
   │                       │                       │
   │  POST /analyze        │                       │
   ├──────────────────────►│                       │
   │   UseCaseData         │                       │
   │                       │  Claude API Call      │
   │                       ├──────────────────────►│
   │                       │  Analyze use case     │
   │                       │                       │
   │                       │◄──────────────────────┤
   │                       │  Recommendations JSON │
   │◄──────────────────────┤                       │
   │   Analysis Response   │                       │
   │                       │                       │
   │  POST /generate-spec  │                       │
   ├──────────────────────►│                       │
   │   + Recommendation    │                       │
   │                       │  Claude API Call      │
   │                       ├──────────────────────►│
   │                       │  Generate spec        │
   │                       │◄──────────────────────┤
   │◄──────────────────────┤  Markdown doc         │
   │   Specification       │                       │
   │                       │                       │
   │  POST /generate       │                       │
   ├──────────────────────►│                       │
   │   Profile Request     │                       │
   │                       │  Generate locally     │
   │                       │  (No external call)   │
   │◄──────────────────────┤                       │
   │   StructureDefinition │                       │
   │                       │                       │
   │  POST /upload         │                       │
   ├──────────────────────►│                       │
   │   Profile + Project   │  Simplifier API       │
   │                       ├──────────────────────►│
   │                       │  Upload profile       │
   │                       │◄──────────────────────┤
   │◄──────────────────────┤  Success + URL        │
   │   Upload Result       │                       │
```

## Technology Layers

```
┌─────────────────────────────────────────────────────┐
│                  Presentation Layer                  │
│  React Components, CSS, User Interactions           │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│                  State Management                    │
│  Zustand Store (Client-side state)                  │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│                   API Client Layer                   │
│  Axios HTTP Client (REST API calls)                 │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│                  Backend API Layer                   │
│  Express Routes + Validation (Zod)                  │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│                   Service Layer                      │
│  ClaudeService, FHIRGenerator, SimplifierService    │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│                  External Services                   │
│  Claude AI API, Simplifier.net API                  │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│                   Data Persistence                   │
│  Local Filesystem (profiles/), Simplifier.net       │
└─────────────────────────────────────────────────────┘
```

## Security Model

```
┌──────────────────────────────────────────────┐
│            Security Boundaries                │
└──────────────────────────────────────────────┘

Frontend (Browser)
  │
  ├─ No sensitive keys stored
  ├─ Validation on input (client-side)
  └─ HTTPS in production

Backend (Server)
  │
  ├─ Environment variables (.env)
  │    ├─ ANTHROPIC_API_KEY (secret)
  │    └─ SIMPLIFIER_API_KEY (secret)
  │
  ├─ Input validation (Zod schemas)
  ├─ Error sanitization
  ├─ CORS configuration
  └─ Filesystem access control

External Services
  │
  ├─ Claude AI (Authenticated)
  └─ Simplifier.net (Authenticated)
```

## Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────────┐
│                  Production Deployment               │
└─────────────────────────────────────────────────────┘

Frontend                Backend                Database
┌──────────┐           ┌──────────┐           ┌──────────┐
│  Vercel  │           │  Railway │           │ MongoDB  │
│   or     │◄─────────►│    or    │◄─────────►│    or    │
│ Netlify  │           │  Render  │           │PostgreSQL│
└──────────┘           └──────────┘           └──────────┘
     │                       │                       │
     │                       │                       │
     └───────────────────────┴───────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
              ┌──────────┐      ┌──────────┐
              │ Claude   │      │Simplifier│
              │   AI     │      │   .net   │
              └──────────┘      └──────────┘
```

## Error Handling Flow

```
User Action
    │
    ▼
Frontend Component
    │
    ├─ Try/Catch Block
    │   │
    │   ├─ Success → Update State
    │   │
    │   └─ Error → Set Error State
    │       │
    │       └─ Display Error Message
    │
    ▼
API Client (Axios)
    │
    ├─ Request Interceptor
    │
    └─ Response Interceptor
        │
        └─ Catch HTTP Errors
    │
    ▼
Backend Route
    │
    ├─ asyncHandler Wrapper
    │   │
    │   └─ Catches async errors
    │
    ├─ Zod Validation
    │   │
    │   └─ Returns 400 on validation error
    │
    └─ Business Logic
        │
        └─ Throws errors if needed
    │
    ▼
Error Handler Middleware
    │
    ├─ Logs error
    │
    └─ Returns structured error response
        {
          success: false,
          error: "message",
          stack: "..." (dev only)
        }
```

## Performance Considerations

```
Bottlenecks                  Mitigations
────────────                 ───────────
Claude API calls             • Show loading states
(5-15 seconds)               • Caching (future)
                            • Async processing

Large JSON rendering         • Collapsible JSON viewer
                            • Syntax highlighting
                            • Pagination

Profile generation           • Client-side generation
                            • Web workers (future)

File I/O                     • Async filesystem ops
                            • Stream large files
```

---

**Architecture Version:** 1.0
**Last Updated:** November 2025
