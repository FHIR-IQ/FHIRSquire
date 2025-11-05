import { Router } from 'express';
import { fhirProfileGenerator, ProfileGenerationRequest } from '../services/fhirProfileGenerator';
import { asyncHandler } from '../middleware/asyncHandler';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

export const profileRouter = Router();

const profileGenerationSchema = z.object({
  profileName: z.string().min(1),
  baseResourceType: z.string().min(1),
  baseProfile: z.string().optional(),
  description: z.string().min(1),
  fhirVersion: z.enum(['R4', 'R5', 'R6']),
  publisher: z.string().min(1),
  jurisdiction: z.string().optional(),
  mustSupportElements: z.array(z.string()),
  cardinalityConstraints: z.array(z.object({
    element: z.string(),
    min: z.number(),
    max: z.string()
  })).optional(),
  extensions: z.array(z.object({
    url: z.string(),
    description: z.string()
  })).optional(),
  bindingConstraints: z.array(z.object({
    element: z.string(),
    valueSetUrl: z.string(),
    strength: z.enum(['required', 'extensible', 'preferred', 'example'])
  })).optional()
});

/**
 * POST /api/profile/generate
 * Generate a FHIR StructureDefinition
 */
profileRouter.post('/generate', asyncHandler(async (req, res) => {
  // Validate request
  const validationResult = profileGenerationSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: validationResult.error.errors
    });
  }

  const request: ProfileGenerationRequest = validationResult.data;

  // Generate profile based on FHIR version
  let profile;
  if (request.fhirVersion === 'R4') {
    profile = fhirProfileGenerator.generateR4Profile(request);
  } else {
    return res.status(400).json({
      error: `FHIR version ${request.fhirVersion} not yet supported. Currently only R4 is supported.`
    });
  }

  res.json({
    success: true,
    data: {
      profile
    }
  });
}));

/**
 * POST /api/profile/validate
 * Validate a FHIR resource against a profile
 */
profileRouter.post('/validate', asyncHandler(async (req, res) => {
  const { resource, profile } = req.body;

  if (!resource || !profile) {
    return res.status(400).json({
      error: 'Missing required fields: resource and profile'
    });
  }

  const validation = fhirProfileGenerator.validateResource(resource, profile);

  res.json({
    success: true,
    data: validation
  });
}));

/**
 * POST /api/profile/save
 * Save a profile to the local filesystem
 */
profileRouter.post('/save', asyncHandler(async (req, res) => {
  const { profile, filename } = req.body;

  if (!profile || !filename) {
    return res.status(400).json({
      error: 'Missing required fields: profile and filename'
    });
  }

  // Ensure profiles directory exists
  const profilesDir = path.join(process.cwd(), '..', 'profiles');
  await fs.mkdir(profilesDir, { recursive: true });

  // Save profile
  const filepath = path.join(profilesDir, filename);
  await fs.writeFile(filepath, JSON.stringify(profile, null, 2), 'utf-8');

  res.json({
    success: true,
    data: {
      filepath,
      message: 'Profile saved successfully'
    }
  });
}));

/**
 * GET /api/profile/list
 * List all saved profiles
 */
profileRouter.get('/list', asyncHandler(async (req, res) => {
  const profilesDir = path.join(process.cwd(), '..', 'profiles');

  try {
    const files = await fs.readdir(profilesDir);
    const profiles = await Promise.all(
      files
        .filter(f => f.endsWith('.json'))
        .map(async (file) => {
          const content = await fs.readFile(path.join(profilesDir, file), 'utf-8');
          const profile = JSON.parse(content);
          return {
            filename: file,
            id: profile.id,
            name: profile.name,
            title: profile.title,
            version: profile.version,
            status: profile.status
          };
        })
    );

    res.json({
      success: true,
      data: profiles
    });
  } catch (error) {
    // If directory doesn't exist, return empty array
    if ((error as any).code === 'ENOENT') {
      return res.json({
        success: true,
        data: []
      });
    }
    throw error;
  }
}));
