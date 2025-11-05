import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { useCase, selectedRecommendation, customRequirements } = req.body;

    // Validate required fields
    if (!useCase || !selectedRecommendation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const prompt = buildSpecificationPrompt(useCase, selectedRecommendation, customRequirements);

    // Add timeout wrapper
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Specification generation timeout - please try again')), 55000)
    );

    const specPromise = (async () => {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 3072,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return content.text;
    })();

    const specification = await Promise.race([specPromise, timeoutPromise]);

    return res.status(200).json({
      success: true,
      data: { specification }
    });
  } catch (error) {
    console.error('Error generating specification:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function buildSpecificationPrompt(useCase: any, recommendation: any, customRequirements?: string): string {
  return `Create a concise FHIR profile specification.

Use Case: ${useCase.businessUseCase}

Base Profile:
- ${recommendation.profileName} (${recommendation.baseResource})
- ${recommendation.profileUrl}

${customRequirements ? `Custom Requirements: ${customRequirements}` : ''}

Target: FHIR ${useCase.fhirVersion}

Provide a brief specification with:
1. Profile name and description
2. Key constraints (cardinality, must-support elements)
3. Terminology bindings
4. Extensions needed
5. Implementation notes

Keep it concise and actionable. Use markdown format.`;
}
