import { Router } from 'express';
import { simplifierService } from '../services/simplifierService';
import { asyncHandler } from '../middleware/asyncHandler';

export const simplifierRouter = Router();

/**
 * GET /api/simplifier/status
 * Check if Simplifier integration is configured
 */
simplifierRouter.get('/status', asyncHandler(async (req, res) => {
  const configured = simplifierService.isConfigured();

  res.json({
    success: true,
    data: {
      configured,
      message: configured
        ? 'Simplifier integration is configured'
        : 'Simplifier API key not configured. Set SIMPLIFIER_API_KEY in .env'
    }
  });
}));

/**
 * GET /api/simplifier/projects
 * Get user's projects from Simplifier
 */
simplifierRouter.get('/projects', asyncHandler(async (req, res) => {
  const projects = await simplifierService.getProjects();

  res.json({
    success: true,
    data: projects
  });
}));

/**
 * POST /api/simplifier/projects
 * Create a new project on Simplifier
 */
simplifierRouter.post('/projects', asyncHandler(async (req, res) => {
  const { name, scope, description } = req.body;

  if (!name || !scope) {
    return res.status(400).json({
      error: 'Missing required fields: name and scope'
    });
  }

  const project = await simplifierService.createProject(name, scope, description);

  res.json({
    success: true,
    data: project
  });
}));

/**
 * POST /api/simplifier/upload
 * Upload a profile to Simplifier
 */
simplifierRouter.post('/upload', asyncHandler(async (req, res) => {
  const { projectScope, profile, filename } = req.body;

  if (!projectScope || !profile || !filename) {
    return res.status(400).json({
      error: 'Missing required fields: projectScope, profile, and filename'
    });
  }

  const result = await simplifierService.uploadProfile({
    projectScope,
    profile,
    filename
  });

  res.json({
    success: true,
    data: result
  });
}));

/**
 * POST /api/simplifier/ig
 * Create an Implementation Guide on Simplifier
 */
simplifierRouter.post('/ig', asyncHandler(async (req, res) => {
  const { projectScope, igName, profiles } = req.body;

  if (!projectScope || !igName || !profiles || !Array.isArray(profiles)) {
    return res.status(400).json({
      error: 'Missing required fields: projectScope, igName, and profiles (array)'
    });
  }

  const result = await simplifierService.createImplementationGuide(
    projectScope,
    igName,
    profiles
  );

  res.json({
    success: true,
    data: result
  });
}));

/**
 * POST /api/simplifier/validate
 * Validate a profile using Simplifier's validator
 */
simplifierRouter.post('/validate', asyncHandler(async (req, res) => {
  const { profile } = req.body;

  if (!profile) {
    return res.status(400).json({
      error: 'Missing required field: profile'
    });
  }

  const validation = await simplifierService.validateProfile(profile);

  res.json({
    success: true,
    data: validation
  });
}));
