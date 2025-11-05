import axios from 'axios';
import type { UseCaseData, Analysis, ProfileRecommendation } from '../store/useStore';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Use Case Analysis
  analyzeUseCase: async (data: UseCaseData): Promise<Analysis> => {
    const response = await apiClient.post('/use-case/analyze', data);
    return response.data.data;
  },

  generateSpecification: async (
    useCase: UseCaseData,
    recommendation: ProfileRecommendation,
    customRequirements?: string
  ): Promise<string> => {
    const response = await apiClient.post('/use-case/generate-spec', {
      useCase,
      selectedRecommendation: recommendation,
      customRequirements,
    });
    return response.data.data.specification;
  },

  // Profile Generation
  generateProfile: async (request: any): Promise<any> => {
    const response = await apiClient.post('/profile/generate', request);
    return response.data.data.profile;
  },

  validateProfile: async (resource: any, profile: any): Promise<{ valid: boolean; errors: string[] }> => {
    const response = await apiClient.post('/profile/validate', { resource, profile });
    return response.data.data;
  },

  saveProfile: async (profile: any, filename: string): Promise<{ filepath: string; message: string }> => {
    const response = await apiClient.post('/profile/save', { profile, filename });
    return response.data.data;
  },

  listProfiles: async (): Promise<any[]> => {
    const response = await apiClient.get('/profile/list');
    return response.data.data;
  },

  // Simplifier Integration
  getSimplifierStatus: async (): Promise<{ configured: boolean; message: string }> => {
    const response = await apiClient.get('/simplifier/status');
    return response.data.data;
  },

  getSimplifierProjects: async (): Promise<any[]> => {
    const response = await apiClient.get('/simplifier/projects');
    return response.data.data;
  },

  createSimplifierProject: async (name: string, scope: string, description?: string): Promise<any> => {
    const response = await apiClient.post('/simplifier/projects', { name, scope, description });
    return response.data.data;
  },

  uploadToSimplifier: async (
    projectScope: string,
    profile: any,
    filename: string
  ): Promise<{ success: boolean; url?: string }> => {
    const response = await apiClient.post('/simplifier/upload', { projectScope, profile, filename });
    return response.data.data;
  },

  createImplementationGuide: async (
    projectScope: string,
    igName: string,
    profiles: any[]
  ): Promise<{ success: boolean; url?: string }> => {
    const response = await apiClient.post('/simplifier/ig', { projectScope, igName, profiles });
    return response.data.data;
  },

  validateWithSimplifier: async (profile: any): Promise<{ valid: boolean; issues: any[] }> => {
    const response = await apiClient.post('/simplifier/validate', { profile });
    return response.data.data;
  },
};
