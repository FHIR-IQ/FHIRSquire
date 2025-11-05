import axios, { AxiosInstance } from 'axios';

export interface SimplifierProject {
  id: string;
  name: string;
  scope: string;
  description?: string;
}

export interface UploadProfileRequest {
  projectScope: string;
  profile: any; // FHIR StructureDefinition
  filename: string;
}

export class SimplifierService {
  private client: AxiosInstance;

  constructor() {
    const apiKey = process.env.SIMPLIFIER_API_KEY;
    const baseURL = process.env.SIMPLIFIER_BASE_URL || 'https://api.simplifier.net';

    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
      }
    });
  }

  /**
   * Check if Simplifier integration is configured
   */
  isConfigured(): boolean {
    return !!process.env.SIMPLIFIER_API_KEY;
  }

  /**
   * Get user's projects from Simplifier
   */
  async getProjects(): Promise<SimplifierProject[]> {
    if (!this.isConfigured()) {
      throw new Error('Simplifier API key not configured');
    }

    try {
      const response = await this.client.get('/projects');
      return response.data;
    } catch (error) {
      console.error('Error fetching Simplifier projects:', error);
      throw new Error('Failed to fetch projects from Simplifier');
    }
  }

  /**
   * Create a new project on Simplifier
   */
  async createProject(name: string, scope: string, description?: string): Promise<SimplifierProject> {
    if (!this.isConfigured()) {
      throw new Error('Simplifier API key not configured');
    }

    try {
      const response = await this.client.post('/projects', {
        name,
        scope,
        description,
        visibility: 'private' // Default to private
      });
      return response.data;
    } catch (error) {
      console.error('Error creating Simplifier project:', error);
      throw new Error('Failed to create project on Simplifier');
    }
  }

  /**
   * Upload a FHIR profile to Simplifier
   */
  async uploadProfile(request: UploadProfileRequest): Promise<{ success: boolean; url?: string }> {
    if (!this.isConfigured()) {
      throw new Error('Simplifier API key not configured');
    }

    try {
      // Upload to Simplifier project
      const response = await this.client.post(
        `/projects/${request.projectScope}/resources`,
        {
          resourceType: 'StructureDefinition',
          resource: request.profile,
          filename: request.filename
        }
      );

      return {
        success: true,
        url: response.data.url || `https://simplifier.net/${request.projectScope}/~resources?id=${request.profile.id}`
      };
    } catch (error) {
      console.error('Error uploading profile to Simplifier:', error);
      throw new Error('Failed to upload profile to Simplifier');
    }
  }

  /**
   * Create an Implementation Guide on Simplifier
   */
  async createImplementationGuide(
    projectScope: string,
    igName: string,
    profiles: any[]
  ): Promise<{ success: boolean; url?: string }> {
    if (!this.isConfigured()) {
      throw new Error('Simplifier API key not configured');
    }

    try {
      // Create IG structure
      const igResource = {
        resourceType: 'ImplementationGuide',
        id: igName.toLowerCase().replace(/\s+/g, '-'),
        name: igName,
        status: 'draft',
        fhirVersion: ['4.0.1'],
        definition: {
          resource: profiles.map(profile => ({
            reference: {
              reference: `StructureDefinition/${profile.id}`
            },
            name: profile.title || profile.name,
            description: profile.description
          }))
        }
      };

      const response = await this.client.post(
        `/projects/${projectScope}/implementationguides`,
        igResource
      );

      return {
        success: true,
        url: response.data.url || `https://simplifier.net/${projectScope}/~guides`
      };
    } catch (error) {
      console.error('Error creating IG on Simplifier:', error);
      throw new Error('Failed to create Implementation Guide on Simplifier');
    }
  }

  /**
   * Validate a profile using Simplifier's validator
   */
  async validateProfile(profile: any): Promise<{ valid: boolean; issues: any[] }> {
    if (!this.isConfigured()) {
      throw new Error('Simplifier API key not configured');
    }

    try {
      const response = await this.client.post('/validate', {
        resource: profile
      });

      return {
        valid: response.data.valid || false,
        issues: response.data.issues || []
      };
    } catch (error) {
      console.error('Error validating profile with Simplifier:', error);
      throw new Error('Failed to validate profile');
    }
  }
}

export const simplifierService = new SimplifierService();
