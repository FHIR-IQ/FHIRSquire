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

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      temperature: 0.7,
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

    const analysis = parseClaudeResponse(content.text);

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
  return `You are a FHIR (Fast Healthcare Interoperability Resources) expert specializing in healthcare interoperability standards and profile design. Your task is to analyze a healthcare use case and provide specific, actionable recommendations for FHIR profiles and Implementation Guides.

**Use Case Details:**
- **Business Use Case**: ${request.businessUseCase}
- **Reason for New Profile**: ${request.reasonForProfile}
- **Specific Use Case**: ${request.specificUseCase}
- **Data Role**: ${request.dataRole}
- **Target FHIR Version**: ${request.fhirVersion}
${request.organizationContext ? `- **Organization Context**: ${request.organizationContext}` : ''}

**Your Task:**
1. Analyze whether existing FHIR profiles can meet this need, or if a new profile is required
2. Recommend specific FHIR profiles from well-known Implementation Guides (IGs) like:
   - US Core Implementation Guide
   - International Patient Summary (IPS)
   - mCODE (minimal Common Oncology Data Elements)
   - CARIN Blue Button
   - Da Vinci Health Record Exchange (HRex)
   - C-CDA on FHIR
   - Other relevant domain-specific IGs

3. For each recommendation, specify:
   - Profile name and URL
   - Implementation Guide and URL
   - Relevance score (0-100)
   - Detailed reasoning for the recommendation
   - Base FHIR resource
   - Key must-support elements
   - Relevant extensions

4. Provide a suggested approach: use-existing, extend-existing, or create-new
5. Explain the rationale for your approach
6. List additional considerations (terminology bindings, cardinality constraints, privacy considerations, etc.)

**Response Format:**
Provide your response as a JSON object with this exact structure:
{
  "recommendations": [
    {
      "profileName": "string",
      "profileUrl": "string",
      "implementationGuide": "string",
      "igUrl": "string",
      "relevanceScore": number,
      "reasoning": "string",
      "baseResource": "string",
      "mustSupportElements": ["string"],
      "extensions": ["string"]
    }
  ],
  "analysis": "string - your detailed analysis",
  "suggestedApproach": "use-existing | extend-existing | create-new",
  "rationale": "string - explanation of your suggested approach",
  "additionalConsiderations": ["string"]
}

Ensure your response is valid JSON only, with no additional text before or after.`;
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
