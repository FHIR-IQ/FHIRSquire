import { Router } from 'express';
import { claudeService, UseCaseAnalysisRequest } from '../services/claudeService';
import { asyncHandler } from '../middleware/asyncHandler';
import { z } from 'zod';

export const useCaseRouter = Router();

const useCaseSchema = z.object({
  businessUseCase: z.string().min(10, 'Business use case must be at least 10 characters'),
  reasonForProfile: z.string().min(10, 'Reason must be at least 10 characters'),
  specificUseCase: z.string().min(10, 'Specific use case must be at least 10 characters'),
  dataRole: z.enum(['consumer', 'producer', 'intermediary']),
  fhirVersion: z.enum(['R4', 'R5', 'R6']),
  organizationContext: z.string().optional()
});

/**
 * POST /api/use-case/analyze
 * Analyze a use case and get recommendations
 */
useCaseRouter.post('/analyze', asyncHandler(async (req, res) => {
  // Validate request
  const validationResult = useCaseSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: validationResult.error.errors
    });
  }

  const request: UseCaseAnalysisRequest = validationResult.data;

  // Call Claude service
  const analysis = await claudeService.analyzeUseCase(request);

  res.json({
    success: true,
    data: analysis
  });
}));

/**
 * POST /api/use-case/generate-spec
 * Generate detailed profile specification
 */
useCaseRouter.post('/generate-spec', asyncHandler(async (req, res) => {
  const { useCase, selectedRecommendation, customRequirements } = req.body;

  if (!useCase || !selectedRecommendation) {
    return res.status(400).json({
      error: 'Missing required fields: useCase and selectedRecommendation'
    });
  }

  const specification = await claudeService.generateProfileSpecification(
    useCase,
    selectedRecommendation,
    customRequirements
  );

  res.json({
    success: true,
    data: {
      specification
    }
  });
}));
