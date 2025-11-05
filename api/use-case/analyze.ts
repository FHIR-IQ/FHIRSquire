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
    const { businessUseCase, reasonForProfile, specificUseCase, dataRole, fhirVersion, organizationContext } = req.body;

    // Validate required fields
    if (!businessUseCase || !reasonForProfile || !specificUseCase || !dataRole || !fhirVersion) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const prompt = buildAnalysisPrompt({
      businessUseCase,
      reasonForProfile,
      specificUseCase,
      dataRole,
      fhirVersion,
      organizationContext
    });

    // Add timeout wrapper
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Analysis timeout - please try again')), 55000)
    );

    const analysisPromise = (async () => {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2048,
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

      return parseClaudeResponse(content.text);
    })();

    const analysis = await Promise.race([analysisPromise, timeoutPromise]);

    return res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Error analyzing use case:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function buildAnalysisPrompt(request: any): string {
  return `You are a FHIR expert. Analyze this use case and recommend FHIR profiles.

Use Case:
- Business: ${request.businessUseCase}
- Why profile needed: ${request.reasonForProfile}
- Specific use: ${request.specificUseCase}
- Role: ${request.dataRole}
- FHIR version: ${request.fhirVersion}
${request.organizationContext ? `- Context: ${request.organizationContext}` : ''}

Provide 2-3 most relevant profile recommendations from IGs like US Core, IPS, mCODE, CARIN, Da Vinci HRex.

Return ONLY valid JSON (no markdown):
{
  "recommendations": [
    {
      "profileName": "string",
      "profileUrl": "string",
      "implementationGuide": "string",
      "igUrl": "string",
      "relevanceScore": number,
      "reasoning": "brief explanation",
      "baseResource": "string",
      "mustSupportElements": ["element1", "element2"],
      "extensions": ["ext1"]
    }
  ],
  "analysis": "concise analysis of needs",
  "suggestedApproach": "use-existing | extend-existing | create-new",
  "rationale": "brief rationale",
  "additionalConsiderations": ["consideration1", "consideration2"]
}`;
}

function parseClaudeResponse(responseText: string): any {
  try {
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(jsonText);

    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      throw new Error('Invalid response structure: missing recommendations array');
    }

    if (!['use-existing', 'extend-existing', 'create-new'].includes(parsed.suggestedApproach)) {
      throw new Error('Invalid suggestedApproach value');
    }

    return parsed;
  } catch (error) {
    console.error('Failed to parse Claude response:', error);
    console.error('Response text:', responseText);
    throw new Error(`Failed to parse Claude response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
