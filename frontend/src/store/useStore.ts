import { create } from 'zustand';

export interface UseCaseData {
  businessUseCase: string;
  reasonForProfile: string;
  specificUseCase: string;
  dataRole: 'consumer' | 'producer' | 'intermediary';
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

export interface Analysis {
  recommendations: ProfileRecommendation[];
  analysis: string;
  suggestedApproach: 'use-existing' | 'extend-existing' | 'create-new';
  rationale: string;
  additionalConsiderations: string[];
}

interface StoreState {
  // Use Case
  useCaseData: UseCaseData | null;
  setUseCaseData: (data: UseCaseData) => void;

  // Analysis & Recommendations
  analysis: Analysis | null;
  setAnalysis: (analysis: Analysis) => void;
  selectedRecommendation: ProfileRecommendation | null;
  setSelectedRecommendation: (rec: ProfileRecommendation) => void;

  // Profile Generation
  profileSpecification: string | null;
  setProfileSpecification: (spec: string) => void;
  generatedProfile: any | null;
  setGeneratedProfile: (profile: any) => void;

  // Reset
  reset: () => void;
}

export const useStore = create<StoreState>((set) => ({
  useCaseData: null,
  setUseCaseData: (data) => set({ useCaseData: data }),

  analysis: null,
  setAnalysis: (analysis) => set({ analysis }),
  selectedRecommendation: null,
  setSelectedRecommendation: (rec) => set({ selectedRecommendation: rec }),

  profileSpecification: null,
  setProfileSpecification: (spec) => set({ profileSpecification: spec }),
  generatedProfile: null,
  setGeneratedProfile: (profile) => set({ generatedProfile: profile }),

  reset: () =>
    set({
      useCaseData: null,
      analysis: null,
      selectedRecommendation: null,
      profileSpecification: null,
      generatedProfile: null,
    }),
}));
