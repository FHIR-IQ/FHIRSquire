# FHIRSquire

**FHIR Profile Builder & Research Tool with AI-Powered Recommendations**

FHIRSquire is an all-in-one suite for building FHIR profiles, researching existing Implementation Guides, and receiving AI-powered recommendations from Claude AI. It streamlines the process of creating healthcare interoperability standards.

## Features

- **Use Case Analysis**: Enter your business requirements and get AI-powered analysis
- **Smart Recommendations**: Claude AI researches existing FHIR profiles and IGs to provide relevant recommendations
- **Profile Generation**: Automatically generate FHIR StructureDefinitions (R4, R5, R6)
- **Simplifier.net Integration**: Upload profiles and create Implementation Guides
- **Documentation Suite**: Complete workflow from use case to published profile

## Workflow

1. **Define Use Case**: Describe your business needs, why you need a profile, and specific requirements
2. **Get Recommendations**: Claude AI analyzes your use case and recommends existing profiles from US Core, IPS, mCODE, and other IGs
3. **Generate Profile**: Create a FHIR StructureDefinition based on selected recommendations
4. **Upload to Simplifier**: Publish your profile to Simplifier.net and create Implementation Guides

## Prerequisites

- Node.js 18+ and npm 9+
- Anthropic API key (for Claude AI)
- Simplifier.net API key (optional, for uploading profiles)

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd FHIRSquire
npm install
```

### 2. Configure Environment

Copy the example environment file and add your API keys:

```bash
cp .env.example .env
```

Edit `.env` and add:
- `ANTHROPIC_API_KEY`: Your Anthropic API key from https://console.anthropic.com/
- `SIMPLIFIER_API_KEY`: (Optional) Your Simplifier.net API key

### 3. Run the Application

```bash
# Start both frontend and backend
npm run dev

# Or run them separately:
npm run dev:backend  # Runs on http://localhost:3001
npm run dev:frontend # Runs on http://localhost:5173
```

### 4. Open in Browser

Navigate to http://localhost:5173

## Development

### Project Structure

```
FHIRSquire/
├── backend/           # Node.js/Express API
│   ├── src/
│   │   ├── services/  # Claude AI, FHIR, Simplifier services
│   │   ├── routes/    # API endpoints
│   │   └── middleware/
├── frontend/          # React/TypeScript UI
│   ├── src/
│   │   ├── components/
│   │   ├── store/
│   │   └── api/
└── profiles/          # Generated FHIR profiles
```

### Available Commands

```bash
# Development
npm run dev              # Run both frontend and backend
npm run dev:frontend     # Run frontend only
npm run dev:backend      # Run backend only

# Build
npm run build            # Build both projects
npm run build:frontend   # Build frontend only
npm run build:backend    # Build backend only

# Testing
npm test                 # Run tests for all workspaces

# Linting
npm run lint             # Lint all code
```

## Technology Stack

- **Frontend**: React, TypeScript, Vite, Zustand
- **Backend**: Node.js, Express, TypeScript
- **AI**: Anthropic Claude API
- **FHIR**: HAPI FHIR types, StructureDefinition generation
- **Integration**: Simplifier.net API

## API Endpoints

### Use Case Analysis
- `POST /api/use-case/analyze` - Analyze use case and get recommendations
- `POST /api/use-case/generate-spec` - Generate detailed profile specification

### Profile Management
- `POST /api/profile/generate` - Generate FHIR StructureDefinition
- `POST /api/profile/validate` - Validate resource against profile
- `POST /api/profile/save` - Save profile locally
- `GET /api/profile/list` - List saved profiles

### Simplifier Integration
- `GET /api/simplifier/status` - Check integration status
- `GET /api/simplifier/projects` - Get user's projects
- `POST /api/simplifier/projects` - Create new project
- `POST /api/simplifier/upload` - Upload profile
- `POST /api/simplifier/ig` - Create Implementation Guide

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open a GitHub issue.
