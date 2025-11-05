import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface UseCaseAnalysisRequest {
  businessUseCase: string;
  reasonForProfile: string;
  specificUseCase: string;
  dataRole: string; // consumer, producer, intermediary
  fhirVersion: 'R4' | 'R5' | 'R6';
  organizationContext?: string;
}

export interface ProfileRecommendation {
  profileName: string;
  profileUrl: string;
  implementationGuide: string;
  igUrl: string;
  relevanceScore: number;
  reasoning: string;
  baseResource: string;
  mustSupportElements: string[];
  extensions: string[];
}

export interface UseCaseAnalysisResponse {
  recommendations: ProfileRecommendation[];
  analysis: string;
  suggestedApproach: 'use-existing' | 'extend-existing' | 'create-new';
  rationale: string;
  additionalConsiderations: string[];
}

export class ClaudeService {
  /**
   * Analyze a use case and provide FHIR profile recommendations
   */
  async analyzeUseCase(request: UseCaseAnalysisRequest): Promise<UseCaseAnalysisResponse> {
    const prompt = this.buildAnalysisPrompt(request);

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

    return this.parseClaudeResponse(content.text);
  }

  /**
   * Build the analysis prompt for Claude
   */
  private buildAnalysisPrompt(request: UseCaseAnalysisRequest): string {
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

  /**
   * Parse Claude's response into structured data
   */
  private parseClaudeResponse(responseText: string): UseCaseAnalysisResponse {
    try {
      // Remove markdown code blocks if present
      let jsonText = responseText.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(jsonText);

      // Validate the structure
      if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
        throw new Error('Invalid response structure: missing recommendations array');
      }

      if (!['use-existing', 'extend-existing', 'create-new'].includes(parsed.suggestedApproach)) {
        throw new Error('Invalid suggestedApproach value');
      }

      return parsed as UseCaseAnalysisResponse;
    } catch (error) {
      console.error('Failed to parse Claude response:', error);
      console.error('Response text:', responseText);
      throw new Error(`Failed to parse Claude response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a detailed profile specification based on selected recommendations
   */
  async generateProfileSpecification(
    useCase: UseCaseAnalysisRequest,
    selectedRecommendation: ProfileRecommendation,
    customRequirements?: string
  ): Promise<string> {
    const prompt = `You are creating a detailed specification for a new FHIR profile based on the following:

**Use Case:**
${useCase.businessUseCase}

**Base Profile to Extend:**
- Profile: ${selectedRecommendation.profileName}
- URL: ${selectedRecommendation.profileUrl}
- Base Resource: ${selectedRecommendation.baseResource}

**Custom Requirements:**
${customRequirements || 'None specified'}

**Target FHIR Version:** ${useCase.fhirVersion}

Create a detailed specification document that includes:
1. Profile name and description
2. Use case and scope
3. Relationship to base profile
4. Cardinality constraints for key elements
5. Must Support elements
6. Terminology bindings (required value sets)
7. Extensions needed
8. Search parameters
9. Examples of usage
10. Implementation notes

Provide a comprehensive, implementable specification in markdown format.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8192,
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

    return content.text;
  }
}

export const claudeService = new ClaudeService();
